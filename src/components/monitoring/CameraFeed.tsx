import React, { useRef, useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Badge
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Videocam as VideocamIcon,
  VideocamOff as VideocamOffIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

interface Alert {
  id: string;
  type: 'suspicious_behavior' | 'theft_detected' | 'loitering';
  confidence: number;
  timestamp: Date;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface CameraFeedProps {
  cameraId: string;
  name: string;
  streamUrl: string;
  isActive: boolean;
  alerts: Alert[];
  onToggleCamera: (cameraId: string) => void;
  onCameraSettings: (cameraId: string) => void;
}

const CameraFeed: React.FC<CameraFeedProps> = ({
  cameraId,
  name,
  streamUrl,
  isActive,
  alerts,
  onToggleCamera,
  onCameraSettings
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

  useEffect(() => {
    if (isActive && videoRef.current) {
      // Simulate video stream connection
      const video = videoRef.current;
      
      // In a real implementation, this would connect to the actual stream
      video.src = streamUrl || '/api/placeholder-video';
      
      video.onloadstart = () => setConnectionStatus('connecting');
      video.oncanplay = () => setConnectionStatus('connected');
      video.onerror = () => setConnectionStatus('error');
      
      video.play().catch(() => setConnectionStatus('error'));
    }
  }, [isActive, streamUrl]);

  useEffect(() => {
    // Draw alert overlays on canvas
    if (canvasRef.current && videoRef.current && alerts.length > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const video = videoRef.current;
      
      if (ctx) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        alerts.forEach(alert => {
          const { x, y, width, height } = alert.boundingBox;
          
          // Draw bounding box
          ctx.strokeStyle = alert.type === 'theft_detected' ? '#f44336' : '#ff9800';
          ctx.lineWidth = 3;
          ctx.strokeRect(x, y, width, height);
          
          // Draw alert label
          ctx.fillStyle = alert.type === 'theft_detected' ? '#f44336' : '#ff9800';
          ctx.font = '14px Arial';
          const text = `${alert.type.replace('_', ' ')} (${Math.round(alert.confidence * 100)}%)`;
          ctx.fillText(text, x, y - 5);
        });
      }
    }
  }, [alerts]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const getStatusColor = () => {
    if (!isActive) return 'default';
    switch (connectionStatus) {
      case 'connected': return 'success';
      case 'connecting': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = () => {
    if (!isActive) return 'Offline';
    switch (connectionStatus) {
      case 'connected': return 'Live';
      case 'connecting': return 'Connecting';
      case 'error': return 'Error';
      default: return 'Unknown';
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ p: 1, pb: '8px !important' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle2" noWrap>
            {name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Badge badgeContent={alerts.length} color="error">
              <WarningIcon color={alerts.length > 0 ? 'error' : 'disabled'} fontSize="small" />
            </Badge>
            <Chip
              size="small"
              label={getStatusText()}
              color={getStatusColor()}
              icon={isActive ? <VideocamIcon /> : <VideocamOffIcon />}
            />
            <IconButton size="small" onClick={handleMenuOpen}>
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
        
        <Box sx={{ position: 'relative', aspectRatio: '16/9', bgcolor: 'black', borderRadius: 1 }}>
          {isActive ? (
            <>
              <video
                ref={videoRef}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: 4
                }}
                muted
                playsInline
              />
              <canvas
                ref={canvasRef}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none'
                }}
              />
            </>
          ) : (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: 'text.secondary'
              }}
            >
              <VideocamOffIcon sx={{ fontSize: 48 }} />
            </Box>
          )}
        </Box>
      </CardContent>
      
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          onToggleCamera(cameraId);
          handleMenuClose();
        }}>
          {isActive ? 'Turn Off' : 'Turn On'}
        </MenuItem>
        <MenuItem onClick={() => {
          onCameraSettings(cameraId);
          handleMenuClose();
        }}>
          Settings
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default CameraFeed;