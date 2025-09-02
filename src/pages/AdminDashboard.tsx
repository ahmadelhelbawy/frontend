/**
 * Administrator Dashboard
 * Comprehensive admin interface with system monitoring, user management, and configuration
 */

import React, { useState, useEffect } from 'react';
import {
  useSystemStats,
  useServiceStatus,
  usePerformanceMetrics,
  useUsers,
  useCameras,
  useAIPerformance,
  useAlertDistribution,
  useDatabasePerformance,
  useWebSocketPerformance
} from '../hooks/useAdminAPI';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardHeader,
  Button,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Badge,
  Tooltip,
  Avatar,
  Stack
} from '@mui/material';
import {
  Dashboard,
  People,
  Settings,
  Security,
  Monitor,
  Storage,
  NetworkCheck,
  BugReport,
  Timeline,
  Assessment,
  AdminPanelSettings,
  SystemUpdate,
  NotificationsActive,
  CameraAlt,
  SmartToy,
  DataUsage,
  Memory,
  Speed,
  CloudSync,
  Refresh,
  Edit,
  Delete,
  Add,
  Visibility,
  VisibilityOff,
  CheckCircle,
  Error,
  Warning,
  Info
} from '@mui/icons-material';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AdminDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  
  // API hooks for real-time data
  const { stats: systemStats, loading: statsLoading } = useSystemStats();
  const { services, loading: servicesLoading } = useServiceStatus();
  const { metrics: performanceData, loading: metricsLoading } = usePerformanceMetrics(6);
  const { users, loading: usersLoading, createUser } = useUsers();
  const { cameras, loading: camerasLoading } = useCameras();
  const { performance: aiPerformance, loading: aiLoading } = useAIPerformance();
  const { distribution: alertStats, loading: alertsLoading } = useAlertDistribution();
  const { performance: dbPerformance, loading: dbLoading } = useDatabasePerformance();
  const { performance: wsPerformance, loading: wsLoading } = useWebSocketPerformance();

  // Local state for dialogs
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({
    username: '',
    name: '',
    email: '',
    role: 'security_operator',
    permissions: []
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
      case 'online':
      case 'active':
      case 'healthy':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
      case 'critical':
      case 'offline':
        return 'error';
      default:
        return 'default';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'administrator':
        return 'error';
      case 'security_supervisor':
        return 'warning';
      case 'security_operator':
        return 'primary';
      case 'store_manager':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  return (
    <Box sx={{ height: '100vh', backgroundColor: '#0f172a' }}>
      {/* Header */}
      <AppBar position="static" sx={{ backgroundColor: '#1e293b', borderBottom: '1px solid #334155' }}>
        <Toolbar>
          <AdminPanelSettings sx={{ mr: 2, color: '#3b82f6' }} />
          <Typography variant="h5" sx={{ flexGrow: 1, fontWeight: 700 }}>
            System Administrator Dashboard
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            sx={{ mr: 2 }}
            onClick={() => window.location.reload()}
          >
            Refresh
          </Button>
          <Badge badgeContent={4} color="error">
            <NotificationsActive />
          </Badge>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3 }}>
        {/* Quick Stats */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box sx={{ p: 1, backgroundColor: '#1e3a8a', borderRadius: 2 }}>
                    <Monitor sx={{ color: 'white' }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {systemStats?.active_services || 0}/{systemStats?.total_services || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Services
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box sx={{ p: 1, backgroundColor: '#059669', borderRadius: 2 }}>
                    <People sx={{ color: 'white' }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {systemStats?.active_users || 0}/{systemStats?.total_users || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Users
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box sx={{ p: 1, backgroundColor: '#7c3aed', borderRadius: 2 }}>
                    <NetworkCheck sx={{ color: 'white' }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {systemStats?.active_connections || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      WebSocket Connections
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box sx={{ p: 1, backgroundColor: '#dc2626', borderRadius: 2 }}>
                    <BugReport sx={{ color: 'white' }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {formatUptime(systemStats?.uptime || 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      System Uptime
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Main Content Tabs */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab icon={<Dashboard />} label="System Overview" />
              <Tab icon={<People />} label="User Management" />
              <Tab icon={<CameraAlt />} label="Camera Management" />
              <Tab icon={<SmartToy />} label="AI Models" />
              <Tab icon={<Settings />} label="Configuration" />
              <Tab icon={<Assessment />} label="Performance" />
            </Tabs>
          </Box>

          {/* System Overview Tab */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              {/* System Health */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader
                    title="System Health"
                    titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                    action={
                      <Chip
                        label="HEALTHY"
                        color="success"
                        size="small"
                        icon={<CheckCircle />}
                      />
                    }
                  />
                  <CardContent>
                    <Stack spacing={2}>
                      <Box>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2">CPU Usage</Typography>
                          <Typography variant="body2" fontWeight="bold">{systemStats?.cpu_usage || 0}%</Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={systemStats?.cpu_usage || 0} 
                          color={(systemStats?.cpu_usage || 0) > 80 ? 'error' : (systemStats?.cpu_usage || 0) > 60 ? 'warning' : 'success'}
                        />
                      </Box>

                      <Box>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2">Memory Usage</Typography>
                          <Typography variant="body2" fontWeight="bold">{systemStats?.memory_usage || 0}%</Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={systemStats?.memory_usage || 0} 
                          color={(systemStats?.memory_usage || 0) > 85 ? 'error' : (systemStats?.memory_usage || 0) > 70 ? 'warning' : 'success'}
                        />
                      </Box>

                      <Box>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2">Disk Usage</Typography>
                          <Typography variant="body2" fontWeight="bold">{systemStats?.disk_usage || 0}%</Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={systemStats?.disk_usage || 0} 
                          color={(systemStats?.disk_usage || 0) > 90 ? 'error' : (systemStats?.disk_usage || 0) > 80 ? 'warning' : 'success'}
                        />
                      </Box>

                      <Box>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2">Network Latency</Typography>
                          <Typography variant="body2" fontWeight="bold">{systemStats?.network_latency || 0}ms</Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={(systemStats?.network_latency || 0) / 100 * 100} 
                          color={(systemStats?.network_latency || 0) > 50 ? 'error' : (systemStats?.network_latency || 0) > 25 ? 'warning' : 'success'}
                        />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* Performance Chart */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader 
                    title="Performance Trends"
                    titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                  />
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="time" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <RechartsTooltip 
                          contentStyle={{ 
                            backgroundColor: '#1f2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px' 
                          }} 
                        />
                        <Line type="monotone" dataKey="cpu" stroke="#3b82f6" strokeWidth={2} />
                        <Line type="monotone" dataKey="memory" stroke="#10b981" strokeWidth={2} />
                        <Line type="monotone" dataKey="network" stroke="#f59e0b" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>

              {/* Services Status */}
              <Grid item xs={12}>
                <Card>
                  <CardHeader 
                    title="Service Status"
                    titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                    action={
                      <Button variant="outlined" startIcon={<SystemUpdate />}>
                        Update All
                      </Button>
                    }
                  />
                  <CardContent>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Service Name</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Version</TableCell>
                            <TableCell>Uptime</TableCell>
                            <TableCell>CPU Usage</TableCell>
                            <TableCell>Memory Usage</TableCell>
                            <TableCell>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {services.map((service) => (
                            <TableRow key={service.name}>
                              <TableCell>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <Box sx={{ 
                                    width: 8, 
                                    height: 8, 
                                    borderRadius: '50%', 
                                    backgroundColor: service.status === 'running' ? '#10b981' : '#ef4444' 
                                  }} />
                                  <Typography fontWeight="medium">{service.name}</Typography>
                                </Stack>
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={service.status.toUpperCase()} 
                                  color={getStatusColor(service.status) as any}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>{service.version}</TableCell>
                              <TableCell>{formatUptime(service.uptime || 0)}</TableCell>
                              <TableCell>{service.cpu_usage || 0}%</TableCell>
                              <TableCell>{service.memory_usage || 0}%</TableCell>
                              <TableCell>
                                <Stack direction="row" spacing={1}>
                                  <IconButton size="small" color="primary">
                                    <Refresh />
                                  </IconButton>
                                  <IconButton size="small" color="secondary">
                                    <Settings />
                                  </IconButton>
                                </Stack>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* User Management Tab */}
          <TabPanel value={tabValue} index={1}>
            <Stack spacing={3}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h5" fontWeight="bold">User Management</Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setUserDialogOpen(true)}
                >
                  Add User
                </Button>
              </Box>

              <Card>
                <CardContent>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>User</TableCell>
                          <TableCell>Role</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Last Login</TableCell>
                          <TableCell>Permissions</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <Stack direction="row" alignItems="center" spacing={2}>
                                <Avatar sx={{ width: 32, height: 32, backgroundColor: '#3b82f6' }}>
                                  {user.name.split(' ').map(n => n[0]).join('')}
                                </Avatar>
                                <Box>
                                  <Typography fontWeight="medium">{user.name}</Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {user.username}
                                  </Typography>
                                </Box>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={user.role.replace('_', ' ').toUpperCase()} 
                                color={getRoleColor(user.role) as any}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={user.status.toUpperCase()} 
                                color={getStatusColor(user.status) as any}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              {new Date(user.last_login).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={0.5}>
                                {user.permissions.slice(0, 2).map((permission) => (
                                  <Chip 
                                    key={permission}
                                    label={permission}
                                    size="small"
                                    variant="outlined"
                                  />
                                ))}
                                {user.permissions.length > 2 && (
                                  <Chip 
                                    label={`+${user.permissions.length - 2}`}
                                    size="small"
                                    variant="outlined"
                                  />
                                )}
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={1}>
                                <IconButton size="small" color="primary">
                                  <Edit />
                                </IconButton>
                                <IconButton size="small" color="warning">
                                  <Visibility />
                                </IconButton>
                                <IconButton size="small" color="error">
                                  <Delete />
                                </IconButton>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Stack>
          </TabPanel>

          {/* Camera Management Tab */}
          <TabPanel value={tabValue} index={2}>
            <Stack spacing={3}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h5" fontWeight="bold">Camera Management</Typography>
                <Button variant="contained" startIcon={<Add />}>
                  Add Camera
                </Button>
              </Box>

              <Grid container spacing={3}>
                {cameras.map((camera) => (
                  <Grid item xs={12} md={6} lg={4} key={camera.id}>
                    <Card>
                      <CardHeader
                        title={camera.name}
                        subheader={camera.location}
                        action={
                          <Chip 
                            label={camera.status.toUpperCase()} 
                            color={getStatusColor(camera.status) as any}
                            size="small"
                          />
                        }
                      />
                      <CardContent>
                        <Stack spacing={2}>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="body2">Resolution:</Typography>
                            <Typography variant="body2" fontWeight="bold">{camera.resolution}</Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="body2">FPS:</Typography>
                            <Typography variant="body2" fontWeight="bold">{camera.fps}</Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="body2">Detection:</Typography>
                            <Chip 
                              label={camera.detection_enabled ? 'ENABLED' : 'DISABLED'}
                              color={camera.detection_enabled ? 'success' : 'error'}
                              size="small"
                            />
                          </Box>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="body2">Recording:</Typography>
                            <Chip 
                              label={camera.recording ? 'ACTIVE' : 'INACTIVE'}
                              color={camera.recording ? 'success' : 'warning'}
                              size="small"
                            />
                          </Box>
                          <Divider />
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <Button size="small" variant="outlined" startIcon={<Edit />}>
                              Configure
                            </Button>
                            <Button size="small" variant="outlined" startIcon={<Visibility />}>
                              View Feed
                            </Button>
                          </Stack>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Stack>
          </TabPanel>

          {/* AI Models Tab */}
          <TabPanel value={tabValue} index={3}>
            <Stack spacing={3}>
              <Typography variant="h5" fontWeight="bold">AI Model Management</Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardHeader
                      title="YOLO v11 v2.1"
                      subheader="Object Detection"
                      action={<Chip label="HEALTHY" color="success" size="small" />}
                    />
                    <CardContent>
                      <Stack spacing={2}>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2">Accuracy:</Typography>
                          <Typography variant="body2" fontWeight="bold">94.2%</Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2">Latency:</Typography>
                          <Typography variant="body2" fontWeight="bold">8ms</Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2">Throughput:</Typography>
                          <Typography variant="body2" fontWeight="bold">65 FPS</Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2">GPU Usage:</Typography>
                          <Typography variant="body2" fontWeight="bold">85%</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={85} color="primary" />
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card>
                    <CardHeader
                      title="Face Recognition v1"
                      subheader="Facial Recognition"
                      action={<Chip label="WARNING" color="warning" size="small" />}
                    />
                    <CardContent>
                      <Stack spacing={2}>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2">Accuracy:</Typography>
                          <Typography variant="body2" fontWeight="bold">89.5%</Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2">Latency:</Typography>
                          <Typography variant="body2" fontWeight="bold">18ms</Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2">Throughput:</Typography>
                          <Typography variant="body2" fontWeight="bold">40 FPS</Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2">GPU Usage:</Typography>
                          <Typography variant="body2" fontWeight="bold">88%</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={88} color="warning" />
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card>
                    <CardHeader
                      title="Behavior Analysis"
                      subheader="Pattern Recognition"
                      action={<Chip label="HEALTHY" color="success" size="small" />}
                    />
                    <CardContent>
                      <Stack spacing={2}>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2">Accuracy:</Typography>
                          <Typography variant="body2" fontWeight="bold">92.8%</Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2">Latency:</Typography>
                          <Typography variant="body2" fontWeight="bold">22ms</Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2">Patterns/min:</Typography>
                          <Typography variant="body2" fontWeight="bold">156</Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2">CPU Usage:</Typography>
                          <Typography variant="body2" fontWeight="bold">42%</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={42} color="success" />
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Stack>
          </TabPanel>

          {/* Configuration Tab */}
          <TabPanel value={tabValue} index={4}>
            <Stack spacing={3}>
              <Typography variant="h5" fontWeight="bold">System Configuration</Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardHeader title="Detection Settings" />
                    <CardContent>
                      <Stack spacing={3}>
                        <FormControl fullWidth>
                          <InputLabel>Default Confidence Threshold</InputLabel>
                          <Select value={0.7} label="Default Confidence Threshold">
                            <MenuItem value={0.5}>Low (0.5)</MenuItem>
                            <MenuItem value={0.6}>Medium-Low (0.6)</MenuItem>
                            <MenuItem value={0.7}>Medium (0.7)</MenuItem>
                            <MenuItem value={0.8}>High (0.8)</MenuItem>
                            <MenuItem value={0.9}>Very High (0.9)</MenuItem>
                          </Select>
                        </FormControl>

                        <FormControlLabel
                          control={<Switch defaultChecked />}
                          label="Enable Automatic AI Model Updates"
                        />

                        <FormControlLabel
                          control={<Switch defaultChecked />}
                          label="Enable Performance Monitoring"
                        />

                        <FormControlLabel
                          control={<Switch />}
                          label="Enable Debug Logging"
                        />
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card>
                    <CardHeader title="System Limits" />
                    <CardContent>
                      <Stack spacing={3}>
                        <TextField
                          label="Max Concurrent Cameras"
                          type="number"
                          defaultValue={50}
                          fullWidth
                        />

                        <TextField
                          label="Max WebSocket Connections"
                          type="number"
                          defaultValue={1000}
                          fullWidth
                        />

                        <TextField
                          label="Alert Retention Days"
                          type="number"
                          defaultValue={30}
                          fullWidth
                        />

                        <TextField
                          label="Video Storage Days"
                          type="number"
                          defaultValue={7}
                          fullWidth
                        />
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Stack>
          </TabPanel>

          {/* Performance Tab */}
          <TabPanel value={tabValue} index={5}>
            <Stack spacing={3}>
              <Typography variant="h5" fontWeight="bold">Performance Analytics</Typography>
              
              <Grid container spacing={3}>
                {/* Database Performance */}
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardHeader title="Database Performance" />
                    <CardContent>
                      <Stack spacing={2}>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2">Query Cache Hit Rate:</Typography>
                          <Typography variant="body2" fontWeight="bold" color="success.main">85.3%</Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2">Average Query Time:</Typography>
                          <Typography variant="body2" fontWeight="bold">2.3ms</Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2">Active Indexes:</Typography>
                          <Typography variant="body2" fontWeight="bold">25</Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2">Total Records:</Typography>
                          <Typography variant="body2" fontWeight="bold">15,420</Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                {/* AI Model Performance */}
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardHeader title="AI Model Performance" />
                    <CardContent>
                      <Stack spacing={2}>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2">Average Inference Time:</Typography>
                          <Typography variant="body2" fontWeight="bold" color="success.main">8.2ms</Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2">Model Cache Hit Rate:</Typography>
                          <Typography variant="body2" fontWeight="bold">78.9%</Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2">Batch Processing Rate:</Typography>
                          <Typography variant="body2" fontWeight="bold">4.2 frames/batch</Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2">Success Rate:</Typography>
                          <Typography variant="body2" fontWeight="bold" color="success.main">99.9%</Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Alert Distribution */}
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardHeader title="Alert Distribution (Last 24h)" />
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            dataKey="value"
                            data={alertStats?.distribution || []}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                          >
                            {(alertStats?.distribution || []).map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip 
                            contentStyle={{ 
                              backgroundColor: '#1f2937', 
                              border: '1px solid #374151',
                              borderRadius: '8px' 
                            }} 
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Network Performance */}
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardHeader title="Network & WebSocket Performance" />
                    <CardContent>
                      <Stack spacing={2}>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2">Active Connections:</Typography>
                          <Typography variant="body2" fontWeight="bold">{systemStats?.active_connections || 0}</Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2">Average Latency:</Typography>
                          <Typography variant="body2" fontWeight="bold">{systemStats?.network_latency || 0}ms</Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2">Messages/sec:</Typography>
                          <Typography variant="body2" fontWeight="bold">245</Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2">Connection Quality:</Typography>
                          <Typography variant="body2" fontWeight="bold" color="success.main">98.7%</Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Stack>
          </TabPanel>
        </Card>
      </Box>

      {/* User Dialog */}
      <Dialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Username"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              fullWidth
            />
            <TextField
              label="Full Name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={newUser.role}
                label="Role"
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              >
                <MenuItem value="security_operator">Security Operator</MenuItem>
                <MenuItem value="security_supervisor">Security Supervisor</MenuItem>
                <MenuItem value="store_manager">Store Manager</MenuItem>
                <MenuItem value="administrator">Administrator</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDialogOpen(false)}>Cancel</Button>
          <Button variant="contained">Create User</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
