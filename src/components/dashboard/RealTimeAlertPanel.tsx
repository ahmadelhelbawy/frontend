import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  IconButton,
  Badge,
  useTheme,
  alpha,
  Tooltip,
  Avatar
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';

interface Alert {
  id: string;
  type: 'shoplifting' | 'suspicious_behavior' | 'known_offender' | 'system_alert';
  severity: 'low' | 'medium' | 'high' | 'critical';
  cameraId: string;
  cameraName: string;
  message: string;
  timestamp: Date;
  personId?: string;
  confidence: number;
  isAcknowledged: boolean;
  faceImageUrl?: string;
}

interface RealTimeAlertPanelProps {
  alerts: Alert[];
  onAlertSelect: (alertId: string) => void;
}

const RealTimeAlertPanel: React.FC<RealTimeAlertPanelProps> = ({
  alerts = [],
  onAlertSelect
}) => {
  const theme = useTheme();
  const [mockAlerts, setMockAlerts] = useState<Alert[]>([]);

  // Generate mock alerts for demonstration
  useEffect(() => {
    const generateMockAlerts = () => {
      const mockData: Alert[] = [
        {
          id: 'alert-001',
          type: 'known_offender',
          severity: 'critical',
          cameraId: 'cam-entrance-01',
          cameraName: 'Main Entrance',
          message: 'Known offender detected: John Doe',
          timestamp: new Date(Date.now() - 2 * 60 * 1000),
          personId: 'person-001',
          confidence: 0.87,
          isAcknowledged: false,
          faceImageUrl: '/api/faces/person-001.jpg'
        },
        {
          id: 'alert-002',
          type: 'suspicious_behavior',
          severity: 'high',
          cameraId: 'cam-electronics-02',
          cameraName: 'Electronics Section',
          message: 'Suspicious concealment behavior detected',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          confidence: 0.78,
          isAcknowledged: false
        },
        {
          id: 'alert-003',
          type: 'shoplifting',
          severity: 'critical',
          cameraId: 'cam-checkout-03',
          cameraName: 'Checkout Area',
          message: 'Potential shoplifting incident detected',
          timestamp: new Date(Date.now() - 8 * 60 * 1000),
          confidence: 0.92,
          isAcknowledged: true
        },
        {
          id: 'alert-004',
          type: 'system_alert',
          severity: 'medium',
          cameraId: 'cam-storage-04',
          cameraName: 'Storage Room',
          message: 'Camera connection lost',
          timestamp: new Date(Date.now() - 12 * 60 * 1000),
          confidence: 1.0,
          isAcknowledged: false
        }
      ];
      setMockAlerts(mockData);
    };

    generateMockAlerts();
    const interval = setInterval(generateMockAlerts, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const displayAlerts = alerts.length > 0 ? alerts : mockAlerts;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return theme.palette.error.main;
      case 'high': return theme.palette.warning.main;
      case 'medium': return theme.palette.info.main;
      case 'low': return theme.palette.success.main;
      default: return theme.palette.grey[500];
    }
  };

  const getSeverityIcon = (type: string, severity: string) => {
    if (type === 'system_alert') return <ErrorIcon />;
    if (type === 'known_offender') return <SecurityIcon />;
    if (severity === 'critical') return <ErrorIcon />;
    if (severity === 'high') return <WarningIcon />;
    return <PersonIcon />;
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return timestamp.toLocaleDateString();
  };

  const unacknowledgedAlerts = displayAlerts.filter(alert => !alert.isAcknowledged);
  const criticalAlerts = displayAlerts.filter(alert => alert.severity === 'critical' && !alert.isAcknowledged);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: alpha(theme.palette.background.default, 0.5)
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
            Real-Time Alerts
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Badge badgeContent={criticalAlerts.length} color="error">
              <Chip
                size="small"
                label="Critical"
                color="error"
                variant={criticalAlerts.length > 0 ? "filled" : "outlined"}
              />
            </Badge>
            <Badge badgeContent={unacknowledgedAlerts.length} color="warning">
              <Chip
                size="small"
                label="Active"
                color="warning"
                variant={unacknowledgedAlerts.length > 0 ? "filled" : "outlined"}
              />
            </Badge>
          </Box>
        </Box>
      </Box>

      {/* Alert List */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {displayAlerts.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: theme.palette.text.secondary
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="body2">No active alerts</Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {displayAlerts
              .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
              .map((alert) => (
                <ListItem
                  key={alert.id}
                  sx={{
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    backgroundColor: alert.isAcknowledged 
                      ? 'transparent' 
                      : alpha(getSeverityColor(alert.severity), 0.05),
                    opacity: alert.isAcknowledged ? 0.7 : 1,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                      cursor: 'pointer'
                    },
                    animation: !alert.isAcknowledged && alert.severity === 'critical' 
                      ? 'pulse 2s ease-in-out infinite' 
                      : 'none'
                  }}
                  onClick={() => onAlertSelect(alert.id)}
                >
                  <ListItemIcon>
                    <Box sx={{ position: 'relative' }}>
                      {alert.faceImageUrl ? (
                        <Avatar
                          src={alert.faceImageUrl}
                          sx={{
                            width: 32,
                            height: 32,
                            border: `2px solid ${getSeverityColor(alert.severity)}`
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            color: getSeverityColor(alert.severity),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {getSeverityIcon(alert.type, alert.severity)}
                        </Box>
                      )}
                      {!alert.isAcknowledged && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: -2,
                            right: -2,
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: getSeverityColor(alert.severity),
                            animation: 'pulse 1s ease-in-out infinite'
                          }}
                        />
                      )}
                    </Box>
                  </ListItemIcon>

                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: alert.isAcknowledged ? 'normal' : 'bold',
                            color: theme.palette.text.primary,
                            flex: 1
                          }}
                        >
                          {alert.message}
                        </Typography>
                        <Chip
                          label={alert.severity.toUpperCase()}
                          size="small"
                          sx={{
                            height: 16,
                            fontSize: '0.6rem',
                            backgroundColor: alpha(getSeverityColor(alert.severity), 0.1),
                            color: getSeverityColor(alert.severity),
                            border: `1px solid ${getSeverityColor(alert.severity)}`
                          }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                          {alert.cameraName} • {Math.round(alert.confidence * 100)}% confidence
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <TimeIcon sx={{ fontSize: 12 }} />
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                            {formatTimeAgo(alert.timestamp)}
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />

                  <ListItemSecondaryAction>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAlertSelect(alert.id);
                        }}
                      >
                        <VisibilityIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
          </List>
        )}
      </Box>
    </Box>
  );
};

export default RealTimeAlertPanel;