import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  AppBar,
  Toolbar,
  IconButton,
  Switch,
  FormControlLabel,
  Chip,
  Card,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Badge,
  CircularProgress,
} from '@mui/material';
import {
  VideoSettings as VideoSettingsIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Videocam as VideocamIcon,
  VideocamOff as VideocamOffIcon,
  Security as SecurityIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import AlertPanel from './AlertPanel';

interface CameraStream {
  camera_id: string;
  name: string;
  rtsp_url: string;
  status: 'active' | 'inactive' | 'error';
  last_frame_time?: string;
  detection_enabled: boolean;
  face_recognition_enabled: boolean;
  recording: boolean;
}

interface DetectionStats {
  camera_id: string;
  total_detections: number;
  face_detections: number;
  watchlist_matches: number;
  recent_alerts: number;
  processing_fps: number;
  last_update: string;
}

interface CameraGridProps {
  staffId: string;
}

const CameraGrid: React.FC<CameraGridProps> = ({ staffId }) => {
  const [cameras, setCameras] = useState<CameraStream[]>([]);
  const [detectionStats, setDetectionStats] = useState<DetectionStats[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const [fullscreenCamera, setFullscreenCamera] = useState<string | null>(null);
  const [globalDetectionEnabled, setGlobalDetectionEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  
  const statsWsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    initializeCameras();
    connectStatsWebSocket();
    
    return () => {
      if (statsWsRef.current) {
        statsWsRef.current.close();
      }
    };
  }, []);

  const initializeCameras = async () => {
    try {
      // Load camera configuration from backend
      const response = await fetch('http://localhost:8000/api/cameras/config');
      if (response.ok) {
        const data = await response.json();
        setCameras(data.cameras || []);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to load camera config:', error);
      setLoading(false);
    }
  };

  const connectStatsWebSocket = () => {
    try {
      const wsUrl = `ws://localhost:8000/api/detection/stats`;
      statsWsRef.current = new WebSocket(wsUrl);

      statsWsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'detection_stats') {
            setDetectionStats(data.stats);
          }
        } catch (error) {
          console.error('Stats WebSocket message error:', error);
        }
      };

      statsWsRef.current.onclose = () => {
        // Reconnect after 5 seconds
        setTimeout(connectStatsWebSocket, 5000);
      };

    } catch (error) {
      console.error('Stats WebSocket connection error:', error);
    }
  };

  const toggleCameraDetection = async (cameraId: string) => {
    try {
      const camera = cameras.find(c => c.camera_id === cameraId);
      if (!camera) return;

      const response = await fetch(`http://localhost:8000/api/cameras/${cameraId}/detection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          enabled: !camera.detection_enabled 
        }),
      });

      if (response.ok) {
        setCameras(prev => 
          prev.map(cam => 
            cam.camera_id === cameraId
              ? { ...cam, detection_enabled: !cam.detection_enabled }
              : cam
          )
        );
      }
    } catch (error) {
      console.error('Failed to toggle detection:', error);
    }
  };

  const toggleGlobalDetection = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/detection/global', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !globalDetectionEnabled }),
      });

      if (response.ok) {
        setGlobalDetectionEnabled(!globalDetectionEnabled);
      }
    } catch (error) {
      console.error('Failed to toggle global detection:', error);
    }
  };

  const getDetectionStatsForCamera = (cameraId: string) => {
    return detectionStats.find(stats => stats.camera_id === cameraId);
  };

  const renderCameraFeed = (camera: CameraStream) => {
    const stats = getDetectionStatsForCamera(camera.camera_id);
    const isFullscreen = fullscreenCamera === camera.camera_id;
    
    return (
      <Grid item xs={isFullscreen ? 12 : 6} lg={isFullscreen ? 12 : 3} key={camera.camera_id}>
        <Card 
          sx={{ 
            position: 'relative',
            height: isFullscreen ? '80vh' : 300,
            backgroundColor: '#000',
            border: camera.status === 'error' ? '2px solid #dc3545' : '1px solid #ddd',
          }}
        >
          {/* Camera Video Feed Placeholder */}
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: '100%',
              backgroundColor: '#1a1a1a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundImage: `
                repeating-linear-gradient(
                  45deg,
                  transparent,
                  transparent 2px,
                  rgba(255,255,255,0.03) 2px,
                  rgba(255,255,255,0.03) 4px
                )
              `,
            }}
          >
            {camera.status === 'active' ? (
              <Box sx={{ textAlign: 'center', color: 'white' }}>
                <VideocamIcon sx={{ fontSize: 48, mb: 1, color: '#4caf50' }} />
                <Typography variant="h6" sx={{ color: '#4caf50' }}>
                  LIVE FEED
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {camera.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  {camera.rtsp_url.includes('192.168') ? 'RTSP Stream Ready' : 'Demo Mode'}
                </Typography>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', color: 'white' }}>
                <VideocamOffIcon sx={{ fontSize: 48, mb: 1, color: '#f44336' }} />
                <Typography variant="body2" color="#f44336">
                  {camera.status === 'error' ? 'Camera Error' : 'Camera Offline'}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Camera Info Overlay */}
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              right: 8,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <Box>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  color: 'white',
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  mb: 0.5,
                  fontWeight: 600,
                }}
              >
                {camera.name}
              </Typography>
              
              <Chip
                label={camera.camera_id}
                size="small"
                sx={{ 
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  color: 'white',
                  fontSize: '0.7rem',
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {/* Detection Status */}
              <Chip
                label={camera.detection_enabled ? 'AI ON' : 'AI OFF'}
                size="small"
                color={camera.detection_enabled ? 'success' : 'default'}
                sx={{ fontSize: '0.7rem' }}
              />
              
              {/* Face Recognition Status */}
              {camera.face_recognition_enabled && (
                <Chip
                  label="FACE ID"
                  size="small"
                  color="primary"
                  sx={{ fontSize: '0.7rem' }}
                />
              )}
              
              {/* Recording Status */}
              {camera.recording && (
                <Chip
                  label="REC"
                  size="small"
                  color="error"
                  sx={{ fontSize: '0.7rem' }}
                />
              )}
            </Box>
          </Box>

          {/* Detection Stats Overlay */}
          {stats && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 8,
                left: 8,
                right: 8,
                backgroundColor: 'rgba(0,0,0,0.9)',
                color: 'white',
                p: 1,
                borderRadius: 1,
                fontSize: '0.75rem',
              }}
            >
              <Grid container spacing={1}>
                <Grid item xs={4}>
                  <Typography variant="caption" display="block">
                    Objects: <span style={{color: '#4caf50'}}>{stats.total_detections}</span>
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" display="block">
                    Faces: <span style={{color: '#2196f3'}}>{stats.face_detections}</span>
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" display="block">
                    Matches: <span style={{color: '#f44336'}}>{stats.watchlist_matches}</span>
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" display="block">
                    FPS: <span style={{color: '#ff9800'}}>{stats.processing_fps.toFixed(1)}</span>
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" display="block">
                    Alerts: <span style={{color: '#e91e63'}}>{stats.recent_alerts}</span>
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Camera Controls */}
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5,
            }}
          >
            <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
              <IconButton
                size="small"
                onClick={() => setFullscreenCamera(isFullscreen ? null : camera.camera_id)}
                sx={{ 
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  '&:hover': { backgroundColor: 'rgba(0,0,0,0.9)' }
                }}
              >
                {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Camera Settings">
              <IconButton
                size="small"
                onClick={() => setSelectedCamera(camera.camera_id)}
                sx={{ 
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  '&:hover': { backgroundColor: 'rgba(0,0,0,0.9)' }
                }}
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title={camera.detection_enabled ? "Disable AI Detection" : "Enable AI Detection"}>
              <IconButton
                size="small"
                onClick={() => toggleCameraDetection(camera.camera_id)}
                sx={{ 
                  backgroundColor: camera.detection_enabled ? 'rgba(76, 175, 80, 0.8)' : 'rgba(244, 67, 54, 0.8)',
                  color: 'white',
                  '&:hover': { 
                    backgroundColor: camera.detection_enabled ? 'rgba(76, 175, 80, 1)' : 'rgba(244, 67, 54, 1)'
                  }
                }}
              >
                <SecurityIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Card>
      </Grid>
    );
  };

  const renderCameraSettings = () => {
    const camera = cameras.find(c => c.camera_id === selectedCamera);
    if (!camera) return null;

    return (
      <Dialog
        open={Boolean(selectedCamera)}
        onClose={() => setSelectedCamera(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <VideocamIcon />
            <Box>
              <Typography variant="h6">{camera.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                {camera.camera_id}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Detection Settings</Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={camera.detection_enabled}
                    onChange={() => toggleCameraDetection(camera.camera_id)}
                  />
                }
                label="AI Object Detection"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={camera.face_recognition_enabled}
                    onChange={async () => {
                      try {
                        const response = await fetch(`http://localhost:8000/api/cameras/${camera.camera_id}/face-recognition`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ enabled: !camera.face_recognition_enabled }),
                        });
                        
                        if (response.ok) {
                          setCameras(prev => 
                            prev.map(c => 
                              c.camera_id === camera.camera_id
                                ? { ...c, face_recognition_enabled: !c.face_recognition_enabled }
                                : c
                            )
                          );
                        }
                      } catch (error) {
                        console.error('Failed to toggle face recognition:', error);
                      }
                    }}
                  />
                }
                label="Face Recognition"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={camera.recording}
                    onChange={async () => {
                      try {
                        const response = await fetch(`http://localhost:8000/api/cameras/${camera.camera_id}/recording`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ enabled: !camera.recording }),
                        });
                        
                        if (response.ok) {
                          setCameras(prev => 
                            prev.map(c => 
                              c.camera_id === camera.camera_id
                                ? { ...c, recording: !c.recording }
                                : c
                            )
                          );
                        }
                      } catch (error) {
                        console.error('Failed to toggle recording:', error);
                      }
                    }}
                  />
                }
                label="Recording"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Camera Information</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                RTSP URL: {camera.rtsp_url}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Status: <Chip 
                  label={camera.status.toUpperCase()} 
                  size="small"
                  color={camera.status === 'active' ? 'success' : 'error'}
                />
              </Typography>
              {camera.last_frame_time && (
                <Typography variant="body2" color="text.secondary">
                  Last Frame: {new Date(camera.last_frame_time).toLocaleString()}
                </Typography>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setSelectedCamera(null)}>Close</Button>
          <Button 
            variant="contained" 
            onClick={() => setSelectedCamera(null)}
          >
            Apply Settings
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const renderSystemStats = () => {
    const totalDetections = detectionStats.reduce((sum, stats) => sum + stats.total_detections, 0);
    const totalFaces = detectionStats.reduce((sum, stats) => sum + stats.face_detections, 0);
    const totalMatches = detectionStats.reduce((sum, stats) => sum + stats.watchlist_matches, 0);
    const avgFps = detectionStats.length > 0 
      ? detectionStats.reduce((sum, stats) => sum + stats.processing_fps, 0) / detectionStats.length
      : 0;
    
    return (
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={3}>
          <Paper sx={{ p: 1.5, textAlign: 'center' }}>
            <Typography variant="h5" color="primary">{totalDetections}</Typography>
            <Typography variant="caption">Total Objects</Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={3}>
          <Paper sx={{ p: 1.5, textAlign: 'center' }}>
            <Typography variant="h5" color="secondary">{totalFaces}</Typography>
            <Typography variant="caption">Faces Detected</Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={3}>
          <Paper sx={{ p: 1.5, textAlign: 'center', backgroundColor: '#dc354520' }}>
            <Typography variant="h5" color="#dc3545">{totalMatches}</Typography>
            <Typography variant="caption">Watchlist Matches</Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={3}>
          <Paper sx={{ p: 1.5, textAlign: 'center' }}>
            <Typography variant="h5" color="success.main">{avgFps.toFixed(1)}</Typography>
            <Typography variant="caption">Avg FPS</Typography>
          </Paper>
        </Grid>
      </Grid>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading 8-Camera Security System...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* System Statistics */}
      {renderSystemStats()}
      
      {/* Global Controls */}
      <Paper sx={{ mb: 2, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">System Controls</Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={globalDetectionEnabled}
                  onChange={toggleGlobalDetection}
                  color="primary"
                />
              }
              label="Global AI Detection"
            />
            
            <AlertPanel staffId={staffId} />
          </Box>
        </Box>
      </Paper>
      
      {/* Camera Grid */}
      <Grid container spacing={2}>
        {cameras.map(renderCameraFeed)}
      </Grid>
      
      {/* System Status Summary */}
      <Paper sx={{ mt: 2, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          System Status
        </Typography>
        
        <Grid container spacing={2} sx={{ textAlign: 'center' }}>
          <Grid item xs={3}>
            <Badge 
              badgeContent={cameras.filter(c => c.status === 'active').length} 
              color="success"
            >
              <VideocamIcon />
            </Badge>
            <Typography variant="caption" display="block">Active Cameras</Typography>
          </Grid>
          
          <Grid item xs={3}>
            <Badge 
              badgeContent={cameras.filter(c => c.detection_enabled).length} 
              color="primary"
            >
              <SecurityIcon />
            </Badge>
            <Typography variant="caption" display="block">AI Detection</Typography>
          </Grid>
          
          <Grid item xs={3}>
            <Badge 
              badgeContent={cameras.filter(c => c.face_recognition_enabled).length} 
              color="secondary"
            >
              <SecurityIcon />
            </Badge>
            <Typography variant="caption" display="block">Face Recognition</Typography>
          </Grid>
          
          <Grid item xs={3}>
            <Badge 
              badgeContent={cameras.filter(c => c.recording).length} 
              color="error"
            >
              <VideocamIcon />
            </Badge>
            <Typography variant="caption" display="block">Recording</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Camera Settings Dialog */}
      {renderCameraSettings()}
    </Box>
  );
};

export default CameraGrid;
