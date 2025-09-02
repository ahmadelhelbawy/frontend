import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  IconButton,
  Badge,
  Collapse,
  Divider
} from '@mui/material';
import {
  Warning as WarningIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { useWebSocket } from '../../contexts/WebSocketContext';
import { useNotification } from '../../contexts/NotificationContext';

interface Alert {
  id: string;
  cameraId: string;
  cameraName: string;
  type: 'suspicious_behavior' | 'theft_detected' | 'loitering';
  confidence: number;
  timestamp: Date;
  description: string;
  severity: 'low' | 'medium' | 'high';
  acknowledged: boolean;
}

const AlertNotifications: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [expanded, setExpanded] = useState(true);
  const { socket } = useWebSocket();
  const { showNotification } = useNotification();

  useEffect(() => {
    if (socket) {
      socket.on('new_alert', (alert: Alert) => {
        setAlerts(prev => [alert, ...prev].slice(0, 50)); // Keep last 50 alerts
        
        // Show system notification
        showNotification(
          `${alert.type.replace('_', ' ')} detected on ${alert.cameraName}`,
          alert.severity === 'high' ? 'error' : 'warning'
        );
        
        // Show desktop notification if available
        if (window.electronAPI) {
          window.electronAPI.showNotification(
            'Security Alert',
            `${alert.type.replace('_', ' ')} detected on ${alert.cameraName}`
          );
        }
      });

      socket.on('alert_acknowledged', (alertId: string) => {
        setAlerts(prev => prev.map(alert => 
          alert.id === alertId ? { ...alert, acknowledged: true } : alert
        ));
      });

      return () => {
        socket.off('new_alert');
        socket.off('alert_acknowledged');
      };
    }
  }, [socket, showNotification]);

  const handleAcknowledgeAlert = (alertId: string) => {
    if (socket) {
      socket.emit('acknowledge_alert', alertId);
    }
  };

  const handleClearAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'theft_detected':
        return <SecurityIcon color="error" />;
      case 'suspicious_behavior':
        return <WarningIcon color="warning" />;
      case 'loitering':
        return <PersonIcon color="info" />;
      default:
        return <WarningIcon />;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const unacknowledgedCount = alerts.filter(alert => !alert.acknowledged).length;

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ p: 2, pb: '16px !important', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            <Badge badgeContent={unacknowledgedCount} color="error">
              Real-time Alerts
            </Badge>
          </Typography>
          <IconButton size="small" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>

        <Collapse in={expanded} sx={{ flexGrow: 1 }}>
          <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
            {alerts.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                <SecurityIcon sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="body2">
                  No alerts at this time
                </Typography>
              </Box>
            ) : (
              <List dense>
                {alerts.map((alert, index) => (
                  <React.Fragment key={alert.id}>
                    <ListItem
                      sx={{
                        bgcolor: alert.acknowledged ? 'transparent' : 'action.hover',
                        borderRadius: 1,
                        mb: 1
                      }}
                    >
                      <ListItemIcon>
                        {getAlertIcon(alert.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: alert.acknowledged ? 'normal' : 'bold' }}>
                              {alert.type.replace('_', ' ')}
                            </Typography>
                            <Chip
                              size="small"
                              label={alert.severity}
                              color={getAlertColor(alert.severity) as any}
                              variant="outlined"
                            />
                            <Chip
                              size="small"
                              label={`${Math.round(alert.confidence * 100)}%`}
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              {alert.cameraName} • {alert.timestamp.toLocaleTimeString()}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              {alert.description}
                            </Typography>
                          </Box>
                        }
                      />
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {!alert.acknowledged && (
                          <Chip
                            size="small"
                            label="Acknowledge"
                            color="primary"
                            variant="outlined"
                            onClick={() => handleAcknowledgeAlert(alert.id)}
                            clickable
                          />
                        )}
                        <IconButton
                          size="small"
                          onClick={() => handleClearAlert(alert.id)}
                        >
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </ListItem>
                    {index < alerts.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default AlertNotifications;