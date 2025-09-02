/**
 * MultiCameraGridView - Scalable multi-camera monitoring interface
 * Provides grid layout with real-time status indicators, detection overlays, and camera controls
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  IconButton,
  Tooltip,
  Badge,
  Chip,
  Menu,
  MenuItem,
  Card,
  CardContent,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Slider,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  LinearProgress,
  alpha,
  useTheme
} from '@mui/material';
import {
  Videocam,
  VideocamOff,
  Warning,
  CheckCircle,
  Error,
  ZoomIn,
  ZoomOut,
  Fullscreen,
  FullscreenExit,
  Settings,
  Refresh,
  ViewComfy,
  ViewModule,
  GridView,
  AspectRatio,
  PlayArrow,
  Pause,
  Stop,
  VolumeOff,
  VolumeUp,
  MoreVert,
  Visibility,
  VisibilityOff,
  RecordVoiceOver,
  Mic,
  MicOff,
  HighQuality,
  SignalWifi1Bar
} from '@mui/icons-material';

export interface Camera {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline' | 'maintenance' | 'error';
  streamUrl: string;
  resolution: string;
  fps: number;
  recording: boolean;
  aiEnabled: boolean;
  healthScore: number; // 0-100
  lastSeen: string;
  metadata: {
    model?: string;
    firmwareVersion?: string;
    ipAddress?: string;
    networkQuality?: number;
    storageUsedGb?: number;
    storageTotalGb?: number;
    temperatureC?: number;
  };
  currentDetections: Detection[];
  recentAlerts: Array<{
    id: string;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: string;
    message: string;
  }>;
  settings: {
    brightness: number;
    contrast: number;
    zoom: number;
    audioEnabled: boolean;
    nightVision: boolean;
    motionDetection: boolean;
    detectionSensitivity: number;
  };
}

export interface Detection {
  id: string;
  cameraId: string;
  timestamp: string;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence: number;
  className: string;
  trackId?: string;
  metadata?: {
    suspiciousActivity?: string;
    riskScore?: number;
    personId?: string;
    objectProperties?: Record<string, any>;
  };
}

interface GridLayout {
  columns: number;
  rows: number;
  aspectRatio: string;
}

interface MultiCameraGridViewProps {
  cameras: Camera[];
  onCameraSelect: (camera: Camera) => void;
  onCameraAction: (cameraId: string, action: string, params?: any) => Promise<void>;
  onDetectionClick: (detection: Detection) => void;
  selectedCameras: string[];
  fullscreenCamera?: string;
  onFullscreenToggle: (cameraId?: string) => void;
  realTimeUpdates?: boolean;
  allowMultiSelect?: boolean;
  showDetectionOverlay?: boolean;
  gridSize?: 'auto' | '2x2' | '3x3' | '4x4' | '2x3' | '3x4';
}

const MultiCameraGridView: React.FC<MultiCameraGridViewProps> = ({
  cameras,
  onCameraSelect,
  onCameraAction,
  onDetectionClick,
  selectedCameras,
  fullscreenCamera,
  onFullscreenToggle,
  realTimeUpdates = true,
  allowMultiSelect = true,
  showDetectionOverlay = true,
  gridSize = 'auto'
}) => {
  const theme = useTheme();
  
  // State management
  const [currentGridSize, setGridSize] = useState<'auto' | '2x2' | '3x3' | '4x4' | '2x3' | '3x4'>(gridSize);
  const [gridLayout, setGridLayout] = useState<GridLayout>({ columns: 3, rows: 2, aspectRatio: '16:9' });
  const [cameraMenuAnchor, setCameraMenuAnchor] = useState<{ element: HTMLElement; cameraId: string } | null>(null);
  const [settingsDialog, setSettingsDialog] = useState<{ open: boolean; cameraId?: string }>({ open: false });
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'carousel'>('grid');
  const [showOfflineCameras, setShowOfflineCameras] = useState(true);
  const [detectionOverlayEnabled, setDetectionOverlayEnabled] = useState(showDetectionOverlay);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);
  
  // Refs
  const gridRef = useRef<HTMLDivElement>(null);
  const refreshTimer = useRef<NodeJS.Timeout>();
  
  // Professional color scheme
  const colors = {
    primary: '#1e3a8a',
    secondary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f8fafc',
    textSecondary: '#cbd5e1'
  };

  // Calculate optimal grid layout
  const calculateGridLayout = useCallback((cameraCount: number, containerWidth: number, containerHeight: number): GridLayout => {
    if (currentGridSize !== 'auto') {
      const [colsStr, rowsStr] = currentGridSize.split('x');
      return {
        columns: parseInt(colsStr || '3'),
        rows: parseInt(rowsStr || '2'),
        aspectRatio: '16:9'
      };
    }

    // Auto-calculate optimal layout
    const aspectRatio = 16 / 9;
    const containerAspectRatio = containerWidth / containerHeight;
    
    let bestLayout = { columns: 1, rows: 1, aspectRatio: '16:9' };
    let bestScore = Infinity;
    
    for (let cols = 1; cols <= Math.ceil(Math.sqrt(cameraCount * 2)); cols++) {
      const rows = Math.ceil(cameraCount / cols);
      const cellWidth = containerWidth / cols;
      const cellHeight = containerHeight / rows;
      const cellAspectRatio = cellWidth / cellHeight;
      
      // Score based on how close we get to 16:9 aspect ratio
      const aspectRatioScore = Math.abs(cellAspectRatio - aspectRatio);
      const utilizationScore = Math.abs((cols * rows) - cameraCount) / (cols * rows);
      const totalScore = aspectRatioScore + utilizationScore;
      
      if (totalScore < bestScore) {
        bestScore = totalScore;
        bestLayout = { columns: cols, rows: rows, aspectRatio: '16:9' };
      }
    }
    
    return bestLayout;
  }, [currentGridSize]);

  // Filter cameras based on visibility settings
  const visibleCameras = useMemo(() => {
    if (!cameras || !Array.isArray(cameras)) {
      return [];
    }
    return (cameras || []).filter(camera => {
      if (!showOfflineCameras && camera.status === 'offline') {
        return false;
      }
      return true;
    });
  }, [cameras, showOfflineCameras]);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh && realTimeUpdates) {
      refreshTimer.current = setInterval(() => {
        // Trigger refresh callback if provided
      }, refreshInterval);
    }
    
    return () => {
      if (refreshTimer.current) {
        clearInterval(refreshTimer.current);
      }
    };
  }, [autoRefresh, realTimeUpdates, refreshInterval]);

  // Get camera status color
  const getCameraStatusColor = (status: string) => {
    switch (status) {
      case 'online': return colors.success;
      case 'offline': return colors.danger;
      case 'maintenance': return colors.warning;
      case 'error': return colors.danger;
      default: return colors.textSecondary;
    }
  };

  // Get camera status icon
  const getCameraStatusIcon = (camera: Camera) => {
    if (camera.status === 'offline') {
      return <VideocamOff sx={{ color: colors.danger }} />;
    }
    
    const recentAlerts = camera.recentAlerts || [];
    const alertCount = recentAlerts.filter(a => a.severity === 'high' || a.severity === 'critical').length;
    if (alertCount > 0) {
      return (
        <Badge badgeContent={alertCount} color="error">
          <Videocam sx={{ color: getCameraStatusColor(camera.status) }} />
        </Badge>
      );
    }
    
    return <Videocam sx={{ color: getCameraStatusColor(camera.status) }} />;
  };

  // Handle camera click
  const handleCameraClick = (camera: Camera) => {
    onCameraSelect(camera);
  };

  // Handle camera menu
  const handleCameraMenu = (event: React.MouseEvent, cameraId: string) => {
    event.stopPropagation();
    setCameraMenuAnchor({ element: event.currentTarget as HTMLElement, cameraId });
  };

  // Handle camera action
  const handleCameraAction = async (cameraId: string, action: string, params?: any) => {
    try {
      await onCameraAction(cameraId, action, params);
      setCameraMenuAnchor(null);
    } catch (error) {
      console.error(`Failed to ${action} camera:`, error);
    }
  };

  // Render detection overlay
  const renderDetectionOverlay = (camera: Camera) => {
    const currentDetections = camera.currentDetections || [];
    if (!detectionOverlayEnabled || currentDetections.length === 0) {
      return null;
    }

    return (
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none'
        }}
      >
        {currentDetections.map((detection: any, index: number) => (
          <Box
            key={detection.id}
            sx={{
              position: 'absolute',
              left: `${detection.bbox.x}%`,
              top: `${detection.bbox.y}%`,
              width: `${detection.bbox.width}%`,
              height: `${detection.bbox.height}%`,
              border: `2px solid ${detection.confidence > 0.8 ? colors.danger : colors.warning}`,
              borderRadius: 1,
              pointerEvents: 'auto',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: alpha(colors.danger, 0.1)
              }
            }}
            onClick={() => onDetectionClick(detection)}
          >
            <Box
              sx={{
                position: 'absolute',
                top: -24,
                left: 0,
                backgroundColor: alpha(colors.danger, 0.9),
                color: colors.text,
                px: 1,
                borderRadius: 1,
                fontSize: '10px',
                whiteSpace: 'nowrap'
              }}
            >
              {detection.className} {Math.round(detection.confidence * 100)}%
            </Box>
          </Box>
        ))}
      </Box>
    );
  };

  // Render camera card
  const renderCameraCard = (camera: Camera, index: number) => {
    const isSelected = selectedCameras.includes(camera.id);
    const isFullscreen = fullscreenCamera === camera.id;
    
    return (
      <Card
        key={camera.id}
        sx={{
          height: '100%',
          cursor: 'pointer',
          position: 'relative',
          border: isSelected ? `2px solid ${colors.secondary}` : `1px solid ${alpha(colors.primary, 0.2)}`,
          backgroundColor: alpha(colors.surface, 0.95),
          '&:hover': {
            boxShadow: theme.shadows[8],
            borderColor: colors.secondary
          },
          ...(isFullscreen && {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            borderRadius: 0
          })
        }}
        onClick={() => handleCameraClick(camera)}
      >
        {/* Camera Feed Area */}
        <Box
          sx={{
            aspectRatio: gridLayout.aspectRatio,
            position: 'relative',
            backgroundColor: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}
        >
          {camera.status === 'online' ? (
            <>
              {/* Simulated video feed */}
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  background: `linear-gradient(45deg, ${alpha(colors.primary, 0.3)}, ${alpha(colors.secondary, 0.3)})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                  Live Feed
                </Typography>
              </Box>
              
              {/* Detection Overlay */}
              {renderDetectionOverlay(camera)}
              
              {/* Recording Indicator */}
              {camera.recording && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    backgroundColor: alpha(colors.danger, 0.9),
                    color: colors.text,
                    px: 1,
                    borderRadius: 1,
                    fontSize: '10px'
                  }}
                >
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      backgroundColor: colors.text,
                      borderRadius: '50%',
                      animation: 'pulse 2s infinite'
                    }}
                  />
                  REC
                </Box>
              )}
              
              {/* Status Indicators */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  display: 'flex',
                  gap: 0.5
                }}
              >
                {camera.aiEnabled && (
                  <Chip
                    label="AI"
                    size="small"
                    sx={{
                      backgroundColor: alpha(colors.success, 0.2),
                      color: colors.success,
                      height: 20,
                      fontSize: '10px'
                    }}
                  />
                )}
                
                {(camera.currentDetections || []).length > 0 && (
                  <Chip
                    label={(camera.currentDetections || []).length}
                    size="small"
                    color="error"
                    sx={{ height: 20, fontSize: '10px' }}
                  />
                )}
              </Box>
            </>
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
                color: colors.textSecondary
              }}
            >
              <VideocamOff sx={{ fontSize: 48 }} />
              <Typography variant="body2">
                {camera.status === 'offline' ? 'Camera Offline' : 
                 camera.status === 'maintenance' ? 'Under Maintenance' : 'Camera Error'}
              </Typography>
            </Box>
          )}
          
          {/* Fullscreen Toggle */}
          <IconButton
            sx={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              backgroundColor: alpha(colors.surface, 0.8),
              color: colors.text,
              '&:hover': { backgroundColor: alpha(colors.surface, 0.9) }
            }}
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onFullscreenToggle(isFullscreen ? undefined : camera.id);
            }}
          >
            {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
          </IconButton>
        </Box>

        {/* Camera Info */}
        {!isFullscreen && (
          <CardContent sx={{ p: 1.5, pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getCameraStatusIcon(camera)}
                <Typography variant="body2" sx={{ color: colors.text, fontWeight: 600 }}>
                  {camera.name}
                </Typography>
              </Box>
              
              <IconButton
                size="small"
                onClick={(e) => handleCameraMenu(e, camera.id)}
                sx={{ color: colors.textSecondary }}
              >
                <MoreVert fontSize="small" />
              </IconButton>
            </Box>
            
            <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block', mb: 1 }}>
              {camera.location} • {camera.resolution} • {camera.fps} FPS
            </Typography>
            
            {/* Health Score */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                Health:
              </Typography>
              <LinearProgress
                variant="determinate"
                value={camera.healthScore}
                sx={{
                  flex: 1,
                  height: 4,
                  backgroundColor: alpha(colors.textSecondary, 0.2),
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: camera.healthScore > 80 ? colors.success : 
                                   camera.healthScore > 60 ? colors.warning : colors.danger
                  }
                }}
              />
              <Typography variant="caption" sx={{ color: colors.text, fontWeight: 600 }}>
                {camera.healthScore}%
              </Typography>
            </Box>
            
            {/* Recent Alerts */}
            {(camera.recentAlerts || []).length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                  Latest: {(camera.recentAlerts || [])[0]?.message}
                </Typography>
              </Box>
            )}
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header Controls */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          backgroundColor: alpha(colors.surface, 0.95),
          borderBottom: `1px solid ${alpha(colors.primary, 0.2)}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" sx={{ color: colors.text, fontWeight: 600 }}>
            Camera Grid ({visibleCameras.length} cameras)
          </Typography>
          
          {/* Grid Size Controls */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            {(['2x2', '3x3', '4x4', 'auto'] as const).map((size) => (
              <Button
                key={size}
                size="small"
                variant={currentGridSize === size ? 'contained' : 'outlined'}
                onClick={() => setGridSize(size)}
                sx={{
                  minWidth: 'auto',
                  px: 1.5,
                  color: currentGridSize === size ? colors.text : colors.textSecondary
                }}
              >
                {size}
              </Button>
            ))}
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={detectionOverlayEnabled}
                onChange={(e) => setDetectionOverlayEnabled(e.target.checked)}
                size="small"
              />
            }
            label="Detection Overlay"
            sx={{ color: colors.textSecondary, '& .MuiFormControlLabel-label': { fontSize: '14px' } }}
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={showOfflineCameras}
                onChange={(e) => setShowOfflineCameras(e.target.checked)}
                size="small"
              />
            }
            label="Show Offline"
            sx={{ color: colors.textSecondary, '& .MuiFormControlLabel-label': { fontSize: '14px' } }}
          />
          
          <Button
            startIcon={<Refresh />}
            size="small"
            sx={{ color: colors.textSecondary }}
          >
            Refresh
          </Button>
        </Box>
      </Paper>

      {/* Camera Grid */}
      <Box
        ref={gridRef}
        sx={{
          flex: 1,
          p: 2,
          overflow: 'auto'
        }}
      >
        <Grid container spacing={2}>
          {visibleCameras.map((camera: any, index: number) => (
            <Grid
              key={camera.id}
              item
              xs={12}
              sm={gridLayout.columns === 1 ? 12 : 6}
              md={12 / Math.min(gridLayout.columns, 4)}
              lg={12 / gridLayout.columns}
            >
              {renderCameraCard(camera, index)}
            </Grid>
          ))}
        </Grid>
        
        {visibleCameras.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <VideocamOff sx={{ fontSize: 64, color: colors.textSecondary, mb: 2 }} />
            <Typography variant="h6" sx={{ color: colors.textSecondary, mb: 1 }}>
              No cameras available
            </Typography>
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
              Check your camera connections or adjust filter settings
            </Typography>
          </Box>
        )}
      </Box>

      {/* Camera Context Menu */}
      <Menu
        anchorEl={cameraMenuAnchor?.element}
        open={Boolean(cameraMenuAnchor)}
        onClose={() => setCameraMenuAnchor(null)}
      >
        <MenuItem onClick={() => handleCameraAction(cameraMenuAnchor!.cameraId, 'restart')}>
          <Refresh sx={{ mr: 1 }} /> Restart Camera
        </MenuItem>
        <MenuItem onClick={() => {
          setSettingsDialog({ open: true, cameraId: cameraMenuAnchor!.cameraId });
          setCameraMenuAnchor(null);
        }}>
          <Settings sx={{ mr: 1 }} /> Camera Settings
        </MenuItem>
        <MenuItem onClick={() => handleCameraAction(cameraMenuAnchor!.cameraId, 'toggle_recording')}>
          <RecordVoiceOver sx={{ mr: 1 }} /> Toggle Recording
        </MenuItem>
        <MenuItem onClick={() => handleCameraAction(cameraMenuAnchor!.cameraId, 'toggle_ai')}>
          <Visibility sx={{ mr: 1 }} /> Toggle AI Detection
        </MenuItem>
      </Menu>

      {/* Camera Settings Dialog */}
      <Dialog
        open={settingsDialog.open}
        onClose={() => setSettingsDialog({ open: false })}
        maxWidth="md"
        fullWidth
      >
        {settingsDialog.cameraId && (
          <>
            <DialogTitle>
              Camera Settings - {cameras.find(c => c.id === settingsDialog.cameraId)?.name}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography gutterBottom>Brightness</Typography>
                  <Slider
                    defaultValue={50}
                    min={0}
                    max={100}
                    valueLabelDisplay="auto"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography gutterBottom>Contrast</Typography>
                  <Slider
                    defaultValue={50}
                    min={0}
                    max={100}
                    valueLabelDisplay="auto"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography gutterBottom>Detection Sensitivity</Typography>
                  <Slider
                    defaultValue={75}
                    min={0}
                    max={100}
                    valueLabelDisplay="auto"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Night Vision"
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSettingsDialog({ open: false })}>
                Cancel
              </Button>
              <Button variant="contained">
                Apply Settings
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default MultiCameraGridView;
