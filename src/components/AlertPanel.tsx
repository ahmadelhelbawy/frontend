import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  IconButton,
  Alert,
  Badge,
  Tooltip,
  Drawer,
  AppBar,
  Toolbar,
  CircularProgress,
  Snackbar,
  Fade,
  Grow,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  NotificationsActive as NotificationsActiveIcon,
  Notifications as NotificationsIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';

interface AlertEvent {
  alert_id: string;
  event_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  camera_id: string;
  timestamp: string;
  title: string;
  message: string;
  behavior_tags: string[];
  confidence_score: number;
  face_matches: Array<{
    name: string;
    confidence: number;
    watchlist_type?: string;
    risk_level?: string;
    offense_count?: number;
  }>;
  face_snapshot_base64?: string;
  acknowledged: boolean;
  created_at: string;
}

interface AlertPanelProps {
  staffId: string;
  onAlertAction?: (alertId: string, action: string) => void;
}

const AlertPanel: React.FC<AlertPanelProps> = ({ staffId, onAlertAction }) => {
  const [alerts, setAlerts] = useState<AlertEvent[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<AlertEvent | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const wsRef = useRef<WebSocket | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const severityConfig = {
    low: { color: '#28a745', icon: 'ℹ️', label: 'Low', priority: 1 },
    medium: { color: '#ffc107', icon: '⚠️', label: 'Medium', priority: 2 },
    high: { color: '#fd7e14', icon: '🚨', label: 'High', priority: 3 },
    critical: { color: '#dc3545', icon: '🔴', label: 'Critical', priority: 4 },
  };

  const alertSounds = {
    low: '/sounds/alert-low.mp3',
    medium: '/sounds/alert-medium.mp3',
    high: '/sounds/alert-high.mp3',
    critical: '/sounds/alert-critical.mp3',
  };

  useEffect(() => {
    // Initialize audio
    audioRef.current = new Audio();
    
    // Connect to WebSocket
    connectWebSocket();
    
    // Load recent alerts
    loadRecentAlerts();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [staffId]);

  const connectWebSocket = () => {
    try {
      const wsUrl = `ws://localhost:8000/api/alerts/ws/${staffId}`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        setIsConnected(true);
        setConnectionError(null);
        console.log('WebSocket connected');
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('WebSocket message parse error:', error);
        }
      };

      wsRef.current.onclose = (event) => {
        setIsConnected(false);
        console.log('WebSocket disconnected:', event.code, event.reason);
        
        // Attempt to reconnect after 3 seconds
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
      };

      wsRef.current.onerror = (error) => {
        setConnectionError('Connection failed');
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      setConnectionError('Failed to connect');
      console.error('WebSocket connection error:', error);
    }
  };

  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'security_alert':
        handleNewAlert(data.alert);
        break;
      case 'recent_alerts':
        setAlerts(data.alerts);
        calculateUnreadCount(data.alerts);
        break;
      case 'alert_acknowledged':
        handleAlertAcknowledged(data.alert_id);
        break;
      case 'pong':
        // Keep-alive response
        break;
      default:
        console.log('Unknown WebSocket message type:', data.type);
    }
  };

  const handleNewAlert = (alert: AlertEvent) => {
    setAlerts(prev => [alert, ...prev.slice(0, 99)]); // Keep last 100 alerts
    setUnreadCount(prev => prev + 1);
    
    // Play alert sound
    if (soundEnabled) {
      playAlertSound(alert.severity);
    }
    
    // Show notification snackbar
    setSnackbarMessage(`New ${alert.severity} alert: ${alert.title}`);
    setShowSnackbar(true);
    
    // Auto-open drawer for high/critical alerts
    if (alert.severity === 'high' || alert.severity === 'critical') {
      setDrawerOpen(true);
    }
  };

  const handleAlertAcknowledged = (alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.alert_id === alertId 
          ? { ...alert, acknowledged: true }
          : alert
      )
    );
  };

  const calculateUnreadCount = (alertList: AlertEvent[]) => {
    const unread = alertList.filter(alert => !alert.acknowledged).length;
    setUnreadCount(unread);
  };

  const playAlertSound = (severity: string) => {
    if (audioRef.current) {
      const soundFile = alertSounds[severity as keyof typeof alertSounds] || alertSounds.medium;
      audioRef.current.src = soundFile;
      audioRef.current.play().catch(console.error);
    }
  };

  const loadRecentAlerts = async () => {
    try {
      const response = await fetch('/api/alerts/history?limit=50');
      const data = await response.json();
      
      if (data.success) {
        setAlerts(data.alerts);
        calculateUnreadCount(data.alerts);
      }
    } catch (error) {
      console.error('Failed to load recent alerts:', error);
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/alerts/acknowledge/${alertId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staff_id: staffId }),
      });

      if (response.ok) {
        // Send acknowledgment via WebSocket
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'acknowledge_alert',
            alert_id: alertId,
          }));
        }
        
        if (onAlertAction) {
          onAlertAction(alertId, 'acknowledged');
        }
      }
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  };

  const sendKeepAlive = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'ping' }));
    }
  };

  // Send keep-alive every 30 seconds
  useEffect(() => {
    const keepAliveInterval = setInterval(sendKeepAlive, 30000);
    return () => clearInterval(keepAliveInterval);
  }, []);

  const filteredAlerts = alerts.filter(alert => 
    filterSeverity === 'all' || alert.severity === filterSeverity
  );

  const renderAlert = (alert: AlertEvent) => {
    const config = severityConfig[alert.severity];
    
    return (
      <Grow in key={alert.alert_id}>
        <Card 
          sx={{ 
            mb: 2, 
            border: `2px solid ${config.color}`,
            backgroundColor: alert.acknowledged ? '#f8f9fa' : 'white',
            opacity: alert.acknowledged ? 0.7 : 1,
          }}
        >
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <Avatar 
                  src={alert.face_snapshot_base64 ? 
                    `data:image/jpeg;base64,${alert.face_snapshot_base64}` : undefined}
                  sx={{ 
                    width: 50, 
                    height: 50,
                    border: `2px solid ${config.color}`,
                  }}
                >
                  {!alert.face_snapshot_base64 && <PersonIcon />}
                </Avatar>
              </Grid>
              
              <Grid item xs>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Chip
                    label={config.label}
                    size="small"
                    sx={{ backgroundColor: config.color, color: 'white' }}
                  />
                  <Typography variant="subtitle2" color="text.secondary">
                    {alert.camera_id} • {new Date(alert.timestamp).toLocaleTimeString()}
                  </Typography>
                </Box>
                
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {alert.title}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {alert.message}
                </Typography>
                
                {/* Behavior Tags */}
                {alert.behavior_tags && alert.behavior_tags.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                    {alert.behavior_tags.map((tag, index) => (
                      <Chip 
                        key={index}
                        label={tag}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    ))}
                  </Box>
                )}
                
                {/* Face Matches */}
                {alert.face_matches && alert.face_matches.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" color="error" sx={{ fontWeight: 600 }}>
                      🚨 WATCHLIST MATCH:
                    </Typography>
                    {alert.face_matches.map((match, index) => (
                      <Chip
                        key={index}
                        label={`${match.name} (${(match.confidence * 100).toFixed(0)}%)`}
                        size="small"
                        color="error"
                        sx={{ ml: 1 }}
                      />
                    ))}
                  </Box>
                )}
                
                {/* Confidence Score */}
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Confidence: {(alert.confidence_score * 100).toFixed(1)}%
                </Typography>
              </Grid>
              
              <Grid item>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Tooltip title="View Details">
                    <IconButton
                      onClick={() => setSelectedAlert(alert)}
                      size="small"
                      color="primary"
                    >
                      <SecurityIcon />
                    </IconButton>
                  </Tooltip>
                  
                  {!alert.acknowledged && (
                    <Tooltip title="Acknowledge Alert">
                      <IconButton
                        onClick={() => acknowledgeAlert(alert.alert_id)}
                        size="small"
                        color="success"
                      >
                        <CheckIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grow>
    );
  };

  const renderAlertDetails = () => {
    if (!selectedAlert) return null;
    
    const config = severityConfig[selectedAlert.severity];
    
    return (
      <Dialog 
        open={Boolean(selectedAlert)} 
        onClose={() => setSelectedAlert(null)}
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ backgroundColor: config.color }}>
              <SecurityIcon />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6">{selectedAlert.title}</Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedAlert.alert_id}
              </Typography>
            </Box>
            <Chip 
              label={config.label}
              sx={{ backgroundColor: config.color, color: 'white' }}
            />
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={3}>
            {/* Alert Information */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>Alert Information</Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Event Type</Typography>
                    <Typography variant="body1">
                      {selectedAlert.event_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Camera</Typography>
                    <Typography variant="body1">{selectedAlert.camera_id}</Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Timestamp</Typography>
                    <Typography variant="body1">
                      {new Date(selectedAlert.timestamp).toLocaleString()}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Confidence</Typography>
                    <Typography variant="body1">
                      {(selectedAlert.confidence_score * 100).toFixed(1)}%
                    </Typography>
                  </Grid>
                </Grid>
                
                <Typography variant="body1" sx={{ mt: 2 }}>
                  {selectedAlert.message}
                </Typography>
                
                {/* Behavior Tags */}
                {selectedAlert.behavior_tags && selectedAlert.behavior_tags.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Detected Behaviors
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedAlert.behavior_tags.map((tag, index) => (
                        <Chip 
                          key={index}
                          label={tag}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Paper>
              
              {/* Face Recognition Results */}
              {selectedAlert.face_matches && selectedAlert.face_matches.length > 0 && (
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom color="error">
                    🚨 Watchlist Matches
                  </Typography>
                  
                  {selectedAlert.face_matches.map((match, index) => (
                    <Card key={index} variant="outlined" sx={{ mb: 1, border: '1px solid #dc3545' }}>
                      <CardContent sx={{ py: 1.5 }}>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item>
                            <Avatar sx={{ backgroundColor: '#dc3545' }}>
                              <PersonIcon />
                            </Avatar>
                          </Grid>
                          
                          <Grid item xs>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {match.name}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              <Chip 
                                label={`${(match.confidence * 100).toFixed(1)}% match`}
                                size="small"
                                color="error"
                              />
                              
                              {match.watchlist_type && (
                                <Chip 
                                  label={match.watchlist_type}
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                              
                              {match.offense_count && match.offense_count > 0 && (
                                <Badge badgeContent={match.offense_count} color="error">
                                  <Chip 
                                    label="Repeat Offender"
                                    size="small"
                                    color="warning"
                                  />
                                </Badge>
                              )}
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  ))}
                </Paper>
              )}
            </Grid>
            
            {/* Face Snapshot */}
            <Grid item xs={12} md={4}>
              {selectedAlert.face_snapshot_base64 && (
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom>Face Snapshot</Typography>
                  <img
                    src={`data:image/jpeg;base64,${selectedAlert.face_snapshot_base64}`}
                    alt="Face Snapshot"
                    style={{
                      width: '100%',
                      maxWidth: 200,
                      height: 'auto',
                      borderRadius: 8,
                      border: `2px solid ${config.color}`,
                    }}
                  />
                </Paper>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setSelectedAlert(null)}>Close</Button>
          {!selectedAlert.acknowledged && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                acknowledgeAlert(selectedAlert.alert_id);
                setSelectedAlert(null);
              }}
              startIcon={<CheckIcon />}
            >
              Acknowledge
            </Button>
          )}
        </DialogActions>
      </Dialog>
    );
  };

  const renderConnectionStatus = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box
        sx={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          backgroundColor: isConnected ? '#28a745' : '#dc3545',
          animation: isConnected ? 'none' : 'pulse 2s infinite',
        }}
      />
      <Typography variant="body2" color="text.secondary">
        {isConnected ? 'Connected' : 'Connecting...'}
      </Typography>
      
      {connectionError && (
        <Tooltip title={connectionError}>
          <WarningIcon color="error" fontSize="small" />
        </Tooltip>
      )}
    </Box>
  );

  const renderAlertSummary = () => {
    const criticalCount = alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length;
    const highCount = alerts.filter(a => a.severity === 'high' && !a.acknowledged).length;
    const mediumCount = alerts.filter(a => a.severity === 'medium' && !a.acknowledged).length;
    
    return (
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={3}>
          <Paper sx={{ p: 1.5, textAlign: 'center', backgroundColor: '#dc354520' }}>
            <Typography variant="h5" color="#dc3545">{criticalCount}</Typography>
            <Typography variant="caption">Critical</Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={3}>
          <Paper sx={{ p: 1.5, textAlign: 'center', backgroundColor: '#fd7e1420' }}>
            <Typography variant="h5" color="#fd7e14">{highCount}</Typography>
            <Typography variant="caption">High</Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={3}>
          <Paper sx={{ p: 1.5, textAlign: 'center', backgroundColor: '#ffc10720' }}>
            <Typography variant="h5" color="#ffc107">{mediumCount}</Typography>
            <Typography variant="caption">Medium</Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={3}>
          <Paper sx={{ p: 1.5, textAlign: 'center' }}>
            <Typography variant="h5" color="primary">{alerts.length}</Typography>
            <Typography variant="caption">Total</Typography>
          </Paper>
        </Grid>
      </Grid>
    );
  };

  return (
    <>
      {/* Alert Bell Icon */}
      <Tooltip title="Security Alerts">
        <IconButton
          onClick={() => setDrawerOpen(true)}
          color="inherit"
          sx={{ position: 'relative' }}
        >
          {unreadCount > 0 ? (
            <Badge badgeContent={unreadCount} color="error" max={99}>
              <NotificationsActiveIcon 
                sx={{ 
                  color: unreadCount > 0 ? '#dc3545' : 'inherit',
                  animation: unreadCount > 0 ? 'shake 2s infinite' : 'none',
                }} 
              />
            </Badge>
          ) : (
            <NotificationsIcon />
          )}
        </IconButton>
      </Tooltip>

      {/* Alert Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: 450, md: 500 },
            maxWidth: '90vw',
          },
        }}
      >
        <AppBar position="static" elevation={1}>
          <Toolbar>
            <SecurityIcon sx={{ mr: 1 }} />
            <Typography variant="h6" sx={{ flex: 1 }}>
              Security Alerts
            </Typography>
            
            <IconButton
              color="inherit"
              onClick={() => setSoundEnabled(!soundEnabled)}
              size="small"
            >
              {soundEnabled ? <VolumeUpIcon /> : <VolumeOffIcon />}
            </IconButton>
            
            <IconButton
              color="inherit"
              onClick={loadRecentAlerts}
              size="small"
            >
              <RefreshIcon />
            </IconButton>
            
            <IconButton
              color="inherit"
              onClick={() => setDrawerOpen(false)}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        
        <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>
          {/* Connection Status */}
          <Box sx={{ mb: 2 }}>
            {renderConnectionStatus()}
          </Box>
          
          {/* Alert Summary */}
          {renderAlertSummary()}
          
          {/* Severity Filter */}
          <Box sx={{ mb: 2 }}>
            <Button
              variant={filterSeverity === 'all' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setFilterSeverity('all')}
              sx={{ mr: 1, mb: 1 }}
            >
              All
            </Button>
            {Object.entries(severityConfig).map(([severity, config]) => (
              <Button
                key={severity}
                variant={filterSeverity === severity ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setFilterSeverity(severity)}
                sx={{ 
                  mr: 1, 
                  mb: 1,
                  backgroundColor: filterSeverity === severity ? config.color : 'transparent',
                  color: filterSeverity === severity ? 'white' : config.color,
                  borderColor: config.color,
                  '&:hover': {
                    backgroundColor: config.color + '20',
                  }
                }}
              >
                {config.icon} {config.label}
              </Button>
            ))}
          </Box>
          
          {/* Alerts List */}
          {filteredAlerts.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <SecurityIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No alerts found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {alerts.length === 0 
                  ? 'No alerts have been generated yet'
                  : 'No alerts match the current filter'
                }
              </Typography>
            </Paper>
          ) : (
            <Box>
              {filteredAlerts.map(renderAlert)}
            </Box>
          )}
        </Box>
      </Drawer>

      {/* Alert Details Dialog */}
      {renderAlertDetails()}

      {/* Notification Snackbar */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setShowSnackbar(false)} 
          severity="warning" 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </>
  );
};

export default AlertPanel;
