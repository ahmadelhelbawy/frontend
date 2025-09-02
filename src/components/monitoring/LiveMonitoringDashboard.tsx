/**
 * LiveMonitoringDashboard - Real-time monitoring with backend API integration
 * Features live metrics, system health, and real-time updates
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  alpha,
  useTheme
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  Error,
  Refresh,
  Wifi,
  WifiOff,
  Memory,
  Storage,
  Speed,
  Security
} from '@mui/icons-material';

// Import the unified API service
import { unifiedAPI } from '../../services/UnifiedAPIService';

interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
  activeConnections: number;
  alertsPerMinute: number;
  detectionAccuracy: number;
  systemUptime: number;
}

interface LiveMonitoringDashboardProps {
  refreshInterval?: number;
  onError?: (error: string) => void;
  onMetricsUpdate?: (metrics: SystemMetrics) => void;
}

const LiveMonitoringDashboard: React.FC<LiveMonitoringDashboardProps> = ({
  refreshInterval = 5000,
  onError,
  onMetricsUpdate
}) => {
  const theme = useTheme();
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0,
    networkLatency: 0,
    activeConnections: 0,
    alertsPerMinute: 0,
    detectionAccuracy: 0,
    systemUptime: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');

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

  // Fetch live metrics from backend
  const fetchMetrics = useCallback(async () => {
    try {
      setIsLoading(true);
      setConnectionStatus('connecting');

      // Fetch system health from unified API
      const healthResponse = await unifiedAPI.getSystemHealth();
      
      if (healthResponse.success && healthResponse.data) {
        const healthData = healthResponse.data;
        
        // Transform backend data to our metrics format
        const newMetrics: SystemMetrics = {
          cpuUsage: healthData.cpuUsage || 0,
          memoryUsage: healthData.memoryUsage || 0,
          diskUsage: healthData.diskUsage || 0,
          networkLatency: healthData.networkLatency || 0,
          activeConnections: healthData.activeConnections || 0,
          alertsPerMinute: healthData.alertsPerMinute || 0,
          detectionAccuracy: healthData.detectionAccuracy || 0,
          systemUptime: healthData.systemUptime || 0
        };

        setMetrics(newMetrics);
        setConnectionStatus('connected');
        setLastUpdate(new Date());
        onMetricsUpdate?.(newMetrics);
      } else {
        console.warn('Failed to fetch system health data');
        setConnectionStatus('disconnected');
        onError?.('Failed to fetch system health data');
      }
    } catch (error: any) {
      console.error('Error fetching metrics:', error);
      setConnectionStatus('disconnected');
      onError?.(error.message || 'Failed to fetch live metrics');
      
      // Fallback to mock data for demo purposes
      const mockMetrics: SystemMetrics = {
        cpuUsage: Math.random() * 100,
        memoryUsage: Math.random() * 100,
        diskUsage: Math.random() * 100,
        networkLatency: Math.random() * 50,
        activeConnections: Math.floor(Math.random() * 100),
        alertsPerMinute: Math.floor(Math.random() * 10),
        detectionAccuracy: 85 + Math.random() * 15,
        systemUptime: Date.now() - Math.random() * 86400000 // Random uptime
      };
      setMetrics(mockMetrics);
    } finally {
      setIsLoading(false);
    }
  }, [onError, onMetricsUpdate]);

  // Auto-refresh effect
  useEffect(() => {
    fetchMetrics();
    
    const interval = setInterval(fetchMetrics, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchMetrics, refreshInterval]);

  // Format uptime
  const formatUptime = useCallback((uptime: number) => {
    const days = Math.floor(uptime / 86400000);
    const hours = Math.floor((uptime % 86400000) / 3600000);
    const minutes = Math.floor((uptime % 3600000) / 60000);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }, []);

  // Get status color for metrics
  const getStatusColor = useCallback((value: number, thresholds: { warning: number; danger: number }) => {
    if (value >= thresholds.danger) return colors.danger;
    if (value >= thresholds.warning) return colors.warning;
    return colors.success;
  }, [colors]);

  // Metric cards data
  const metricCards = useMemo(() => [
    {
      title: 'CPU Usage',
      value: `${metrics.cpuUsage.toFixed(1)}%`,
      icon: <Speed />,
      color: getStatusColor(metrics.cpuUsage, { warning: 70, danger: 90 }),
      progress: metrics.cpuUsage,
      trend: metrics.cpuUsage > 50 ? 'up' : 'down'
    },
    {
      title: 'Memory Usage',
      value: `${metrics.memoryUsage.toFixed(1)}%`,
      icon: <Memory />,
      color: getStatusColor(metrics.memoryUsage, { warning: 80, danger: 95 }),
      progress: metrics.memoryUsage,
      trend: metrics.memoryUsage > 60 ? 'up' : 'down'
    },
    {
      title: 'Disk Usage',
      value: `${metrics.diskUsage.toFixed(1)}%`,
      icon: <Storage />,
      color: getStatusColor(metrics.diskUsage, { warning: 80, danger: 95 }),
      progress: metrics.diskUsage,
      trend: metrics.diskUsage > 70 ? 'up' : 'down'
    },
    {
      title: 'Network Latency',
      value: `${metrics.networkLatency.toFixed(1)}ms`,
      icon: <Wifi />,
      color: getStatusColor(metrics.networkLatency, { warning: 100, danger: 200 }),
      progress: (metrics.networkLatency / 200) * 100,
      trend: metrics.networkLatency > 50 ? 'up' : 'down'
    },
    {
      title: 'Active Connections',
      value: metrics.activeConnections.toString(),
      icon: <Security />,
      color: colors.accent,
      progress: (metrics.activeConnections / 100) * 100,
      trend: 'stable'
    },
    {
      title: 'Alerts/Min',
      value: metrics.alertsPerMinute.toString(),
      icon: <Warning />,
      color: metrics.alertsPerMinute > 5 ? colors.warning : colors.success,
      progress: (metrics.alertsPerMinute / 10) * 100,
      trend: metrics.alertsPerMinute > 3 ? 'up' : 'down'
    },
    {
      title: 'Detection Accuracy',
      value: `${metrics.detectionAccuracy.toFixed(1)}%`,
      icon: <CheckCircle />,
      color: getStatusColor(100 - metrics.detectionAccuracy, { warning: 10, danger: 20 }),
      progress: metrics.detectionAccuracy,
      trend: metrics.detectionAccuracy > 90 ? 'up' : 'down'
    },
    {
      title: 'System Uptime',
      value: formatUptime(metrics.systemUptime),
      icon: <CheckCircle />,
      color: colors.success,
      progress: 100,
      trend: 'stable'
    }
  ], [metrics, getStatusColor, formatUptime, colors]);

  return (
    <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ color: colors.text, fontWeight: 600, mb: 1 }}>
            Live System Monitoring
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              icon={connectionStatus === 'connected' ? <Wifi /> : <WifiOff />}
              label={connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
              size="small"
              sx={{
                backgroundColor: connectionStatus === 'connected' 
                  ? alpha(colors.success, 0.2) 
                  : alpha(colors.danger, 0.2),
                color: connectionStatus === 'connected' ? colors.success : colors.danger,
                border: `1px solid ${connectionStatus === 'connected' 
                  ? alpha(colors.success, 0.3) 
                  : alpha(colors.danger, 0.3)}`
              }}
            />
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
              Last updated: {lastUpdate.toLocaleTimeString()}
            </Typography>
          </Box>
        </Box>

        <Tooltip title="Refresh Metrics">
          <IconButton
            onClick={fetchMetrics}
            disabled={isLoading}
            sx={{
              color: colors.accent,
              '&:hover': {
                backgroundColor: alpha(colors.accent, 0.1)
              }
            }}
          >
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Metrics Grid */}
      <Grid container spacing={3}>
        {metricCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <Card
              sx={{
                backgroundColor: alpha(colors.surface, 0.95),
                border: `1px solid ${colors.border}`,
                borderRadius: 2,
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: colors.accent,
                  boxShadow: `0 8px 32px ${alpha(colors.accent, 0.1)}`,
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 1,
                        backgroundColor: alpha(card.color, 0.1),
                        color: card.color
                      }}
                    >
                      {card.icon}
                    </Box>
                    <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                      {card.title}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {card.trend === 'up' && <TrendingUp sx={{ color: colors.success, fontSize: 16 }} />}
                    {card.trend === 'down' && <TrendingDown sx={{ color: colors.danger, fontSize: 16 }} />}
                  </Box>
                </Box>

                <Typography
                  variant="h4"
                  sx={{
                    color: colors.text,
                    fontWeight: 700,
                    mb: 2,
                    fontSize: '1.75rem'
                  }}
                >
                  {card.value}
                </Typography>

                <LinearProgress
                  variant="determinate"
                  value={card.progress}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: alpha(colors.textSecondary, 0.1),
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: card.color,
                      borderRadius: 3
                    }
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* System Status Summary */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ color: colors.text, mb: 2 }}>
          System Status Summary
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                backgroundColor: alpha(colors.surface, 0.95),
                border: `1px solid ${colors.border}`,
                borderRadius: 2
              }}
            >
              <CardContent>
                <Typography variant="subtitle1" sx={{ color: colors.text, mb: 2 }}>
                  Performance Indicators
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                      Overall System Health
                    </Typography>
                    <Chip
                      label={metrics.cpuUsage < 70 && metrics.memoryUsage < 80 ? 'Healthy' : 'Warning'}
                      size="small"
                      color={metrics.cpuUsage < 70 && metrics.memoryUsage < 80 ? 'success' : 'warning'}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                      Detection Performance
                    </Typography>
                    <Chip
                      label={metrics.detectionAccuracy > 90 ? 'Excellent' : 'Good'}
                      size="small"
                      color={metrics.detectionAccuracy > 90 ? 'success' : 'primary'}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                backgroundColor: alpha(colors.surface, 0.95),
                border: `1px solid ${colors.border}`,
                borderRadius: 2
              }}
            >
              <CardContent>
                <Typography variant="subtitle1" sx={{ color: colors.text, mb: 2 }}>
                  Network Status
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                      Connection Quality
                    </Typography>
                    <Chip
                      label={metrics.networkLatency < 50 ? 'Excellent' : 'Good'}
                      size="small"
                      color={metrics.networkLatency < 50 ? 'success' : 'primary'}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                      Active Sessions
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.text }}>
                      {metrics.activeConnections}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default LiveMonitoringDashboard;
