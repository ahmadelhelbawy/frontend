/**
 * AdvancedCameraGrid - Cinematic Camera Grid with AI Enhancement
 * Features: Customizable layouts, threat indicators, AI overlays, focus mode
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import {
  Box,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Chip,
  Typography,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Paper,
  Divider,
  Badge,
  alpha,
  useTheme
} from '@mui/material';
import {
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Settings as SettingsIcon,
  GridView as GridViewIcon,
  ViewModule as ViewModuleIcon,
  ViewCarousel as ViewCarouselIcon,
  VideoCall as FocusVideoIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Videocam as VideocamIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

interface CameraGridConfig {
  layout: 'grid' | 'masonry' | 'carousel' | 'focus' | 'split';
  columns: number;
  aspectRatio: string;
  spacing: number;
  borderRadius: number;
  overlayStyle: 'minimal' | 'detailed' | 'tactical' | 'cinematic';
  animations: boolean;
  hoverEffects: boolean;
  focusMode: boolean;
  showAudioIndicators: boolean;
  autoFocusOnThreat: boolean;
}

interface Camera {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline' | 'error' | 'maintenance';
  threatLevel: 'normal' | 'low' | 'medium' | 'high' | 'critical';
  streamUrl: string;
  detections: Detection[];
  audioEnabled: boolean;
  resolution: string;
  fps: number;
  lastSeen: Date;
  metadata: {
    confidence: number;
    processingLatency: number;
    bandwidth: number;
  };
}

interface Detection {
  id: string;
  type: string;
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  timestamp: Date;
}

const AdvancedCameraGrid: React.FC<{
  cameras: Camera[];
  onCameraSelect?: (camera: Camera) => void;
  onCameraAction?: (cameraId: string, action: string) => void;
}> = ({ cameras, onCameraSelect, onCameraAction }) => {
  const theme = useTheme();
  const [gridConfig, setGridConfig] = useState<CameraGridConfig>({
    layout: 'grid',
    columns: 4,
    aspectRatio: '16:9',
    spacing: 8,
    borderRadius: 12,
    overlayStyle: 'tactical',
    animations: true,
    hoverEffects: true,
    focusMode: false,
    showAudioIndicators: true,
    autoFocusOnThreat: true
  });

  const [focusedCamera, setFocusedCamera] = useState<string | null>(null);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [selectedCameras, setSelectedCameras] = useState<string[]>([]);

  // Auto-focus on critical threats
  useEffect(() => {
    if (gridConfig.autoFocusOnThreat) {
      const criticalCamera = cameras.find(camera => camera.threatLevel === 'critical');
      if (criticalCamera && focusedCamera !== criticalCamera.id) {
        setFocusedCamera(criticalCamera.id);
      }
    }
  }, [cameras, gridConfig.autoFocusOnThreat, focusedCamera]);

  const handleCameraFocus = (cameraId: string) => {
    setFocusedCamera(focusedCamera === cameraId ? null : cameraId);
    const camera = cameras.find(c => c.id === cameraId);
    if (camera && onCameraSelect) {
      onCameraSelect(camera);
    }
  };

  const getGridColumns = () => {
    switch (gridConfig.layout) {
      case 'focus':
        return focusedCamera ? 1 : gridConfig.columns;
      case 'split':
        return 2;
      default:
        return gridConfig.columns;
    }
  };

  return (
    <motion.div
      className="advanced-camera-grid"
      layout
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: `linear-gradient(135deg, ${alpha(theme.palette.background.default, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
        borderRadius: 16,
        overflow: 'hidden'
      }}
    >
      {/* Grid Controls */}
      <CameraGridControls
        config={gridConfig}
        onConfigChange={setGridConfig}
        showCustomizer={showCustomizer}
        onToggleCustomizer={() => setShowCustomizer(!showCustomizer)}
        selectedCount={selectedCameras.length}
        totalCameras={cameras.length}
      />

      {/* Main Camera Grid */}
      <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
        <AutoLayoutGrid config={gridConfig}>
          <AnimatePresence mode="popLayout">
            {cameras.map((camera, index) => (
              <motion.div
                key={camera.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  scale: focusedCamera === camera.id ? 1.05 : 1,
                  zIndex: focusedCamera === camera.id ? 10 : 1
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 400, 
                  damping: 25,
                  delay: index * 0.05
                }}
                whileHover={gridConfig.hoverEffects ? { 
                  scale: 1.02, 
                  y: -5,
                  transition: { type: "spring", stiffness: 400, damping: 10 }
                } : {}}
                className="camera-container"
                style={{
                  gridColumn: focusedCamera === camera.id && gridConfig.layout === 'focus' 
                    ? 'span 2' 
                    : 'span 1'
                }}
              >
                <CinematicCameraFeed
                  camera={camera}
                  config={gridConfig}
                  isFocused={focusedCamera === camera.id}
                  isSelected={selectedCameras.includes(camera.id)}
                  onFocus={() => handleCameraFocus(camera.id)}
                  onSelect={() => {
                    setSelectedCameras(prev => 
                      prev.includes(camera.id)
                        ? prev.filter(id => id !== camera.id)
                        : [...prev, camera.id]
                    );
                  }}
                  onAction={(action) => onCameraAction?.(camera.id, action)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </AutoLayoutGrid>
      </Box>

      {/* Customization Panel */}
      <AnimatePresence>
        {showCustomizer && (
          <CameraGridCustomizer
            config={gridConfig}
            onChange={setGridConfig}
            onClose={() => setShowCustomizer(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Cinematic Camera Feed Component
const CinematicCameraFeed: React.FC<{
  camera: Camera;
  config: CameraGridConfig;
  isFocused: boolean;
  isSelected: boolean;
  onFocus: () => void;
  onSelect: () => void;
  onAction: (action: string) => void;
}> = ({ camera, config, isFocused, isSelected, onFocus, onSelect, onAction }) => {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controls = useAnimation();

  // Threat level colors
  const threatColors = {
    normal: theme.palette.success.main,
    low: theme.palette.info.main,
    medium: theme.palette.warning.main,
    high: theme.palette.error.main,
    critical: theme.palette.error.dark
  };

  // Status colors
  const statusColors = {
    online: theme.palette.success.main,
    offline: theme.palette.error.main,
    error: theme.palette.error.dark,
    maintenance: theme.palette.warning.main
  };

  useEffect(() => {
    if (camera.threatLevel === 'critical') {
      controls.start({
        boxShadow: [
          `0 0 20px ${alpha(threatColors.critical, 0.6)}`,
          `0 0 40px ${alpha(threatColors.critical, 0.8)}`,
          `0 0 20px ${alpha(threatColors.critical, 0.6)}`
        ],
        transition: { duration: 1, repeat: Infinity, ease: "easeInOut" }
      });
    }
  }, [camera.threatLevel, controls, threatColors.critical]);

  return (
    <motion.div
      className={`cinematic-feed threat-${camera.threatLevel} status-${camera.status}`}
      animate={controls}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onFocus}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: config.aspectRatio,
        borderRadius: config.borderRadius,
        overflow: 'hidden',
        cursor: 'pointer',
        border: `2px solid ${isSelected ? theme.palette.primary.main : threatColors[camera.threatLevel]}`,
        backgroundColor: alpha(theme.palette.background.paper, 0.9),
        backdropFilter: 'blur(10px)'
      }}
    >
      {/* Video Stream */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundColor: alpha(theme.palette.common.black, 0.8),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {camera.status === 'online' ? (
          <video
            ref={videoRef}
            className="camera-stream"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            autoPlay
            muted
            playsInline
          />
        ) : (
          <Box sx={{ textAlign: 'center', color: 'white' }}>
            <VideocamIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              {camera.status === 'offline' ? 'Camera Offline' : 
               camera.status === 'error' ? 'Connection Error' : 
               'Under Maintenance'}
            </Typography>
          </Box>
        )}
      </Box>

      {/* AI Overlay */}
      <motion.div
        className="ai-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered || isFocused ? 1 : 0.7 }}
        transition={{ duration: 0.2 }}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none'
        }}
      >
        {/* Detection Boxes */}
        <DetectionOverlay 
          detections={camera.detections} 
          overlayStyle={config.overlayStyle}
        />

        {/* Threat Indicators */}
        <ThreatIndicators 
          level={camera.threatLevel}
          animated={config.animations}
        />
      </motion.div>

      {/* Camera Info Panel */}
      <motion.div
        className="camera-info-panel"
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: isHovered || isFocused ? 1 : 0,
          y: isHovered || isFocused ? 0 : 20
        }}
        transition={{ duration: 0.2 }}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: `linear-gradient(transparent, ${alpha(theme.palette.common.black, 0.8)})`,
          padding: 12,
          color: 'white'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {camera.name}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {camera.location} • {camera.resolution} • {camera.fps}fps
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {config.showAudioIndicators && (
              <Tooltip title={camera.audioEnabled ? "Audio On" : "Audio Off"}>
                <IconButton size="small" sx={{ color: 'white' }}>
                  {camera.audioEnabled ? <VolumeUpIcon /> : <VolumeOffIcon />}
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Refresh Stream">
              <IconButton 
                size="small" 
                sx={{ color: 'white' }}
                onClick={(e) => {
                  e.stopPropagation();
                  onAction('refresh');
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={isFocused ? "Exit Focus" : "Focus Camera"}>
              <IconButton 
                size="small" 
                sx={{ color: 'white' }}
                onClick={(e) => {
                  e.stopPropagation();
                  onFocus();
                }}
              >
                {isFocused ? <FullscreenExitIcon /> : <FullscreenIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Performance Metrics */}
        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
          <Chip
            size="small"
            label={`${Math.round(camera.metadata.confidence * 100)}%`}
            sx={{
              backgroundColor: alpha(theme.palette.success.main, 0.3),
              color: 'white',
              fontSize: '0.7rem'
            }}
          />
          <Chip
            size="small"
            label={`${camera.metadata.processingLatency}ms`}
            sx={{
              backgroundColor: alpha(theme.palette.info.main, 0.3),
              color: 'white',
              fontSize: '0.7rem'
            }}
          />
        </Box>
      </motion.div>

      {/* Status Indicator */}
      <Box
        sx={{
          position: 'absolute',
          top: 12,
          right: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <motion.div
          animate={{
            scale: camera.status === 'online' ? [1, 1.2, 1] : 1,
            opacity: camera.status === 'online' ? [0.7, 1, 0.7] : 0.5
          }}
          transition={{
            duration: 2,
            repeat: camera.status === 'online' ? Infinity : 0,
            ease: "easeInOut"
          }}
        >
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: statusColors[camera.status],
              boxShadow: `0 0 10px ${alpha(statusColors[camera.status], 0.6)}`
            }}
          />
        </motion.div>
        
        {camera.detections.length > 0 && (
          <Badge
            badgeContent={camera.detections.length}
            color="error"
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '0.6rem',
                minWidth: 16,
                height: 16
              }
            }}
          >
            <WarningIcon sx={{ color: theme.palette.warning.main, fontSize: 16 }} />
          </Badge>
        )}
      </Box>

      {/* Pulse Effect for Critical Alerts */}
      {camera.threatLevel === 'critical' && config.animations && (
        <motion.div
          className="alert-pulse"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            position: 'absolute',
            inset: -4,
            border: `4px solid ${threatColors.critical}`,
            borderRadius: config.borderRadius + 4,
            pointerEvents: 'none'
          }}
        />
      )}
    </motion.div>
  );
};

// Auto Layout Grid Component
const AutoLayoutGrid: React.FC<{
  config: CameraGridConfig;
  children: React.ReactNode;
}> = ({ config, children }) => {
  const getGridStyle = (): React.CSSProperties => {
    switch (config.layout) {
      case 'masonry':
        return {
          display: 'grid',
          gridTemplateColumns: `repeat(${config.columns}, 1fr)`,
          gap: config.spacing,
          gridAutoRows: 'auto'
        };
      case 'carousel':
        return {
          display: 'flex',
          gap: config.spacing,
          overflowX: 'auto',
          scrollSnapType: 'x mandatory'
        };
      default:
        return {
          display: 'grid',
          gridTemplateColumns: `repeat(${config.columns}, 1fr)`,
          gap: config.spacing
        };
    }
  };

  return (
    <Box sx={getGridStyle() as any}>
      {children}
    </Box>
  );
};

// Detection Overlay Component
const DetectionOverlay: React.FC<{
  detections: Detection[];
  overlayStyle: string;
}> = ({ detections, overlayStyle }) => {
  return (
    <>
      {detections.map((detection) => (
        <motion.div
          key={detection.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          style={{
            position: 'absolute',
            left: `${detection.boundingBox.x}%`,
            top: `${detection.boundingBox.y}%`,
            width: `${detection.boundingBox.width}%`,
            height: `${detection.boundingBox.height}%`,
            border: '2px solid #ff4444',
            borderRadius: 4,
            pointerEvents: 'none'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: -24,
              left: 0,
              backgroundColor: 'rgba(255, 68, 68, 0.9)',
              color: 'white',
              padding: '2px 6px',
              borderRadius: 1,
              fontSize: '0.7rem',
              fontWeight: 600
            }}
          >
            {detection.type} ({Math.round(detection.confidence * 100)}%)
          </Box>
        </motion.div>
      ))}
    </>
  );
};

// Threat Indicators Component
const ThreatIndicators: React.FC<{
  level: string;
  animated: boolean;
}> = ({ level, animated }) => {
  if (level === 'normal') return null;

  const getIndicatorColor = () => {
    switch (level) {
      case 'low': return '#2196f3';
      case 'medium': return '#ff9800';
      case 'high': return '#f44336';
      case 'critical': return '#d32f2f';
      default: return '#4caf50';
    }
  };

  return (
    <motion.div
      style={{
        position: 'absolute',
        top: 8,
        left: 8,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: '4px 8px',
        borderRadius: 12,
        color: 'white'
      }}
      animate={animated ? {
        scale: level === 'critical' ? [1, 1.1, 1] : 1,
        opacity: level === 'critical' ? [0.8, 1, 0.8] : 1
      } : {}}
      transition={{
        duration: 1,
        repeat: level === 'critical' ? Infinity : 0,
        ease: "easeInOut"
      }}
    >
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: getIndicatorColor()
        }}
      />
      <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 600 }}>
        {level.toUpperCase()}
      </Typography>
    </motion.div>
  );
};

// Camera Grid Controls Component
const CameraGridControls: React.FC<{
  config: CameraGridConfig;
  onConfigChange: (config: CameraGridConfig) => void;
  showCustomizer: boolean;
  onToggleCustomizer: () => void;
  selectedCount: number;
  totalCameras: number;
}> = ({ config, onConfigChange, showCustomizer, onToggleCustomizer, selectedCount, totalCameras }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 2,
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        backgroundColor: alpha(theme.palette.background.paper, 0.5),
        backdropFilter: 'blur(10px)'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Live Camera Matrix
        </Typography>
        <Chip
          size="small"
          label={`${totalCameras} cameras`}
          sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.1) }}
        />
        {selectedCount > 0 && (
          <Chip
            size="small"
            label={`${selectedCount} selected`}
            color="primary"
          />
        )}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Layout Buttons */}
        <Tooltip title="Grid Layout">
          <IconButton
            size="small"
            color={config.layout === 'grid' ? 'primary' : 'default'}
            onClick={() => onConfigChange({ ...config, layout: 'grid' })}
          >
            <GridViewIcon />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Focus Mode">
          <IconButton
            size="small"
            color={config.layout === 'focus' ? 'primary' : 'default'}
            onClick={() => onConfigChange({ ...config, layout: 'focus' })}
          >
            <FocusVideoIcon />
          </IconButton>
        </Tooltip>

        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

        {/* Customization Toggle */}
        <Tooltip title="Customize Grid">
          <IconButton
            size="small"
            color={showCustomizer ? 'primary' : 'default'}
            onClick={onToggleCustomizer}
          >
            <SettingsIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

// Camera Grid Customizer Component
const CameraGridCustomizer: React.FC<{
  config: CameraGridConfig;
  onChange: (config: CameraGridConfig) => void;
  onClose: () => void;
}> = ({ config, onChange, onClose }) => {
  const theme = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <Paper
        sx={{
          m: 2,
          p: 3,
          backgroundColor: alpha(theme.palette.background.paper, 0.95),
          backdropFilter: 'blur(20px)',
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
        }}
      >
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Grid Customization
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Columns: {config.columns}
            </Typography>
            <Slider
              value={config.columns}
              onChange={(_, value) => onChange({ ...config, columns: value as number })}
              min={1}
              max={8}
              marks
              valueLabelDisplay="auto"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Spacing: {config.spacing}px
            </Typography>
            <Slider
              value={config.spacing}
              onChange={(_, value) => onChange({ ...config, spacing: value as number })}
              min={4}
              max={32}
              valueLabelDisplay="auto"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Overlay Style</InputLabel>
              <Select
                value={config.overlayStyle}
                onChange={(e) => onChange({ ...config, overlayStyle: e.target.value as any })}
              >
                <MenuItem value="minimal">Minimal</MenuItem>
                <MenuItem value="detailed">Detailed</MenuItem>
                <MenuItem value="tactical">Tactical</MenuItem>
                <MenuItem value="cinematic">Cinematic</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Aspect Ratio</InputLabel>
              <Select
                value={config.aspectRatio}
                onChange={(e) => onChange({ ...config, aspectRatio: e.target.value })}
              >
                <MenuItem value="16:9">16:9 (Widescreen)</MenuItem>
                <MenuItem value="4:3">4:3 (Standard)</MenuItem>
                <MenuItem value="1:1">1:1 (Square)</MenuItem>
                <MenuItem value="21:9">21:9 (Ultrawide)</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.animations}
                    onChange={(e) => onChange({ ...config, animations: e.target.checked })}
                  />
                }
                label="Animations"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={config.hoverEffects}
                    onChange={(e) => onChange({ ...config, hoverEffects: e.target.checked })}
                  />
                }
                label="Hover Effects"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={config.showAudioIndicators}
                    onChange={(e) => onChange({ ...config, showAudioIndicators: e.target.checked })}
                  />
                }
                label="Audio Indicators"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={config.autoFocusOnThreat}
                    onChange={(e) => onChange({ ...config, autoFocusOnThreat: e.target.checked })}
                  />
                }
                label="Auto-Focus on Threats"
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </motion.div>
  );
};

export default AdvancedCameraGrid;