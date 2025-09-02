/**
 * SecurityTopNavigation - Modern agency-style top navigation for security dashboard
 * Features professional styling, dropdown menus, and responsive design
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Badge,
  Chip,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
  alpha,
  styled,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Security as SecurityIcon,
  CameraAlt as CameraIcon,
  Analytics as AnalyticsIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Refresh as RefreshIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  SignalCellular4Bar as SignalIcon,
  SignalCellular0Bar as NoSignalIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

// Styled components with enhanced animations
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.95)} 0%, ${alpha(theme.palette.primary.dark, 0.98)} 100%)`,
  backdropFilter: 'blur(20px)',
  border: 'none',
  boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.15)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    boxShadow: `0 6px 25px ${alpha(theme.palette.common.black, 0.25)}`
  }
}));

const StatusIndicator = styled(Box)(({ theme, status }: { theme: any; status: string }) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  background: status === 'healthy' ? theme.palette.success.main :
              status === 'warning' ? theme.palette.warning.main :
              status === 'critical' ? theme.palette.error.main :
              theme.palette.grey[500],
  boxShadow: `0 0 8px ${status === 'healthy' ? alpha(theme.palette.success.main, 0.6) :
                status === 'warning' ? alpha(theme.palette.warning.main, 0.6) :
                status === 'critical' ? alpha(theme.palette.error.main, 0.6) :
                alpha(theme.palette.grey[500], 0.6)}`,
  animation: status === 'healthy' ? 'pulse 2s infinite' : 'none',
  '@keyframes pulse': {
    '0%': { opacity: 1 },
    '50%': { opacity: 0.5 },
    '100%': { opacity: 1 }
  }
}));

const ConnectionStatus = styled(Box)(({ theme, connected }: { theme: any; connected: boolean }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  padding: theme.spacing(0.5, 1),
  borderRadius: theme.shape.borderRadius,
  background: connected ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.error.main, 0.1),
  border: `1px solid ${connected ? alpha(theme.palette.success.main, 0.3) : alpha(theme.palette.error.main, 0.3)}`,
  color: connected ? theme.palette.success.main : theme.palette.error.main,
  fontSize: '0.75rem',
  fontWeight: 500,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    background: connected ? alpha(theme.palette.success.main, 0.15) : alpha(theme.palette.error.main, 0.15),
    transform: 'scale(1.05)'
  }
}));

const MetricChip = styled(Chip)(({ theme }) => ({
  background: alpha(theme.palette.background.paper, 0.1),
  border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
  color: theme.palette.common.white,
  fontWeight: 500,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    background: alpha(theme.palette.background.paper, 0.2),
    transform: 'translateY(-2px)',
    boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.2)}`
  }
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.common.white,
  background: alpha(theme.palette.common.white, 0.1),
  border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    background: alpha(theme.palette.common.white, 0.2),
    transform: 'scale(1.1) rotate(5deg)',
    boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.3)}`
  }
}));

interface SecurityTopNavigationProps {
  onMenuToggle: () => void;
  systemStatus: string;
  onlineCameras: number;
  totalCameras: number;
  notifications: Array<{
    id: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    timestamp: Date;
  }>;
}

const SecurityTopNavigation: React.FC<SecurityTopNavigationProps> = ({
  onMenuToggle,
  systemStatus,
  onlineCameras,
  totalCameras,
  notifications
}) => {
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [fullscreenMode, setFullscreenMode] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Simulate connection status changes
  useEffect(() => {
    const interval = setInterval(() => {
      setConnectionStatus(Math.random() > 0.1); // 90% uptime
      setLastUpdate(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleProfileMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleProfileMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

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

  const handleLogout = useCallback(() => {
    // Handle logout logic
    console.log('Logging out...');
    handleProfileMenuClose();
  }, [handleProfileMenuClose]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return theme.palette.success.main;
      case 'warning': return theme.palette.warning.main;
      case 'critical': return theme.palette.error.main;
      default: return theme.palette.grey[500];
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy': return 'Operational';
      case 'warning': return 'Attention';
      case 'critical': return 'Critical';
      default: return 'Unknown';
    }
  };

  return (
    <StyledAppBar position="fixed" elevation={0}>
      <Toolbar sx={{ minHeight: '72px', px: { xs: 2, sm: 3 } }}>
        {/* Left Section */}
        <Box display="flex" alignItems="center" gap={2}>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={onMenuToggle}
              sx={{
                background: alpha(theme.palette.common.white, 0.1),
                border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
                '&:hover': {
                  background: alpha(theme.palette.common.white, 0.2)
                }
              }}
            >
              <MenuIcon />
            </IconButton>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <SecurityIcon sx={{ fontSize: 28, color: theme.palette.secondary.main }} />
              <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '0.5px' }}>
                AI Security Hub
              </Typography>
            </Box>
          </motion.div>
        </Box>

        {/* Center Section - System Status */}
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <StatusIndicator status={systemStatus} theme={theme} />
              <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>
                System {getStatusText(systemStatus)}
              </Typography>
              
              <ConnectionStatus connected={connectionStatus} theme={theme}>
                {connectionStatus ? <WifiIcon fontSize="small" /> : <WifiOffIcon fontSize="small" />}
                {connectionStatus ? 'Connected' : 'Disconnected'}
              </ConnectionStatus>

              <Typography variant="caption" sx={{ color: alpha(theme.palette.common.white, 0.7) }}>
                Last: {lastUpdate.toLocaleTimeString()}
              </Typography>
            </Box>
          </motion.div>
        </Box>

        {/* Right Section - Metrics and Actions */}
        <Box display="flex" alignItems="center" gap={2}>
          {/* Camera Status */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Tooltip title="Camera Status">
              <MetricChip
                icon={<CameraIcon sx={{ fontSize: 16 }} />}
                label={`${onlineCameras}/${totalCameras}`}
                size="small"
                variant="outlined"
              />
            </Tooltip>
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Tooltip title="Notifications">
              <IconButton
                color="inherit"
                sx={{
                  background: alpha(theme.palette.common.white, 0.1),
                  border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`
                }}
              >
                <Badge badgeContent={notifications.length} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Box display="flex" gap={1}>
              <Tooltip title="Refresh">
                <ActionButton onClick={handleRefresh}>
                  <RefreshIcon />
                </ActionButton>
              </Tooltip>

              <Tooltip title={fullscreenMode ? 'Exit Fullscreen' : 'Enter Fullscreen'}>
                <ActionButton onClick={handleFullscreenToggle}>
                  {fullscreenMode ? <FullscreenExitIcon /> : <FullscreenIcon />}
                </ActionButton>
              </Tooltip>
            </Box>
          </motion.div>

          {/* User Profile */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Tooltip title="User Menu">
              <IconButton
                onClick={handleProfileMenuOpen}
                sx={{
                  background: alpha(theme.palette.secondary.main, 0.2),
                  border: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
                  '&:hover': {
                    background: alpha(theme.palette.secondary.main, 0.3),
                    transform: 'scale(1.05)'
                  }
                }}
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.secondary.main }}>
                  <AccountCircleIcon />
                </Avatar>
              </IconButton>
            </Tooltip>
          </motion.div>
        </Box>
      </Toolbar>

      {/* User Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.98)} 100%)`,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            borderRadius: 2,
            boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.2)}`,
            mt: 1
          }
        }}
      >
        <MenuItem onClick={handleProfileMenuClose}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}>
              <AccountCircleIcon />
            </Avatar>
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>
                Security Operator
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Senior Analyst
              </Typography>
            </Box>
          </Box>
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={handleProfileMenuClose}>
          <SettingsIcon sx={{ mr: 2, fontSize: 20 }} />
          <Typography variant="body2">Settings</Typography>
        </MenuItem>
        
        <MenuItem onClick={handleLogout}>
          <LogoutIcon sx={{ mr: 2, fontSize: 20 }} />
          <Typography variant="body2">Logout</Typography>
        </MenuItem>
      </Menu>
    </StyledAppBar>
  );
};

export default SecurityTopNavigation;
