/**
 * IncidentManagementWorkflow - End-to-end incident tracking and management
 * Provides comprehensive incident lifecycle management from detection to resolution with documentation and escalation
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
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
  Stepper,
  Step,
  StepLabel,
  StepContent,
  StepConnector,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Avatar,
  AvatarGroup,
  LinearProgress,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Drawer,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  alpha,
  useTheme
} from '@mui/material';
import {
  Assignment,
  AssignmentTurnedIn,
  Warning,
  Error,
  CheckCircle,
  Cancel,
  Schedule,
  Person,
  Group,
  Comment,
  Attachment,
  Visibility,
  Edit,
  Delete,
  Add,
  Save,
  Send,
  Phone,
  Email,
  PhotoCamera,
  Videocam,
  Description,
  Report,
  Timeline as TimelineIcon,
  History,
  Notifications,
  Security,
  LocalPolice,
  MedicalServices,
  FireTruck,
  Business,
  Close,
  ExpandMore,
  PlayArrow,
  Pause,
  Stop,
  Refresh,
  Download,
  Upload,
  Share,
  Print,
  Flag,
  Star,
  StarBorder,
  Archive,
  Unarchive,
  Lock,
  LockOpen,
  Public,
  VpnLock as PrivateConnector,
  TrendingUp
} from '@mui/icons-material';

export interface Incident {
  id: string;
  title: string;
  description: string;
  status: 'new' | 'assigned' | 'investigating' | 'escalated' | 'resolved' | 'closed' | 'false_positive';
  priority: 'low' | 'medium' | 'high' | 'critical';
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  category: 'theft' | 'suspicious_behavior' | 'safety' | 'security' | 'maintenance' | 'other';
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  closed_at?: string;
  
  // Incident details
  store_id: string;
  store_name: string;
  location: string;
  camera_ids: string[];
  detection_ids: string[];
  
  // Assignment and tracking
  assigned_to: string;
  assigned_by: string;
  reporter: string;
  responders: string[];
  
  // Metadata
  tags: string[];
  estimated_loss?: number;
  actual_loss?: number;
  evidence_collected: boolean;
  police_notified: boolean;
  insurance_claimed: boolean;
  
  // SLA and metrics
  response_time_sla: number; // minutes
  resolution_time_sla: number; // hours
  response_time_actual?: number;
  resolution_time_actual?: number;
  
  // Related data
  alerts: string[];
  activities: IncidentActivity[];
  attachments: IncidentAttachment[];
  escalations: IncidentEscalation[];
  comments: IncidentComment[];
}

export interface IncidentActivity {
  id: string;
  incident_id: string;
  type: 'created' | 'assigned' | 'status_changed' | 'escalated' | 'commented' | 'attachment_added' | 'resolved';
  description: string;
  user_id: string;
  user_name: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface IncidentAttachment {
  id: string;
  incident_id: string;
  filename: string;
  file_type: 'image' | 'video' | 'document' | 'audio';
  file_size: number;
  url: string;
  thumbnail_url?: string;
  uploaded_by: string;
  uploaded_at: string;
  description?: string;
}

export interface IncidentEscalation {
  id: string;
  incident_id: string;
  escalated_to: string;
  escalated_by: string;
  escalated_at: string;
  reason: string;
  response_required_by?: string;
  responded_at?: string;
  response?: string;
}

export interface IncidentComment {
  id: string;
  incident_id: string;
  user_id: string;
  user_name: string;
  content: string;
  timestamp: string;
  is_internal: boolean;
  mentions: string[];
}

export interface IncidentTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  priority: string;
  severity: string;
  default_assignments: string[];
  checklist: string[];
  required_fields: string[];
  estimated_duration: number; // hours
}

interface IncidentManagementWorkflowProps {
  incidents: Incident[];
  templates: IncidentTemplate[];
  currentUser: {
    id: string;
    name: string;
    role: string;
    permissions: string[];
  };
  operators: Array<{
    id: string;
    name: string;
    role: string;
    status: 'online' | 'offline' | 'busy';
    department: string;
  }>;
  onCreateIncident: (incident: Partial<Incident>) => Promise<string>;
  onUpdateIncident: (incidentId: string, updates: Partial<Incident>) => Promise<void>;
  onAddComment: (incidentId: string, comment: Omit<IncidentComment, 'id' | 'timestamp'>) => Promise<void>;
  onAddAttachment: (incidentId: string, file: File, description?: string) => Promise<void>;
  onEscalateIncident: (incidentId: string, escalation: Omit<IncidentEscalation, 'id' | 'escalated_at'>) => Promise<void>;
  onAssignIncident: (incidentId: string, assigneeId: string) => Promise<void>;
  onGenerateReport: (incidentId: string, format: 'pdf' | 'docx') => Promise<void>;
}

const IncidentManagementWorkflow: React.FC<IncidentManagementWorkflowProps> = ({
  incidents,
  templates,
  currentUser,
  operators,
  onCreateIncident,
  onUpdateIncident,
  onAddComment,
  onAddAttachment,
  onEscalateIncident,
  onAssignIncident,
  onGenerateReport
}) => {
  const theme = useTheme();
  
  // State management
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'timeline'>('list');
  const [filterStatus, setFilterStatus] = useState<string[]>(['new', 'assigned', 'investigating', 'escalated']);
  const [createDialog, setCreateDialog] = useState(false);
  const [commentDialog, setCommentDialog] = useState(false);
  const [escalationDialog, setEscalationDialog] = useState(false);
  const [attachmentDialog, setAttachmentDialog] = useState(false);
  const [reportDialog, setReportDialog] = useState(false);
  const [detailsDrawer, setDetailsDrawer] = useState(false);
  
  const [newIncident, setNewIncident] = useState<Partial<Incident>>({
    priority: 'medium',
    severity: 'moderate',
    category: 'theft',
    status: 'new'
  });
  const [newComment, setNewComment] = useState({ content: '', is_internal: false });
  const [escalationData, setEscalationData] = useState({ escalated_to: '', reason: '' });
  const [notification, setNotification] = useState<{
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  } | null>(null);
  
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

  // Incident statistics
  const incidentStats = useMemo(() => {
    const stats = {
      total: incidents.length,
      new: incidents.filter(i => i.status === 'new').length,
      assigned: incidents.filter(i => i.status === 'assigned').length,
      investigating: incidents.filter(i => i.status === 'investigating').length,
      escalated: incidents.filter(i => i.status === 'escalated').length,
      resolved: incidents.filter(i => i.status === 'resolved').length,
      overdue: incidents.filter(i => {
        if (i.status === 'resolved' || i.status === 'closed') return false;
        const createdAt = new Date(i.created_at);
        const now = new Date();
        const hoursElapsed = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
        return hoursElapsed > i.resolution_time_sla;
      }).length,
      myIncidents: incidents.filter(i => i.assigned_to === currentUser.id).length,
      highPriority: incidents.filter(i => i.priority === 'high' || i.priority === 'critical').length
    };
    return stats;
  }, [incidents, currentUser.id]);

  // Filtered incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter(incident => filterStatus.includes(incident.status));
  }, [incidents, filterStatus]);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return colors.danger;
      case 'assigned': return colors.warning;
      case 'investigating': return colors.secondary;
      case 'escalated': return '#ff6b35';
      case 'resolved': return colors.success;
      case 'closed': return colors.textSecondary;
      case 'false_positive': return colors.textSecondary;
      default: return colors.textSecondary;
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return colors.danger;
      case 'high': return '#ff6b35';
      case 'medium': return colors.warning;
      case 'low': return colors.success;
      default: return colors.textSecondary;
    }
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'theft': return <Security />;
      case 'suspicious_behavior': return <Warning />;
      case 'safety': return <MedicalServices />;
      case 'security': return <LocalPolice />;
      case 'maintenance': return <Assignment />;
      default: return <Flag />;
    }
  };

  // Handle incident creation
  const handleCreateIncident = async () => {
    try {
      const incidentId = await onCreateIncident({
        ...newIncident,
        reporter: currentUser.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      setCreateDialog(false);
      setNewIncident({ priority: 'medium', severity: 'moderate', category: 'theft', status: 'new' });
      setNotification({ message: 'Incident created successfully', severity: 'success' });
    } catch (error) {
      setNotification({ message: 'Failed to create incident', severity: 'error' });
    }
  };

  // Handle status change
  const handleStatusChange = async (incidentId: string, newStatus: string) => {
    try {
      const updates: Partial<Incident> = { 
        status: newStatus as any, 
        updated_at: new Date().toISOString() 
      };
      
      if (newStatus === 'resolved') {
        updates.resolved_at = new Date().toISOString();
      } else if (newStatus === 'closed') {
        updates.closed_at = new Date().toISOString();
      }
      
      await onUpdateIncident(incidentId, updates);
      setNotification({ message: `Incident ${newStatus}`, severity: 'success' });
    } catch (error) {
      setNotification({ message: 'Failed to update incident status', severity: 'error' });
    }
  };

  // Handle comment addition
  const handleAddComment = async () => {
    if (!selectedIncident || !newComment.content.trim()) return;
    
    try {
      await onAddComment(selectedIncident.id, {
        incident_id: selectedIncident.id,
        user_id: currentUser.id,
        user_name: currentUser.name,
        content: newComment.content,
        is_internal: newComment.is_internal,
        mentions: []
      });
      
      setCommentDialog(false);
      setNewComment({ content: '', is_internal: false });
      setNotification({ message: 'Comment added successfully', severity: 'success' });
    } catch (error) {
      setNotification({ message: 'Failed to add comment', severity: 'error' });
    }
  };

  // Handle escalation
  const handleEscalation = async () => {
    if (!selectedIncident || !escalationData.escalated_to || !escalationData.reason.trim()) return;
    
    try {
      await onEscalateIncident(selectedIncident.id, {
        incident_id: selectedIncident.id,
        escalated_to: escalationData.escalated_to,
        escalated_by: currentUser.id,
        reason: escalationData.reason
      });
      
      await onUpdateIncident(selectedIncident.id, { 
        status: 'escalated', 
        updated_at: new Date().toISOString() 
      });
      
      setEscalationDialog(false);
      setEscalationData({ escalated_to: '', reason: '' });
      setNotification({ message: 'Incident escalated successfully', severity: 'success' });
    } catch (error) {
      setNotification({ message: 'Failed to escalate incident', severity: 'error' });
    }
  };

  // Render incident card
  const renderIncidentCard = (incident: Incident) => {
    const isOverdue = (() => {
      if (incident.status === 'resolved' || incident.status === 'closed') return false;
      const createdAt = new Date(incident.created_at);
      const now = new Date();
      const hoursElapsed = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
      return hoursElapsed > incident.resolution_time_sla;
    })();

    return (
      <Card
        key={incident.id}
        sx={{
          mb: 2,
          cursor: 'pointer',
          border: `1px solid ${alpha(colors.primary, 0.2)}`,
          '&:hover': { backgroundColor: alpha(colors.surface, 0.5) },
          ...(isOverdue && { borderLeft: `4px solid ${colors.danger}` })
        }}
        onClick={() => {
          setSelectedIncident(incident);
          setDetailsDrawer(true);
        }}
      >
        <CardHeader
          avatar={
            <Avatar sx={{ backgroundColor: getStatusColor(incident.status) }}>
              {getCategoryIcon(incident.category)}
            </Avatar>
          }
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" sx={{ color: colors.text }}>
                {incident.title}
              </Typography>
              <Chip
                label={incident.priority.toUpperCase()}
                size="small"
                sx={{
                  backgroundColor: alpha(getPriorityColor(incident.priority), 0.2),
                  color: getPriorityColor(incident.priority),
                  fontSize: '10px',
                  height: 18
                }}
              />
              {isOverdue && (
                <Chip
                  label="OVERDUE"
                  size="small"
                  color="error"
                  sx={{ fontSize: '10px', height: 18 }}
                />
              )}
            </Box>
          }
          subheader={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
              <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                #{incident.id.slice(-6)} • {incident.store_name} • {incident.location}
              </Typography>
              <Chip
                label={incident.status.replace('_', ' ').toUpperCase()}
                size="small"
                sx={{
                  backgroundColor: alpha(getStatusColor(incident.status), 0.2),
                  color: getStatusColor(incident.status),
                  fontSize: '10px',
                  height: 16
                }}
              />
            </Box>
          }
          action={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {incident.comments.length > 0 && (
                <Badge badgeContent={incident.comments.length} color="primary">
                  <Comment sx={{ color: colors.textSecondary }} />
                </Badge>
              )}
              {incident.attachments.length > 0 && (
                <Badge badgeContent={incident.attachments.length} color="primary">
                  <Attachment sx={{ color: colors.textSecondary }} />
                </Badge>
              )}
              <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                {Math.round((Date.now() - new Date(incident.created_at).getTime()) / 60000)} minutes ago
              </Typography>
            </Box>
          }
        />
        
        <CardContent sx={{ pt: 0 }}>
          <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 1 }}>
            {incident.description}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Person sx={{ fontSize: 16, color: colors.textSecondary }} />
              <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                {operators.find(op => op.id === incident.assigned_to)?.name || 'Unassigned'}
              </Typography>
            </Box>
            
            {incident.tags.length > 0 && (
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {incident.tags.slice(0, 3).map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    sx={{ fontSize: '10px', height: 16 }}
                  />
                ))}
                {incident.tags.length > 3 && (
                  <Chip
                    label={`+${incident.tags.length - 3}`}
                    size="small"
                    sx={{ fontSize: '10px', height: 16 }}
                  />
                )}
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  };

  // Render incident timeline
  const renderIncidentTimeline = (incident: Incident) => {
    const activities = incident.activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return (
      <Box>
        {activities.map((activity, index) => (
          <Box key={activity.id} sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ mr: 2, mt: 0.5 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: activity.type === 'escalated' ? colors.danger :
                                   activity.type === 'resolved' ? colors.success :
                                   activity.type === 'assigned' ? colors.warning :
                                   colors.secondary
                }}
              />
              {index < activities.length - 1 && (
                <Box
                  sx={{
                    width: 2,
                    height: 40,
                    backgroundColor: alpha(colors.textSecondary, 0.3),
                    ml: 1,
                    mt: 1
                  }}
                />
              )}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                  {new Date(activity.timestamp).toLocaleDateString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: colors.text, mb: 0.5 }}>
                {activity.description}
              </Typography>
              <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                by {activity.user_name}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
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
            Incident Management
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              startIcon={<Add />}
              onClick={() => setCreateDialog(true)}
              variant="contained"
              size="small"
            >
              New Incident
            </Button>
            <Button
              startIcon={<Report />}
              size="small"
              sx={{ color: colors.textSecondary }}
            >
              Reports
            </Button>
            <Button
              startIcon={<Refresh />}
              size="small"
              sx={{ color: colors.textSecondary }}
            >
              Refresh
            </Button>
          </Box>
        </Box>

        {/* Statistics */}
        <Grid container spacing={2}>
          {[
            { label: 'Total', value: incidentStats.total, color: colors.textSecondary },
            { label: 'New', value: incidentStats.new, color: colors.danger },
            { label: 'My Incidents', value: incidentStats.myIncidents, color: colors.secondary },
            { label: 'High Priority', value: incidentStats.highPriority, color: colors.warning },
            { label: 'Overdue', value: incidentStats.overdue, color: colors.danger },
            { label: 'Resolved Today', value: incidentStats.resolved, color: colors.success }
          ].map((stat, index) => (
            <Grid item xs={12} sm={6} md={2} key={index}>
              <Card sx={{ backgroundColor: alpha(stat.color, 0.1), textAlign: 'center', p: 1 }}>
                <Typography variant="h4" sx={{ color: stat.color, fontWeight: 700 }}>
                  {stat.value}
                </Typography>
                <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                  {stat.label}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Filters and View Controls */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          backgroundColor: alpha(colors.surface, 0.5),
          borderBottom: `1px solid ${alpha(colors.primary, 0.1)}`
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {['new', 'assigned', 'investigating', 'escalated', 'resolved'].map((status) => (
              <Chip
                key={status}
                label={status.replace('_', ' ').toUpperCase()}
                onClick={() => {
                  setFilterStatus(prev => 
                    prev.includes(status) 
                      ? prev.filter(s => s !== status)
                      : [...prev, status]
                  );
                }}
                variant={filterStatus.includes(status) ? 'filled' : 'outlined'}
                size="small"
                sx={{
                  backgroundColor: filterStatus.includes(status) ? alpha(getStatusColor(status), 0.2) : 'transparent',
                  color: getStatusColor(status),
                  borderColor: getStatusColor(status)
                }}
              />
            ))}
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant={viewMode === 'list' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setViewMode('list')}
              sx={{ minWidth: 'auto' }}
            >
              List
            </Button>
            <Button
              variant={viewMode === 'timeline' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setViewMode('timeline')}
              sx={{ minWidth: 'auto' }}
            >
              Timeline
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Content */}
      <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
        {viewMode === 'list' && (
          <Box>
            {filteredIncidents.map(renderIncidentCard)}
            {filteredIncidents.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Assignment sx={{ fontSize: 64, color: colors.textSecondary, mb: 2 }} />
                <Typography variant="h6" sx={{ color: colors.textSecondary, mb: 1 }}>
                  No incidents found
                </Typography>
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                  Adjust your filters or create a new incident
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* Create Incident Dialog */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Incident</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Incident Title"
                value={newIncident.title || ''}
                onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={newIncident.description || ''}
                onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                required
              />
            </Grid>
            
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={newIncident.priority || 'medium'}
                  onChange={(e) => setNewIncident({ ...newIncident, priority: e.target.value as any })}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={newIncident.category || 'theft'}
                  onChange={(e) => setNewIncident({ ...newIncident, category: e.target.value as any })}
                >
                  <MenuItem value="theft">Theft</MenuItem>
                  <MenuItem value="suspicious_behavior">Suspicious Behavior</MenuItem>
                  <MenuItem value="safety">Safety</MenuItem>
                  <MenuItem value="security">Security</MenuItem>
                  <MenuItem value="maintenance">Maintenance</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Store Name"
                value={newIncident.store_name || ''}
                onChange={(e) => setNewIncident({ ...newIncident, store_name: e.target.value })}
                required
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Location"
                value={newIncident.location || ''}
                onChange={(e) => setNewIncident({ ...newIncident, location: e.target.value })}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Assign To</InputLabel>
                <Select
                  value={newIncident.assigned_to || ''}
                  onChange={(e) => setNewIncident({ ...newIncident, assigned_to: e.target.value })}
                >
                  <MenuItem value="">Unassigned</MenuItem>
                  {operators.filter(op => op.status === 'online').map((operator) => (
                    <MenuItem key={operator.id} value={operator.id}>
                      {operator.name} ({operator.role})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateIncident} variant="contained">Create Incident</Button>
        </DialogActions>
      </Dialog>

      {/* Incident Details Drawer */}
      <Drawer
        anchor="right"
        open={detailsDrawer}
        onClose={() => setDetailsDrawer(false)}
        PaperProps={{ sx: { width: 600 } }}
      >
        {selectedIncident && (
          <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ color: colors.text }}>
                Incident Details
              </Typography>
              <IconButton onClick={() => setDetailsDrawer(false)}>
                <Close />
              </IconButton>
            </Box>
            
            <Tabs
              value={selectedTab}
              onChange={(_, newValue) => setSelectedTab(newValue)}
              sx={{ mb: 2 }}
            >
              <Tab label="Overview" />
              <Tab label="Timeline" />
              <Tab label="Comments" />
              <Tab label="Attachments" />
            </Tabs>
            
            {selectedTab === 0 && (
              <Box>
                {/* Incident Overview */}
                <Card sx={{ mb: 2, backgroundColor: alpha(colors.surface, 0.5) }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: colors.text, mb: 1 }}>
                      {selectedIncident.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 2 }}>
                      {selectedIncident.description}
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                          Status
                        </Typography>
                        <Typography variant="body2" sx={{ color: colors.text }}>
                          {selectedIncident.status.replace('_', ' ').toUpperCase()}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                          Priority
                        </Typography>
                        <Typography variant="body2" sx={{ color: colors.text }}>
                          {selectedIncident.priority.toUpperCase()}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                          Category
                        </Typography>
                        <Typography variant="body2" sx={{ color: colors.text }}>
                          {selectedIncident.category.replace('_', ' ').toUpperCase()}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                          Assigned To
                        </Typography>
                        <Typography variant="body2" sx={{ color: colors.text }}>
                          {operators.find(op => op.id === selectedIncident.assigned_to)?.name || 'Unassigned'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
                
                {/* Quick Actions */}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  {selectedIncident.status !== 'resolved' && (
                    <Button
                      size="small"
                      startIcon={<CheckCircle />}
                      onClick={() => handleStatusChange(selectedIncident.id, 'resolved')}
                      sx={{ color: colors.success }}
                    >
                      Resolve
                    </Button>
                  )}
                  
                  <Button
                    size="small"
                    startIcon={<Comment />}
                    onClick={() => setCommentDialog(true)}
                    sx={{ color: colors.secondary }}
                  >
                    Comment
                  </Button>
                  
                  <Button
                    size="small"
                    startIcon={<TrendingUp />}
                    onClick={() => setEscalationDialog(true)}
                    sx={{ color: colors.warning }}
                  >
                    Escalate
                  </Button>
                  
                  <Button
                    size="small"
                    startIcon={<Attachment />}
                    onClick={() => setAttachmentDialog(true)}
                    sx={{ color: colors.textSecondary }}
                  >
                    Attach
                  </Button>
                  
                  <Button
                    size="small"
                    startIcon={<Report />}
                    onClick={() => setReportDialog(true)}
                    sx={{ color: colors.textSecondary }}
                  >
                    Report
                  </Button>
                </Box>
              </Box>
            )}
            
            {selectedTab === 1 && renderIncidentTimeline(selectedIncident)}
            
            {selectedTab === 2 && (
              <Box>
                <List>
                  {selectedIncident.comments.map((comment) => (
                    <ListItem key={comment.id} sx={{ px: 0, alignItems: 'flex-start' }}>
                      <ListItemIcon>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {comment.user_name.charAt(0)}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="body2" fontWeight={600}>
                              {comment.user_name}
                            </Typography>
                            {comment.is_internal && (
                              <Chip
                                label="INTERNAL"
                                size="small"
                                color="warning"
                                sx={{ fontSize: '10px', height: 16 }}
                              />
                            )}
                            <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                              {Math.round((Date.now() - new Date(comment.timestamp).getTime()) / 60000)} minutes ago
                            </Typography>
                          </Box>
                        }
                        secondary={comment.content}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
            
            {selectedTab === 3 && (
              <Box>
                <Grid container spacing={2}>
                  {selectedIncident.attachments.map((attachment) => (
                    <Grid item xs={12} sm={6} key={attachment.id}>
                      <Card>
                        <CardContent sx={{ p: 2 }}>
                          <Typography variant="body2" fontWeight={600}>
                            {attachment.filename}
                          </Typography>
                          <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                            {attachment.file_type} • {(attachment.file_size / 1024 / 1024).toFixed(1)}MB
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Box>
        )}
      </Drawer>

      {/* Comment Dialog */}
      <Dialog open={commentDialog} onClose={() => setCommentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Comment</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Enter your comment..."
            value={newComment.content}
            onChange={(e) => setNewComment({ ...newComment, content: e.target.value })}
            sx={{ mt: 1 }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={newComment.is_internal}
                onChange={(e) => setNewComment({ ...newComment, is_internal: e.target.checked })}
              />
            }
            label="Internal comment (not visible to external parties)"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommentDialog(false)}>Cancel</Button>
          <Button onClick={handleAddComment} variant="contained">Add Comment</Button>
        </DialogActions>
      </Dialog>

      {/* Escalation Dialog */}
      <Dialog open={escalationDialog} onClose={() => setEscalationDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Escalate Incident</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1, mb: 2 }}>
            <InputLabel>Escalate To</InputLabel>
            <Select
              value={escalationData.escalated_to}
              onChange={(e) => setEscalationData({ ...escalationData, escalated_to: e.target.value })}
            >
              {operators.filter(op => op.role === 'manager' || op.role === 'supervisor').map((operator) => (
                <MenuItem key={operator.id} value={operator.id}>
                  {operator.name} ({operator.role})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Escalation Reason"
            placeholder="Explain why this incident needs to be escalated..."
            value={escalationData.reason}
            onChange={(e) => setEscalationData({ ...escalationData, reason: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEscalationDialog(false)}>Cancel</Button>
          <Button onClick={handleEscalation} variant="contained" color="warning">
            Escalate
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification */}
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

export default IncidentManagementWorkflow;
