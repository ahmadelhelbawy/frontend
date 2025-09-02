/**
 * AIModelHealthMonitor - Real-time AI service monitoring and model health dashboard
 * Provides comprehensive AI model status, performance metrics, and health alerts
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  IconButton,
  Button,
  Tooltip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  alpha,
  useTheme
} from '@mui/material';
import {
  Memory,
  Speed,
  Visibility,
  Warning,
  CheckCircle,
  Error,
  Refresh,
  Settings,
  TrendingUp,
  TrendingDown,
  Timeline,
  Storage,
  DeviceHub,
  Psychology,
  Computer,
  CloudQueue,
  RestartAlt,
  MoreVert,
  BarChart,
  ShowChart
} from '@mui/icons-material';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export interface AIModel {
  id: string;
  name: string;
  version: string;
  type: 'detection' | 'classification' | 'behavioral';
  status: 'healthy' | 'degraded' | 'offline' | 'loading';
  health_score: number; // 0-100
  last_updated: string;
  metrics: {
    inference_time_ms: number;
    throughput_fps: number;
    accuracy_percent: number;
    memory_usage_mb: number;
    gpu_utilization_percent: number;
    cpu_utilization_percent: number;
    error_rate_percent: number;
    queue_depth: number;
    processed_frames_total: number;
    failed_inferences: number;
  };
  resource_usage: {
    memory_allocated_mb: number;
    memory_used_mb: number;
    gpu_memory_mb: number;
    gpu_temperature_c?: number;
    power_draw_w?: number;
  };
  performance_history: Array<{
    timestamp: string;
    inference_time: number;
    throughput: number;
    accuracy: number;
    gpu_utilization: number;
  }>;
  alerts: Array<{
    id: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    timestamp: string;
  }>;
  configuration: {
    batch_size: number;
    input_resolution: string;
    confidence_threshold: number;
    max_queue_size: number;
  };
}

interface SystemHealth {
  overall_status: 'healthy' | 'degraded' | 'critical';
  overall_health_score: number;
  active_models: number;
  total_models: number;
  system_load_percent: number;
  memory_usage_percent: number;
  gpu_usage_percent: number;
  disk_usage_percent: number;
  network_latency_ms: number;
  uptime_hours: number;
}

interface AIModelHealthMonitorProps {
  models: AIModel[];
  systemHealth: SystemHealth;
  onModelAction: (modelId: string, action: string) => Promise<void>;
  onRefresh: () => Promise<void>;
  realTimeUpdates?: boolean;
}

const AIModelHealthMonitor: React.FC<AIModelHealthMonitorProps> = ({
  models,
  systemHealth,
  onModelAction,
  onRefresh,
  realTimeUpdates = true
}) => {
  const theme = useTheme();
  
  // State management
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h'>('1h');
  
  // Professional color scheme
  const colors = {
    primary: '#1e3a8a',
    secondary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f8fafc',
    textSecondary: '#cbd5e1'
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return colors.success;
      case 'degraded': return colors.warning;
      case 'offline': return colors.danger;
      case 'loading': return colors.secondary;
      default: return colors.textSecondary;
    }
  };

  // Get health score color
  const getHealthScoreColor = (score: number) => {
    if (score >= 90) return colors.success;
    if (score >= 70) return colors.warning;
    return colors.danger;
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  // Model statistics
  const modelStats = useMemo(() => {
    return {
      healthy: models.filter(m => m.status === 'healthy').length,
      degraded: models.filter(m => m.status === 'degraded').length,
      offline: models.filter(m => m.status === 'offline').length,
      loading: models.filter(m => m.status === 'loading').length,
      avgInferenceTime: models.reduce((sum, m) => sum + m.metrics.inference_time_ms, 0) / models.length || 0,
      avgThroughput: models.reduce((sum, m) => sum + m.metrics.throughput_fps, 0) / models.length || 0,
      avgAccuracy: models.reduce((sum, m) => sum + m.metrics.accuracy_percent, 0) / models.length || 0,
      totalAlerts: models.reduce((sum, m) => sum + m.alerts.length, 0),
      criticalAlerts: models.reduce((sum, m) => sum + m.alerts.filter(a => a.severity === 'critical').length, 0)
    };
  }, [models]);

  // Performance chart data
  const performanceData = useMemo(() => {
    if (models.length === 0) return [];
    
    const timePoints = models[0]?.performance_history?.map(h => ({
      time: new Date(h.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      timestamp: h.timestamp
    }));
    
    return timePoints.map(point => {
      const data: { [key: string]: any } = { time: point.time };
      models.forEach(model => {
        const historyPoint = model.performance_history.find(h => h.timestamp === point.timestamp);
        if (historyPoint) {
          data[`${model.name}_inference`] = historyPoint.inference_time;
          data[`${model.name}_throughput`] = historyPoint.throughput;
          data[`${model.name}_gpu`] = historyPoint.gpu_utilization;
        }
      });
      return data;
    });
  }, [models]);

  return (
    <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ color: colors.text, fontWeight: 600 }}>
          AI Model Health Monitor
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            startIcon={refreshing ? <CircularProgress size={16} /> : <Refresh />}
            onClick={handleRefresh}
            disabled={refreshing}
            size="small"
            sx={{ color: colors.textSecondary }}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </Box>
      </Box>

      {/* System Health Overview */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          backgroundColor: alpha(colors.surface, 0.95),
          border: `1px solid ${alpha(colors.primary, 0.2)}`
        }}
      >
        <Typography variant="h6" sx={{ color: colors.text, mb: 2 }}>
          System Health Overview
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h4" sx={{ color: getHealthScoreColor(systemHealth.overall_health_score), mr: 2 }}>
                {systemHealth.overall_health_score}%
              </Typography>
              <Chip
                label={systemHealth.overall_status.toUpperCase()}
                sx={{
                  backgroundColor: alpha(getStatusColor(systemHealth.overall_status), 0.2),
                  color: getStatusColor(systemHealth.overall_status),
                  fontWeight: 600
                }}
              />
            </Box>
            
            <Grid container spacing={2}>
              {[
                { label: 'Active Models', value: `${systemHealth.active_models}/${systemHealth.total_models}`, icon: <Psychology /> },
                { label: 'System Load', value: `${systemHealth.system_load_percent}%`, icon: <Computer /> },
                { label: 'Memory Usage', value: `${systemHealth.memory_usage_percent}%`, icon: <Memory /> },
                { label: 'GPU Usage', value: `${systemHealth.gpu_usage_percent}%`, icon: <DeviceHub /> },
                { label: 'Network Latency', value: `${systemHealth.network_latency_ms}ms`, icon: <CloudQueue /> },
                { label: 'Uptime', value: `${Math.floor(systemHealth.uptime_hours)}h`, icon: <Timeline /> }
              ].map((metric, index) => (
                <Grid item xs={6} sm={4} key={index}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ color: colors.secondary }}>{metric.icon}</Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block' }}>
                        {metric.label}
                      </Typography>
                      <Typography variant="body2" sx={{ color: colors.text, fontWeight: 600 }}>
                        {metric.value}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" sx={{ color: colors.text, mb: 1 }}>
              Model Status Distribution
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {[
                { status: 'Healthy', count: modelStats.healthy, color: colors.success },
                { status: 'Degraded', count: modelStats.degraded, color: colors.warning },
                { status: 'Offline', count: modelStats.offline, color: colors.danger },
                { status: 'Loading', count: modelStats.loading, color: colors.secondary }
              ].map((item, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, backgroundColor: item.color, borderRadius: '50%' }} />
                    <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                      {item.status}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: colors.text, fontWeight: 600 }}>
                    {item.count}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Performance Metrics */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          backgroundColor: alpha(colors.surface, 0.95),
          border: `1px solid ${alpha(colors.primary, 0.2)}`
        }}
      >
        <Typography variant="h6" sx={{ color: colors.text, mb: 2 }}>
          Performance Trends
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(colors.primary, 0.2)} />
                  <XAxis 
                    dataKey="time" 
                    stroke={colors.textSecondary}
                    fontSize={12}
                  />
                  <YAxis stroke={colors.textSecondary} fontSize={12} />
                  {models.map((model, index) => (
                    <Line
                      key={model.id}
                      type="monotone"
                      dataKey={`${model.name}_inference`}
                      stroke={`hsl(${index * 60}, 70%, 50%)`}
                      strokeWidth={2}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
          
          <Grid item xs={12} lg={4}>
            <Typography variant="subtitle2" sx={{ color: colors.text, mb: 2 }}>
              Average Metrics
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                { 
                  label: 'Inference Time',
                  value: `${modelStats.avgInferenceTime.toFixed(1)}ms`,
                  icon: <Speed />,
                  trend: modelStats.avgInferenceTime < 50 ? 'up' : 'down'
                },
                {
                  label: 'Throughput',
                  value: `${modelStats.avgThroughput.toFixed(1)} FPS`,
                  icon: <Timeline />,
                  trend: modelStats.avgThroughput > 25 ? 'up' : 'down'
                },
                {
                  label: 'Accuracy',
                  value: `${modelStats.avgAccuracy.toFixed(1)}%`,
                  icon: <BarChart />,
                  trend: modelStats.avgAccuracy > 85 ? 'up' : 'down'
                },
                {
                  label: 'Active Alerts',
                  value: modelStats.totalAlerts,
                  icon: <Warning />,
                  trend: modelStats.totalAlerts > 0 ? 'down' : 'up'
                }
              ].map((metric, index) => (
                <Card key={index} sx={{ backgroundColor: alpha(colors.primary, 0.05) }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ color: colors.secondary }}>{metric.icon}</Box>
                        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                          {metric.label}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="h6" sx={{ color: colors.text, fontWeight: 600 }}>
                          {metric.value}
                        </Typography>
                        {metric.trend === 'up' ? (
                          <TrendingUp sx={{ color: colors.success, fontSize: 16 }} />
                        ) : (
                          <TrendingDown sx={{ color: colors.danger, fontSize: 16 }} />
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Model Details Table */}
      <Paper
        elevation={0}
        sx={{
          backgroundColor: alpha(colors.surface, 0.95),
          border: `1px solid ${alpha(colors.primary, 0.2)}`
        }}
      >
        <Typography variant="h6" sx={{ color: colors.text, p: 3, pb: 1 }}>
          Model Details
        </Typography>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: colors.textSecondary, fontWeight: 600 }}>Model</TableCell>
                <TableCell sx={{ color: colors.textSecondary, fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ color: colors.textSecondary, fontWeight: 600 }}>Health Score</TableCell>
                <TableCell sx={{ color: colors.textSecondary, fontWeight: 600 }}>Inference Time</TableCell>
                <TableCell sx={{ color: colors.textSecondary, fontWeight: 600 }}>Throughput</TableCell>
                <TableCell sx={{ color: colors.textSecondary, fontWeight: 600 }}>Memory</TableCell>
                <TableCell sx={{ color: colors.textSecondary, fontWeight: 600 }}>GPU Util</TableCell>
                <TableCell sx={{ color: colors.textSecondary, fontWeight: 600 }}>Alerts</TableCell>
                <TableCell sx={{ color: colors.textSecondary, fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {models.map((model) => (
                <TableRow
                  key={model.id}
                  sx={{
                    '&:hover': { backgroundColor: alpha(colors.surface, 0.5) },
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setSelectedModel(model);
                    setDetailsDialog(true);
                  }}
                >
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ color: colors.text, fontWeight: 600 }}>
                        {model.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                        v{model.version} • {model.type}
                      </Typography>
                      {model.type === 'detection' && (
                        <Typography variant="caption" sx={{ color: colors.success, display: 'block' }}>
                          YOLO11 Eye (Detection)
                        </Typography>
                      )}
                      {model.type === 'behavioral' && (
                        <Typography variant="caption" sx={{ color: colors.warning, display: 'block' }}>
                          CNN+Transformer+LSTM Brain
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={model.status}
                      size="small"
                      sx={{
                        backgroundColor: alpha(getStatusColor(model.status), 0.2),
                        color: getStatusColor(model.status),
                        textTransform: 'uppercase',
                        fontWeight: 600
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{ color: getHealthScoreColor(model.health_score), fontWeight: 600 }}
                      >
                        {model.health_score}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={model.health_score}
                        sx={{
                          width: 60,
                          height: 4,
                          backgroundColor: alpha(colors.textSecondary, 0.2),
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: getHealthScoreColor(model.health_score)
                          }
                        }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: colors.text }}>
                      {model.metrics.inference_time_ms}ms
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: colors.text }}>
                      {model.metrics.throughput_fps} FPS
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: colors.text }}>
                      {model.metrics.memory_usage_mb}MB
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: colors.text }}>
                      {model.metrics.gpu_utilization_percent}%
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {model.alerts.length > 0 && (
                      <Chip
                        label={model.alerts.length}
                        size="small"
                        color={model.alerts.some(a => a.severity === 'critical') ? 'error' : 'warning'}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Restart Model">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onModelAction(model.id, 'restart');
                          }}
                          sx={{ color: colors.warning }}
                        >
                          <RestartAlt fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Configure">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Open configuration
                          }}
                          sx={{ color: colors.textSecondary }}
                        >
                          <Settings fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Model Details Dialog */}
      <Dialog
        open={detailsDialog}
        onClose={() => setDetailsDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        {selectedModel && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6">
                  {selectedModel.name} - Detailed Metrics
                </Typography>
                <Chip
                  label={selectedModel.status}
                  sx={{
                    backgroundColor: alpha(getStatusColor(selectedModel.status), 0.2),
                    color: getStatusColor(selectedModel.status),
                    textTransform: 'uppercase'
                  }}
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Resource Usage</Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon><Memory /></ListItemIcon>
                      <ListItemText
                        primary="Memory Usage"
                        secondary={`${selectedModel.resource_usage.memory_used_mb}MB / ${selectedModel.resource_usage.memory_allocated_mb}MB`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><DeviceHub /></ListItemIcon>
                      <ListItemText
                        primary="GPU Memory"
                        secondary={`${selectedModel.resource_usage.gpu_memory_mb}MB`}
                      />
                    </ListItem>
                    {selectedModel.resource_usage.gpu_temperature_c && (
                      <ListItem>
                        <ListItemIcon><Computer /></ListItemIcon>
                        <ListItemText
                          primary="GPU Temperature"
                          secondary={`${selectedModel.resource_usage.gpu_temperature_c}°C`}
                        />
                      </ListItem>
                    )}
                  </List>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Configuration</Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Batch Size"
                        secondary={selectedModel.configuration.batch_size}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Input Resolution"
                        secondary={selectedModel.configuration.input_resolution}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Confidence Threshold"
                        secondary={`${selectedModel.configuration.confidence_threshold}%`}
                      />
                    </ListItem>
                  </List>
                </Grid>
                
                {selectedModel.alerts.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>Active Alerts</Typography>
                    {selectedModel.alerts.map((alert, index) => (
                      <Alert
                        key={alert.id}
                        severity={alert.severity === 'critical' ? 'error' : alert.severity as any}
                        sx={{ mb: 1 }}
                      >
                        <Typography variant="body2">
                          {alert.message}
                        </Typography>
                        <Typography variant="caption" display="block">
                          {new Date(alert.timestamp).toLocaleString()}
                        </Typography>
                      </Alert>
                    ))}
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailsDialog(false)}>Close</Button>
              <Button
                variant="contained"
                onClick={() => {
                  onModelAction(selectedModel.id, 'restart');
                  setDetailsDialog(false);
                }}
              >
                Restart Model
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default AIModelHealthMonitor;
