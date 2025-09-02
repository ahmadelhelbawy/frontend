/**
 * LiveDetectionOverlay - Interactive detection overlay system for real-time AI visualization
 * Shows bounding boxes, confidence scores, alert classifications with operator controls
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Paper,
  Tooltip,
  Slider,
  Switch,
  FormControlLabel,
  Button,
  Menu,
  MenuItem,
  Badge,
  alpha,
  useTheme
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Settings,
  FilterList,
  ZoomIn,
  ZoomOut,
  CenterFocusStrong,
  Warning,
  Person,
  ShoppingBag,
  Security
} from '@mui/icons-material';

export interface BoundingBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  class_name: string;
  alert_level: 'normal' | 'suspicious' | 'shoplifting';
  tracking_id?: string;
  metadata?: {
    person_id?: string;
    behavior_score?: number;
    dwell_time?: number;
    suspicious_actions?: string[];
  };
}

export interface DetectionFrame {
  timestamp: string;
  camera_id: string;
  frame_width: number;
  frame_height: number;
  detections: BoundingBox[];
  processing_time_ms: number;
  model_version: string;
}

interface LiveDetectionOverlayProps {
  /** Camera stream element or container */
  videoElement: HTMLVideoElement | HTMLCanvasElement | HTMLDivElement;
  /** Current detection frame data */
  detectionFrame: DetectionFrame | null;
  /** Camera stream dimensions */
  streamDimensions: { width: number; height: number };
  /** Overlay container dimensions */
  containerDimensions: { width: number; height: number };
  /** Show/hide overlay */
  visible?: boolean;
  /** Confidence threshold for showing detections */
  confidenceThreshold?: number;
  /** Enable interactive controls */
  interactive?: boolean;
  /** Callback when detection is clicked */
  onDetectionClick?: (detection: BoundingBox) => void;
  /** Callback when detection is right-clicked */
  onDetectionRightClick?: (detection: BoundingBox, event: React.MouseEvent) => void;
  /** Callback when overlay settings change */
  onSettingsChange?: (settings: OverlaySettings) => void;
  /** Color scheme */
  colorScheme?: 'light' | 'dark';
  /** Enable operator annotations */
  enableAnnotations?: boolean;
}

interface OverlaySettings {
  showBoundingBoxes: boolean;
  showConfidenceScores: boolean;
  showClassLabels: boolean;
  showTrackingIds: boolean;
  showBehaviorScores: boolean;
  confidenceThreshold: number;
  alertLevelFilters: Set<string>;
  classFilters: Set<string>;
  highlightSuspicious: boolean;
  showMetadata: boolean;
}

const LiveDetectionOverlay: React.FC<LiveDetectionOverlayProps> = ({
  videoElement,
  detectionFrame,
  streamDimensions,
  containerDimensions,
  visible = true,
  confidenceThreshold = 0.5,
  interactive = true,
  onDetectionClick,
  onDetectionRightClick,
  onSettingsChange,
  colorScheme = 'dark',
  enableAnnotations = false
}) => {
  const theme = useTheme();
  const overlayRef = useRef<HTMLDivElement>(null);
  const [settings, setSettings] = useState<OverlaySettings>({
    showBoundingBoxes: true,
    showConfidenceScores: true,
    showClassLabels: true,
    showTrackingIds: false,
    showBehaviorScores: false,
    confidenceThreshold: confidenceThreshold,
    alertLevelFilters: new Set(['normal', 'suspicious', 'shoplifting']),
    classFilters: new Set(['person', 'handbag', 'backpack', 'bottle']),
    highlightSuspicious: true,
    showMetadata: false
  });
  
  const [settingsMenuAnchor, setSettingsMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedDetection, setSelectedDetection] = useState<BoundingBox | null>(null);
  const [hoveredDetection, setHoveredDetection] = useState<BoundingBox | null>(null);

  // Professional color scheme for detections
  const colors = useMemo(() => ({
    normal: {
      primary: colorScheme === 'dark' ? '#3b82f6' : '#1d4ed8',
      secondary: colorScheme === 'dark' ? '#60a5fa' : '#3b82f6',
      background: colorScheme === 'dark' ? alpha('#1e3a8a', 0.9) : alpha('#eff6ff', 0.9)
    },
    suspicious: {
      primary: colorScheme === 'dark' ? '#f59e0b' : '#d97706',
      secondary: colorScheme === 'dark' ? '#fbbf24' : '#f59e0b',
      background: colorScheme === 'dark' ? alpha('#92400e', 0.9) : alpha('#fef3c7', 0.9)
    },
    shoplifting: {
      primary: colorScheme === 'dark' ? '#ef4444' : '#dc2626',
      secondary: colorScheme === 'dark' ? '#f87171' : '#ef4444',
      background: colorScheme === 'dark' ? alpha('#991b1b', 0.9) : alpha('#fee2e2', 0.9)
    },
    text: colorScheme === 'dark' ? '#ffffff' : '#000000',
    textSecondary: colorScheme === 'dark' ? '#e2e8f0' : '#64748b',
    overlay: colorScheme === 'dark' ? alpha('#000000', 0.7) : alpha('#ffffff', 0.9)
  }), [colorScheme]);

  // Calculate scale factors for coordinate transformation
  const scaleFactors = useMemo(() => {
    if (!streamDimensions.width || !streamDimensions.height) return { x: 1, y: 1 };
    
    return {
      x: containerDimensions.width / streamDimensions.width,
      y: containerDimensions.height / streamDimensions.height
    };
  }, [streamDimensions, containerDimensions]);

  // Filter detections based on settings
  const filteredDetections = useMemo(() => {
    if (!detectionFrame?.detections) return [];
    
    return detectionFrame.detections.filter(detection => {
      if (detection.confidence < settings.confidenceThreshold) return false;
      if (!settings.alertLevelFilters.has(detection.alert_level)) return false;
      if (!settings.classFilters.has(detection.class_name)) return false;
      return true;
    });
  }, [detectionFrame, settings]);

  // Update settings and notify parent
  const updateSettings = (newSettings: Partial<OverlaySettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    onSettingsChange?.(updatedSettings);
  };

  // Convert detection coordinates to overlay coordinates
  const transformCoordinates = (detection: BoundingBox) => {
    return {
      x: detection.x * scaleFactors.x,
      y: detection.y * scaleFactors.y,
      width: detection.width * scaleFactors.x,
      height: detection.height * scaleFactors.y
    };
  };

  // Get detection color based on alert level
  const getDetectionColor = (alertLevel: string) => {
    switch (alertLevel) {
      case 'suspicious': return colors.suspicious;
      case 'shoplifting': return colors.shoplifting;
      default: return colors.normal;
    }
  };

  // Get detection icon
  const getDetectionIcon = (className: string, alertLevel: string) => {
    if (alertLevel === 'shoplifting') return <Security fontSize="small" />;
    if (alertLevel === 'suspicious') return <Warning fontSize="small" />;
    
    switch (className) {
      case 'person': return <Person fontSize="small" />;
      case 'handbag':
      case 'backpack':
      case 'suitcase': return <ShoppingBag fontSize="small" />;
      default: return null;
    }
  };

  // Handle detection click
  const handleDetectionClick = (detection: BoundingBox, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (event.button === 2) { // Right click
      onDetectionRightClick?.(detection, event);
    } else {
      setSelectedDetection(detection);
      onDetectionClick?.(detection);
    }
  };

  if (!visible || !detectionFrame) return null;

  return (
    <Box
      ref={overlayRef}
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: interactive ? 'auto' : 'none',
        zIndex: 10,
        overflow: 'hidden'
      }}
    >
      {/* Detection Overlays */}
      {settings.showBoundingBoxes && filteredDetections.map((detection) => {
        const coords = transformCoordinates(detection);
        const detectionColors = getDetectionColor(detection.alert_level);
        const isSelected = selectedDetection?.id === detection.id;
        const isHovered = hoveredDetection?.id === detection.id;
        const isHighPriority = detection.alert_level !== 'normal';

        return (
          <Box
            key={detection.id}
            onMouseEnter={() => setHoveredDetection(detection)}
            onMouseLeave={() => setHoveredDetection(null)}
            onMouseDown={(e) => handleDetectionClick(detection, e)}
            onContextMenu={(e) => {
              e.preventDefault();
              onDetectionRightClick?.(detection, e);
            }}
            sx={{
              position: 'absolute',
              left: coords.x,
              top: coords.y,
              width: coords.width,
              height: coords.height,
              border: `2px solid ${detectionColors.primary}`,
              borderRadius: '4px',
              cursor: interactive ? 'pointer' : 'default',
              pointerEvents: interactive ? 'auto' : 'none',
              transition: 'all 0.2s ease',
              backgroundColor: isSelected || isHovered ? alpha(detectionColors.primary, 0.1) : 'transparent',
              boxShadow: isHighPriority || isSelected || isHovered ? 
                `0 0 12px ${alpha(detectionColors.primary, 0.6)}` : 
                `0 0 4px ${alpha(detectionColors.primary, 0.3)}`,
              transform: isSelected ? 'scale(1.02)' : 'scale(1)',
              zIndex: isSelected ? 15 : isHighPriority ? 12 : 11,
              // Animated border for high priority detections
              '&::before': isHighPriority && settings.highlightSuspicious ? {
                content: '""',
                position: 'absolute',
                top: -2,
                left: -2,
                right: -2,
                bottom: -2,
                background: `linear-gradient(45deg, ${detectionColors.primary}, transparent, ${detectionColors.primary})`,
                borderRadius: '6px',
                zIndex: -1,
                animation: 'pulse 2s ease-in-out infinite'
              } : {}
            }}
          >
            {/* Detection Label */}
            {(settings.showClassLabels || settings.showConfidenceScores) && (
              <Paper
                elevation={0}
                sx={{
                  position: 'absolute',
                  top: -28,
                  left: 0,
                  px: 1,
                  py: 0.5,
                  backgroundColor: detectionColors.background,
                  border: `1px solid ${detectionColors.primary}`,
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  minWidth: 'fit-content',
                  whiteSpace: 'nowrap',
                  fontSize: '11px',
                  zIndex: 20
                }}
              >
                {getDetectionIcon(detection.class_name, detection.alert_level)}
                
                {settings.showClassLabels && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: detectionColors.primary,
                      fontWeight: 600,
                      fontSize: '10px',
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase'
                    }}
                  >
                    {detection.class_name}
                  </Typography>
                )}
                
                {settings.showConfidenceScores && (
                  <Chip
                    label={`${Math.round(detection.confidence * 100)}%`}
                    size="small"
                    sx={{
                      height: 16,
                      fontSize: '9px',
                      backgroundColor: alpha(detectionColors.primary, 0.2),
                      color: detectionColors.primary,
                      '& .MuiChip-label': { px: 0.5 }
                    }}
                  />
                )}
                
                {settings.showTrackingIds && detection.tracking_id && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: colors.textSecondary,
                      fontSize: '9px',
                      fontFamily: 'monospace'
                    }}
                  >
                    #{detection.tracking_id}
                  </Typography>
                )}
              </Paper>
            )}

            {/* Behavior Score Indicator */}
            {settings.showBehaviorScores && detection.metadata?.behavior_score && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -20,
                  right: 0,
                  backgroundColor: colors.overlay,
                  px: 0.5,
                  py: 0.25,
                  borderRadius: '2px',
                  fontSize: '9px',
                  color: colors.text
                }}
              >
                Risk: {Math.round(detection.metadata.behavior_score * 100)}%
              </Box>
            )}

            {/* Center Focus Point */}
            {(isSelected || isHovered) && (
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: detectionColors.primary,
                  boxShadow: `0 0 8px ${detectionColors.primary}`,
                  animation: 'pulse 1s ease-in-out infinite'
                }}
              />
            )}
          </Box>
        );
      })}

      {/* Overlay Controls */}
      {interactive && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            display: 'flex',
            gap: 1,
            zIndex: 30
          }}
        >
          {/* Detection Count Badge */}
          <Paper
            elevation={0}
            sx={{
              px: 1,
              py: 0.5,
              backgroundColor: colors.overlay,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              borderRadius: '4px'
            }}
          >
            <Badge 
              badgeContent={filteredDetections.length} 
              color="primary"
              sx={{ '& .MuiBadge-badge': { fontSize: '10px', height: 16 } }}
            >
              <CenterFocusStrong sx={{ fontSize: 16, color: colors.text }} />
            </Badge>
            <Typography variant="caption" sx={{ color: colors.text, fontSize: '10px' }}>
              Detections
            </Typography>
          </Paper>

          {/* Settings Menu Button */}
          <IconButton
            size="small"
            onClick={(e) => setSettingsMenuAnchor(e.currentTarget)}
            sx={{
              backgroundColor: colors.overlay,
              color: colors.text,
              '&:hover': { backgroundColor: alpha(colors.overlay, 0.8) }
            }}
          >
            <Settings fontSize="small" />
          </IconButton>

          {/* Visibility Toggle */}
          <IconButton
            size="small"
            onClick={() => updateSettings({ showBoundingBoxes: !settings.showBoundingBoxes })}
            sx={{
              backgroundColor: colors.overlay,
              color: colors.text,
              '&:hover': { backgroundColor: alpha(colors.overlay, 0.8) }
            }}
          >
            {settings.showBoundingBoxes ? 
              <Visibility fontSize="small" /> : 
              <VisibilityOff fontSize="small" />
            }
          </IconButton>
        </Box>
      )}

      {/* Settings Menu */}
      <Menu
        anchorEl={settingsMenuAnchor}
        open={Boolean(settingsMenuAnchor)}
        onClose={() => setSettingsMenuAnchor(null)}
        PaperProps={{
          sx: {
            backgroundColor: colors.overlay,
            color: colors.text,
            minWidth: 280,
            p: 2
          }
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 2, color: colors.text }}>
          Detection Overlay Settings
        </Typography>
        
        {/* Confidence Threshold */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" sx={{ color: colors.textSecondary, mb: 1, display: 'block' }}>
            Confidence Threshold: {Math.round(settings.confidenceThreshold * 100)}%
          </Typography>
          <Slider
            value={settings.confidenceThreshold}
            onChange={(_, value) => updateSettings({ confidenceThreshold: value as number })}
            min={0}
            max={1}
            step={0.05}
            size="small"
            sx={{ color: colors.normal.primary }}
          />
        </Box>

        {/* Display Options */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <FormControlLabel
            control={
              <Switch 
                checked={settings.showConfidenceScores}
                onChange={(e) => updateSettings({ showConfidenceScores: e.target.checked })}
                size="small"
              />
            }
            label="Show Confidence Scores"
            sx={{ color: colors.text }}
          />
          
          <FormControlLabel
            control={
              <Switch 
                checked={settings.showTrackingIds}
                onChange={(e) => updateSettings({ showTrackingIds: e.target.checked })}
                size="small"
              />
            }
            label="Show Tracking IDs"
            sx={{ color: colors.text }}
          />
          
          <FormControlLabel
            control={
              <Switch 
                checked={settings.showBehaviorScores}
                onChange={(e) => updateSettings({ showBehaviorScores: e.target.checked })}
                size="small"
              />
            }
            label="Show Behavior Scores"
            sx={{ color: colors.text }}
          />
          
          <FormControlLabel
            control={
              <Switch 
                checked={settings.highlightSuspicious}
                onChange={(e) => updateSettings({ highlightSuspicious: e.target.checked })}
                size="small"
              />
            }
            label="Highlight Suspicious"
            sx={{ color: colors.text }}
          />
        </Box>
      </Menu>

      {/* Detection Details Panel (when selected) */}
      {selectedDetection && settings.showMetadata && (
        <Paper
          elevation={8}
          sx={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            p: 2,
            backgroundColor: colors.overlay,
            color: colors.text,
            maxWidth: 300,
            borderRadius: '8px',
            border: `1px solid ${getDetectionColor(selectedDetection.alert_level).primary}`
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1, color: getDetectionColor(selectedDetection.alert_level).primary }}>
            Detection Details
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, fontSize: '12px' }}>
            <Box>ID: {selectedDetection.id}</Box>
            <Box>Class: {selectedDetection.class_name}</Box>
            <Box>Confidence: {Math.round(selectedDetection.confidence * 100)}%</Box>
            <Box>Alert Level: {selectedDetection.alert_level}</Box>
            {selectedDetection.tracking_id && <Box>Tracking: #{selectedDetection.tracking_id}</Box>}
            {selectedDetection.metadata?.dwell_time && (
              <Box>Dwell Time: {Math.round(selectedDetection.metadata.dwell_time)}s</Box>
            )}
            {selectedDetection.metadata?.behavior_score && (
              <Box>Risk Score: {Math.round(selectedDetection.metadata.behavior_score * 100)}%</Box>
            )}
          </Box>
          
          <Button
            size="small"
            onClick={() => setSelectedDetection(null)}
            sx={{ mt: 1, color: colors.textSecondary }}
          >
            Close
          </Button>
        </Paper>
      )}

      {/* Processing Info */}
      {detectionFrame && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            backgroundColor: alpha(colors.overlay, 0.8),
            px: 1,
            py: 0.5,
            borderRadius: '4px',
            fontSize: '10px',
            color: colors.textSecondary,
            fontFamily: 'monospace'
          }}
        >
          {detectionFrame.processing_time_ms}ms • {detectionFrame.model_version}
        </Box>
      )}

      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
    </Box>
  );
};

export default LiveDetectionOverlay;
