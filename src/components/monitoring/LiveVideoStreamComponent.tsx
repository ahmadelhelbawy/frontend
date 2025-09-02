import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Badge,
  LinearProgress,
  Menu,
  MenuItem,
  Slider
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Fullscreen as FullscreenIcon,
  Settings as SettingsIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
  Videocam as VideocamIcon,
  VideocamOff as VideocamOffIcon,
  FiberManualRecord as RecordIcon,
  Download as DownloadIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

interface VideoStreamProps {
  cameraId: string;
  cameraName: string;
  streamUrl?: string;
  onStreamStart?: (cameraId: string) => void;
  onStreamStop?: (cameraId: string) => void;
  onError?: (cameraId: string, error: string) => void;
  showControls?: boolean;
  autoStart?: boolean;
  width?: number | string;
  height?: number | string;
}

interface StreamStatus {
  status: 'starting' | 'connected' | 'error' | 'stopped';
  fps: number;
  framesProcessed: number;
  bytesStreamed: number;
  isHealthy: boolean;
  lastFrameTime?: string;
}

interface DetectionOverlay {
  id: string;
  type: 'person' | 'object' | 'behavior';
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence: number;
  label: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface VisionEvent {
  type: 'video_frame';
  cameraId: string;
  timestamp: string;
  frameData: string; // base64 encoded image
  visionEvent: {
    detections: any[];
    behavioralEvents: any[];
    riskAssessment: {
      overallRisk: number;
      alertLevel: string;
      requiresAttention: boolean;
    };
  };
}

const LiveVideoStreamComponent: React.FC<VideoStreamProps> = ({
  cameraId,
  cameraName,
  streamUrl,
  onStreamStart,
  onStreamStop,
  onError,
  showControls = true,
  autoStart = false,
  width = '100%',
  height = 300
}) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [streamStatus, setStreamStatus] = useState<StreamStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [detectionOverlays, setDetectionOverlays] = useState<DetectionOverlay[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(true);
  const [settingsAnchor, setSettingsAnchor] = useState<null | HTMLElement>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const websocketRef = useRef<WebSocket | null>(null);
  const streamIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize stream on mount if autoStart is enabled
  useEffect(() => {
    if (autoStart) {
      startStream();
    }
    
    return () => {
      stopStream();
    };
  }, [autoStart, cameraId]);
  
  // Fetch stream status periodically
  useEffect(() => {
    if (isStreaming) {
      const interval = setInterval(fetchStreamStatus, 2000);
      return () => clearInterval(interval);
    }
  }, [isStreaming, cameraId]);
  
  const fetchStreamStatus = async () => {
    try {
      const response = await fetch(`/api/streaming/cameras/${cameraId}/status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.ok) {
        const status: StreamStatus = await response.json();
        setStreamStatus(status);
        
        if (status.status === 'error' && !error) {
          setError('Stream connection error');
        } else if (status.status === 'connected' && error) {
          setError(null);
        }
      }
    } catch (err) {
      console.error('Failed to fetch stream status:', err);
    }
  };
  
  const startStream = async () => {
    if (isStreaming) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Start RTSP stream on backend
      const response = await fetch(`/api/streaming/cameras/${cameraId}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          camera_id: cameraId
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to start stream');
      }
      
      // Wait a moment for stream to initialize
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Connect to WebSocket for video frames
      await connectWebSocket();
      
      setIsStreaming(true);
      onStreamStart?.(cameraId);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start stream';
      setError(errorMessage);
      onError?.(cameraId, errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const stopStream = async () => {
    if (!isStreaming) return;
    
    try {
      // Disconnect WebSocket
      if (websocketRef.current) {
        websocketRef.current.close();
        websocketRef.current = null;
      }
      
      // Stop RTSP stream on backend
      await fetch(`/api/streaming/cameras/${cameraId}/stop`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      setIsStreaming(false);
      setStreamStatus(null);
      setDetectionOverlays([]);
      onStreamStop?.(cameraId);
      
    } catch (err) {
      console.error('Failed to stop stream:', err);
    }
  };
  
  const connectWebSocket = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${wsProtocol}//${window.location.host}/api/streaming/cameras/${cameraId}/webrtc`;
      
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log(`WebSocket connected for camera ${cameraId}`);
        websocketRef.current = ws;
        resolve();
      };
      
      ws.onmessage = (event) => {
        try {
          const data: VisionEvent = JSON.parse(event.data);
          handleVideoFrame(data);
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(new Error('WebSocket connection failed'));
      };
      
      ws.onclose = () => {
        console.log(`WebSocket disconnected for camera ${cameraId}`);
        websocketRef.current = null;
        if (isStreaming) {
          // Attempt to reconnect after a delay
          setTimeout(() => {
            if (isStreaming) {
              connectWebSocket().catch(console.error);
            }
          }, 3000);
        }
      };
    });
  };
  
  const handleVideoFrame = (data: VisionEvent) => {
    if (data.type === 'video_frame' && data.cameraId === cameraId) {
      // Draw frame on canvas
      const canvas = canvasRef.current;
      if (canvas && data.frameData) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const img = new Image();
          img.onload = () => {
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw video frame
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            // Draw detection overlays
            drawDetectionOverlays(ctx, data.visionEvent);
          };
          img.src = `data:image/jpeg;base64,${data.frameData}`;
        }
      }
      
      // Update detection overlays
      updateDetectionOverlays(data.visionEvent);
    }
  };
  
  const drawDetectionOverlays = (ctx: CanvasRenderingContext2D, visionEvent: any) => {
    if (!visionEvent.detections) return;
    
    visionEvent.detections.forEach((detection: any) => {
      if (detection.bbox) {
        const [x1, y1, x2, y2] = detection.bbox;
        const width = x2 - x1;
        const height = y2 - y1;
        
        // Scale coordinates to canvas size
        const scaleX = ctx.canvas.width / 640; // Assuming original frame width
        const scaleY = ctx.canvas.height / 480; // Assuming original frame height
        
        const scaledX = x1 * scaleX;
        const scaledY = y1 * scaleY;
        const scaledWidth = width * scaleX;
        const scaledHeight = height * scaleY;
        
        // Draw bounding box
        ctx.strokeStyle = getRiskColor(detection.confidence || 0);
        ctx.lineWidth = 2;
        ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);
        
        // Draw label
        const label = `${detection.class || 'Person'} (${Math.round((detection.confidence || 0) * 100)}%)`;
        ctx.fillStyle = getRiskColor(detection.confidence || 0);
        ctx.fillRect(scaledX, scaledY - 25, label.length * 8, 25);
        
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.fillText(label, scaledX + 5, scaledY - 8);
      }
    });
  };
  
  const updateDetectionOverlays = (visionEvent: any) => {
    const overlays: DetectionOverlay[] = [];
    
    if (visionEvent.detections) {
      visionEvent.detections.forEach((detection: any, index: number) => {
        if (detection.bbox) {
          const [x1, y1, x2, y2] = detection.bbox;
          overlays.push({
            id: `detection_${index}`,
            type: 'person',
            boundingBox: {
              x: x1,
              y: y1,
              width: x2 - x1,
              height: y2 - y1
            },
            confidence: detection.confidence || 0,
            label: detection.class || 'Person',
            riskLevel: getRiskLevel(detection.confidence || 0)
          });
        }
      });
    }
    
    setDetectionOverlays(overlays);
  };
  
  const getRiskColor = (confidence: number): string => {
    if (confidence >= 0.8) return '#f44336'; // High risk - red
    if (confidence >= 0.6) return '#ff9800'; // Medium risk - orange
    if (confidence >= 0.4) return '#2196f3'; // Low risk - blue
    return '#4caf50'; // Very low risk - green
  };
  
  const getRiskLevel = (confidence: number): 'low' | 'medium' | 'high' | 'critical' => {
    if (confidence >= 0.8) return 'critical';
    if (confidence >= 0.6) return 'high';
    if (confidence >= 0.4) return 'medium';
    return 'low';
  };
  
  const getStatusIcon = () => {
    if (isLoading) return <CircularProgress size={20} />;
    if (error) return <ErrorIcon color="error" />;
    if (streamStatus?.isHealthy) return <CheckCircleIcon color="success" />;
    return <WarningIcon color="warning" />;
  };
  
  const getStatusColor = () => {
    if (error) return 'error';
    if (streamStatus?.isHealthy) return 'success';
    if (isStreaming) return 'warning';
    return 'default';
  };
  
  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // TODO: Implement actual recording functionality
  };
  
  const downloadRecording = () => {
    // TODO: Implement download functionality
    console.log('Download recording for camera:', cameraId);
  };
  
  const handleSettingsClick = (event: React.MouseEvent<HTMLElement>) => {
    setSettingsAnchor(event.currentTarget);
  };
  
  const handleSettingsClose = () => {
    setSettingsAnchor(null);
  };

  return (
    <Card sx={{ width, height: 'auto' }}>
      <CardContent sx={{ p: 1 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box>
            <Typography variant="subtitle2" noWrap>
              {cameraName}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getStatusIcon()}
              <Chip
                label={streamStatus?.status || 'stopped'}
                size="small"
                color={getStatusColor() as any}
                sx={{ fontSize: '0.7rem' }}
              />
              {streamStatus && (
                <Typography variant="caption" color="textSecondary">
                  {streamStatus.fps.toFixed(1)} FPS
                </Typography>
              )}
            </Box>
          </Box>
          
          {showControls && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Badge badgeContent={detectionOverlays.length} color="primary">
                <VideocamIcon fontSize="small" />
              </Badge>
              <IconButton size="small" onClick={handleSettingsClick}>
                <SettingsIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
        </Box>
        
        {/* Video Container */}
        <Box sx={{ 
          position: 'relative', 
          height: typeof height === 'number' ? height : 240,
          bgcolor: 'black',
          borderRadius: 1,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {error ? (
            <Alert severity="error" sx={{ m: 2 }}>
              {error}
            </Alert>
          ) : (
            <>
              <canvas
                ref={canvasRef}
                width={640}
                height={480}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />
              
              {isLoading && (
                <Box sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <CircularProgress />
                  <Typography variant="caption" color="white">
                    Starting stream...
                  </Typography>
                </Box>
              )}
              
              {!isStreaming && !isLoading && (
                <Box sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center'
                }}>
                  <VideocamOffIcon sx={{ fontSize: 48, color: 'grey.500', mb: 1 }} />
                  <Typography variant="caption" color="grey.500">
                    Stream not active
                  </Typography>
                </Box>
              )}
              
              {/* Recording indicator */}
              {isRecording && (
                <Box sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  bgcolor: 'rgba(244, 67, 54, 0.8)',
                  borderRadius: 1,
                  px: 1,
                  py: 0.5
                }}>
                  <RecordIcon sx={{ fontSize: 12, color: 'white' }} />
                  <Typography variant="caption" color="white">
                    REC
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Box>
        
        {/* Controls */}
        {showControls && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: 1, 
            mt: 1 
          }}>
            <IconButton
              size="small"
              onClick={isStreaming ? stopStream : startStream}
              disabled={isLoading}
              color="primary"
            >
              {isStreaming ? <StopIcon /> : <PlayIcon />}
            </IconButton>
            
            <IconButton
              size="small"
              onClick={toggleRecording}
              disabled={!isStreaming}
              color={isRecording ? "error" : "default"}
            >
              <RecordIcon />
            </IconButton>
            
            <IconButton
              size="small"
              onClick={downloadRecording}
              disabled={!isRecording}
            >
              <DownloadIcon />
            </IconButton>
            
            <IconButton
              size="small"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
            </IconButton>
          </Box>
        )}
        
        {/* Stream Statistics */}
        {streamStatus && (
          <Box sx={{ mt: 1 }}>
            <LinearProgress 
              variant="determinate" 
              value={Math.min(streamStatus.fps / 30 * 100, 100)} 
              sx={{ height: 4, borderRadius: 2 }}
            />
            <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
              {streamStatus.framesProcessed} frames processed
            </Typography>
          </Box>
        )}
      </CardContent>
      
      {/* Settings Menu */}
      <Menu
        anchorEl={settingsAnchor}
        open={Boolean(settingsAnchor)}
        onClose={handleSettingsClose}
      >
        <MenuItem>
          <Box sx={{ width: 200, px: 1 }}>
            <Typography variant="caption">Volume</Typography>
            <Slider
              value={volume}
              onChange={(_, value) => setVolume(value as number)}
              min={0}
              max={1}
              step={0.1}
              size="small"
            />
          </Box>
        </MenuItem>
        <MenuItem onClick={() => console.log('Quality settings')}>
          Video Quality
        </MenuItem>
        <MenuItem onClick={() => console.log('Detection settings')}>
          Detection Settings
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default LiveVideoStreamComponent;