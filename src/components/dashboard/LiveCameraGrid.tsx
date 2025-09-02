/**
 * LiveCameraGrid - Essential camera grid component
 * Displays live camera feeds in a responsive grid layout
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Videocam as VideocamIcon,
  VideocamOff as VideocamOffIcon,
  Fullscreen as FullscreenIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { CameraStatus } from '../../services/databaseApiService';

interface LiveCameraGridProps {
  cameras?: CameraStatus[];
  maxCameras?: number;
  onCameraSelect?: (camera: CameraStatus) => void;
}

const LiveCameraGrid: React.FC<LiveCameraGridProps> = ({
  cameras = [],
  maxCameras = 8,
  onCameraSelect
}) => {
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);

  const handleCameraClick = (camera: CameraStatus) => {
    setSelectedCamera(camera.id);
    onCameraSelect?.(camera);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'success';
      case 'offline': return 'error';
      case 'error': return 'warning';
      default: return 'default';
    }
  };

  // Ensure cameras is always an array
  const camerasArray = Array.isArray(cameras) ? cameras : [];
  const displayCameras = camerasArray.slice(0, maxCameras);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, color: 'white' }}>
        Live Camera Feeds ({displayCameras.length}/{camerasArray.length})
      </Typography>
      
      <Grid container spacing={2}>
        {displayCameras.map((camera) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={camera.id}>
            <Card
              sx={{
                bgcolor: 'rgba(30, 41, 59, 0.8)',
                border: selectedCamera === camera.id ? '2px solid #3b82f6' : '1px solid rgba(71, 85, 105, 0.3)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.3)'
                }
              }}
              onClick={() => handleCameraClick(camera)}
            >
              <CardContent sx={{ p: 1 }}>
                {/* Camera Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
                    {camera.name}
                  </Typography>
                  <Chip
                    size="small"
                    label={camera.status}
                    color={getStatusColor(camera.status) as any}
                    sx={{ fontSize: '0.7rem' }}
                  />
                </Box>

                {/* Camera Feed Area */}
                <Box
                  sx={{
                    aspectRatio: '16/9',
                    bgcolor: '#000',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    mb: 1
                  }}
                >
                  {camera.status === 'online' ? (
                    <>
                      {/* Placeholder for actual video stream */}
                      <Box
                        sx={{
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(45deg, #1e293b 25%, transparent 25%), linear-gradient(-45deg, #1e293b 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1e293b 75%), linear-gradient(-45deg, transparent 75%, #1e293b 75%)',
                          backgroundSize: '20px 20px',
                          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <VideocamIcon sx={{ color: '#3b82f6', fontSize: 40 }} />
                      </Box>
                      
                      {/* Camera Controls Overlay */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          display: 'flex',
                          gap: 0.5
                        }}
                      >
                        <IconButton
                          size="small"
                          sx={{ 
                            bgcolor: 'rgba(0,0,0,0.5)', 
                            color: 'white',
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                          }}
                        >
                          <FullscreenIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          sx={{ 
                            bgcolor: 'rgba(0,0,0,0.5)', 
                            color: 'white',
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                          }}
                        >
                          <SettingsIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </>
                  ) : camera.status === 'offline' ? (
                    <Box sx={{ textAlign: 'center', color: '#ef4444' }}>
                      <VideocamOffIcon sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="caption" display="block">
                        Camera Offline
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center', color: '#f59e0b' }}>
                      <CircularProgress size={30} sx={{ color: '#f59e0b', mb: 1 }} />
                      <Typography variant="caption" display="block">
                        Connecting...
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Camera Info */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    {camera.location}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    {camera.fps} FPS
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default LiveCameraGrid;