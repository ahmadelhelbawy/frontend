/**
 * AnimatedDashboardExample - Example dashboard page with integrated micro-interactions
 */

import React, { useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Avatar,
  LinearProgress,
  Box,
  useTheme
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  VideoCall as VideoCallIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';

import { motion } from 'framer-motion';
import {
  AnimatedCard,
  AnimatedButton,
  StaggeredList,
  PulsingDot,
  FloatingAction,
  GlowEffect,
  ShimmerEffect,
  NumberTicker,
  ProgressRing,
  CountUp,
  TypewriterText,
  SparkleEffect
} from '../animations/MicroInteractions';
import { EnhancedLayoutShell, AnimatedPage, AnimatedDivider } from '../layout/EnhancedLayoutShell';
import { useScrollAnimation } from '../animations/AnimationHooks';

const AnimatedDashboardExample: React.FC = () => {
  const theme = useTheme();
  const [selectedMetric, setSelectedMetric] = useState('incidents');
  const { ref: statsRef, controls: statsControls } = useScrollAnimation(0.3);

  // Mock data
  const dashboardStats = {
    totalIncidents: 247,
    activeCameras: 23,
    systemHealth: 98,
    averageResponse: 1.2
  };

  const recentIncidents = [
    { id: 1, type: 'Shoplifting', location: 'Aisle 3', time: '2 min ago', severity: 'high' },
    { id: 2, type: 'Suspicious Activity', location: 'Exit Door', time: '5 min ago', severity: 'medium' },
    { id: 3, type: 'Loitering', location: 'Electronics', time: '8 min ago', severity: 'low' },
    { id: 4, type: 'Shoplifting', location: 'Checkout', time: '12 min ago', severity: 'high' }
  ];

  const cameraStatuses = [
    { id: 'CAM001', name: 'Main Entrance', status: 'online', fps: 30 },
    { id: 'CAM002', name: 'Aisle 1-3', status: 'online', fps: 28 },
    { id: 'CAM003', name: 'Checkout Area', status: 'warning', fps: 25 },
    { id: 'CAM004', name: 'Exit Door', status: 'offline', fps: 0 }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return theme.palette.error.main;
      case 'medium': return theme.palette.warning.main;
      case 'low': return theme.palette.info.main;
      default: return theme.palette.text.secondary;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return theme.palette.success.main;
      case 'warning': return theme.palette.warning.main;
      case 'offline': return theme.palette.error.main;
      default: return theme.palette.text.secondary;
    }
  };

  return (
    <EnhancedLayoutShell
      showScrollToTop={true}
      showPerformanceIndicator={true}
      enableParallax={true}
    >
      <AnimatedPage animation="fadeInUp" delay={0.1}>
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <SparkleEffect>
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: 700,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              <TypewriterText text="AI Security Dashboard" speed={100} />
            </Typography>
          </SparkleEffect>
          
          <Typography variant="h6" color="text.secondary">
            Real-time monitoring and incident detection
          </Typography>
        </Box>

        <AnimatedDivider variant="gradient" />

        {/* Stats Cards */}
        <Box ref={statsRef}>
          <StaggeredList staggerDelay={0.1}>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <AnimatedCard variant="bounceIn" hoverEffect={true}>
                  <GlowEffect color={theme.palette.error.main} trigger="hover">
                    <Card
                      sx={{
                        background: `linear-gradient(135deg, ${theme.palette.error.main}15, ${theme.palette.error.dark}10)`,
                        border: `1px solid ${theme.palette.error.main}30`
                      }}
                    >
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                          <WarningIcon sx={{ color: theme.palette.error.main, mr: 1 }} />
                          <PulsingDot color={theme.palette.error.main} intensity="strong" />
                        </Box>
                        <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
                          <CountUp from={0} to={dashboardStats.totalIncidents} duration={1.5} />
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Incidents
                        </Typography>
                      </CardContent>
                    </Card>
                  </GlowEffect>
                </AnimatedCard>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <AnimatedCard variant="slideInLeft" delay={0.1} hoverEffect={true}>
                  <GlowEffect color={theme.palette.success.main} trigger="hover">
                    <Card
                      sx={{
                        background: `linear-gradient(135deg, ${theme.palette.success.main}15, ${theme.palette.success.dark}10)`,
                        border: `1px solid ${theme.palette.success.main}30`
                      }}
                    >
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                          <VideoCallIcon sx={{ color: theme.palette.success.main, mr: 1 }} />
                          <PulsingDot color={theme.palette.success.main} intensity="medium" />
                        </Box>
                        <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
                          <CountUp from={0} to={dashboardStats.activeCameras} duration={1.2} />
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Active Cameras
                        </Typography>
                      </CardContent>
                    </Card>
                  </GlowEffect>
                </AnimatedCard>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <AnimatedCard variant="slideInRight" delay={0.2} hoverEffect={true}>
                  <GlowEffect color={theme.palette.primary.main} trigger="hover">
                    <Card
                      sx={{
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.primary.dark}10)`,
                        border: `1px solid ${theme.palette.primary.main}30`
                      }}
                    >
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                          <CheckCircleIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                          <ProgressRing
                            progress={dashboardStats.systemHealth}
                            size={40}
                            color={theme.palette.primary.main}
                          />
                        </Box>
                        <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
                          <CountUp from={0} to={dashboardStats.systemHealth} suffix="%" duration={1.8} />
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          System Health
                        </Typography>
                      </CardContent>
                    </Card>
                  </GlowEffect>
                </AnimatedCard>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <AnimatedCard variant="flipIn" delay={0.3} hoverEffect={true}>
                  <GlowEffect color={theme.palette.info.main} trigger="hover">
                    <Card
                      sx={{
                        background: `linear-gradient(135deg, ${theme.palette.info.main}15, ${theme.palette.info.dark}10)`,
                        border: `1px solid ${theme.palette.info.main}30`
                      }}
                    >
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                          <SpeedIcon sx={{ color: theme.palette.info.main, mr: 1 }} />
                          <PulsingDot color={theme.palette.info.main} intensity="subtle" />
                        </Box>
                        <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
                          <CountUp from={0} to={dashboardStats.averageResponse} duration={1} suffix="s" />
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Avg Response Time
                        </Typography>
                      </CardContent>
                    </Card>
                  </GlowEffect>
                </AnimatedCard>
              </Grid>
            </Grid>
          </StaggeredList>
        </Box>

        <AnimatedDivider variant="dots" />

        {/* Recent Incidents Section */}
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <AnimatedCard variant="fadeInUp" delay={0.4}>
              <ShimmerEffect>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`
                  }}
                >
                  <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                    Recent Incidents
                  </Typography>
                  
                  <StaggeredList staggerDelay={0.1}>
                    {recentIncidents.map((incident) => (
                      <Box key={incident.id} sx={{ mb: 2 }}>
                        <AnimatedButton variant="lift">
                          <Paper
                            elevation={1}
                            sx={{
                              p: 2,
                              borderLeft: `4px solid ${getSeverityColor(incident.severity)}`,
                              '&:hover': {
                                backgroundColor: theme.palette.action.hover
                              }
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <PulsingDot
                                  color={getSeverityColor(incident.severity)}
                                  intensity={incident.severity === 'high' ? 'strong' : 'medium'}
                                />
                                <Box>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    {incident.type}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {incident.location}
                                  </Typography>
                                </Box>
                              </Box>
                              <Box sx={{ textAlign: 'right' }}>
                                <Chip
                                  size="small"
                                  label={incident.severity.toUpperCase()}
                                  color={incident.severity === 'high' ? 'error' : incident.severity === 'medium' ? 'warning' : 'info'}
                                />
                                <Typography variant="caption" display="block" color="text.secondary">
                                  {incident.time}
                                </Typography>
                              </Box>
                            </Box>
                          </Paper>
                        </AnimatedButton>
                      </Box>
                    ))}
                  </StaggeredList>

                  <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <AnimatedButton variant="glow">
                      <Button
                        variant="outlined"
                        color="primary"
                        sx={{ borderRadius: 3 }}
                      >
                        View All Incidents
                      </Button>
                    </AnimatedButton>
                  </Box>
                </Paper>
              </ShimmerEffect>
            </AnimatedCard>
          </Grid>

          {/* Camera Status Panel */}
          <Grid item xs={12} lg={4}>
            <AnimatedCard variant="slideInRight" delay={0.5}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  height: '100%',
                  background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`
                }}
              >
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                  Camera Status
                </Typography>

                <StaggeredList staggerDelay={0.15}>
                  {cameraStatuses.map((camera) => (
                    <Box key={camera.id} sx={{ mb: 2 }}>
                      <AnimatedButton variant="scale">
                        <Card
                          variant="outlined"
                          sx={{
                            borderColor: `${getStatusColor(camera.status)}40`,
                            '&:hover': {
                              borderColor: getStatusColor(camera.status),
                              backgroundColor: `${getStatusColor(camera.status)}10`
                            }
                          }}
                        >
                          <CardContent sx={{ py: 1.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <PulsingDot
                                  color={getStatusColor(camera.status)}
                                  size={8}
                                  intensity={camera.status === 'online' ? 'medium' : 'strong'}
                                />
                                <Box>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                    {camera.id}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {camera.name}
                                  </Typography>
                                </Box>
                              </Box>
                              <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  <NumberTicker value={camera.fps} format={(num) => `${num} FPS`} />
                                </Typography>
                                <Chip
                                  size="small"
                                  label={camera.status.toUpperCase()}
                                  color={camera.status === 'online' ? 'success' : camera.status === 'warning' ? 'warning' : 'error'}
                                />
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </AnimatedButton>
                    </Box>
                  ))}
                </StaggeredList>

                <Box sx={{ mt: 3 }}>
                  <AnimatedButton variant="lift">
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<VideoCallIcon />}
                      sx={{ borderRadius: 3 }}
                    >
                      Manage Cameras
                    </Button>
                  </AnimatedButton>
                </Box>
              </Paper>
            </AnimatedCard>
          </Grid>
        </Grid>

        <AnimatedDivider variant="wave" />

        {/* Action Buttons Section */}
        <AnimatedCard variant="fadeInUp" delay={0.6}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              mt: 4,
              background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`
            }}
          >
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
              Quick Actions
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <GlowEffect color={theme.palette.primary.main}>
                  <AnimatedButton variant="scale">
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<SecurityIcon />}
                      sx={{
                        py: 2,
                        borderRadius: 3,
                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
                      }}
                    >
                      Security Overview
                    </Button>
                  </AnimatedButton>
                </GlowEffect>
              </Grid>

              <Grid item xs={12} sm={4}>
                <GlowEffect color={theme.palette.success.main}>
                  <AnimatedButton variant="lift">
                    <Button
                      variant="contained"
                      color="success"
                      fullWidth
                      startIcon={<TrendingUpIcon />}
                      sx={{ py: 2, borderRadius: 3 }}
                    >
                      Analytics
                    </Button>
                  </AnimatedButton>
                </GlowEffect>
              </Grid>

              <Grid item xs={12} sm={4}>
                <GlowEffect color={theme.palette.warning.main}>
                  <AnimatedButton variant="rotate">
                    <Button
                      variant="contained"
                      color="warning"
                      fullWidth
                      startIcon={<SpeedIcon />}
                      sx={{ py: 2, borderRadius: 3 }}
                    >
                      Performance
                    </Button>
                  </AnimatedButton>
                </GlowEffect>
              </Grid>
            </Grid>
          </Paper>
        </AnimatedCard>

        {/* Performance Metrics */}
        <AnimatedCard variant="fadeInScale" delay={0.8}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              mt: 4,
              background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`
            }}
          >
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
              System Performance
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <ProgressRing
                    progress={85}
                    size={100}
                    color={theme.palette.primary.main}
                  />
                  <Typography variant="h6" sx={{ mt: 2, fontWeight: 600 }}>
                    CPU Usage
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    85% Average
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <ProgressRing
                    progress={67}
                    size={100}
                    color={theme.palette.success.main}
                  />
                  <Typography variant="h6" sx={{ mt: 2, fontWeight: 600 }}>
                    Memory Usage
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    67% Average
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <ProgressRing
                    progress={92}
                    size={100}
                    color={theme.palette.error.main}
                  />
                  <Typography variant="h6" sx={{ mt: 2, fontWeight: 600 }}>
                    Network I/O
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    92% Peak
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Box sx={{ mt: 4 }}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                Overall System Health
              </Typography>
              <LinearProgress
                variant="determinate"
                value={dashboardStats.systemHealth}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: `${theme.palette.primary.main}20`,
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    background: `linear-gradient(45deg, ${theme.palette.success.main}, ${theme.palette.primary.main})`
                  }
                }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Excellent performance across all systems
              </Typography>
            </Box>
          </Paper>
        </AnimatedCard>
      </AnimatedPage>
    </EnhancedLayoutShell>
  );
};

export default AnimatedDashboardExample;
