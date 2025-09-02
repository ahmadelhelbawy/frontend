import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  useTheme,
  alpha,
  Fade,
  Slide,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Badge
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  Close as CloseIcon,
  CheckCircle as CheckIcon,
  Visibility as VisibilityIcon,
  AccessTime as TimeIcon,
  PriorityHigh as PriorityIcon
} from '@mui/icons-material';

interface CriticalAlert {
  id: string;
  type: 'security_breach' | 'known_offender' | 'suspicious_behavior' | 'system_critical';
  severity: 'low' | 'medium' | 'high' | 'critical' | 'emergency';
  title: string;
  message: string;
  location: string;
  timestamp: Date;
  requiresAcknowledgment: boolean;
  autoCloseAfter?: number; // seconds
  personThumbnail?: string; // URL to person image
  confidence?: number; // AI confidence score
  priority?: number; // 1-5 priority level
}

interface AlertQueueItem extends CriticalAlert {
  queuePosition: number;
  timeInQueue: number; // seconds
}

interface BigAlertNotificationsProps {
  alerts?: CriticalAlert[];
  onAlertAcknowledge?: (alertId: string) => void;
  onAlertDismiss?: (alertId: string) => void;
  showAlertQueue?: boolean; // Show alert queue panel
  maxQueueSize?: number; // Maximum alerts in queue
}

const BigAlertNotifications: React.FC<BigAlertNotificationsProps> = ({
  alerts = [],
  onAlertAcknowledge,
  onAlertDismiss,
  showAlertQueue = true,
  maxQueueSize = 10
}) => {
  const theme = useTheme();
  const [activeAlerts, setActiveAlerts] = useState<CriticalAlert[]>([]);
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<Set<string>>(new Set());
  const [alertQueue, setAlertQueue] = useState<AlertQueueItem[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second for queue timing
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Enhanced alert generation with queue management
  useEffect(() => {
    if (alerts.length > 0) {
      setActiveAlerts(alerts);
      // Add to queue with priority sorting
      const queueItems: AlertQueueItem[] = alerts.map((alert, index) => ({
        ...alert,
        queuePosition: index + 1,
        timeInQueue: 0,
        priority: alert.priority || getSeverityPriority(alert.severity)
      }));
      setAlertQueue(prev => [...prev, ...queueItems].slice(0, maxQueueSize));
      return;
    }

    // Enhanced mock alerts with person thumbnails and varied severities
    const mockAlerts: CriticalAlert[] = [
      {
        id: 'critical-001',
        type: 'known_offender',
        severity: 'critical',
        title: 'KNOWN OFFENDER DETECTED',
        message: 'Person with previous shoplifting history identified',
        location: 'ELECTRONICS SECTION - CAMERA 02',
        timestamp: new Date(),
        requiresAcknowledgment: true,
        personThumbnail: '/api/mock/person-001.jpg',
        confidence: 0.94,
        priority: 5
      },
      {
        id: 'high-001',
        type: 'suspicious_behavior',
        severity: 'high',
        title: 'SUSPICIOUS BEHAVIOR',
        message: 'Person concealing items detected',
        location: 'CLOTHING SECTION - CAMERA 04',
        timestamp: new Date(Date.now() - 30000),
        requiresAcknowledgment: true,
        personThumbnail: '/api/mock/person-002.jpg',
        confidence: 0.82,
        priority: 4
      },
      {
        id: 'medium-001',
        type: 'suspicious_behavior',
        severity: 'medium',
        title: 'LOITERING DETECTED',
        message: 'Person in high-value area for extended time',
        location: 'JEWELRY SECTION - CAMERA 01',
        timestamp: new Date(Date.now() - 120000),
        requiresAcknowledgment: false,
        confidence: 0.76,
        priority: 3
      }
    ];

    // Simulate alerts appearing over time
    const timer1 = setTimeout(() => {
      if (mockAlerts[0]) setActiveAlerts([mockAlerts[0]]);
      if (mockAlerts[0]) addToQueue(mockAlerts[0]);
    }, 3000);

    const timer2 = setTimeout(() => {
      if (mockAlerts[1]) setActiveAlerts(prev => [...prev, mockAlerts[1]]);
      if (mockAlerts[1]) addToQueue(mockAlerts[1]);
    }, 8000);

    const timer3 = setTimeout(() => {
      if (mockAlerts[2]) addToQueue(mockAlerts[2]);
    }, 12000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [alerts, maxQueueSize]);

  // Helper function to get priority from severity
  const getSeverityPriority = (severity: string): number => {
    switch (severity) {
      case 'emergency': return 5;
      case 'critical': return 4;
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 1;
    }
  };

  // Add alert to queue with priority sorting
  const addToQueue = (alert: CriticalAlert) => {
    const queueItem: AlertQueueItem = {
      ...alert,
      queuePosition: 0,
      timeInQueue: 0,
      priority: alert.priority || getSeverityPriority(alert.severity)
    };

    setAlertQueue(prev => {
      const newQueue = [...prev, queueItem]
        .sort((a, b) => (b.priority || 0) - (a.priority || 0)) // Sort by priority (highest first)
        .slice(0, maxQueueSize)
        .map((item, index) => ({ ...item, queuePosition: index + 1 }));
      return newQueue;
    });
  };

  // Simple Green/Yellow/Red color system for security operators
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'emergency': return '#ff0000'; // RED - Immediate action required
      case 'critical': return '#ff0000';  // RED - Immediate action required
      case 'high': return '#ffaa00';      // YELLOW - Attention needed
      case 'medium': return '#ffaa00';    // YELLOW - Attention needed
      case 'low': return '#00ff00';       // GREEN - Normal monitoring
      default: return '#ffaa00';          // YELLOW - Default caution
    }
  };

  // Get simple status indicator for security operators
  const getSimpleStatus = (severity: string): { color: string; label: string; icon: string } => {
    switch (severity) {
      case 'emergency':
      case 'critical':
        return { color: '#ff0000', label: 'CRITICAL', icon: '🔴' };
      case 'high':
      case 'medium':
        return { color: '#ffaa00', label: 'WARNING', icon: '🟡' };
      case 'low':
        return { color: '#00ff00', label: 'NORMAL', icon: '🟢' };
      default:
        return { color: '#ffaa00', label: 'CAUTION', icon: '🟡' };
    }
  };

  const getTypeIcon = (type: string, size: number = 64) => {
    const iconProps = { sx: { fontSize: size, color: '#ffffff' } };
    
    switch (type) {
      case 'security_breach': return <SecurityIcon {...iconProps} />;
      case 'known_offender': return <SecurityIcon {...iconProps} />;
      case 'suspicious_behavior': return <PersonIcon {...iconProps} />;
      case 'system_critical': return <ErrorIcon {...iconProps} />;
      default: return <WarningIcon {...iconProps} />;
    }
  };

  const handleAcknowledge = (alertId: string) => {
    setAcknowledgedAlerts(prev => new Set([...Array.from(prev), alertId]));
    // Remove from queue when acknowledged
    setAlertQueue(prev => prev.filter(alert => alert.id !== alertId));
    
    if (onAlertAcknowledge) {
      onAlertAcknowledge(alertId);
    }
    
    // Auto-dismiss after acknowledgment
    setTimeout(() => {
      handleDismiss(alertId);
    }, 2000);
  };

  const handleDismiss = (alertId: string) => {
    setActiveAlerts(prev => prev.filter(alert => alert.id !== alertId));
    setAlertQueue(prev => prev.filter(alert => alert.id !== alertId));
    
    if (onAlertDismiss) {
      onAlertDismiss(alertId);
    }
  };

  const handleQueueItemSelect = (alertId: string) => {
    const queueItem = alertQueue.find(item => item.id === alertId);
    if (queueItem && !activeAlerts.find(alert => alert.id === alertId)) {
      // Promote queue item to active alert
      setActiveAlerts(prev => [...prev, queueItem]);
    }
  };

  const visibleAlerts = activeAlerts.filter(alert => !acknowledgedAlerts.has(alert.id));
  const criticalAlerts = visibleAlerts.filter(alert => alert.severity === 'critical' || alert.severity === 'emergency');

  return (
    <Box>
      {/* Alert Queue Panel - Always visible for security operators */}
      {showAlertQueue && (
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            top: 20,
            right: 20,
            width: 350,
            maxHeight: 400,
            zIndex: 8888,
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
            border: '2px solid #444444',
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          {/* Queue Header */}
          <Box
            sx={{
              p: 2,
              background: 'linear-gradient(90deg, #333333 0%, #444444 100%)',
              borderBottom: '1px solid #555555'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography
                variant="h6"
                sx={{
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '14px',
                  letterSpacing: '1px',
                  fontFamily: 'monospace'
                }}
              >
                🚨 ALERT QUEUE
              </Typography>
              <Badge badgeContent={alertQueue.length} color="error">
                <Chip
                  size="small"
                  label={`${criticalAlerts.length} CRITICAL`}
                  sx={{
                    backgroundColor: criticalAlerts.length > 0 ? '#ff0000' : '#666666',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '10px'
                  }}
                />
              </Badge>
            </Box>
          </Box>

          {/* Queue List */}
          <Box sx={{ maxHeight: 320, overflowY: 'auto' }}>
            {alertQueue.length === 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 120,
                  color: '#888888'
                }}
              >
                <CheckIcon sx={{ fontSize: 32, mb: 1 }} />
                <Typography sx={{ fontSize: '12px', fontFamily: 'monospace' }}>
                  NO ALERTS IN QUEUE
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {alertQueue.map((alert, index) => {
                  const status = getSimpleStatus(alert.severity);
                  const timeAgo = Math.floor((currentTime.getTime() - alert.timestamp.getTime()) / 1000);
                  
                  return (
                    <ListItem
                      key={alert.id}
                      onClick={() => handleQueueItemSelect(alert.id)}
                      sx={{
                        borderBottom: '1px solid #333333',
                        backgroundColor: index === 0 ? alpha(status.color, 0.1) : 'transparent',
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: alpha(status.color, 0.2)
                        },
                        animation: alert.severity === 'critical' || alert.severity === 'emergency' 
                          ? 'pulse 2s ease-in-out infinite' 
                          : 'none'
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        {alert.personThumbnail ? (
                          <Avatar
                            src={alert.personThumbnail}
                            sx={{
                              width: 32,
                              height: 32,
                              border: `2px solid ${status.color}`
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              backgroundColor: status.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '16px'
                            }}
                          >
                            {status.icon}
                          </Box>
                        )}
                      </ListItemIcon>

                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography
                              sx={{
                                color: '#ffffff',
                                fontSize: '11px',
                                fontWeight: 700,
                                fontFamily: 'monospace',
                                flex: 1
                              }}
                            >
                              {alert.title}
                            </Typography>
                            <Chip
                              label={status.label}
                              size="small"
                              sx={{
                                height: 16,
                                fontSize: '8px',
                                backgroundColor: status.color,
                                color: '#000000',
                                fontWeight: 700
                              }}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography
                              sx={{
                                color: '#cccccc',
                                fontSize: '10px',
                                fontFamily: 'monospace',
                                mb: 0.5
                              }}
                            >
                              {alert.location}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography
                                sx={{
                                  color: '#888888',
                                  fontSize: '9px',
                                  fontFamily: 'monospace'
                                }}
                              >
                                {timeAgo < 60 ? `${timeAgo}s ago` : `${Math.floor(timeAgo / 60)}m ago`}
                              </Typography>
                              {alert.confidence && (
                                <Typography
                                  sx={{
                                    color: '#888888',
                                    fontSize: '9px',
                                    fontFamily: 'monospace'
                                  }}
                                >
                                  • {Math.round(alert.confidence * 100)}%
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        }
                      />

                      <ListItemSecondaryAction>
                        <Typography
                          sx={{
                            color: status.color,
                            fontSize: '12px',
                            fontWeight: 700,
                            fontFamily: 'monospace'
                          }}
                        >
                          #{alert.queuePosition}
                        </Typography>
                      </ListItemSecondaryAction>
                    </ListItem>
                  );
                })}
              </List>
            )}
          </Box>
        </Paper>
      )}

      {/* Full-Screen Critical Alerts */}
      {visibleAlerts.length > 0 && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: alpha('#000000', 0.8),
            backdropFilter: 'blur(10px)'
          }}
        >
      {visibleAlerts.map((alert, index) => {
        const isAcknowledged = acknowledgedAlerts.has(alert.id);
        const severityColor = getSeverityColor(alert.severity);
        const status = getSimpleStatus(alert.severity);
        
        return (
          <Slide
            key={alert.id}
            direction="down"
            in={!isAcknowledged}
            timeout={500}
          >
            <Paper
              elevation={24}
              sx={{
                position: 'relative',
                maxWidth: 900,
                width: '90%',
                background: `linear-gradient(135deg, ${severityColor} 0%, ${alpha(severityColor, 0.8)} 100%)`,
                border: `6px solid ${alpha('#ffffff', 0.4)}`,
                borderRadius: 4,
                p: 4,
                textAlign: 'center',
                animation: alert.severity === 'critical' || alert.severity === 'emergency' 
                  ? `pulse 2s ease-in-out infinite, shake 0.5s ease-in-out infinite` 
                  : `pulse 3s ease-in-out infinite`,
                boxShadow: `0 0 60px ${alpha(severityColor, 0.9)}`,
                transform: `translateY(${index * 20}px)`,
                zIndex: 10000 - index
              }}
            >
              {/* Person Thumbnail and Alert Icon */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 3,
                  mb: 3
                }}
              >
                {alert.personThumbnail ? (
                  <Avatar
                    src={alert.personThumbnail}
                    sx={{
                      width: 120,
                      height: 120,
                      border: `4px solid #ffffff`,
                      boxShadow: '0 0 30px rgba(255,255,255,0.5)',
                      filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.3))'
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: 120,
                      height: 120,
                      borderRadius: '50%',
                      backgroundColor: alpha('#ffffff', 0.2),
                      border: `4px solid #ffffff`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.5))'
                    }}
                  >
                    {getTypeIcon(alert.type, 60)}
                  </Box>
                )}
                
                {/* Large Status Indicator */}
                <Box
                  sx={{
                    fontSize: '80px',
                    filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.5))',
                    animation: 'pulse 1s ease-in-out infinite'
                  }}
                >
                  {status.icon}
                </Box>
              </Box>

              {/* Simple Status Label */}
              <Chip
                label={status.label}
                sx={{
                  backgroundColor: '#ffffff',
                  color: severityColor,
                  fontWeight: 900,
                  fontSize: '24px',
                  height: 60,
                  borderRadius: 6,
                  mb: 3,
                  px: 4,
                  boxShadow: '0 0 30px rgba(255,255,255,0.8)',
                  '& .MuiChip-label': {
                    fontSize: '24px',
                    fontWeight: 900,
                    letterSpacing: '3px',
                    fontFamily: 'monospace'
                  }
                }}
              />

              {/* Alert Title */}
              <Typography
                variant="h2"
                sx={{
                  color: '#ffffff',
                  fontWeight: 900,
                  letterSpacing: '3px',
                  mb: 2,
                  textShadow: '0 0 20px rgba(0,0,0,0.8)',
                  fontSize: { xs: '2rem', sm: '3rem', md: '4rem' },
                  fontFamily: 'monospace'
                }}
              >
                {alert.title}
              </Typography>

              {/* Alert Message */}
              <Typography
                variant="h5"
                sx={{
                  color: '#ffffff',
                  fontWeight: 600,
                  mb: 3,
                  textShadow: '0 0 10px rgba(0,0,0,0.8)',
                  lineHeight: 1.4,
                  fontFamily: 'monospace'
                }}
              >
                {alert.message}
              </Typography>

              {/* Confidence Score for Security Operators */}
              {alert.confidence && (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mb: 3
                  }}
                >
                  <Chip
                    label={`AI CONFIDENCE: ${Math.round(alert.confidence * 100)}%`}
                    sx={{
                      backgroundColor: alpha('#ffffff', 0.2),
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '16px',
                      fontFamily: 'monospace',
                      letterSpacing: '2px'
                    }}
                  />
                </Box>
              )}

              {/* Location and Time */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 4,
                  mb: 4,
                  flexWrap: 'wrap'
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: alpha('#ffffff', 0.9),
                    fontWeight: 700,
                    fontFamily: 'monospace',
                    letterSpacing: '2px',
                    backgroundColor: alpha('#000000', 0.3),
                    px: 2,
                    py: 1,
                    borderRadius: 2
                  }}
                >
                  📍 {alert.location}
                </Typography>
                
                <Typography
                  variant="h6"
                  sx={{
                    color: alpha('#ffffff', 0.9),
                    fontWeight: 700,
                    fontFamily: 'monospace',
                    letterSpacing: '2px',
                    backgroundColor: alpha('#000000', 0.3),
                    px: 2,
                    py: 1,
                    borderRadius: 2
                  }}
                >
                  🕐 {alert.timestamp.toLocaleTimeString('en-US', { hour12: false })}
                </Typography>
              </Box>

              {/* Simple Action Buttons for Security Operators */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 4,
                  flexWrap: 'wrap'
                }}
              >
                {alert.requiresAcknowledgment && (
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<CheckIcon sx={{ fontSize: 32 }} />}
                    onClick={() => handleAcknowledge(alert.id)}
                    sx={{
                      backgroundColor: '#ffffff',
                      color: severityColor,
                      fontWeight: 900,
                      fontSize: '1.5rem',
                      px: 6,
                      py: 3,
                      borderRadius: 4,
                      textTransform: 'none',
                      letterSpacing: '2px',
                      fontFamily: 'monospace',
                      minWidth: 280,
                      height: 70,
                      boxShadow: '0 0 30px rgba(255,255,255,0.8)',
                      '&:hover': {
                        backgroundColor: alpha('#ffffff', 0.9),
                        boxShadow: '0 0 40px rgba(255,255,255,1)',
                        transform: 'scale(1.05)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    ✓ ACKNOWLEDGE
                  </Button>
                )}
                
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<CloseIcon sx={{ fontSize: 32 }} />}
                  onClick={() => handleDismiss(alert.id)}
                  sx={{
                    borderColor: '#ffffff',
                    color: '#ffffff',
                    fontWeight: 900,
                    fontSize: '1.5rem',
                    px: 6,
                    py: 3,
                    borderRadius: 4,
                    textTransform: 'none',
                    letterSpacing: '2px',
                    fontFamily: 'monospace',
                    minWidth: 280,
                    height: 70,
                    borderWidth: 3,
                    '&:hover': {
                      borderColor: '#ffffff',
                      backgroundColor: alpha('#ffffff', 0.2),
                      borderWidth: 3,
                      transform: 'scale(1.05)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  ✕ DISMISS
                </Button>
              </Box>

              {/* Priority Badge */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -15,
                  right: -15,
                  backgroundColor: '#ffffff',
                  color: severityColor,
                  px: 3,
                  py: 2,
                  borderRadius: 3,
                  fontWeight: 900,
                  fontSize: '1.2rem',
                  letterSpacing: '2px',
                  fontFamily: 'monospace',
                  boxShadow: '0 0 20px rgba(255,255,255,0.9)',
                  animation: 'pulse 1s ease-in-out infinite',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <PriorityIcon sx={{ fontSize: 20 }} />
                {status.label}
              </Box>
            </Paper>
          </Slide>
        );
      })}
        </Box>
      )}

      {/* Simple Acknowledged Feedback for Security Operators */}
      {acknowledgedAlerts.size > 0 && (
        <Fade in={true} timeout={1000}>
          <Paper
            elevation={12}
            sx={{
              position: 'fixed',
              bottom: 50,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'linear-gradient(135deg, #00ff00 0%, #00aa00 100%)',
              border: `3px solid #ffffff`,
              borderRadius: 4,
              p: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              boxShadow: '0 0 40px rgba(0,255,0,0.8)',
              zIndex: 10001
            }}
          >
            <Box sx={{ fontSize: '32px' }}>🟢</Box>
            <Typography
              variant="h5"
              sx={{
                color: '#ffffff',
                fontWeight: 900,
                letterSpacing: '2px',
                fontFamily: 'monospace',
                textShadow: '0 0 10px rgba(0,0,0,0.8)'
              }}
            >
              ✓ ALERT ACKNOWLEDGED
            </Typography>
          </Paper>
        </Fade>
      )}
    </Box>
  );
};

export default BigAlertNotifications;