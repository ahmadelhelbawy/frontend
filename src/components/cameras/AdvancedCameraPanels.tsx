/**
 * AdvancedCameraPanels - Professional camera monitoring with feed simulation
 * Features customizable layouts, feed switching, and advanced controls
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Button,
  Chip,
  Slider,
  Switch,
  FormControlLabel,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  alpha,
  useTheme
} from '@mui/material';
import {
  Videocam,
  VideocamOff,
  Fullscreen,
  Settings,
  ZoomIn,
  ZoomOut,
  RotateLeft,
  RotateRight,
  VolumeUp,
  VolumeOff,
  RecordVoiceOver,
  Stop,
  PlayArrow,
  Pause,
  MoreVert,
  Refresh,
  Warning,
  CheckCircle,
  Error,
  HighQuality,
  Nightlight,
  FlashOn,
  GridOn,
  ViewComfy
} from '@mui/icons-material';

interface CameraFeed {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline' | 'maintenance' | 'error';
  streamUrl: string;
  resolution: string;
  fps: number;
  recording: boolean;
  aiEnabled: boolean;
  detectionCount: number;
  lastSeen: string;
  healthScore: number;
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

interface AdvancedCameraPanelsProps {
  cameras: CameraFeed[];
  onCameraSelect?: (camera: CameraFeed) => void;
  onCameraAction?: (cameraId: string, action: string, params?: any) => void;
  layout?: 'grid' | 'list' | 'carousel';
  showControls?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const AdvancedCameraPanels: React.FC<AdvancedCameraPanelsProps> = ({
  cameras,
  onCameraSelect,
  onCameraAction,
  layout = 'grid',
  showControls = true,
  autoRefresh = true,
  refreshInterval = 5000
}) => {
  const theme = useTheme();
  const [selectedCamera, setSelectedCamera] = useState<CameraFeed | null>(null);
  const [settingsDialog, setSettingsDialog] = useState<{ open: boolean; camera?: CameraFeed }>({ open: false });
  const [cameraMenuAnchor, setCameraMenuAnchor] = useState<{ element: HTMLElement; camera: CameraFeed } | null>(null);
  const [fullscreenCamera, setFullscreenCamera] = useState<string | null>(null);
  const [feedSimulation, setFeedSimulation] = useState<Map<string, boolean>>(new Map());

  // Refs for feed simulation
  const feedRefs = useRef<Map<string, HTMLCanvasElement>>(new Map());
  const animationRefs = useRef<Map<string, number>>(new Map());

  // Professional security color scheme
  const colors = {
    primary: '#0f172a',
    secondary: '#1e293b',
    accent: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    text: '#f8fafc',
    textSecondary: '#cbd5e1',
    surface: '#1e293b',
    border: 'rgba(59, 130, 246, 0.2)'
  };

  // Initialize feed simulation for cameras
  useEffect(() => {
    cameras.forEach(camera => {
      if (camera.status === 'online' && !feedSimulation.has(camera.id)) {
        setFeedSimulation(prev => new Map(prev).set(camera.id, true));
      }
    });
  }, [cameras, feedSimulation]);

  // Simulate camera feed with animated canvas
  const simulateFeed = useCallback((cameraId: string, canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    let frame = 0;

    const drawFrame = () => {
      // Clear canvas
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);

      // Create animated background pattern
      const time = Date.now() * 0.001;
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, `hsl(${(time * 50 + frame * 2) % 360}, 20%, 10%)`);
      gradient.addColorStop(1, `hsl(${(time * 30 + frame * 3) % 360}, 15%, 15%)`);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Add moving elements to simulate activity
      ctx.fillStyle = alpha(colors.accent, 0.3);
      for (let i = 0; i < 5; i++) {
        const x = (Math.sin(time + i) * 50 + width / 2) % width;
        const y = (Math.cos(time * 0.5 + i) * 30 + height / 2) % height;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Add timestamp overlay
      ctx.fillStyle = colors.text;
      ctx.font = '12px monospace';
      ctx.fillText(new Date().toLocaleTimeString(), 10, height - 10);

      frame++;
      const animationId = requestAnimationFrame(drawFrame);
      animationRefs.current.set(cameraId, animationId);
    };

    drawFrame();
  }, [colors]);

  // Start/stop feed simulation
  useEffect(() => {
    cameras.forEach(camera => {
      const canvas = feedRefs.current.get(camera.id);
      const isSimulating = feedSimulation.get(camera.id);
      
      if (canvas && isSimulating && camera.status === 'online') {
        simulateFeed(camera.id, canvas);
      } else {
        const animationId = animationRefs.current.get(camera.id);
        if (animationId) {
          cancelAnimationFrame(animationId);
          animationRefs.current.delete(camera.id);
        }
      }
    });

    return () => {
      animationRefs.current.forEach(animationId => {
        cancelAnimationFrame(animationId);
      });
      animationRefs.current.clear();
    };
  }, [cameras, feedSimulation, simulateFeed]);

  const handleCameraClick = useCallback((camera: CameraFeed) => {
    setSelectedCamera(camera);
    onCameraSelect?.(camera);
  }, [onCameraSelect]);

  const handleCameraAction = useCallback(async (camera: CameraFeed, action: string, params?: any) => {
    try {
      await onCameraAction?.(camera.id, action, params);
      setCameraMenuAnchor(null);
    } catch (error) {
      console.error(`Failed to ${action} camera:`, error);
    }
  }, [onCameraAction]);

  const handleSettingsOpen = useCallback((camera: CameraFeed) => {
    setSettingsDialog({ open: true, camera });
    setCameraMenuAnchor(null);
  }, []);

  const handleSettingsClose = useCallback(() => {
    setSettingsDialog({ open: false });
  }, []);

  const handleFullscreenToggle = useCallback((camera: CameraFeed) => {
    if (fullscreenCamera === camera.id) {
      setFullscreenCamera(null);
    } else {
      setFullscreenCamera(camera.id);
    }
  }, [fullscreenCamera]);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'online': return colors.success;
      case 'offline': return colors.danger;
      case 'maintenance': return colors.warning;
      case 'error': return colors.danger;
      default: return colors.textSecondary;
    }
  }, [colors]);

  const getStatusIcon = useCallback((camera: CameraFeed) => {
    switch (camera.status) {
      case 'online':
        return <CheckCircle sx={{ color: colors.success }} />;
      case 'offline':
        return <VideocamOff sx={{ color: colors.danger }} />;
      case 'maintenance':
        return <Warning sx={{ color: colors.warning }} />;
      case 'error':
        return <Error sx={{ color: colors.danger }} />;
      default:
        return <Videocam sx={{ color: colors.textSecondary }} />;
    }
  }, [colors]);

  // Render camera panel
  const renderCameraPanel = (camera: CameraFeed) => {
    const isSelected = selectedCamera?.id === camera.id;
    const isFullscreen = fullscreenCamera === camera.id;
    const isSimulating = feedSimulation.get(camera.id);

    return (
      <Card
        key={camera.id}
        sx={{
          height: '100%',
          backgroundColor: alpha(colors.surface, 0.95),
          border: `2px solid ${isSelected ? colors.accent : colors.border}`,
          borderRadius: 2,
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: colors.accent,
            boxShadow: `0 8px 32px ${alpha(colors.accent, 0.1)}`,
            transform: 'translateY(-2px)'
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
            position: 'relative',
            aspectRatio: '16/9',
            backgroundColor: '#000',
            overflow: 'hidden'
          }}
        >
          {camera.status === 'online' ? (
            <>
              {/* Simulated Feed */}
              <canvas
                ref={(el) => {
                  if (el) {
                    feedRefs.current.set(camera.id, el);
                    el.width = el.offsetWidth;
                    el.height = el.offsetHeight;
                  }
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  display: isSimulating ? 'block' : 'none'
                }}
              />
              
              {/* Placeholder when not simulating */}
              {!isSimulating && (
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(45deg, ${alpha(colors.primary, 0.3)}, ${alpha(colors.secondary, 0.3)})`
                  }}
                >
                  <Videocam sx={{ fontSize: 48, color: colors.textSecondary }} />
                </Box>
              )}

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
                    py: 0.5,
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
                
                {camera.detectionCount > 0 && (
                  <Chip
                    label={camera.detectionCount}
                    size="small"
                    color="error"
                    sx={{ height: 20, fontSize: '10px' }}
                  />
                )}
              </Box>

              {/* Controls Overlay */}
              {showControls && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    display: 'flex',
                    gap: 0.5,
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                    '&:hover': {
                      opacity: 1
                    }
                  }}
                >
                  <Tooltip title="Fullscreen">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFullscreenToggle(camera);
                      }}
                      sx={{
                        backgroundColor: alpha(colors.surface, 0.8),
                        color: colors.text,
                        '&:hover': { backgroundColor: alpha(colors.surface, 0.9) }
                      }}
                    >
                      <Fullscreen />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Settings">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSettingsOpen(camera);
                      }}
                      sx={{
                        backgroundColor: alpha(colors.surface, 0.8),
                        color: colors.text,
                        '&:hover': { backgroundColor: alpha(colors.surface, 0.9) }
                      }}
                    >
                      <Settings />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="More Options">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCameraMenuAnchor({ element: e.currentTarget, camera });
                      }}
                      sx={{
                        backgroundColor: alpha(colors.surface, 0.8),
                        color: colors.text,
                        '&:hover': { backgroundColor: alpha(colors.surface, 0.9) }
                      }}
                    >
                      <MoreVert />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
            </>
          ) : (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                color: colors.textSecondary
              }}
            >
              {getStatusIcon(camera)}
              <Typography variant="body2">
                {camera.status === 'offline' ? 'Camera Offline' : 
                 camera.status === 'maintenance' ? 'Under Maintenance' : 'Camera Error'}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Camera Info */}
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getStatusIcon(camera)}
              <Typography variant="subtitle1" sx={{ color: colors.text, fontWeight: 600 }}>
                {camera.name}
              </Typography>
            </Box>
            
            <Chip
              label={camera.status}
              size="small"
              sx={{
                backgroundColor: alpha(getStatusColor(camera.status), 0.2),
                color: getStatusColor(camera.status),
                textTransform: 'capitalize'
              }}
            />
          </Box>
          
          <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 1 }}>
            {camera.location} • {camera.resolution} • {camera.fps} FPS
          </Typography>
          
          {/* Health Score */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" sx={{ color: colors.textSecondary }}>
              Health:
            </Typography>
            <Box sx={{ flex: 1 }}>
              <Box
                sx={{
                  height: 4,
                  backgroundColor: alpha(colors.textSecondary, 0.2),
                  borderRadius: 2,
                  overflow: 'hidden'
                }}
              >
                <Box
                  sx={{
                    height: '100%',
                    width: `${camera.healthScore}%`,
                    backgroundColor: camera.healthScore > 80 ? colors.success : 
                                   camera.healthScore > 60 ? colors.warning : colors.danger,
                    transition: 'width 0.3s ease'
                  }}
                />
              </Box>
            </Box>
            <Typography variant="caption" sx={{ color: colors.text, fontWeight: 600 }}>
              {camera.healthScore}%
            </Typography>
          </Box>
        </CardContent>

        {/* Actions */}
        {showControls && (
          <CardActions sx={{ p: 2, pt: 0 }}>
            <Button
              size="small"
              startIcon={camera.recording ? <Stop /> : <RecordVoiceOver />}
              onClick={(e) => {
                e.stopPropagation();
                handleCameraAction(camera, 'toggle_recording');
              }}
              sx={{
                color: camera.recording ? colors.danger : colors.accent,
                '&:hover': {
                  backgroundColor: alpha(camera.recording ? colors.danger : colors.accent, 0.1)
                }
              }}
            >
              {camera.recording ? 'Stop' : 'Record'}
            </Button>
            
            <Button
              size="small"
              startIcon={<Refresh />}
              onClick={(e) => {
                e.stopPropagation();
                handleCameraAction(camera, 'restart');
              }}
              sx={{
                color: colors.textSecondary,
                '&:hover': {
                  backgroundColor: alpha(colors.accent, 0.1)
                }
              }}
            >
              Restart
            </Button>
          </CardActions>
        )}
      </Card>
    );
  };

  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      {/* Camera Grid */}
      <Grid container spacing={3} sx={{ p: 3 }}>
        {cameras.map(renderCameraPanel)}
      </Grid>

      {/* Camera Context Menu */}
      <Menu
        anchorEl={cameraMenuAnchor?.element}
        open={Boolean(cameraMenuAnchor)}
        onClose={() => setCameraMenuAnchor(null)}
        PaperProps={{
          sx: {
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`
          }
        }}
      >
        <MenuItem onClick={() => handleCameraAction(cameraMenuAnchor!.camera, 'restart')}>
          <Refresh sx={{ mr: 1 }} /> Restart Camera
        </MenuItem>
        <MenuItem onClick={() => handleSettingsOpen(cameraMenuAnchor!.camera)}>
          <Settings sx={{ mr: 1 }} /> Camera Settings
        </MenuItem>
        <MenuItem onClick={() => handleCameraAction(cameraMenuAnchor!.camera, 'toggle_recording')}>
          <RecordVoiceOver sx={{ mr: 1 }} /> Toggle Recording
        </MenuItem>
        <MenuItem onClick={() => handleCameraAction(cameraMenuAnchor!.camera, 'toggle_ai')}>
          <HighQuality sx={{ mr: 1 }} /> Toggle AI Detection
        </MenuItem>
      </Menu>

      {/* Camera Settings Dialog */}
      <Dialog
        open={settingsDialog.open}
        onClose={handleSettingsClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`
          }
        }}
      >
        {settingsDialog.camera && (
          <>
            <DialogTitle sx={{ color: colors.text }}>
              Camera Settings - {settingsDialog.camera.name}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <Typography gutterBottom sx={{ color: colors.text }}>
                    Brightness
                  </Typography>
                  <Slider
                    defaultValue={settingsDialog.camera.settings.brightness}
                    min={0}
                    max={100}
                    valueLabelDisplay="auto"
                    sx={{
                      '& .MuiSlider-thumb': {
                        color: colors.accent
                      },
                      '& .MuiSlider-track': {
                        color: colors.accent
                      },
                      '& .MuiSlider-rail': {
                        color: alpha(colors.textSecondary, 0.3)
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography gutterBottom sx={{ color: colors.text }}>
                    Contrast
                  </Typography>
                  <Slider
                    defaultValue={settingsDialog.camera.settings.contrast}
                    min={0}
                    max={100}
                    valueLabelDisplay="auto"
                    sx={{
                      '& .MuiSlider-thumb': {
                        color: colors.accent
                      },
                      '& .MuiSlider-track': {
                        color: colors.accent
                      },
                      '& .MuiSlider-rail': {
                        color: alpha(colors.textSecondary, 0.3)
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography gutterBottom sx={{ color: colors.text }}>
                    Detection Sensitivity
                  </Typography>
                  <Slider
                    defaultValue={settingsDialog.camera.settings.detectionSensitivity}
                    min={0}
                    max={100}
                    valueLabelDisplay="auto"
                    sx={{
                      '& .MuiSlider-thumb': {
                        color: colors.accent
                      },
                      '& .MuiSlider-track': {
                        color: colors.accent
                      },
                      '& .MuiSlider-rail': {
                        color: alpha(colors.textSecondary, 0.3)
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        defaultChecked={settingsDialog.camera.settings.nightVision}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: colors.accent
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: colors.accent
                          }
                        }}
                      />
                    }
                    label="Night Vision"
                    sx={{ color: colors.text }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        defaultChecked={settingsDialog.camera.settings.audioEnabled}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: colors.accent
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: colors.accent
                          }
                        }}
                      />
                    }
                    label="Audio Recording"
                    sx={{ color: colors.text }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        defaultChecked={settingsDialog.camera.settings.motionDetection}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: colors.accent
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: colors.accent
                          }
                        }}
                      />
                    }
                    label="Motion Detection"
                    sx={{ color: colors.text }}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleSettingsClose} sx={{ color: colors.textSecondary }}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSettingsClose}
                sx={{
                  backgroundColor: colors.accent,
                  '&:hover': {
                    backgroundColor: alpha(colors.accent, 0.8)
                  }
                }}
              >
                Apply Settings
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default AdvancedCameraPanels;
