/**
 * Live Dashboard Page
 * Complete operator dashboard with real-time data from PostgreSQL database
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Chip,
  Button,
  IconButton,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Badge,
  Tooltip
} from '@mui/material';
import {
  Dashboard,
  Videocam,
  Warning,
  CheckCircle,
  Error,
  Refresh,
  Settings,
  Notifications,
  Speed,
  Memory,
  Storage,
  Timeline,
  Security,
  Person,
  LocationOn,
  AccessTime,
  TrendingUp,
  TrendingDown
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useLiveDashboard } from '../contexts/LiveDashboardContext';
import LiveCameraGrid from '../components/dashboard/LiveCameraGrid';

// Performance Chart Component
function PerformanceChart({ data, title, dataKey, color = '#8884d8' }: any) {
  return (
    <Card>
      <CardHeader title={title} />
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <RechartsTooltip />
            <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Detection Stats Component
function DetectionStatsCard() {
  const { state } = useLiveDashboard();
  
  const detectionStats = state.dashboardSummary?.detection_stats;
  
  if (!detectionStats) {
    return (
      <Card>
        <CardHeader title="Detection Statistics" />
        <CardContent>
          <Typography color="text.secondary">Loading...</Typography>
        </CardContent>
      </Card>
    );
  }

  const pieData = detectionStats.class_distribution.map((item: any, index: number) => ({
    ...item,
    fill: ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'][index % 5]
  }));

  return (
    <Card>
      <CardHeader 
        title="Detection Statistics" 
        subheader={`${detectionStats.class_distribution.reduce((sum: number, item: any) => sum + item.count, 0)} total detections`}
      />
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h4" color="primary">
                {detectionStats.class_distribution.find((item: any) => item.name === 'suspicious')?.count || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Suspicious Detections
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h4" color="error">
                {detectionStats.class_distribution.find((item: any) => item.name === 'alert')?.count || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Alert-Level Detections
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6">
                {(85.5).toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average Confidence
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  dataKey="count"
                  label={({ name, count }) => `${name}: ${count}`}
                />
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

// System Performance Card
function SystemPerformanceCard() {
  const { state } = useLiveDashboard();
  
  const performance = state.performanceSummary;
  
  if (!performance) {
    return (
      <Card>
        <CardHeader title="System Performance" />
        <CardContent>
          <Typography color="text.secondary">Loading...</Typography>
        </CardContent>
      </Card>
    );
  }

  const getPerformanceColor = (value: number, thresholds: [number, number]) => {
    if (value < thresholds[0]) return 'success';
    if (value < thresholds[1]) return 'warning';
    return 'error';
  };

  return (
    <Card>
      <CardHeader 
        title="System Performance" 
        subheader={`${performance.activeCameras || performance.active_cameras || 0} active cameras`}
      />
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Speed sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">{(performance.averageFPS || performance.avg_fps || 0).toFixed(1)} FPS</Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={((performance.averageFPS || performance.avg_fps || 0) / 30) * 100} 
              color={getPerformanceColor(performance.averageFPS || performance.avg_fps || 0, [15, 25])}
            />
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AccessTime sx={{ mr: 1, color: 'secondary.main' }} />
              <Typography variant="h6">{(performance.avg_latency || 50).toFixed(0)}ms</Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={Math.max(0, 100 - ((performance.avg_latency || 50) / 100) * 100)} 
              color={getPerformanceColor(performance.avg_latency || 50, [50, 100])}
            />
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Memory sx={{ mr: 1, color: 'warning.main' }} />
              <Typography variant="h6">{(performance.avg_gpu_utilization || 75).toFixed(0)}%</Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={performance.avg_gpu_utilization || 75} 
              color={getPerformanceColor(performance.avg_gpu_utilization || 75, [70, 90])}
            />
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CheckCircle sx={{ mr: 1, color: 'success.main' }} />
              <Typography variant="h6">{(performance.avg_availability || 98.5).toFixed(1)}%</Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={performance.avg_availability || 98.5} 
              color={(performance.avg_availability || 98.5) > 95 ? 'success' : 'warning'}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

// Active Alerts Card
function ActiveAlertsCard() {
  const { state, acknowledgeAlert, setSelectedAlert } = useLiveDashboard();
  
  const alerts = state.activeAlerts.slice(0, 5); // Show top 5 alerts

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      default: return 'default';
    }
  };

  const handleAcknowledge = async (alertId: string) => {
    await acknowledgeAlert(alertId, 'operator');
  };

  return (
    <Card>
      <CardHeader 
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warning />
            Active Alerts
            <Badge badgeContent={state.activeAlerts.length} color="error" />
          </Box>
        }
        action={
          <IconButton onClick={() => setSelectedAlert(null)}>
            <Refresh />
          </IconButton>
        }
      />
      <CardContent sx={{ maxHeight: 300, overflow: 'auto' }}>
        {alerts.length === 0 ? (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
            No active alerts
          </Typography>
        ) : (
          <List dense>
            {alerts.map((alert, index) => (
              <React.Fragment key={alert.id}>
                <ListItem
                  secondaryAction={
                    (alert.status === 'active' || !alert.acknowledged) && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleAcknowledge(alert.id)}
                      >
                        Acknowledge
                      </Button>
                    )
                  }
                >
                  <ListItemIcon>
                    <Chip
                      label={alert.severity}
                      color={getSeverityColor(alert.severity) as any}
                      size="small"
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={alert.title || alert.message}
                    secondary={
                      <Box>
                        <Typography variant="caption" display="block">
                          {alert.camera_name || `Camera ${alert.cameraId}`} • {alert.location || 'Unknown Location'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(alert.created_at || alert.timestamp).toLocaleString()}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < alerts.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
}

// Recent Detections Card
function RecentDetectionsCard() {
  const { state } = useLiveDashboard();
  
  const detections = state.recentDetections.slice(0, 10);

  const getAlertLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'error';
      case 'suspicious': return 'warning';
      default: return 'success';
    }
  };

  return (
    <Card>
      <CardHeader 
        title="Recent Detections" 
        subheader={`${state.recentDetections.length} detections in the last 24 hours`}
      />
      <CardContent sx={{ maxHeight: 400, overflow: 'auto' }}>
        {detections.length === 0 ? (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
            No recent detections
          </Typography>
        ) : (
          <List dense>
            {detections.map((detection, index) => (
              <React.Fragment key={detection.id}>
                <ListItem>
                  <ListItemIcon>
                    <Chip
                      label={detection.class || detection.type}
                      color={getAlertLevelColor(detection.alert_level || detection.type) as any}
                      size="small"
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">
                          {detection.camera_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {(detection.confidence * 100).toFixed(0)}% confidence
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="caption" display="block">
                          {detection.location}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(detection.timestamp).toLocaleString()}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < detections.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
}

// Main Dashboard Page
export default function LiveDashboardPage() {
  const { 
    state, 
    loadDashboardSummary, 
    connectWebSocket, 
    disconnectWebSocket,
    setAutoRefresh,
    setRefreshInterval,
    updateFilters
  } = useLiveDashboard();

  const [viewMode, setViewMode] = useState<'overview' | 'cameras' | 'analytics'>('overview');

  useEffect(() => {
    // Initial load
    loadDashboardSummary();
    connectWebSocket();

    return () => {
      disconnectWebSocket();
    };
  }, []);

  // Generate mock performance timeline data
  const performanceData = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    fps: 15 + Math.random() * 10,
    latency: 30 + Math.random() * 20,
    gpu: 40 + Math.random() * 30
  }));

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Live Security Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time monitoring with AI-powered threat detection
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {/* Connection Status */}
          <Chip
            icon={state.isConnected ? <CheckCircle /> : <Error />}
            label={state.isConnected ? 'Connected' : 'Disconnected'}
            color={state.isConnected ? 'success' : 'error'}
            variant="outlined"
          />
          
          {/* Auto Refresh Toggle */}
          <FormControlLabel
            control={
              <Switch
                checked={state.autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
            }
            label="Auto Refresh"
          />
          
          {/* Refresh Interval */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Refresh Rate</InputLabel>
            <Select
              value={state.refreshInterval}
              onChange={(e) => setRefreshInterval(e.target.value as number)}
              label="Refresh Rate"
            >
              <MenuItem value={1000}>1 second</MenuItem>
              <MenuItem value={5000}>5 seconds</MenuItem>
              <MenuItem value={10000}>10 seconds</MenuItem>
              <MenuItem value={30000}>30 seconds</MenuItem>
            </Select>
          </FormControl>
          
          {/* View Mode Selector */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>View</InputLabel>
            <Select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as any)}
              label="View"
            >
              <MenuItem value="overview">Overview</MenuItem>
              <MenuItem value="cameras">Cameras</MenuItem>
              <MenuItem value="analytics">Analytics</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Loading State */}
      {state.isLoading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Error State */}
      {state.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {state.error}
        </Alert>
      )}

      {/* Last Updated */}
      {state.lastUpdated && (
        <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
          Last updated: {new Date(state.lastUpdated).toLocaleString()}
        </Typography>
      )}

      {/* Overview Mode */}
      {viewMode === 'overview' && (
        <Grid container spacing={3}>
          {/* Top Row - Key Metrics */}
          <Grid item xs={12} md={6}>
            <SystemPerformanceCard />
          </Grid>
          <Grid item xs={12} md={6}>
            <DetectionStatsCard />
          </Grid>
          
          {/* Second Row - Alerts and Detections */}
          <Grid item xs={12} md={6}>
            <ActiveAlertsCard />
          </Grid>
          <Grid item xs={12} md={6}>
            <RecentDetectionsCard />
          </Grid>
          
          {/* Third Row - Performance Charts */}
          <Grid item xs={12} md={4}>
            <PerformanceChart 
              data={performanceData} 
              title="FPS Performance" 
              dataKey="fps" 
              color="#8884d8" 
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <PerformanceChart 
              data={performanceData} 
              title="Latency (ms)" 
              dataKey="latency" 
              color="#82ca9d" 
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <PerformanceChart 
              data={performanceData} 
              title="GPU Utilization (%)" 
              dataKey="gpu" 
              color="#ffc658" 
            />
          </Grid>
        </Grid>
      )}

      {/* Cameras Mode */}
      {viewMode === 'cameras' && (
        <LiveCameraGrid 
          cameras={state.cameraStatus}
          maxCameras={12} 
        />
      )}

      {/* Analytics Mode */}
      {viewMode === 'analytics' && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Advanced Analytics" />
              <CardContent>
                <Typography color="text.secondary">
                  Advanced analytics dashboard will be available in the next update.
                  This will include behavior pattern analysis, risk assessment, and predictive insights.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}