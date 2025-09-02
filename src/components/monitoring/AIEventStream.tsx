import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Badge,
  Paper,
  LinearProgress,
  Collapse
} from '@mui/material';
import {
  Psychology as PsychologyIcon,
  Visibility as VisibilityIcon,
  VolumeUp as VolumeUpIcon,
  Face as FaceIcon,
  SmartToy as SmartToyIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Timeline as TimelineIcon,
  Speed as SpeedIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useWebSocket } from '../../contexts/WebSocketContext';

interface AIEvent {
  id: string;
  timestamp: string;
  type: 'vision' | 'audio' | 'multimodal' | 'cognitive_decision' | 'threat_assessment';
  source: string; // camera_id, microphone_id, or 'cognitive_agent'
  data: {
    confidence: number;
    threatLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
    description: string;
    reasoning?: string;
    actionTaken?: string;
    metadata?: any;
  };
  processingTime: number; // milliseconds
  status: 'processing' | 'completed' | 'error';
}

interface StreamMetrics {
  eventsPerSecond: number;
  averageProcessingTime: number;
  totalEventsToday: number;
  errorRate: number;
  threatDistribution: {
    none: number;
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
}

const AIEventStream: React.FC = () => {
  const [events, setEvents] = useState<AIEvent[]>([]);
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [metrics, setMetrics] = useState<StreamMetrics>({
    eventsPerSecond: 0,
    averageProcessingTime: 0,
    totalEventsToday: 0,
    errorRate: 0,
    threatDistribution: { none: 0, low: 0, medium: 0, high: 0, critical: 0 }
  });
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);
  
  const { socket } = useWebSocket();

  useEffect(() => {
    if (socket) {
      // Listen for AI events
      socket.on('ai_event', (event: AIEvent) => {
        setEvents(prev => {
          const newEvents = [event, ...prev.slice(0, 99)]; // Keep last 100 events
          return newEvents;
        });
        
        // Auto-scroll to top if enabled
        if (isAutoScroll && listRef.current) {
          listRef.current.scrollTop = 0;
        }
      });

      socket.on('stream_metrics', (newMetrics: StreamMetrics) => {
        setMetrics(newMetrics);
      });

      // Request initial data
      socket.emit('get_ai_events');
      socket.emit('get_stream_metrics');

      return () => {
        socket.off('ai_event');
        socket.off('stream_metrics');
      };
    }
  }, [socket, isAutoScroll]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'vision': return <VisibilityIcon />;
      case 'audio': return <VolumeUpIcon />;
      case 'multimodal': return <SmartToyIcon />;
      case 'cognitive_decision': return <PsychologyIcon />;
      case 'threat_assessment': return <WarningIcon />;
      default: return <TimelineIcon />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'vision': return 'primary';
      case 'audio': return 'secondary';
      case 'multimodal': return 'info';
      case 'cognitive_decision': return 'success';
      case 'threat_assessment': return 'warning';
      default: return 'default';
    }
  };

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'none': return '#4caf50';
      case 'low': return '#2196f3';
      case 'medium': return '#ff9800';
      case 'high': return '#f44336';
      case 'critical': return '#9c27b0';
      default: return '#757575';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon color="success" />;
      case 'processing': return <TimelineIcon color="info" />;
      case 'error': return <ErrorIcon color="error" />;
      default: return <TimelineIcon />;
    }
  };

  const toggleEventExpansion = (eventId: string) => {
    setExpandedEvents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString() + '.' + date.getMilliseconds().toString().padStart(3, '0');
  };

  return (
    <Box>
      {/* Stream Metrics */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ pb: 2 }}>
          <Typography variant="h6" gutterBottom>
            AI Event Stream Metrics
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SpeedIcon color="primary" />
              <Box>
                <Typography variant="h6" color="primary">
                  {metrics.eventsPerSecond.toFixed(1)}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Events/sec
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TimelineIcon color="info" />
              <Box>
                <Typography variant="h6" color="info.main">
                  {metrics.averageProcessingTime}ms
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Avg Processing
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUpIcon color="success" />
              <Box>
                <Typography variant="h6" color="success.main">
                  {metrics.totalEventsToday}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Total Today
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ErrorIcon color="error" />
              <Box>
                <Typography variant="h6" color="error.main">
                  {(metrics.errorRate * 100).toFixed(1)}%
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Error Rate
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Threat Distribution */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" gutterBottom>
              Threat Level Distribution
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {Object.entries(metrics.threatDistribution).map(([level, count]) => (
                <Chip
                  key={level}
                  label={`${level}: ${count}`}
                  size="small"
                  sx={{
                    bgcolor: getThreatColor(level),
                    color: 'white',
                    textTransform: 'capitalize'
                  }}
                />
              ))}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Event Stream */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                Real-time AI Event Stream
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Badge badgeContent={events.length} color="primary">
                  <TimelineIcon />
                </Badge>
                <Typography variant="body2" color="textSecondary">
                  Live Events
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box 
            ref={listRef}
            sx={{ 
              maxHeight: 600, 
              overflow: 'auto',
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'rgba(0,0,0,0.1)',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '4px',
              },
            }}
          >
            <List sx={{ p: 0 }}>
              {events.map((event, index) => (
                <React.Fragment key={event.id}>
                  <ListItem 
                    alignItems="flex-start"
                    sx={{ 
                      py: 1,
                      bgcolor: index === 0 ? 'action.hover' : 'transparent',
                      transition: 'background-color 0.3s ease'
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar 
                        sx={{ 
                          bgcolor: getThreatColor(event.data.threatLevel),
                          width: 32,
                          height: 32
                        }}
                      >
                        {getEventIcon(event.type)}
                      </Avatar>
                    </ListItemAvatar>
                    
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="body2" component="span">
                            {event.data.description}
                          </Typography>
                          <Chip 
                            label={`${Math.round(event.data.confidence * 100)}%`}
                            size="small"
                            color="primary"
                            sx={{ fontSize: '0.7rem' }}
                          />
                          {getStatusIcon(event.status)}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="caption" color="textSecondary">
                              {formatTimestamp(event.timestamp)}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              •
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {event.source}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              •
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {event.processingTime}ms
                            </Typography>
                            <Chip
                              label={event.data.threatLevel}
                              size="small"
                              sx={{
                                bgcolor: getThreatColor(event.data.threatLevel),
                                color: 'white',
                                fontSize: '0.6rem',
                                height: 16,
                                textTransform: 'capitalize'
                              }}
                            />
                          </Box>
                          
                          {(event.data.reasoning || event.data.actionTaken) && (
                            <IconButton
                              size="small"
                              onClick={() => toggleEventExpansion(event.id)}
                              sx={{ p: 0, mt: 0.5 }}
                            >
                              {expandedEvents.has(event.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
                          )}
                          
                          <Collapse in={expandedEvents.has(event.id)}>
                            <Box sx={{ mt: 1, p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
                              {event.data.reasoning && (
                                <Typography variant="caption" display="block" gutterBottom>
                                  <strong>Reasoning:</strong> {event.data.reasoning}
                                </Typography>
                              )}
                              {event.data.actionTaken && (
                                <Typography variant="caption" display="block" gutterBottom>
                                  <strong>Action:</strong> {event.data.actionTaken}
                                </Typography>
                              )}
                              {event.data.metadata && (
                                <Typography variant="caption" display="block" color="textSecondary">
                                  <strong>Metadata:</strong> {JSON.stringify(event.data.metadata, null, 2)}
                                </Typography>
                              )}
                            </Box>
                          </Collapse>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < events.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AIEventStream;