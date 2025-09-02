/**
 * PerformanceWidgets - Real-time GPU/FPS/Latency monitoring widgets
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Stack,
  CircularProgress,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  useTheme,
  alpha,
  Divider
} from '@mui/material';
import {
  Memory as GpuIcon,
  Speed as FpsIcon,
  NetworkCheck as LatencyIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as HealthyIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  FullscreenIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface PerformanceMetrics {
  timestamp: number;
  gpu: {
    usage: number;
    memory: number;
    temperature: number;
    powerDraw: number;
    coreCount: number;
    activeCores: number;
  };
  fps: {
    current: number;
    average: number;
    min: number;
    max: number;
    dropped: number;
  };
  latency: {
    network: number;
    processing: number;
    rendering: number;
    total: number;
  };
  system: {
    cpuUsage: number;
    ramUsage: number;
    diskIO: number;
    networkIO: number;
  };
}

const PerformanceWidgets: React.FC = () => {
  const theme = useTheme();
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState<PerformanceMetrics | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Generate mock performance data
  useEffect(() => {
    const generateMetrics = (): PerformanceMetrics => ({
      timestamp: Date.now(),
      gpu: {
        usage: Math.random() * 100,
        memory: Math.random() * 100,
        temperature: 60 + Math.random() * 20,
        powerDraw: 150 + Math.random() * 100,
        coreCount: 8,
        activeCores: Math.floor(Math.random() * 8) + 1
      },
      fps: {
        current: Math.floor(Math.random() * 10) + 25,
        average: Math.floor(Math.random() * 5) + 28,
        min: Math.floor(Math.random() * 5) + 20,
        max: Math.floor(Math.random() * 5) + 30,
        dropped: Math.floor(Math.random() * 10)
      },
      latency: {
        network: Math.random() * 50 + 10,
        processing: Math.random() * 30 + 5,
        rendering: Math.random() * 20 + 2,
        total: 0
      },
      system: {
        cpuUsage: Math.random() * 100,
        ramUsage: Math.random() * 100,
        diskIO: Math.random() * 100,
        networkIO: Math.random() * 100
      }
    });

    const initialMetrics = Array.from({ length: 20 }, (_, i) => {
      const baseTime = Date.now() - (19 - i) * 1000;
      const metric = generateMetrics();
      metric.timestamp = baseTime;
      metric.latency.total = metric.latency.network + metric.latency.processing + metric.latency.rendering;
      return metric;
    });

    setMetrics(initialMetrics);
    setCurrentMetrics(initialMetrics[initialMetrics.length - 1]);

    const interval = setInterval(() => {
      const newMetric = generateMetrics();
      newMetric.latency.total = newMetric.latency.network + newMetric.latency.processing + newMetric.latency.rendering;
      
      setMetrics(prev => [...prev.slice(1), newMetric]);
      setCurrentMetrics(newMetric);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return theme.palette.error.main;
    if (value >= thresholds.warning) return theme.palette.warning.main;
    return theme.palette.success.main;
  };

  const getStatusIcon = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return <ErrorIcon />;
    if (value >= thresholds.warning) return <WarningIcon />;
    return <HealthyIcon />;
  };

  const chartData = metrics.map(m => ({
    time: new Date(m.timestamp).toLocaleTimeString(),
    gpu: m.gpu.usage,
    fps: m.fps.current,
    latency: m.latency.total,
    cpu: m.system.cpuUsage,
    memory: m.gpu.memory
  }));

  if (!currentMetrics) return null;

  return (
    <Box sx={{ p: 2 }}>
      {/* Compact Performance Overview */}
      <AnimatePresence>
        {!isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            layout
          >
            <Paper
              sx={{
                p: 2,
                backgroundColor: 'rgba(30, 41, 59, 0.9)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(71, 85, 105, 0.3)',
                cursor: 'pointer'
              }}
              onClick={() => setIsExpanded(true)}
            >
              <Stack direction="row" spacing={3} alignItems="center">
                {/* GPU Usage */}
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <GpuIcon color="primary" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">GPU</Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {currentMetrics.gpu.usage.toFixed(0)}%
                      </Typography>
                    </Box>
                    <CircularProgress
                      variant="determinate"
                      value={currentMetrics.gpu.usage}
                      size={40}
                      thickness={4}
                      sx={{
                        color: getStatusColor(currentMetrics.gpu.usage, { warning: 70, critical: 90 })
                      }}
                    />
                  </Stack>
                </motion.div>

                <Divider orientation="vertical" flexItem />

                {/* FPS */}
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <FpsIcon color="info" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">FPS</Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {currentMetrics.fps.current}
                      </Typography>
                    </Box>
                    <Chip
                      icon={getStatusIcon(30 - currentMetrics.fps.current, { warning: 5, critical: 10 })}
                      label={currentMetrics.fps.current >= 25 ? 'Good' : 'Low'}
                      size="small"
                      color={currentMetrics.fps.current >= 25 ? 'success' : 'warning'}
                    />
                  </Stack>
                </motion.div>

                <Divider orientation="vertical" flexItem />

                {/* Latency */}
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <LatencyIcon color="warning" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Latency</Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {currentMetrics.latency.total.toFixed(0)}ms
                      </Typography>
                    </Box>
                    <Chip
                      icon={getStatusIcon(currentMetrics.latency.total, { warning: 100, critical: 200 })}
                      label={currentMetrics.latency.total < 100 ? 'Good' : 'High'}
                      size="small"
                      color={currentMetrics.latency.total < 100 ? 'success' : 'warning'}
                    />
                  </Stack>
                </motion.div>

                <Box sx={{ flex: 1 }} />

                <Tooltip title="Expand Performance View">
                  <IconButton color="primary">
                    <FullscreenIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Performance Dashboard */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            layout
          >
            <Paper
              sx={{
                p: 3,
                backgroundColor: 'rgba(30, 41, 59, 0.9)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(71, 85, 105, 0.3)'
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight="bold">
                  System Performance Monitor
                </Typography>
                
                <Stack direction="row" spacing={1}>
                  <Tooltip title="Refresh Data">
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <IconButton>
                        <RefreshIcon />
                      </IconButton>
                    </motion.div>
                  </Tooltip>
                  
                  <Tooltip title="Collapse View">
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <IconButton onClick={() => setIsExpanded(false)}>
                        <FullscreenIcon style={{ transform: 'rotate(180deg)' }} />
                      </IconButton>
                    </motion.div>
                  </Tooltip>
                </Stack>
              </Stack>

              <Grid container spacing={3}>
                {/* GPU Metrics */}
                <Grid item xs={12} md={6} lg={3}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                          <Typography variant="h6">GPU Performance</Typography>
                          <GpuIcon color="primary" />
                        </Stack>

                        <Box sx={{ position: 'relative', display: 'inline-flex', mb: 3 }}>
                          <CircularProgress
                            variant="determinate"
                            value={currentMetrics.gpu.usage}
                            size={120}
                            thickness={6}
                            sx={{
                              color: getStatusColor(currentMetrics.gpu.usage, { warning: 70, critical: 90 })
                            }}
                          />
                          <Box
                            sx={{
                              top: 0,
                              left: 0,
                              bottom: 0,
                              right: 0,
                              position: 'absolute',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexDirection: 'column'
                            }}
                          >
                            <Typography variant="h5" fontWeight="bold">
                              {currentMetrics.gpu.usage.toFixed(0)}%
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Usage
                            </Typography>
                          </Box>
                        </Box>

                        <Stack spacing={1}>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2">Memory:</Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {currentMetrics.gpu.memory.toFixed(0)}%
                            </Typography>
                          </Stack>
                          
                          <LinearProgress
                            variant="determinate"
                            value={currentMetrics.gpu.memory}
                            sx={{ height: 6, borderRadius: 3 }}
                          />

                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2">Temperature:</Typography>
                            <Typography variant="body2" fontWeight="bold" color={
                              currentMetrics.gpu.temperature > 80 ? 'error.main' : 'text.primary'
                            }>
                              {currentMetrics.gpu.temperature.toFixed(0)}°C
                            </Typography>
                          </Stack>

                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2">Power:</Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {currentMetrics.gpu.powerDraw.toFixed(0)}W
                            </Typography>
                          </Stack>

                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2">Active Cores:</Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {currentMetrics.gpu.activeCores}/{currentMetrics.gpu.coreCount}
                            </Typography>
                          </Stack>
                        </Stack>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>

                {/* FPS Metrics */}
                <Grid item xs={12} md={6} lg={3}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                          <Typography variant="h6">Frame Rate</Typography>
                          <FpsIcon color="info" />
                        </Stack>

                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                          <motion.div
                            animate={{ 
                              scale: [1, 1.05, 1],
                              color: currentMetrics.fps.current < 25 ? [
                                theme.palette.text.primary,
                                theme.palette.warning.main,
                                theme.palette.text.primary
                              ] : theme.palette.text.primary
                            }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            <Typography variant="h2" fontWeight="bold">
                              {currentMetrics.fps.current}
                            </Typography>
                          </motion.div>
                          <Typography variant="subtitle1" color="text.secondary">
                            Frames per Second
                          </Typography>
                        </Box>

                        <Stack spacing={2}>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2">Average:</Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {currentMetrics.fps.average} FPS
                            </Typography>
                          </Stack>

                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2">Range:</Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {currentMetrics.fps.min} - {currentMetrics.fps.max}
                            </Typography>
                          </Stack>

                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2">Dropped:</Typography>
                            <Typography variant="body2" fontWeight="bold" color={
                              currentMetrics.fps.dropped > 5 ? 'warning.main' : 'text.primary'
                            }>
                              {currentMetrics.fps.dropped}
                            </Typography>
                          </Stack>

                          <Box>
                            <Typography variant="body2" gutterBottom>FPS Stability:</Typography>
                            <LinearProgress
                              variant="determinate"
                              value={Math.max(0, 100 - (currentMetrics.fps.max - currentMetrics.fps.min) * 10)}
                              sx={{ 
                                height: 6, 
                                borderRadius: 3,
                                backgroundColor: alpha(theme.palette.info.main, 0.2)
                              }}
                            />
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>

                {/* Latency Metrics */}
                <Grid item xs={12} md={6} lg={3}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                          <Typography variant="h6">Latency</Typography>
                          <LatencyIcon color="warning" />
                        </Stack>

                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                          <motion.div
                            animate={{
                              scale: currentMetrics.latency.total > 150 ? [1, 1.1, 1] : 1
                            }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                          >
                            <Typography variant="h2" fontWeight="bold">
                              {currentMetrics.latency.total.toFixed(0)}
                            </Typography>
                          </motion.div>
                          <Typography variant="subtitle1" color="text.secondary">
                            Milliseconds
                          </Typography>
                        </Box>

                        <Stack spacing={1}>
                          <Box>
                            <Stack direction="row" justifyContent="space-between">
                              <Typography variant="body2">Network:</Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {currentMetrics.latency.network.toFixed(0)}ms
                              </Typography>
                            </Stack>
                            <LinearProgress
                              variant="determinate"
                              value={(currentMetrics.latency.network / currentMetrics.latency.total) * 100}
                              sx={{ height: 4, borderRadius: 2, backgroundColor: alpha(theme.palette.primary.main, 0.2) }}
                            />
                          </Box>

                          <Box>
                            <Stack direction="row" justifyContent="space-between">
                              <Typography variant="body2">Processing:</Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {currentMetrics.latency.processing.toFixed(0)}ms
                              </Typography>
                            </Stack>
                            <LinearProgress
                              variant="determinate"
                              value={(currentMetrics.latency.processing / currentMetrics.latency.total) * 100}
                              sx={{ height: 4, borderRadius: 2, backgroundColor: alpha(theme.palette.info.main, 0.2) }}
                            />
                          </Box>

                          <Box>
                            <Stack direction="row" justifyContent="space-between">
                              <Typography variant="body2">Rendering:</Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {currentMetrics.latency.rendering.toFixed(0)}ms
                              </Typography>
                            </Stack>
                            <LinearProgress
                              variant="determinate"
                              value={(currentMetrics.latency.rendering / currentMetrics.latency.total) * 100}
                              sx={{ height: 4, borderRadius: 2, backgroundColor: alpha(theme.palette.success.main, 0.2) }}
                            />
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>

                {/* System Health */}
                <Grid item xs={12} md={6} lg={3}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                          <Typography variant="h6">System Health</Typography>
                          {getStatusIcon(
                            Math.max(currentMetrics.system.cpuUsage, currentMetrics.system.ramUsage),
                            { warning: 70, critical: 90 }
                          )}
                        </Stack>

                        <Stack spacing={2}>
                          <Box>
                            <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                              <Typography variant="body2">CPU Usage:</Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {currentMetrics.system.cpuUsage.toFixed(0)}%
                              </Typography>
                            </Stack>
                            <LinearProgress
                              variant="determinate"
                              value={currentMetrics.system.cpuUsage}
                              sx={{ 
                                height: 6, 
                                borderRadius: 3,
                                backgroundColor: alpha(theme.palette.primary.main, 0.2)
                              }}
                            />
                          </Box>

                          <Box>
                            <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                              <Typography variant="body2">RAM Usage:</Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {currentMetrics.system.ramUsage.toFixed(0)}%
                              </Typography>
                            </Stack>
                            <LinearProgress
                              variant="determinate"
                              value={currentMetrics.system.ramUsage}
                              sx={{ 
                                height: 6, 
                                borderRadius: 3,
                                backgroundColor: alpha(theme.palette.info.main, 0.2)
                              }}
                            />
                          </Box>

                          <Box>
                            <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                              <Typography variant="body2">Disk I/O:</Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {currentMetrics.system.diskIO.toFixed(0)}%
                              </Typography>
                            </Stack>
                            <LinearProgress
                              variant="determinate"
                              value={currentMetrics.system.diskIO}
                              sx={{ 
                                height: 6, 
                                borderRadius: 3,
                                backgroundColor: alpha(theme.palette.warning.main, 0.2)
                              }}
                            />
                          </Box>

                          <Box>
                            <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                              <Typography variant="body2">Network I/O:</Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {currentMetrics.system.networkIO.toFixed(0)}%
                              </Typography>
                            </Stack>
                            <LinearProgress
                              variant="determinate"
                              value={currentMetrics.system.networkIO}
                              sx={{ 
                                height: 6, 
                                borderRadius: 3,
                                backgroundColor: alpha(theme.palette.success.main, 0.2)
                              }}
                            />
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>

                {/* Performance Charts */}
                <Grid item xs={12}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Performance Trends (Last 20 seconds)
                        </Typography>
                        
                        <Box sx={{ height: 300 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.secondary, 0.1)} />
                              <XAxis 
                                dataKey="time" 
                                stroke={theme.palette.text.secondary}
                                fontSize={12}
                              />
                              <YAxis 
                                stroke={theme.palette.text.secondary}
                                fontSize={12}
                              />
                              <RechartsTooltip 
                                contentStyle={{
                                  backgroundColor: theme.palette.background.paper,
                                  border: `1px solid ${theme.palette.divider}`,
                                  borderRadius: theme.shape.borderRadius
                                }}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="gpu" 
                                stroke={theme.palette.primary.main}
                                strokeWidth={2}
                                dot={false}
                                name="GPU %"
                              />
                              <Line 
                                type="monotone" 
                                dataKey="fps" 
                                stroke={theme.palette.info.main}
                                strokeWidth={2}
                                dot={false}
                                name="FPS"
                              />
                              <Line 
                                type="monotone" 
                                dataKey="latency" 
                                stroke={theme.palette.warning.main}
                                strokeWidth={2}
                                dot={false}
                                name="Latency (ms)"
                              />
                              <Line 
                                type="monotone" 
                                dataKey="cpu" 
                                stroke={theme.palette.secondary.main}
                                strokeWidth={2}
                                dot={false}
                                name="CPU %"
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              </Grid>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default PerformanceWidgets;
