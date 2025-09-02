/**
 * OptimizedSecurityDashboard - Advanced live security dashboard
 * Integrates modern navigation, adaptive layouts, live monitoring, and camera panels
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Drawer,
  Typography,
  useTheme,
  useMediaQuery,
  alpha,
  styled,
  Fade,
  Grow,
  Zoom,
  Slide,
  Collapse,
  IconButton,
  Tooltip,
  Chip,
  Divider,
  Paper,
  Grid,
  Container
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Refresh as RefreshIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  CameraAlt as CameraIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

import SecurityTopNavigation from '../layout/SecurityTopNavigation';
import AdaptiveGridLayout from '../layout/AdaptiveGridLayout';
import LiveMonitoringDashboard from '../monitoring/LiveMonitoringDashboard';
import AdvancedCameraPanels from '../cameras/AdvancedCameraPanels';
import { useOperatorContext } from '../../contexts/OperatorContext';

// Import core micro-interactions only
import {
  AnimatedCard,
  AnimatedButton,
  PulsingDot,
  GlowEffect,
  CountUp,
  TypewriterText,
  SparkleEffect
} from '../animations/MicroInteractions';

// Styled components with enhanced animations
const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: 280,
    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.95)} 0%, ${alpha(theme.palette.primary.dark, 0.98)} 100%)`,
    backdropFilter: 'blur(20px)',
    border: 'none',
    boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.3)}`,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      boxShadow: `0 12px 48px ${alpha(theme.palette.common.black, 0.4)}`,
    }
  }
}));

const DashboardContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: `radial-gradient(ellipse at top, ${alpha(theme.palette.background.default, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.6)} 100%)`,
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23${theme.palette.primary.main.replace('#', '')}' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    pointerEvents: 'none',
    zIndex: 0
  }
}));

const MainContent = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 1,
  padding: theme.spacing(3),
  paddingTop: theme.spacing(10),
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  [theme.breakpoints.up('lg')]: {
    padding: theme.spacing(4),
    paddingTop: theme.spacing(12)
  }
}));

const SidebarHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${alpha(theme.palette.primary.dark, 0.3)} 100%)`,
  backdropFilter: 'blur(10px)',
  '& .MuiTypography-root': {
    color: theme.palette.common.white,
    fontWeight: 600,
    letterSpacing: '0.5px'
  }
}));

const SidebarItem = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  margin: theme.spacing(0.5, 1),
  borderRadius: theme.shape.borderRadius,
  cursor: 'pointer',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  color: alpha(theme.palette.common.white, 0.8),
  '&:hover': {
    background: alpha(theme.palette.common.white, 0.1),
    color: theme.palette.common.white,
    transform: 'translateX(4px)',
    boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.2)}`
  },
  '&.active': {
    background: alpha(theme.palette.common.white, 0.15),
    color: theme.palette.common.white,
    borderLeft: `3px solid ${theme.palette.secondary.main}`,
    boxShadow: `0 4px 16px ${alpha(theme.palette.secondary.main, 0.3)}`
  }
}));

const StatusIndicator = styled(Box)(({ theme, status }: { theme: any; status: string }) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  background: status === 'online' ? theme.palette.success.main :
              status === 'warning' ? theme.palette.warning.main :
              status === 'error' ? theme.palette.error.main :
              theme.palette.grey[500],
  boxShadow: `0 0 8px ${status === 'online' ? alpha(theme.palette.success.main, 0.6) :
                status === 'warning' ? alpha(theme.palette.warning.main, 0.6) :
                status === 'error' ? alpha(theme.palette.error.main, 0.6) :
                alpha(theme.palette.grey[500], 0.6)}`,
  animation: status === 'online' ? 'pulse 2s infinite' : 'none',
  '@keyframes pulse': {
    '0%': { opacity: 1 },
    '50%': { opacity: 0.5 },
    '100%': { opacity: 1 }
  }
}));

const FloatingActionButton = styled(IconButton)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(3),
  right: theme.spacing(3),
  width: 56,
  height: 56,
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: theme.palette.common.white,
  boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  zIndex: 1000,
  '&:hover': {
    transform: 'scale(1.1) rotate(5deg)',
    boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.6)}`
  }
}));

const OptimizedSecurityDashboard: React.FC = () => {
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));
  const [sidebarOpen, setSidebarOpen] = useState(isLargeScreen);
  const [fullscreenMode, setFullscreenMode] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    timestamp: Date;
  }>>([]);

  const { cameras, alerts, aiModels, systemHealth } = useOperatorContext();

  // Simulate push notifications
  useEffect(() => {
    const notificationInterval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance every interval
        const types: Array<'info' | 'warning' | 'error' | 'success'> = ['info', 'warning', 'error', 'success'];
        const messages = [
          'New camera feed detected',
          'AI model performance improved',
          'System health check completed',
          'Alert threshold reached',
          'Backup system activated'
        ];
        
        const message = messages[Math.floor(Math.random() * messages.length)];
        const type = types[Math.floor(Math.random() * types.length)];
        
        if (message && type) {
          const newNotification = {
            id: Date.now().toString(),
            message,
            type,
            timestamp: new Date()
          };
          
          setNotifications(prev => [newNotification, ...prev.slice(0, 4)]);
        }
      }
    }, 10000); // Every 10 seconds

    return () => clearInterval(notificationInterval);
  }, []);

  // Auto-remove old notifications
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setNotifications(prev => prev.filter(n => 
        Date.now() - n.timestamp.getTime() < 30000 // Remove after 30 seconds
      ));
    }, 5000);

    return () => clearInterval(cleanupInterval);
  }, []);

  const handleSidebarToggle = useCallback(() => {
    setSidebarOpen(!sidebarOpen);
  }, [sidebarOpen]);

  const handleFullscreenToggle = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setFullscreenMode(true);
    } else {
      document.exitFullscreen();
      setFullscreenMode(false);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    window.location.reload();
  }, []);

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <SecurityIcon />, active: activeSection === 'dashboard' },
    { id: 'cameras', label: 'Cameras', icon: <CameraIcon />, active: activeSection === 'cameras' },
    { id: 'analytics', label: 'Analytics', icon: <AnalyticsIcon />, active: activeSection === 'analytics' },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon />, active: activeSection === 'settings' }
  ];

  const systemStatus = useMemo(() => {
    if (!systemHealth) return 'unknown';
    const { overall } = systemHealth;
    return overall;
  }, [systemHealth]);

  const onlineCameras = useMemo(() => {
    return cameras.filter(camera => camera.status === 'online').length;
  }, [cameras]);

  const totalCameras = cameras.length;

  return (
    <DashboardContainer>
      {/* Top Navigation */}
      <SecurityTopNavigation 
        onMenuToggle={handleSidebarToggle}
        systemStatus={systemStatus}
        onlineCameras={onlineCameras}
        totalCameras={totalCameras}
        notifications={notifications}
      />

      {/* Sidebar */}
      <StyledDrawer
        variant={isLargeScreen ? 'persistent' : 'temporary'}
        open={sidebarOpen}
        onClose={() => !isLargeScreen && setSidebarOpen(false)}
        anchor="left"
      >
        <SidebarHeader>
          <Box display="flex" alignItems="center" gap={2}>
            <SparkleEffect>
              <SecurityIcon sx={{ color: 'white', fontSize: 28 }} />
            </SparkleEffect>
            <Typography variant="h6">
              Security Hub
            </Typography>
          </Box>
          <Box mt={2} display="flex" alignItems="center" gap={1}>
            <PulsingDot 
              color={systemStatus === 'healthy' ? theme.palette.success.main : theme.palette.warning.main}
              intensity={systemStatus === 'healthy' ? 'medium' : 'strong'}
            />
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              System {systemStatus}
            </Typography>
          </Box>
        </SidebarHeader>

        <Box sx={{ flex: 1, py: 2 }}>
          {sidebarItems.map((item) => (
            <AnimatedButton key={item.id} variant="lift">
              <SidebarItem
                className={item.active ? 'active' : ''}
                onClick={() => setActiveSection(item.id)}
              >
                <Box display="flex" alignItems="center" gap={2}>
                  {item.icon}
                  <Typography variant="body1">
                    {item.label}
                  </Typography>
                </Box>
              </SidebarItem>
            </AnimatedButton>
          ))}
        </Box>

        {/* Enhanced System Stats */}
        <Box sx={{ p: 3, borderTop: `1px solid ${alpha(theme.palette.common.white, 0.1)}` }}>
          <Typography variant="body2" sx={{ color: 'white', mb: 2, opacity: 0.8 }}>
            System Overview
          </Typography>
          <Box display="flex" flexDirection="column" gap={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center" gap={1}>
                <PulsingDot color={theme.palette.success.main} size={6} />
                <Typography variant="body2" sx={{ color: 'white', opacity: 0.7 }}>
                  Cameras
                </Typography>
              </Box>
              <GlowEffect color={theme.palette.success.main}>
                <Chip 
                  label={<CountUp from={0} to={onlineCameras} suffix={`/${totalCameras}`} duration={0.8} />}
                  size="small"
                  sx={{ 
                    background: alpha(theme.palette.success.main, 0.2),
                    color: 'white',
                    fontSize: '0.75rem'
                  }}
                />
              </GlowEffect>
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center" gap={1}>
                <PulsingDot color={theme.palette.info.main} size={6} />
                <Typography variant="body2" sx={{ color: 'white', opacity: 0.7 }}>
                  AI Models
                </Typography>
              </Box>
              <GlowEffect color={theme.palette.info.main}>
                <Chip 
                  label={<CountUp from={0} to={aiModels.length} suffix=" Active" duration={0.8} />}
                  size="small"
                  sx={{ 
                    background: alpha(theme.palette.info.main, 0.2),
                    color: 'white',
                    fontSize: '0.75rem'
                  }}
                />
              </GlowEffect>
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center" gap={1}>
                <PulsingDot 
                  color={alerts.length > 0 ? theme.palette.warning.main : theme.palette.success.main} 
                  size={6}
                  intensity={alerts.length > 0 ? 'strong' : 'subtle'}
                />
                <Typography variant="body2" sx={{ color: 'white', opacity: 0.7 }}>
                  Alerts
                </Typography>
              </Box>
              <GlowEffect color={alerts.length > 0 ? theme.palette.warning.main : theme.palette.success.main}>
                <Chip 
                  label={<CountUp from={0} to={alerts.length} suffix=" New" duration={0.8} />}
                  size="small"
                  sx={{ 
                    background: alpha(alerts.length > 0 ? theme.palette.warning.main : theme.palette.success.main, 0.2),
                    color: 'white',
                    fontSize: '0.75rem'
                  }}
                />
              </GlowEffect>
            </Box>
          </Box>
        </Box>
      </StyledDrawer>

      {/* Main Content */}
      <MainContent
        sx={{
          marginLeft: isLargeScreen && sidebarOpen ? '280px' : 0,
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >

        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {activeSection === 'dashboard' && (
              <Box>
                {/* Enhanced Dashboard Header */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                    <Box>
                      <SparkleEffect>
                        <Typography 
                          variant="h3" 
                          sx={{ 
                            fontWeight: 700, 
                            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            mb: 1
                          }}
                        >
                          Security Operations Center
                        </Typography>
                      </SparkleEffect>
                      <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
                        Real-time monitoring and AI-powered threat detection
                      </Typography>
                    </Box>
                    
                    <Box display="flex" gap={2}>
                      <AnimatedButton variant="glow">
                        <Tooltip title="Refresh Dashboard">
                          <IconButton
                            onClick={handleRefresh}
                            sx={{
                              background: alpha(theme.palette.primary.main, 0.1),
                              '&:hover': {
                                background: alpha(theme.palette.primary.main, 0.2)
                              }
                            }}
                          >
                            <RefreshIcon />
                          </IconButton>
                        </Tooltip>
                      </AnimatedButton>
                      
                      <AnimatedButton variant="glow">
                        <Tooltip title={fullscreenMode ? 'Exit Fullscreen' : 'Enter Fullscreen'}>
                          <IconButton
                            onClick={handleFullscreenToggle}
                            sx={{
                              background: alpha(theme.palette.secondary.main, 0.1),
                              '&:hover': {
                                background: alpha(theme.palette.secondary.main, 0.2)
                              }
                            }}
                          >
                            {fullscreenMode ? <FullscreenExitIcon /> : <FullscreenIcon />}
                          </IconButton>
                        </Tooltip>
                      </AnimatedButton>
                    </Box>
                  </Box>
                </motion.div>

                {/* Enhanced Quick Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Grid container spacing={3} mb={4}>
                    <Grid item xs={12} sm={6} md={3}>
                      <GlowEffect color={theme.palette.success.main} trigger="hover">
                        <Paper
                          elevation={0}
                          sx={{
                            p: 3,
                            background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.light, 0.05)} 100%)`,
                            border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                            borderRadius: 3,
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: `0 8px 25px ${alpha(theme.palette.success.main, 0.15)}`
                            }
                          }}
                        >
                          <Box display="flex" alignItems="center" gap={2}>
                            <Box
                              sx={{
                                width: 48,
                                height: 48,
                                borderRadius: '50%',
                                background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.light})`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white'
                              }}
                            >
                              <CameraIcon />
                            </Box>
                            <Box>
                              <Typography variant="h4" fontWeight={700} color="success.main">
                                <CountUp from={0} to={onlineCameras} duration={1} />
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Active Cameras
                              </Typography>
                            </Box>
                          </Box>
                        </Paper>
                      </GlowEffect>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <GlowEffect color={theme.palette.info.main} trigger="hover">
                        <Paper
                          elevation={0}
                          sx={{
                            p: 3,
                            background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.light, 0.05)} 100%)`,
                            border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                            borderRadius: 3,
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: `0 8px 25px ${alpha(theme.palette.info.main, 0.15)}`
                            }
                          }}
                        >
                          <Box display="flex" alignItems="center" gap={2}>
                            <Box
                              sx={{
                                width: 48,
                                height: 48,
                                borderRadius: '50%',
                                background: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.light})`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white'
                              }}
                            >
                              <AnalyticsIcon />
                            </Box>
                            <Box>
                              <Typography variant="h4" fontWeight={700} color="info.main">
                                <CountUp from={0} to={aiModels.length} duration={1.2} />
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                AI Models
                              </Typography>
                            </Box>
                          </Box>
                        </Paper>
                      </GlowEffect>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <GlowEffect color={theme.palette.warning.main} trigger="hover">
                        <Paper
                          elevation={0}
                          sx={{
                            p: 3,
                            background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.warning.light, 0.05)} 100%)`,
                            border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                            borderRadius: 3,
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: `0 8px 25px ${alpha(theme.palette.warning.main, 0.15)}`
                            }
                          }}
                        >
                          <Box display="flex" alignItems="center" gap={2}>
                            <Box
                              sx={{
                                width: 48,
                                height: 48,
                                borderRadius: '50%',
                                background: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.light})`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white'
                              }}
                            >
                              <NotificationsIcon />
                            </Box>
                            <Box>
                              <Typography variant="h4" fontWeight={700} color="warning.main">
                                <CountUp from={0} to={alerts.length} duration={1.5} />
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Active Alerts
                              </Typography>
                            </Box>
                          </Box>
                        </Paper>
                      </GlowEffect>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <GlowEffect color={theme.palette.primary.main} trigger="hover">
                        <Paper
                          elevation={0}
                          sx={{
                            p: 3,
                            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                            borderRadius: 3,
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.15)}`
                            }
                          }}
                        >
                          <Box display="flex" alignItems="center" gap={2}>
                            <Box
                              sx={{
                                width: 48,
                                height: 48,
                                borderRadius: '50%',
                                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white'
                              }}
                            >
                              <SecurityIcon />
                            </Box>
                            <Box>
                              <Typography variant="h4" fontWeight={700} color="primary.main">
                                <CountUp from={0} to={systemStatus === 'healthy' ? 100 : 85} suffix="%" duration={1.8} />
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                System Health
                              </Typography>
                            </Box>
                          </Box>
                        </Paper>
                      </GlowEffect>
                    </Grid>
                  </Grid>
                </motion.div>

                {/* Main Dashboard Content */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <AdaptiveGridLayout>
                    <LiveMonitoringDashboard />
                    <AdvancedCameraPanels cameras={cameras} />
                  </AdaptiveGridLayout>
                </motion.div>
              </Box>
            )}

            {activeSection === 'cameras' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <Typography variant="h4" mb={3}>Camera Management</Typography>
                <AdvancedCameraPanels cameras={cameras} />
              </motion.div>
            )}

            {activeSection === 'analytics' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Typography variant="h4" mb={3}>Analytics & Reports</Typography>
                <LiveMonitoringDashboard />
              </motion.div>
            )}

            {activeSection === 'settings' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Typography variant="h4" mb={3}>System Settings</Typography>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    Settings panel coming soon...
                  </Typography>
                </Paper>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </MainContent>

      {/* Floating Action Button */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 1, type: 'spring', stiffness: 200 }}
      >
        <FloatingActionButton
          onClick={() => setNotifications([])}
          title="Clear Notifications"
        >
          <NotificationsIcon />
        </FloatingActionButton>
      </motion.div>

      {/* Enhanced Notification Toast */}
      <AnimatePresence>
        {notifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 300, y: 100 }}
            animate={{ opacity: 1, x: 0, y: 100 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            style={{
              position: 'fixed',
              right: 24,
              bottom: 100,
              zIndex: 1001,
              maxWidth: 350
            }}
          >
            <GlowEffect color={theme.palette.primary.main} trigger="always">
              <Paper
                elevation={8}
                sx={{
                  p: 2,
                  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  borderRadius: 2
                }}
              >
                <Box display="flex" alignItems="center" gap={2} mb={1}>
                  <PulsingDot color={theme.palette.primary.main} intensity="strong" />
                  <NotificationsIcon color="primary" />
                  <Typography variant="subtitle2" fontWeight={600}>
                    New Notification
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {notifications[0]?.message}
                </Typography>
              </Paper>
            </GlowEffect>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardContainer>
  );
};

export default OptimizedSecurityDashboard;
