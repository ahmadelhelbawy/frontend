/**
 * AlertManagementCenter - Enterprise-grade alert management system for operators
 * Provides comprehensive alert handling with bulk operations, filtering, escalation, and workflows
 * Integrates with OperatorContext for real-time updates and backend synchronization
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Chip,
  IconButton,
  Checkbox,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  ListItemAvatar,
  Avatar,
  Badge,
  Tooltip,
  Divider,
  Alert as MuiAlert,
  Snackbar,
  LinearProgress,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  Grid,
  alpha,
  useTheme,
  styled
} from '@mui/material';
import {
  Search,
  FilterList,
  Check,
  Close,
  MoreVert,
  Warning,
  Security,
  Person,
  Videocam,
  Schedule,
  Flag,
  Assignment,
  TrendingUp,
  PlayArrow,
  Pause,
  Stop,
  Refresh,
  Download,
  Settings,
  Notifications,
  NotificationsActive,
  TrendingDown,
  AccessTime,
  SignalCellularAlt
} from '@mui/icons-material';
import { useOperatorContext } from '../../contexts/OperatorContext';
import { Alert } from '../../types/operator';

interface AlertFilter {
  search: string;
  severity: string[];
  alertType: string[];
  status: string[];
  timeRange: '1h' | '6h' | '24h' | '7d' | '30d' | 'all';
  cameraIds: string[];
  assignee: string[];
  priority: { min: number; max: number };
  showResolved: boolean;
}

// Styled components for enterprise appearance
const StatsCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(145deg, #1e293b 0%, #334155 100%)',
  border: '1px solid rgba(59, 130, 246, 0.2)',
  borderRadius: '12px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 32px rgba(59, 130, 246, 0.15)'
  }
}));

const AlertListItem = styled(ListItem)(({ theme }) => ({
  borderRadius: '8px',
  margin: '4px 0',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    transform: 'translateX(4px)'
  }
}));

interface AlertManagementCenterProps {
  className?: string;
}

const AlertManagementCenter: React.FC<AlertManagementCenterProps> = ({ className }) => {
  const theme = useTheme();
  const { 
    actions, 
    alerts, 
    currentUser, 
    operators, 
    cameras,
    alertsLoading = false,
    alertsError = null,
    isConnected = true,
    lastUpdated = new Date().toISOString()
  } = useOperatorContext();
  
  // State management
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedAlerts, setSelectedAlerts] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<AlertFilter>({
    search: '',
    severity: [],
    alertType: [],
    status: [],
    timeRange: '24h',
    cameraIds: [],
    assignee: [],
    priority: { min: 1, max: 10 },
    showResolved: false
  });
  
  const [bulkActionMenu, setBulkActionMenu] = useState<null | HTMLElement>(null);
  const [escalationDialog, setEscalationDialog] = useState<{ open: boolean; alertId?: string }>({ open: false });
  const [assignmentDialog, setAssignmentDialog] = useState<{ open: boolean; alertIds: string[] }>({ open: false, alertIds: [] });
  const [filterDialog, setFilterDialog] = useState(false);
  const [notification, setNotification] = useState<{ message: string; severity: 'success' | 'error' | 'info' } | null>(null);
  
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

  // Filter alerts based on selected tab
  const getTabFilteredAlerts = (tabIndex: number) => {
    switch (tabIndex) {
      case 0: return alerts; // All alerts
      case 1: return alerts.filter(a => !a.resolved && a.status !== 'false_positive'); // Active
      case 2: return alerts.filter(a => a.severity === 'critical' || a.severity === 'high'); // High Priority
      case 3: return alerts.filter(a => a.assignee === currentUser?.id); // Assigned to Me
      default: return alerts;
    }
  };

  // Filter and sort alerts
  const filteredAlerts = useMemo(() => {
    let tabFiltered = getTabFilteredAlerts(selectedTab);
    
    let filtered = tabFiltered.filter(alert => {
      // Search filter
      if (filter.search && !alert.message.toLowerCase().includes(filter.search.toLowerCase()) && 
          !alert.cameraName?.toLowerCase().includes(filter.search.toLowerCase())) {
        return false;
      }
      
      // Severity filter
      if (filter.severity.length > 0 && !filter.severity.includes(alert.severity)) {
        return false;
      }
      
      // Alert type filter
      if (filter.alertType.length > 0 && !filter.alertType.includes(alert.alertType)) {
        return false;
      }
      
      // Status filter
      if (filter.status.length > 0 && !filter.status.includes(alert.status)) {
        return false;
      }
      
      // Show resolved filter
      if (!filter.showResolved && alert.resolved) {
        return false;
      }
      
      // Time range filter
      const alertTime = new Date(alert.timestamp);
      const now = new Date();
      const timeDiff = now.getTime() - alertTime.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      switch (filter.timeRange) {
        case '1h': return hoursDiff <= 1;
        case '6h': return hoursDiff <= 6;
        case '24h': return hoursDiff <= 24;
        case '7d': return hoursDiff <= 24 * 7;
        case '30d': return hoursDiff <= 24 * 30;
        default: return true;
      }
    });
    
    // Sort by priority and timestamp
    return filtered.sort((a, b) => {
      if (a.priority !== b.priority) return b.priority - a.priority;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }, [alerts, filter, selectedTab, currentUser]);

  // Alert statistics
  const alertStats = useMemo(() => {
    const stats = {
      total: filteredAlerts.length,
      new: filteredAlerts.filter(a => a.status === 'new').length,
      acknowledged: filteredAlerts.filter(a => a.acknowledged && !a.resolved).length,
      investigating: filteredAlerts.filter(a => a.status === 'investigating').length,
      resolved: filteredAlerts.filter(a => a.resolved).length,
      critical: filteredAlerts.filter(a => a.severity === 'critical').length,
      high: filteredAlerts.filter(a => a.severity === 'high').length,
      overdue: filteredAlerts.filter(a => {
        if (!a.responseTimeSla || a.acknowledged) return false;
        const alertTime = new Date(a.timestamp);
        const now = new Date();
        const timeDiff = (now.getTime() - alertTime.getTime()) / (1000 * 60);
        return timeDiff > a.responseTimeSla;
      }).length
    };
    return stats;
  }, [filteredAlerts]);

  // Handle bulk actions using context
  const handleBulkAction = async (action: string, data?: any) => {
    try {
      const alertIds = Array.from(selectedAlerts);
      
      switch (action) {
        case 'acknowledge':
          await actions.bulkAlertAction(alertIds, 'acknowledge');
          break;
        case 'resolve':
          await actions.bulkAlertAction(alertIds, 'resolve');
          break;
        case 'escalate':
          await actions.bulkAlertAction(alertIds, 'escalate', data);
          break;
        case 'mark_false_positive':
          await actions.bulkAlertAction(alertIds, 'mark_false_positive');
          break;
        default:
          await actions.bulkAlertAction(alertIds, action, data);
      }
      
      setSelectedAlerts(new Set());
      setBulkActionMenu(null);
      setNotification({ message: `${action} completed for ${alertIds.length} alerts`, severity: 'success' });
    } catch (error: any) {
      setNotification({ message: `Failed to ${action} alerts: ${error.message}`, severity: 'error' });
    }
  };

  // Handle individual alert actions using context
  const handleAlertAction = async (alertId: string, action: string, data?: any) => {
    try {
      switch (action) {
        case 'acknowledge':
          await actions.acknowledgeAlert(alertId);
          break;
        case 'resolve':
          await actions.resolveAlert(alertId, data?.resolution);
          break;
        case 'escalate':
          await actions.escalateAlert(alertId, data?.escalatedTo, data?.reason);
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }
      setNotification({ message: `Alert ${action} completed`, severity: 'success' });
    } catch (error: any) {
      setNotification({ message: `Failed to ${action} alert: ${error.message}`, severity: 'error' });
    }
  };

  // Handle assignment with context
  const handleAssignment = async (operatorId: string) => {
    try {
      const alertIds = assignmentDialog.alertIds;
      for (const alertId of alertIds) {
        // Note: This would need to be implemented in the backend API
        await actions.bulkAlertAction([alertId], 'assign', { assigneeId: operatorId });
      }
      setAssignmentDialog({ open: false, alertIds: [] });
      setNotification({ message: `Assigned ${alertIds.length} alerts successfully`, severity: 'success' });
    } catch (error: any) {
      setNotification({ message: `Failed to assign alerts: ${error.message}`, severity: 'error' });
    }
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return colors.danger;
      case 'high': return '#ff6b35';
      case 'medium': return colors.warning;
      case 'low': return colors.success;
      default: return colors.textSecondary;
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return colors.danger;
      case 'acknowledged': return colors.warning;
      case 'investigating': return colors.secondary;
      case 'resolved': return colors.success;
      case 'false_positive': return colors.textSecondary;
      default: return colors.textSecondary;
    }
  };

  // Get alert icon
  const getAlertIcon = (alertType: string, severity: string) => {
    if (severity === 'critical') return <Security color="error" />;
    
    switch (alertType) {
      case 'detection': return <Warning style={{ color: getSeverityColor(severity) }} />;
      case 'behavioral': return <Person style={{ color: getSeverityColor(severity) }} />;
      case 'system': return <Settings style={{ color: getSeverityColor(severity) }} />;
      case 'manual': return <Assignment style={{ color: getSeverityColor(severity) }} />;
      default: return <Notifications style={{ color: getSeverityColor(severity) }} />;
    }
  };

  // Select/deselect all alerts
  const handleSelectAll = () => {
    if (selectedAlerts.size === filteredAlerts.length) {
      setSelectedAlerts(new Set());
    } else {
      setSelectedAlerts(new Set(filteredAlerts.map(alert => alert.id)));
    }
  };

  // Toggle alert selection
  const handleSelectAlert = (alertId: string) => {
    const newSelected = new Set(selectedAlerts);
    if (newSelected.has(alertId)) {
      newSelected.delete(alertId);
    } else {
      newSelected.add(alertId);
    }
    setSelectedAlerts(newSelected);
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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h5" sx={{ color: colors.text, fontWeight: 700, fontSize: '1.5rem' }}>
              Alert Management Center
            </Typography>
            
            {/* Connection Status Indicator */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: isConnected ? colors.success : colors.danger,
                  boxShadow: `0 0 8px ${isConnected ? colors.success : colors.danger}`,
                  animation: isConnected ? 'none' : 'pulse 2s infinite'
                }}
              />
              <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                {isConnected ? 'Live' : 'Disconnected'}
              </Typography>
              {lastUpdated && (
                <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                  • Updated {Math.round((Date.now() - new Date(lastUpdated).getTime()) / 60000)} minutes ago
                </Typography>
              )}
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {alertsLoading && (
              <CircularProgress size={16} sx={{ color: colors.secondary }} />
            )}
            <Button
              startIcon={alertsLoading ? null : <Refresh />}
              onClick={actions.loadAlerts}
              disabled={alertsLoading}
              size="small"
              variant="outlined"
              sx={{ 
                color: colors.textSecondary,
                borderColor: alpha(colors.secondary, 0.3),
                '&:hover': {
                  borderColor: colors.secondary,
                  backgroundColor: alpha(colors.secondary, 0.1)
                }
              }}
            >
              {alertsLoading ? 'Loading...' : 'Refresh'}
            </Button>
            <Button
              startIcon={<Settings />}
              onClick={() => setFilterDialog(true)}
              size="small"
              variant="outlined"
              sx={{ 
                color: colors.textSecondary,
                borderColor: alpha(colors.secondary, 0.3),
                '&:hover': {
                  borderColor: colors.secondary,
                  backgroundColor: alpha(colors.secondary, 0.1)
                }
              }}
            >
              Filters
            </Button>
          </Box>
        </Box>

        {/* Alert Statistics */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          {[
            { label: 'Total', value: alertStats.total, color: colors.textSecondary },
            { label: 'New', value: alertStats.new, color: colors.danger },
            { label: 'Investigating', value: alertStats.investigating, color: colors.secondary },
            { label: 'Critical', value: alertStats.critical, color: colors.danger },
            { label: 'Overdue', value: alertStats.overdue, color: '#ff6b35' }
          ].map((stat, index) => (
            <Chip
              key={index}
              label={`${stat.label}: ${stat.value}`}
              size="small"
              sx={{
                backgroundColor: alpha(stat.color, 0.1),
                color: stat.color,
                fontWeight: 600
              }}
            />
          ))}
        </Box>

        {/* Search and Bulk Actions */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Search alerts..."
            size="small"
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            InputProps={{
              startAdornment: <Search sx={{ color: colors.textSecondary, mr: 1 }} />,
              sx: { color: colors.text }
            }}
            sx={{ flex: 1 }}
          />
          
          {selectedAlerts.size > 0 && (
            <Button
              startIcon={<MoreVert />}
              onClick={(e) => setBulkActionMenu(e.currentTarget)}
              variant="outlined"
              size="small"
              sx={{ color: colors.secondary }}
            >
              Actions ({selectedAlerts.size})
            </Button>
          )}
        </Box>
      </Paper>

      {/* Content Tabs */}
      <Paper elevation={0} sx={{ backgroundColor: alpha(colors.surface, 0.5) }}>
        <Tabs
          value={selectedTab}
          onChange={(_, newValue) => setSelectedTab(newValue)}
          sx={{
            '& .MuiTab-root': { color: colors.textSecondary },
            '& .MuiTab-root.Mui-selected': { color: colors.secondary },
            '& .MuiTabs-indicator': { backgroundColor: colors.secondary }
          }}
        >
          <Tab label="All Alerts" />
          <Tab label="Active" />
          <Tab label="High Priority" />
          <Tab label="Assigned to Me" />
        </Tabs>
      </Paper>

      {/* Alert List */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
        {/* Select All Checkbox */}
        <Box sx={{ p: 1, borderBottom: `1px solid ${alpha(colors.primary, 0.1)}` }}>
          <Checkbox
            checked={selectedAlerts.size === filteredAlerts.length && filteredAlerts.length > 0}
            indeterminate={selectedAlerts.size > 0 && selectedAlerts.size < filteredAlerts.length}
            onChange={handleSelectAll}
            size="small"
            sx={{ color: colors.textSecondary }}
          />
          <Typography variant="caption" sx={{ color: colors.textSecondary, ml: 1 }}>
            {selectedAlerts.size > 0 ? `${selectedAlerts.size} selected` : 'Select all'}
          </Typography>
        </Box>

        <List sx={{ p: 0 }}>
          {filteredAlerts.map((alert: any, index: number) => (
            <ListItem
              key={alert.id}
              sx={{
                backgroundColor: selectedAlerts.has(alert.id) ? alpha(colors.secondary, 0.1) : 'transparent',
                borderBottom: `1px solid ${alpha(colors.primary, 0.1)}`,
                '&:hover': { backgroundColor: alpha(colors.surface, 0.5) },
                p: 1
              }}
            >
              {/* Selection Checkbox */}
              <Checkbox
                checked={selectedAlerts.has(alert.id)}
                onChange={() => handleSelectAlert(alert.id)}
                size="small"
                sx={{ color: colors.textSecondary, mr: 1 }}
              />

              {/* Alert Icon */}
              <ListItemAvatar>
                <Avatar sx={{ width: 32, height: 32, backgroundColor: 'transparent' }}>
                  {getAlertIcon(alert.alertType, alert.severity)}
                </Avatar>
              </ListItemAvatar>

              {/* Alert Details */}
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="body2" sx={{ color: colors.text, fontWeight: 600 }}>
                      {alert.message}
                    </Typography>
                    <Chip
                      label={alert.severity.toUpperCase()}
                      size="small"
                      sx={{
                        backgroundColor: alpha(getSeverityColor(alert.severity), 0.2),
                        color: getSeverityColor(alert.severity),
                        fontSize: '10px',
                        height: 20
                      }}
                    />
                    <Chip
                      label={alert.status.toUpperCase()}
                      size="small"
                      sx={{
                        backgroundColor: alpha(getStatusColor(alert.status), 0.2),
                        color: getStatusColor(alert.status),
                        fontSize: '10px',
                        height: 20
                      }}
                    />
                    {alert.priority >= 8 && (
                      <Flag sx={{ color: colors.danger, fontSize: 16 }} />
                    )}
                  </Box>
                }
                secondary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                      {alert.cameraName && (
                        <>
                          <Videocam sx={{ fontSize: 12, mr: 0.5 }} />
                          {alert.cameraName} •
                        </>
                      )}
                      <Schedule sx={{ fontSize: 12, mr: 0.5 }} />
                      {Math.round((Date.now() - new Date(alert.timestamp).getTime()) / 60000)} minutes ago
                    </Typography>
                    
                    {alert.assignee && (
                      <Typography variant="caption" sx={{ color: colors.secondary }}>
                        Assigned to {alert.assignee}
                      </Typography>
                    )}
                  </Box>
                }
              />

              {/* Quick Actions */}
              <ListItemSecondaryAction>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {!alert.acknowledged && (
                    <Tooltip title="Acknowledge">
                      <IconButton
                        size="small"
                        onClick={() => handleAlertAction(alert.id, 'acknowledge')}
                        sx={{ color: colors.success }}
                      >
                        <Check fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  
                  {alert.acknowledged && !alert.resolved && (
                    <Tooltip title="Resolve">
                      <IconButton
                        size="small"
                        onClick={() => handleAlertAction(alert.id, 'resolve')}
                        sx={{ color: colors.success }}
                      >
                        <Check fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  
                  <Tooltip title="Escalate">
                    <IconButton
                      size="small"
                      onClick={() => setEscalationDialog({ open: true, alertId: alert.id })}
                      sx={{ color: colors.warning }}
                    >
                      <TrendingUp fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>

        {filteredAlerts.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" sx={{ color: colors.textSecondary }}>
              No alerts found matching current filters
            </Typography>
          </Box>
        )}
      </Box>

      {/* Bulk Actions Menu */}
      <Menu
        anchorEl={bulkActionMenu}
        open={Boolean(bulkActionMenu)}
        onClose={() => setBulkActionMenu(null)}
      >
        <MenuItem onClick={() => handleBulkAction('acknowledge')}>
          <Check sx={{ mr: 1 }} /> Acknowledge All
        </MenuItem>
        <MenuItem onClick={() => handleBulkAction('resolve')}>
          <Check sx={{ mr: 1 }} /> Resolve All
        </MenuItem>
        <MenuItem onClick={() => setAssignmentDialog({ open: true, alertIds: Array.from(selectedAlerts) })}>
          <Assignment sx={{ mr: 1 }} /> Assign to Operator
        </MenuItem>
        <MenuItem onClick={() => handleBulkAction('escalate')}>
          <TrendingUp sx={{ mr: 1 }} /> Escalate All
        </MenuItem>
        <MenuItem onClick={() => handleBulkAction('mark_false_positive')}>
          <Close sx={{ mr: 1 }} /> Mark as False Positive
        </MenuItem>
      </Menu>

      {/* Assignment Dialog */}
      <Dialog open={assignmentDialog.open} onClose={() => setAssignmentDialog({ open: false, alertIds: [] })}>
        <DialogTitle>Assign Alerts to Operator</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Select Operator</InputLabel>
            <Select label="Select Operator">
              {operators.filter(op => op.status === 'online').map((operator: any) => (
                <MenuItem key={operator.id} value={operator.id}>
                  {operator.name} ({operator.role})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignmentDialog({ open: false, alertIds: [] })}>Cancel</Button>
          <Button onClick={() => {
            // Handle assignment
            setAssignmentDialog({ open: false, alertIds: [] });
          }} variant="contained">
            Assign
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={!!notification}
        autoHideDuration={4000}
        onClose={() => setNotification(null)}
      >
        <MuiAlert severity={notification?.severity} onClose={() => setNotification(null)}>
          {notification?.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default AlertManagementCenter;
