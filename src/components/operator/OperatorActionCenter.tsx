/**
 * OperatorActionCenter - Centralized operator control hub
 * Provides quick access to common tasks, system controls, emergency procedures, and workflow management
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Tooltip,
  Badge,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
  LinearProgress,
  CircularProgress,
  alpha,
  useTheme
} from '@mui/material';
import {
  Dashboard,
  Security,
  Warning,
  Videocam,
  Assignment,
  Psychology,
  Notifications,
  Settings,
  Person,
  Group,
  Phone,
  Email,
  Report,
  History,
  Analytics,
  Refresh,
  PowerSettingsNew,
  RestartAlt,
  ShieldOutlined,
  LocalPolice,
  MedicalServices,
  FireTruck,
  School,
  Business,
  Map,
  Timeline,
  CheckCircle,
  Error,
  Info,
  Build,
  Speed,
  Memory,
  Storage,
  NetworkCheck,
  CloudQueue,
  Computer,
  DeviceHub,
  ExpandMore,
  PlayArrow,
  Pause,
  Stop,
  VolumeUp,
  VolumeOff,
  Brightness4,
  Brightness7,
  Fullscreen,
  FullscreenExit,
  Add,
  Close,
  Save,
  Delete,
  Edit
} from '@mui/icons-material';

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'alerts' | 'cameras' | 'system' | 'emergency' | 'reports';
  priority: 'high' | 'medium' | 'low';
  requiresConfirmation?: boolean;
  permissions?: string[];
  shortcut?: string;
  action: () => Promise<void>;
}

export interface EmergencyContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  email?: string;
  department: 'security' | 'police' | 'fire' | 'medical' | 'management';
  priority: number;
  available_24_7: boolean;
}

export interface SystemStatus {
  component: string;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  message: string;
  last_updated: string;
  metrics?: {
    cpu_usage?: number;
    memory_usage?: number;
    disk_usage?: number;
    network_latency?: number;
    uptime?: number;
  };
}

export interface WorkflowTask {
  id: string;
  title: string;
  description: string;
  type: 'incident' | 'maintenance' | 'report' | 'training';
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  priority: 'high' | 'medium' | 'low';
  assigned_to?: string;
  due_date?: string;
  created_at: string;
  estimated_duration?: number; // minutes
}

interface OperatorActionCenterProps {
  quickActions: QuickAction[];
  emergencyContacts: EmergencyContact[];
  systemStatus: SystemStatus[];
  workflowTasks: WorkflowTask[];
  currentUser: {
    id: string;
    name: string;
    role: string;
    permissions: string[];
    shift_start?: string;
    shift_end?: string;
  };
  onExecuteAction: (actionId: string, params?: any) => Promise<void>;
  onEmergencyContact: (contactId: string, method: 'phone' | 'email') => Promise<void>;
  onUpdateTask: (taskId: string, updates: Partial<WorkflowTask>) => Promise<void>;
  onSystemControl: (component: string, action: string) => Promise<void>;
  notifications?: Array<{
    id: string;
    type: 'info' | 'warning' | 'error' | 'success';
    message: string;
    timestamp: string;
    read: boolean;
  }>;
}

const OperatorActionCenter: React.FC<OperatorActionCenterProps> = ({
  quickActions,
  emergencyContacts,
  systemStatus,
  workflowTasks,
  currentUser,
  onExecuteAction,
  onEmergencyContact,
  onUpdateTask,
  onSystemControl,
  notifications = []
}) => {
  const theme = useTheme();
  
  // State management
  const [selectedTab, setSelectedTab] = useState(0);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action?: QuickAction;
    params?: any;
  }>({ open: false });
  const [emergencyDialog, setEmergencyDialog] = useState(false);
  const [taskDialog, setTaskDialog] = useState<{
    open: boolean;
    task?: WorkflowTask;
    mode: 'view' | 'edit' | 'create';
  }>({ open: false, mode: 'view' });
  const [notification, setNotification] = useState<{
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  } | null>(null);
  const [expandedAccordions, setExpandedAccordions] = useState<string[]>(['quickActions', 'systemStatus']);
  
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

  // Quick Actions grouped by category
  const groupedActions = useMemo(() => {
    return quickActions.reduce((groups, action) => {
      if (!groups[action.category]) {
        groups[action.category] = [];
      }
      if (groups[action.category]) groups[action.category].push(action);
      return groups;
    }, {} as Record<string, QuickAction[]>);
  }, [quickActions]);

  // System health summary
  const systemHealthSummary = useMemo(() => {
    const total = systemStatus.length;
    const healthy = systemStatus.filter(s => s.status === 'healthy').length;
    const warning = systemStatus.filter(s => s.status === 'warning').length;
    const critical = systemStatus.filter(s => s.status === 'critical').length;
    const offline = systemStatus.filter(s => s.status === 'offline').length;
    
    const overallScore = total > 0 ? Math.round((healthy / total) * 100) : 100;
    let overallStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
    
    if (critical > 0 || offline > 0) {
      overallStatus = 'critical';
    } else if (warning > 0) {
      overallStatus = 'warning';
    }
    
    return { total, healthy, warning, critical, offline, overallScore, overallStatus };
  }, [systemStatus]);

  // Task statistics
  const taskStats = useMemo(() => {
    const total = workflowTasks.length;
    const pending = workflowTasks.filter(t => t.status === 'pending').length;
    const inProgress = workflowTasks.filter(t => t.status === 'in_progress').length;
    const completed = workflowTasks.filter(t => t.status === 'completed').length;
    const overdue = workflowTasks.filter(t => t.status === 'overdue').length;
    const myTasks = workflowTasks.filter(t => t.assigned_to === currentUser.id).length;
    
    return { total, pending, inProgress, completed, overdue, myTasks };
  }, [workflowTasks, currentUser.id]);

  // Emergency contacts by department
  const contactsByDepartment = useMemo(() => {
    return emergencyContacts.reduce((groups, contact) => {
      if (!groups[contact.department]) {
        groups[contact.department] = [];
      }
      if (groups[contact.department]) groups[contact.department].push(contact);
      return groups;
    }, {} as Record<string, EmergencyContact[]>);
  }, [emergencyContacts]);

  // Handle quick action execution
  const handleQuickAction = async (action: QuickAction, params?: any) => {
    if (action.requiresConfirmation) {
      setConfirmDialog({ open: true, action, params });
      return;
    }
    
    try {
      await onExecuteAction(action.id, params);
      setNotification({ message: `${action.title} executed successfully`, severity: 'success' });
    } catch (error) {
      setNotification({ message: `Failed to execute ${action.title}`, severity: 'error' });
    }
  };

  // Handle confirmed action
  const handleConfirmedAction = async () => {
    if (!confirmDialog.action) return;
    
    try {
      await onExecuteAction(confirmDialog.action.id, confirmDialog.params);
      setConfirmDialog({ open: false });
      setNotification({ message: `${confirmDialog.action.title} executed successfully`, severity: 'success' });
    } catch (error) {
      setNotification({ message: `Failed to execute ${confirmDialog.action.title}`, severity: 'error' });
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return colors.success;
      case 'warning': return colors.warning;
      case 'critical': return colors.danger;
      case 'offline': return colors.danger;
      default: return colors.textSecondary;
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return colors.danger;
      case 'medium': return colors.warning;
      case 'low': return colors.success;
      default: return colors.textSecondary;
    }
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'alerts': return <Warning />;
      case 'cameras': return <Videocam />;
      case 'system': return <Settings />;
      case 'emergency': return <Warning />;
      case 'reports': return <Report />;
      default: return <Dashboard />;
    }
  };

  // Get department icon
  const getDepartmentIcon = (department: string) => {
    switch (department) {
      case 'security': return <Security />;
      case 'police': return <LocalPolice />;
      case 'fire': return <FireTruck />;
      case 'medical': return <MedicalServices />;
      case 'management': return <Business />;
      default: return <Person />;
    }
  };

  // Handle accordion toggle
  const handleAccordionToggle = (accordionId: string) => {
    setExpandedAccordions(prev => 
      prev.includes(accordionId)
        ? prev.filter(id => id !== accordionId)
        : [...prev, accordionId]
    );
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          backgroundColor: alpha(colors.surface, 0.95),
          borderBottom: `1px solid ${alpha(colors.primary, 0.2)}`
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" sx={{ color: colors.text, fontWeight: 600 }}>
            Operator Action Center
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
              Welcome, {currentUser.name}
            </Typography>
            <Badge badgeContent={notifications.filter(n => !n.read).length} color="error">
              <Notifications sx={{ color: colors.textSecondary }} />
            </Badge>
          </Box>
        </Box>
        
        {/* Quick Stats */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: alpha(colors.success, 0.1) }}>
              <CardContent sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: colors.success, fontWeight: 700 }}>
                  {systemHealthSummary.overallScore}%
                </Typography>
                <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                  System Health
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: alpha(colors.warning, 0.1) }}>
              <CardContent sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: colors.warning, fontWeight: 700 }}>
                  {taskStats.myTasks}
                </Typography>
                <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                  My Tasks
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: alpha(colors.secondary, 0.1) }}>
              <CardContent sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: colors.secondary, fontWeight: 700 }}>
                  {notifications.filter(n => !n.read).length}
                </Typography>
                <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                  Notifications
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: alpha(colors.danger, 0.1) }}>
              <CardContent sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: colors.danger, fontWeight: 700 }}>
                  {taskStats.overdue}
                </Typography>
                <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                  Overdue Tasks
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Content Area */}
      <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
        <Grid container spacing={2}>
          {/* Left Column - Quick Actions & Emergency */}
          <Grid item xs={12} lg={6}>
            {/* Quick Actions */}
            <Accordion 
              expanded={expandedAccordions.includes('quickActions')}
              onChange={() => handleAccordionToggle('quickActions')}
              sx={{ mb: 2, backgroundColor: alpha(colors.surface, 0.95) }}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Dashboard sx={{ color: colors.secondary }} />
                  <Typography variant="h6" sx={{ color: colors.text }}>
                    Quick Actions
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {Object.entries(groupedActions).map(([category, actions]) => (
                  <Box key={category} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      {getCategoryIcon(category)}
                      <Typography variant="subtitle2" sx={{ color: colors.text, textTransform: 'capitalize' }}>
                        {category}
                      </Typography>
                    </Box>
                    <Grid container spacing={1}>
                      {actions.map((action) => (
                        <Grid item xs={12} sm={6} key={action.id}>
                          <Card
                            sx={{
                              cursor: 'pointer',
                              '&:hover': { backgroundColor: alpha(colors.primary, 0.1) },
                              backgroundColor: alpha(colors.primary, 0.05)
                            }}
                            onClick={() => handleQuickAction(action)}
                          >
                            <CardContent sx={{ p: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Box sx={{ color: getPriorityColor(action.priority) }}>
                                  {action.icon}
                                </Box>
                                <Typography variant="body2" sx={{ color: colors.text, fontWeight: 600 }}>
                                  {action.title}
                                </Typography>
                                {action.priority === 'high' && (
                                  <Chip
                                    label="HIGH"
                                    size="small"
                                    sx={{
                                      backgroundColor: alpha(colors.danger, 0.2),
                                      color: colors.danger,
                                      fontSize: '10px',
                                      height: 16
                                    }}
                                  />
                                )}
                              </Box>
                              <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                                {action.description}
                              </Typography>
                              {action.shortcut && (
                                <Typography variant="caption" sx={{ color: colors.secondary, display: 'block', mt: 0.5 }}>
                                  Shortcut: {action.shortcut}
                                </Typography>
                              )}
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                ))}
              </AccordionDetails>
            </Accordion>

            {/* Emergency Contacts */}
            <Accordion 
              expanded={expandedAccordions.includes('emergency')}
              onChange={() => handleAccordionToggle('emergency')}
              sx={{ mb: 2, backgroundColor: alpha(colors.danger, 0.05) }}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Warning sx={{ color: colors.danger }} />
                  <Typography variant="h6" sx={{ color: colors.text }}>
                    Emergency Contacts
                  </Typography>
                  <Button
                    size="small"
                    variant="contained"
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEmergencyDialog(true);
                    }}
                    sx={{ ml: 'auto', mr: 2 }}
                  >
                    Emergency
                  </Button>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {Object.entries(contactsByDepartment).map(([department, contacts]) => (
                  <Box key={department} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      {getDepartmentIcon(department)}
                      <Typography variant="subtitle2" sx={{ color: colors.text, textTransform: 'capitalize' }}>
                        {department}
                      </Typography>
                    </Box>
                    <List dense>
                      {contacts
                        .sort((a, b) => a.priority - b.priority)
                        .slice(0, 3)
                        .map((contact) => (
                          <ListItem key={contact.id} sx={{ px: 0 }}>
                            <ListItemIcon>
                              <Person sx={{ color: colors.textSecondary }} />
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="body2" sx={{ color: colors.text }}>
                                    {contact.name}
                                  </Typography>
                                  {contact.available_24_7 && (
                                    <Chip
                                      label="24/7"
                                      size="small"
                                      sx={{
                                        backgroundColor: alpha(colors.success, 0.2),
                                        color: colors.success,
                                        fontSize: '10px',
                                        height: 16
                                      }}
                                    />
                                  )}
                                </Box>
                              }
                              secondary={
                                <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                  <Button
                                    size="small"
                                    startIcon={<Phone />}
                                    onClick={() => onEmergencyContact(contact.id, 'phone')}
                                    sx={{ color: colors.success, minWidth: 'auto', px: 1 }}
                                  >
                                    Call
                                  </Button>
                                  {contact.email && (
                                    <Button
                                      size="small"
                                      startIcon={<Email />}
                                      onClick={() => onEmergencyContact(contact.id, 'email')}
                                      sx={{ color: colors.secondary, minWidth: 'auto', px: 1 }}
                                    >
                                      Email
                                    </Button>
                                  )}
                                </Box>
                              }
                            />
                          </ListItem>
                        ))}
                    </List>
                  </Box>
                ))}
              </AccordionDetails>
            </Accordion>
          </Grid>

          {/* Right Column - System Status & Tasks */}
          <Grid item xs={12} lg={6}>
            {/* System Status */}
            <Accordion 
              expanded={expandedAccordions.includes('systemStatus')}
              onChange={() => handleAccordionToggle('systemStatus')}
              sx={{ mb: 2, backgroundColor: alpha(colors.surface, 0.95) }}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Computer sx={{ color: getStatusColor(systemHealthSummary.overallStatus) }} />
                  <Typography variant="h6" sx={{ color: colors.text }}>
                    System Status
                  </Typography>
                  <Chip
                    label={systemHealthSummary.overallStatus.toUpperCase()}
                    size="small"
                    sx={{
                      backgroundColor: alpha(getStatusColor(systemHealthSummary.overallStatus), 0.2),
                      color: getStatusColor(systemHealthSummary.overallStatus),
                      ml: 1
                    }}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <List>
                  {systemStatus.map((status, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemIcon>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: getStatusColor(status.status)
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ color: colors.text }}>
                            {status.component}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                              {status.message}
                            </Typography>
                            {status.metrics && (
                              <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                                {status.metrics.cpu_usage !== undefined && (
                                  <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                                    CPU: {status.metrics.cpu_usage}%
                                  </Typography>
                                )}
                                {status.metrics.memory_usage !== undefined && (
                                  <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                                    RAM: {status.metrics.memory_usage}%
                                  </Typography>
                                )}
                              </Box>
                            )}
                          </Box>
                        }
                      />
                      <Box>
                        <IconButton
                          size="small"
                          onClick={() => onSystemControl(status.component, 'restart')}
                          sx={{ color: colors.textSecondary }}
                        >
                          <RestartAlt fontSize="small" />
                        </IconButton>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>

            {/* Active Tasks */}
            <Accordion 
              expanded={expandedAccordions.includes('tasks')}
              onChange={() => handleAccordionToggle('tasks')}
              sx={{ backgroundColor: alpha(colors.surface, 0.95) }}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Assignment sx={{ color: colors.secondary }} />
                  <Typography variant="h6" sx={{ color: colors.text }}>
                    Active Tasks
                  </Typography>
                  <Chip
                    label={`${taskStats.pending + taskStats.inProgress} Active`}
                    size="small"
                    sx={{
                      backgroundColor: alpha(colors.secondary, 0.2),
                      color: colors.secondary,
                      ml: 1
                    }}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <List>
                  {workflowTasks
                    .filter(task => task.status === 'pending' || task.status === 'in_progress')
                    .slice(0, 5)
                    .map((task) => (
                      <ListItem key={task.id} sx={{ px: 0 }}>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" sx={{ color: colors.text }}>
                                {task.title}
                              </Typography>
                              <Chip
                                label={task.priority.toUpperCase()}
                                size="small"
                                sx={{
                                  backgroundColor: alpha(getPriorityColor(task.priority), 0.2),
                                  color: getPriorityColor(task.priority),
                                  fontSize: '10px',
                                  height: 16
                                }}
                              />
                              {task.status === 'overdue' && (
                                <Chip
                                  label="OVERDUE"
                                  size="small"
                                  color="error"
                                  sx={{ fontSize: '10px', height: 16 }}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                              {task.description}
                              {task.due_date && ` • Due: ${new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}`}
                            </Typography>
                          }
                        />
                        <Box>
                          <IconButton
                            size="small"
                            onClick={() => setTaskDialog({ open: true, task, mode: 'edit' })}
                            sx={{ color: colors.textSecondary }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Box>
                      </ListItem>
                    ))}
                </List>
                
                {workflowTasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <CheckCircle sx={{ fontSize: 48, color: colors.success, mb: 1 }} />
                    <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                      All tasks completed!
                    </Typography>
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>
          </Grid>
        </Grid>
      </Box>

      {/* Speed Dial for Quick Actions */}
      <SpeedDial
        ariaLabel="Quick Actions"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
        onClose={() => setSpeedDialOpen(false)}
        onOpen={() => setSpeedDialOpen(true)}
        open={speedDialOpen}
      >
        {quickActions
          .filter(action => action.priority === 'high')
          .slice(0, 4)
          .map((action) => (
            <SpeedDialAction
              key={action.id}
              icon={action.icon}
              tooltipTitle={action.title}
              onClick={() => {
                setSpeedDialOpen(false);
                handleQuickAction(action);
              }}
            />
          ))}
      </SpeedDial>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false })}>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to execute "{confirmDialog.action?.title}"?
          </Typography>
          {confirmDialog.action?.description && (
            <Typography variant="body2" sx={{ color: colors.textSecondary, mt: 1 }}>
              {confirmDialog.action.description}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false })}>
            Cancel
          </Button>
          <Button onClick={handleConfirmedAction} variant="contained" color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Emergency Dialog */}
      <Dialog
        open={emergencyDialog}
        onClose={() => setEmergencyDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: colors.danger, color: colors.text }}>
          Emergency Contacts
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body2">
              For immediate emergencies, call 911 or your local emergency services.
            </Typography>
          </Alert>
          
          {Object.entries(contactsByDepartment).map(([department, contacts]) => (
            <Box key={department} sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 1, textTransform: 'capitalize' }}>
                {department}
              </Typography>
              {contacts.map((contact) => (
                <Card key={contact.id} sx={{ mb: 1 }}>
                  <CardContent sx={{ py: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body1" fontWeight={600}>
                          {contact.name} - {contact.role}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {contact.phone}
                          {contact.email && ` • ${contact.email}`}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<Phone />}
                          onClick={() => onEmergencyContact(contact.id, 'phone')}
                        >
                          Call
                        </Button>
                        {contact.email && (
                          <Button
                            variant="outlined"
                            startIcon={<Email />}
                            onClick={() => onEmergencyContact(contact.id, 'email')}
                          >
                            Email
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmergencyDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={!!notification}
        autoHideDuration={4000}
        onClose={() => setNotification(null)}
      >
        <Alert severity={notification?.severity} onClose={() => setNotification(null)}>
          {notification?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OperatorActionCenter;
