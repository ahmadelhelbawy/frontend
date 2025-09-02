/**
 * AdvancedNavigationSystem - Organization-level navigation with advanced features
 */

import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
  Chip,
  Stack,
  Breadcrumbs,
  Link,
  Paper,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  Collapse,
  useTheme,
  alpha,
  Button,
  ButtonGroup,
  Tooltip,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  AccountCircle as AccountIcon,
  Logout as LogoutIcon,
  Business as OrganizationIcon,
  Dashboard as DashboardIcon,
  Security as SecurityIcon,
  CameraAlt as CameraIcon,
  Analytics as AnalyticsIcon,
  Report as ReportIcon,
  People as PeopleIcon,
  AdminPanelSettings as AdminIcon,
  Help as HelpIcon,
  Brightness4 as ThemeIcon,
  Language as LanguageIcon,
  Search as SearchIcon,
  ExpandLess,
  ExpandMore,
  Home as HomeIcon,
  NavigateNext as NextIcon,
  FiberManualRecord as DotIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as SuccessIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  children?: NavigationItem[];
  badge?: number;
  color?: string;
  permission?: string;
}

interface Organization {
  id: string;
  name: string;
  logo?: string;
  type: 'corporate' | 'retail' | 'government' | 'education';
  status: 'active' | 'maintenance' | 'offline';
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  organization: Organization;
  permissions: string[];
}

const AdvancedNavigationSystem: React.FC = () => {
  const theme = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<HTMLElement | null>(null);
  const [notificationAnchor, setNotificationAnchor] = useState<HTMLElement | null>(null);
  const [orgMenuAnchor, setOrgMenuAnchor] = useState<HTMLElement | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [currentPath, setCurrentPath] = useState('/dashboard');
  const [notifications, setNotifications] = useState(12);
  const [darkMode, setDarkMode] = useState(true);

  // Mock user data
  const currentUser: User = {
    id: 'user1',
    name: 'Sarah Connor',
    email: 'sarah.connor@securetech.com',
    role: 'Security Manager',
    avatar: '/api/placeholder/40/40',
    organization: {
      id: 'org1',
      name: 'SecureTech Solutions',
      type: 'corporate',
      status: 'active'
    },
    permissions: ['admin', 'cameras', 'alerts', 'reports']
  };

  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
      badge: 3
    },
    {
      id: 'monitoring',
      label: 'Live Monitoring',
      icon: <SecurityIcon />,
      path: '/monitoring',
      children: [
        { id: 'live-feeds', label: 'Live Camera Feeds', icon: <CameraIcon />, path: '/monitoring/feeds' },
        { id: 'alerts', label: 'Active Alerts', icon: <WarningIcon />, path: '/monitoring/alerts', badge: 5 },
        { id: 'incidents', label: 'Incident Management', icon: <ReportIcon />, path: '/monitoring/incidents' }
      ]
    },
    {
      id: 'cameras',
      label: 'Camera Management',
      icon: <CameraIcon />,
      path: '/cameras',
      children: [
        { id: 'camera-grid', label: 'Camera Grid', icon: <CameraIcon />, path: '/cameras/grid' },
        { id: 'camera-config', label: 'Configuration', icon: <SettingsIcon />, path: '/cameras/config' },
        { id: 'camera-health', label: 'Health Monitor', icon: <TrendingUpIcon />, path: '/cameras/health' }
      ]
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <AnalyticsIcon />,
      path: '/analytics',
      children: [
        { id: 'reports', label: 'Reports', icon: <ReportIcon />, path: '/analytics/reports' },
        { id: 'trends', label: 'Trend Analysis', icon: <TrendingUpIcon />, path: '/analytics/trends' },
        { id: 'performance', label: 'Performance', icon: <ScheduleIcon />, path: '/analytics/performance' }
      ]
    },
    {
      id: 'administration',
      label: 'Administration',
      icon: <AdminIcon />,
      path: '/admin',
      permission: 'admin',
      children: [
        { id: 'users', label: 'User Management', icon: <PeopleIcon />, path: '/admin/users' },
        { id: 'settings', label: 'System Settings', icon: <SettingsIcon />, path: '/admin/settings' },
        { id: 'audit', label: 'Audit Logs', icon: <ReportIcon />, path: '/admin/audit' }
      ]
    }
  ];

  const handleItemClick = (item: NavigationItem) => {
    if (item.children && item.children.length > 0) {
      const newExpanded = new Set(expandedItems);
      if (newExpanded.has(item.id)) {
        newExpanded.delete(item.id);
      } else {
        newExpanded.add(item.id);
      }
      setExpandedItems(newExpanded);
    } else {
      setCurrentPath(item.path);
      setDrawerOpen(false);
    }
  };

  const breadcrumbs = useMemo(() => {
    const parts = currentPath.split('/').filter(Boolean);
    return [
      { label: 'Home', path: '/' },
      ...parts.map((part, index) => ({
        label: part.charAt(0).toUpperCase() + part.slice(1),
        path: '/' + parts.slice(0, index + 1).join('/')
      }))
    ];
  }, [currentPath]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return theme.palette.success.main;
      case 'maintenance': return theme.palette.warning.main;
      case 'offline': return theme.palette.error.main;
      default: return theme.palette.grey[500];
    }
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(71, 85, 105, 0.3)',
          zIndex: theme.zIndex.drawer + 1
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Left Section */}
          <Stack direction="row" alignItems="center" spacing={2}>
            {/* Menu Toggle */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <IconButton
                edge="start"
                color="inherit"
                onClick={() => setDrawerOpen(!drawerOpen)}
                sx={{ mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
            </motion.div>

            {/* Organization Selector */}
            <motion.div whileHover={{ scale: 1.02 }}>
              <Button
                onClick={(e) => setOrgMenuAnchor(e.currentTarget)}
                sx={{
                  textTransform: 'none',
                  color: 'white',
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1)
                  }
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Avatar 
                    src={currentUser.organization.logo} 
                    sx={{ width: 24, height: 24 }}
                  >
                    <OrganizationIcon fontSize="small" />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {currentUser.organization.name}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <DotIcon 
                        sx={{ 
                          fontSize: 8, 
                          color: getStatusColor(currentUser.organization.status) 
                        }} 
                      />
                      <Typography variant="caption" color="text.secondary">
                        {currentUser.organization.status}
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
              </Button>
            </motion.div>

            {/* Breadcrumbs */}
            <Box sx={{ ml: 2 }}>
              <Breadcrumbs
                separator={<NextIcon fontSize="small" />}
                sx={{ color: 'text.secondary' }}
              >
                {breadcrumbs.map((crumb, index) => (
                  <Link
                    key={crumb.path}
                    color="inherit"
                    href={crumb.path}
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPath(crumb.path);
                    }}
                    sx={{
                      textDecoration: 'none',
                      '&:hover': { color: 'primary.main' },
                      cursor: 'pointer'
                    }}
                  >
                    <motion.span whileHover={{ scale: 1.05 }}>
                      {crumb.label}
                    </motion.span>
                  </Link>
                ))}
              </Breadcrumbs>
            </Box>
          </Stack>

          {/* Center Section - Quick Actions */}
          <Stack direction="row" spacing={1}>
            <ButtonGroup size="small" variant="outlined">
              <Tooltip title="Emergency Stop">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button color="error" sx={{ minWidth: 40 }}>
                    <WarningIcon />
                  </Button>
                </motion.div>
              </Tooltip>
              
              <Tooltip title="System Status">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button color="success" sx={{ minWidth: 40 }}>
                    <SuccessIcon />
                  </Button>
                </motion.div>
              </Tooltip>
              
              <Tooltip title="Performance Monitor">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button color="info" sx={{ minWidth: 40 }}>
                    <TrendingUpIcon />
                  </Button>
                </motion.div>
              </Tooltip>
            </ButtonGroup>
          </Stack>

          {/* Right Section */}
          <Stack direction="row" alignItems="center" spacing={1}>
            {/* Search */}
            <Tooltip title="Search">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <IconButton color="inherit">
                  <SearchIcon />
                </IconButton>
              </motion.div>
            </Tooltip>

            {/* Theme Toggle */}
            <Tooltip title="Toggle Theme">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <IconButton 
                  color="inherit"
                  onClick={() => setDarkMode(!darkMode)}
                >
                  <ThemeIcon />
                </IconButton>
              </motion.div>
            </Tooltip>

            {/* Notifications */}
            <Tooltip title="Notifications">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <IconButton
                  color="inherit"
                  onClick={(e) => setNotificationAnchor(e.currentTarget)}
                >
                  <Badge badgeContent={notifications} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </motion.div>
            </Tooltip>

            {/* User Menu */}
            <motion.div whileHover={{ scale: 1.05 }}>
              <Button
                onClick={(e) => setUserMenuAnchor(e.currentTarget)}
                sx={{
                  textTransform: 'none',
                  color: 'white',
                  borderRadius: 3,
                  px: 2,
                  py: 1,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1)
                  }
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Avatar 
                    src={currentUser.avatar} 
                    sx={{ width: 32, height: 32 }}
                  >
                    {currentUser.name.charAt(0)}
                  </Avatar>
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {currentUser.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {currentUser.role}
                    </Typography>
                  </Box>
                </Stack>
              </Button>
            </motion.div>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Side Navigation Drawer */}
      <Drawer
        variant="temporary"
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 320,
            backgroundColor: 'rgba(15, 23, 42, 0.98)',
            backdropFilter: 'blur(20px)',
            border: 'none',
            borderRight: '1px solid rgba(71, 85, 105, 0.3)'
          }
        }}
        ModalProps={{
          keepMounted: true // Better mobile performance
        }}
      >
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Drawer Header */}
          <Box
            sx={{
              p: 3,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.8)} 0%, ${alpha(theme.palette.primary.dark, 0.9)} 100%)`,
              borderBottom: '1px solid rgba(71, 85, 105, 0.3)'
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'white', color: 'primary.main' }}>
                  <SecurityIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold" color="white">
                    AI Security Hub
                  </Typography>
                  <Typography variant="caption" color="rgba(255,255,255,0.7)">
                    Advanced Monitoring System
                  </Typography>
                </Box>
              </Stack>
              
              <IconButton 
                onClick={() => setDrawerOpen(false)}
                sx={{ color: 'white' }}
              >
                <CloseIcon />
              </IconButton>
            </Stack>
          </Box>

          {/* Organization Status */}
          <Box sx={{ p: 2, borderBottom: '1px solid rgba(71, 85, 105, 0.3)' }}>
            <Paper sx={{ p: 2, backgroundColor: 'rgba(30, 41, 59, 0.5)' }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar 
                  src={currentUser.organization.logo}
                  sx={{ width: 40, height: 40 }}
                >
                  <OrganizationIcon />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {currentUser.organization.name}
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <DotIcon 
                      sx={{ 
                        fontSize: 8, 
                        color: getStatusColor(currentUser.organization.status),
                        animation: currentUser.organization.status === 'active' ? 'pulse 2s infinite' : 'none'
                      }} 
                    />
                    <Typography variant="caption" color="text.secondary">
                      {currentUser.organization.status.toUpperCase()}
                    </Typography>
                    <Chip
                      label={currentUser.organization.type}
                      size="small"
                      variant="outlined"
                      sx={{ height: 18, fontSize: '0.6rem' }}
                    />
                  </Stack>
                </Box>
              </Stack>
            </Paper>
          </Box>

          {/* Navigation Items */}
          <List sx={{ px: 1, py: 2 }}>
            {navigationItems.map((item, index) => {
              const hasChildren = item.children && item.children.length > 0;
              const isExpanded = expandedItems.has(item.id);
              const isActive = currentPath.startsWith(item.path);
              const hasPermission = !item.permission || currentUser.permissions.includes(item.permission);

              if (!hasPermission) return null;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ListItem disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      onClick={() => handleItemClick(item)}
                      sx={{
                        borderRadius: 2,
                        mx: 1,
                        backgroundColor: isActive ? alpha(theme.palette.primary.main, 0.15) : 'transparent',
                        color: isActive ? 'primary.main' : 'text.primary',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          transform: 'translateX(4px)'
                        },
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ duration: 0.2 }}
                        >
                          {item.icon}
                        </motion.div>
                      </ListItemIcon>
                      
                      <ListItemText 
                        primary={item.label}
                        primaryTypographyProps={{
                          fontWeight: isActive ? 'bold' : 'normal'
                        }}
                      />
                      
                      {item.badge && (
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          <Chip
                            label={item.badge}
                            size="small"
                            color="error"
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                        </motion.div>
                      )}
                      
                      {hasChildren && (
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ExpandMore />
                        </motion.div>
                      )}
                    </ListItemButton>
                  </ListItem>

                  {/* Sub-items */}
                  <AnimatePresence>
                    {hasChildren && (
                      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <List component="div" disablePadding>
                            {item.children?.map((child, childIndex) => (
                              <motion.div
                                key={child.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: childIndex * 0.05 }}
                              >
                                <ListItem disablePadding>
                                  <ListItemButton
                                    onClick={() => {
                                      setCurrentPath(child.path);
                                      setDrawerOpen(false);
                                    }}
                                    sx={{
                                      pl: 4,
                                      borderRadius: 2,
                                      mx: 1,
                                      backgroundColor: currentPath === child.path ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                                      '&:hover': {
                                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                                        transform: 'translateX(2px)'
                                      },
                                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }}
                                  >
                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                      <motion.div whileHover={{ scale: 1.1 }}>
                                        {child.icon}
                                      </motion.div>
                                    </ListItemIcon>
                                    
                                    <ListItemText 
                                      primary={child.label}
                                      primaryTypographyProps={{ 
                                        variant: 'body2',
                                        fontWeight: currentPath === child.path ? 'bold' : 'normal'
                                      }}
                                    />
                                    
                                    {child.badge && (
                                      <Chip
                                        label={child.badge}
                                        size="small"
                                        color="warning"
                                        sx={{ height: 18, fontSize: '0.65rem' }}
                                      />
                                    )}
                                  </ListItemButton>
                                </ListItem>
                              </motion.div>
                            ))}
                          </List>
                        </motion.div>
                      </Collapse>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </List>

          {/* Drawer Footer */}
          <Box sx={{ mt: 'auto', p: 2, borderTop: '1px solid rgba(71, 85, 105, 0.3)' }}>
            <Paper sx={{ p: 2, backgroundColor: 'rgba(30, 41, 59, 0.5)' }}>
              <Stack spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={darkMode}
                      onChange={(e) => setDarkMode(e.target.checked)}
                      size="small"
                    />
                  }
                  label="Dark Mode"
                />
                
                <Stack direction="row" justifyContent="space-between">
                  <Button size="small" startIcon={<HelpIcon />}>
                    Help & Support
                  </Button>
                  <Button size="small" startIcon={<LanguageIcon />}>
                    Language
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          </Box>
        </motion.div>
      </Drawer>

      {/* Organization Menu */}
      <Menu
        anchorEl={orgMenuAnchor}
        open={Boolean(orgMenuAnchor)}
        onClose={() => setOrgMenuAnchor(null)}
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(71, 85, 105, 0.3)',
            minWidth: 280
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Organization Dashboard
          </Typography>
          
          <Stack spacing={1}>
            <MenuItem>
              <ListItemIcon><DashboardIcon /></ListItemIcon>
              <ListItemText primary="Main Dashboard" />
            </MenuItem>
            <MenuItem>
              <ListItemIcon><AnalyticsIcon /></ListItemIcon>
              <ListItemText primary="Analytics Overview" />
            </MenuItem>
            <MenuItem>
              <ListItemIcon><PeopleIcon /></ListItemIcon>
              <ListItemText primary="Team Management" />
            </MenuItem>
            <MenuItem>
              <ListItemIcon><SettingsIcon /></ListItemIcon>
              <ListItemText primary="Organization Settings" />
            </MenuItem>
          </Stack>
        </Box>
      </Menu>

      {/* User Menu */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={() => setUserMenuAnchor(null)}
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(71, 85, 105, 0.3)',
            minWidth: 250
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <Avatar src={currentUser.avatar} sx={{ width: 40, height: 40 }}>
              {currentUser.name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" fontWeight="bold">
                {currentUser.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {currentUser.email}
              </Typography>
            </Box>
          </Stack>
          
          <Divider sx={{ my: 1 }} />
          
          <MenuItem onClick={() => setUserMenuAnchor(null)}>
            <ListItemIcon><AccountIcon /></ListItemIcon>
            <ListItemText primary="Profile" />
          </MenuItem>
          <MenuItem onClick={() => setUserMenuAnchor(null)}>
            <ListItemIcon><SettingsIcon /></ListItemIcon>
            <ListItemText primary="Settings" />
          </MenuItem>
          <MenuItem onClick={() => setUserMenuAnchor(null)}>
            <ListItemIcon><HelpIcon /></ListItemIcon>
            <ListItemText primary="Help & Support" />
          </MenuItem>
          
          <Divider sx={{ my: 1 }} />
          
          <MenuItem onClick={() => setUserMenuAnchor(null)}>
            <ListItemIcon><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Logout" />
          </MenuItem>
        </Box>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={() => setNotificationAnchor(null)}
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(71, 85, 105, 0.3)',
            minWidth: 350,
            maxHeight: 400
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              Notifications
            </Typography>
            <Button size="small" onClick={() => setNotifications(0)}>
              Mark All Read
            </Button>
          </Stack>
          
          <Stack spacing={1}>
            {[
              { id: 1, message: 'Critical alert detected in Camera 3', time: '2 min ago', severity: 'error' },
              { id: 2, message: 'System backup completed successfully', time: '15 min ago', severity: 'success' },
              { id: 3, message: 'Camera 7 requires maintenance', time: '1 hour ago', severity: 'warning' },
              { id: 4, message: 'New AI model update available', time: '2 hours ago', severity: 'info' }
            ].map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ x: 5 }}
              >
                <MenuItem sx={{ borderRadius: 2 }}>
                  <ListItemIcon>
                    <DotIcon sx={{ color: getSeverityColor(notification.severity) }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={notification.message}
                    secondary={notification.time}
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </MenuItem>
              </motion.div>
            ))}
          </Stack>
          
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button size="small" fullWidth>
              View All Notifications
            </Button>
          </Box>
        </Box>
      </Menu>
    </>
  );
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'error': return '#ef4444';
    case 'warning': return '#f59e0b';
    case 'success': return '#10b981';
    case 'info': return '#3b82f6';
    default: return '#6b7280';
  }
};

export default AdvancedNavigationSystem;
