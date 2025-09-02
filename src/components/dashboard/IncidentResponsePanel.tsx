import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  useTheme,
  alpha,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Divider
} from '@mui/material';
import {
  Security as SecurityIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Visibility as VisibilityIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  Send as SendIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  CameraAlt as CameraIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';

interface Incident {
  id: string;
  alertId: string;
  type: 'shoplifting' | 'suspicious_behavior' | 'known_offender' | 'security_breach';
  severity: 'low' | 'medium' | 'high' | 'critical' | 'emergency';
  status: 'new' | 'in_progress' | 'escalated' | 'resolved' | 'closed';
  title: string;
  description: string;
  location: string;
  cameraId: string;
  timestamp: Date;
  assignedOperator?: string;
  personId?: string;
  personThumbnail?: string;
  confidence?: number;
  evidenceUrls?: string[];
  notes: string[];
  actions: IncidentAction[];
}

interface IncidentAction {
  id: string;
  type: 'escalate' | 'contact_security' | 'contact_police' | 'document' | 'resolve';
  label: string;
  description: string;
  completed: boolean;
  timestamp?: Date;
  operatorId?: string;
}

interface IncidentResponsePanelProps {
  incidents?: Incident[];
  currentOperatorId: string;
  onIncidentUpdate?: (incidentId: string, updates: Partial<Incident>) => void;
  onActionComplete?: (incidentId: string, actionId: string) => void;
}

const IncidentResponsePanel: React.FC<IncidentResponsePanelProps> = ({
  incidents = [],
  currentOperatorId,
  onIncidentUpdate,
  onActionComplete
}) => {
  const theme = useTheme();
  const [activeIncidents, setActiveIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [evidenceDialogOpen, setEvidenceDialogOpen] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [escalationReason, setEscalationReason] = useState('');

  // Generate mock incidents for demonstration
  useEffect(() => {
    if (incidents.length > 0) {
      setActiveIncidents(incidents);
      return;
    }

    const mockIncidents: Incident[] = [
      {
        id: 'incident-001',
        alertId: 'alert-001',
        type: 'known_offender',
        severity: 'critical',
        status: 'new',
        title: 'Known Offender Detected',
        description: 'Person with previous shoplifting history identified in Electronics Section',
        location: 'Electronics Section - Camera 02',
        cameraId: 'cam-02',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        personId: 'person-001',
        personThumbnail: '/api/mock/person-001.jpg',
        confidence: 0.94,
        evidenceUrls: ['/api/evidence/video-001.mp4', '/api/evidence/image-001.jpg'],
        notes: [],
        actions: [
          {
            id: 'action-001',
            type: 'escalate',
            label: 'Escalate to Security Manager',
            description: 'Notify security manager of known offender presence',
            completed: false
          },
          {
            id: 'action-002',
            type: 'contact_security',
            label: 'Alert Floor Security',
            description: 'Contact floor security personnel immediately',
            completed: false
          },
          {
            id: 'action-003',
            type: 'document',
            label: 'Document Incident',
            description: 'Create detailed incident report',
            completed: false
          }
        ]
      },
      {
        id: 'incident-002',
        alertId: 'alert-002',
        type: 'suspicious_behavior',
        severity: 'high',
        status: 'in_progress',
        title: 'Suspicious Concealment Behavior',
        description: 'Person observed concealing items in clothing',
        location: 'Clothing Section - Camera 04',
        cameraId: 'cam-04',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        assignedOperator: currentOperatorId,
        confidence: 0.82,
        evidenceUrls: ['/api/evidence/video-002.mp4'],
        notes: ['Initial observation confirmed', 'Subject still in store'],
        actions: [
          {
            id: 'action-004',
            type: 'contact_security',
            label: 'Dispatch Floor Security',
            description: 'Send security to monitor subject',
            completed: true,
            timestamp: new Date(Date.now() - 10 * 60 * 1000),
            operatorId: currentOperatorId
          },
          {
            id: 'action-005',
            type: 'document',
            label: 'Update Documentation',
            description: 'Add behavioral observations to report',
            completed: false
          }
        ]
      }
    ];

    setActiveIncidents(mockIncidents);
  }, [incidents, currentOperatorId]);

  // Simple color system for security operators
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'emergency':
      case 'critical':
        return '#ff0000'; // RED
      case 'high':
      case 'medium':
        return '#ffaa00'; // YELLOW
      case 'low':
        return '#00ff00'; // GREEN
      default:
        return '#ffaa00'; // YELLOW
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return '#ff0000';
      case 'in_progress': return '#ffaa00';
      case 'escalated': return '#ff6600';
      case 'resolved': return '#00ff00';
      case 'closed': return '#888888';
      default: return '#ffaa00';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return '🔴';
      case 'in_progress': return '🟡';
      case 'escalated': return '🟠';
      case 'resolved': return '🟢';
      case 'closed': return '⚫';
      default: return '🟡';
    }
  };

  // One-click action handlers
  const handleQuickAction = (incident: Incident, actionType: string) => {
    const action = incident.actions.find(a => a.type === actionType);
    if (!action) return;

    // Simple confirmation for critical actions
    if (actionType === 'escalate' || actionType === 'contact_police') {
      if (!window.confirm(`Are you sure you want to ${action.label}?`)) {
        return;
      }
    }

    // Mark action as completed
    const updatedActions = incident.actions.map(a => 
      a.id === action.id 
        ? { ...a, completed: true, timestamp: new Date(), operatorId: currentOperatorId }
        : a
    );

    const updatedIncident = {
      ...incident,
      actions: updatedActions,
      status: actionType === 'escalate' ? 'escalated' as const : incident.status
    };

    setActiveIncidents(prev => 
      prev.map(inc => inc.id === incident.id ? updatedIncident : inc)
    );

    if (onActionComplete) {
      onActionComplete(incident.id, action.id);
    }

    // Show simple feedback
    alert(`✓ ${action.label} completed successfully!`);
  };

  const handleViewEvidence = (incident: Incident) => {
    setSelectedIncident(incident);
    setEvidenceDialogOpen(true);
  };

  const handleStartResponse = (incident: Incident) => {
    setSelectedIncident(incident);
    setResponseDialogOpen(true);
  };

  const handleAddNote = () => {
    if (!selectedIncident || !newNote.trim()) return;

    const updatedIncident = {
      ...selectedIncident,
      notes: [...selectedIncident.notes, `${new Date().toLocaleTimeString()}: ${newNote}`]
    };

    setActiveIncidents(prev => 
      prev.map(inc => inc.id === selectedIncident.id ? updatedIncident : inc)
    );

    setSelectedIncident(updatedIncident);
    setNewNote('');
  };

  const handleResolveIncident = (incident: Incident) => {
    const updatedIncident = {
      ...incident,
      status: 'resolved' as const,
      notes: [...incident.notes, `${new Date().toLocaleTimeString()}: Incident resolved by ${currentOperatorId}`]
    };

    setActiveIncidents(prev => 
      prev.map(inc => inc.id === incident.id ? updatedIncident : inc)
    );

    if (onIncidentUpdate) {
      onIncidentUpdate(incident.id, { status: 'resolved' });
    }

    alert('✓ Incident marked as resolved!');
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box
        sx={{
          p: 2,
          background: 'linear-gradient(90deg, #1a1a1a 0%, #2a2a2a 100%)',
          borderBottom: '2px solid #444444'
        }}
      >
        <Typography
          variant="h5"
          sx={{
            color: '#ffffff',
            fontWeight: 700,
            letterSpacing: '2px',
            fontFamily: 'monospace'
          }}
        >
          🚨 INCIDENT RESPONSE CENTER
        </Typography>
        <Typography
          variant="subtitle2"
          sx={{
            color: '#cccccc',
            fontFamily: 'monospace',
            mt: 0.5
          }}
        >
          Active Incidents: {activeIncidents.filter(inc => inc.status !== 'closed').length} | 
          Operator: {currentOperatorId}
        </Typography>
      </Box>

      {/* Incident Cards */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {activeIncidents.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#888888'
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h6" sx={{ fontFamily: 'monospace' }}>
              NO ACTIVE INCIDENTS
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
              All clear - monitoring for new incidents
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {activeIncidents
              .filter(incident => incident.status !== 'closed')
              .sort((a, b) => {
                // Sort by severity and timestamp
                const severityOrder = { emergency: 5, critical: 4, high: 3, medium: 2, low: 1 };
                const aSeverity = severityOrder[a.severity as keyof typeof severityOrder] || 1;
                const bSeverity = severityOrder[b.severity as keyof typeof severityOrder] || 1;
                
                if (aSeverity !== bSeverity) return bSeverity - aSeverity;
                return b.timestamp.getTime() - a.timestamp.getTime();
              })
              .map((incident) => {
                const severityColor = getSeverityColor(incident.severity);
                const statusColor = getStatusColor(incident.status);
                const completedActions = incident.actions.filter(a => a.completed).length;
                const totalActions = incident.actions.length;
                
                return (
                  <Grid item xs={12} md={6} key={incident.id}>
                    <Card
                      elevation={4}
                      sx={{
                        background: `linear-gradient(135deg, ${alpha('#1a1a1a', 0.9)} 0%, ${alpha('#2a2a2a', 0.8)} 100%)`,
                        border: `3px solid ${severityColor}`,
                        borderRadius: 2,
                        position: 'relative',
                        '&:hover': {
                          boxShadow: `0 0 20px ${alpha(severityColor, 0.5)}`
                        }
                      }}
                    >
                      {/* Status Badge */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: -10,
                          right: -10,
                          backgroundColor: statusColor,
                          color: '#ffffff',
                          px: 2,
                          py: 1,
                          borderRadius: 2,
                          fontWeight: 900,
                          fontSize: '12px',
                          fontFamily: 'monospace',
                          boxShadow: `0 0 15px ${alpha(statusColor, 0.8)}`,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5
                        }}
                      >
                        {getStatusIcon(incident.status)} {incident.status.toUpperCase()}
                      </Box>

                      <CardContent sx={{ pb: 1 }}>
                        {/* Incident Header */}
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                          {incident.personThumbnail ? (
                            <Avatar
                              src={incident.personThumbnail}
                              sx={{
                                width: 60,
                                height: 60,
                                border: `2px solid ${severityColor}`
                              }}
                            />
                          ) : (
                            <Box
                              sx={{
                                width: 60,
                                height: 60,
                                borderRadius: '50%',
                                backgroundColor: severityColor,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '24px'
                              }}
                            >
                              🚨
                            </Box>
                          )}
                          
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              variant="h6"
                              sx={{
                                color: '#ffffff',
                                fontWeight: 700,
                                fontFamily: 'monospace',
                                fontSize: '14px',
                                mb: 0.5
                              }}
                            >
                              {incident.title}
                            </Typography>
                            
                            <Typography
                              variant="body2"
                              sx={{
                                color: '#cccccc',
                                fontFamily: 'monospace',
                                fontSize: '12px',
                                mb: 1
                              }}
                            >
                              {incident.description}
                            </Typography>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                              <Chip
                                icon={<LocationIcon sx={{ fontSize: 12 }} />}
                                label={incident.location}
                                size="small"
                                sx={{
                                  backgroundColor: alpha('#ffffff', 0.1),
                                  color: '#ffffff',
                                  fontSize: '10px',
                                  fontFamily: 'monospace'
                                }}
                              />
                              
                              <Chip
                                icon={<TimeIcon sx={{ fontSize: 12 }} />}
                                label={`${Math.floor((Date.now() - incident.timestamp.getTime()) / 60000)}m ago`}
                                size="small"
                                sx={{
                                  backgroundColor: alpha('#ffffff', 0.1),
                                  color: '#ffffff',
                                  fontSize: '10px',
                                  fontFamily: 'monospace'
                                }}
                              />

                              {incident.confidence && (
                                <Chip
                                  label={`${Math.round(incident.confidence * 100)}% AI`}
                                  size="small"
                                  sx={{
                                    backgroundColor: alpha(severityColor, 0.2),
                                    color: severityColor,
                                    fontSize: '10px',
                                    fontFamily: 'monospace',
                                    fontWeight: 700
                                  }}
                                />
                              )}
                            </Box>
                          </Box>
                        </Box>

                        {/* Progress Indicator */}
                        <Box sx={{ mb: 2 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              color: '#888888',
                              fontFamily: 'monospace',
                              fontSize: '10px'
                            }}
                          >
                            RESPONSE PROGRESS: {completedActions}/{totalActions} ACTIONS COMPLETED
                          </Typography>
                          <Box
                            sx={{
                              width: '100%',
                              height: 6,
                              backgroundColor: alpha('#ffffff', 0.1),
                              borderRadius: 3,
                              mt: 0.5,
                              overflow: 'hidden'
                            }}
                          >
                            <Box
                              sx={{
                                width: `${(completedActions / totalActions) * 100}%`,
                                height: '100%',
                                backgroundColor: completedActions === totalActions ? '#00ff00' : '#ffaa00',
                                transition: 'width 0.3s ease'
                              }}
                            />
                          </Box>
                        </Box>

                        {/* Quick Actions */}
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {incident.actions
                            .filter(action => !action.completed)
                            .slice(0, 2)
                            .map((action) => (
                              <Button
                                key={action.id}
                                variant="contained"
                                size="small"
                                onClick={() => handleQuickAction(incident, action.type)}
                                sx={{
                                  backgroundColor: severityColor,
                                  color: '#ffffff',
                                  fontWeight: 700,
                                  fontSize: '10px',
                                  fontFamily: 'monospace',
                                  textTransform: 'none',
                                  '&:hover': {
                                    backgroundColor: alpha(severityColor, 0.8)
                                  }
                                }}
                              >
                                ⚡ {action.label}
                              </Button>
                            ))}
                        </Box>
                      </CardContent>

                      <CardActions sx={{ pt: 0, px: 2, pb: 2 }}>
                        <Button
                          startIcon={<PlayArrowIcon />}
                          onClick={() => handleStartResponse(incident)}
                          sx={{
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: '11px',
                            fontFamily: 'monospace'
                          }}
                        >
                          MANAGE
                        </Button>
                        
                        <Button
                          startIcon={<VisibilityIcon />}
                          onClick={() => handleViewEvidence(incident)}
                          sx={{
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: '11px',
                            fontFamily: 'monospace'
                          }}
                        >
                          EVIDENCE
                        </Button>

                        {incident.status === 'in_progress' && (
                          <Button
                            startIcon={<CheckCircleIcon />}
                            onClick={() => handleResolveIncident(incident)}
                            sx={{
                              color: '#00ff00',
                              fontWeight: 700,
                              fontSize: '11px',
                              fontFamily: 'monospace'
                            }}
                          >
                            RESOLVE
                          </Button>
                        )}
                      </CardActions>
                    </Card>
                  </Grid>
                );
              })}
          </Grid>
        )}
      </Box>

      {/* Response Management Dialog */}
      <Dialog
        open={responseDialogOpen}
        onClose={() => setResponseDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#1a1a1a',
            border: '2px solid #444444'
          }
        }}
      >
        <DialogTitle
          sx={{
            color: '#ffffff',
            fontFamily: 'monospace',
            fontWeight: 700,
            borderBottom: '1px solid #444444'
          }}
        >
          🚨 INCIDENT RESPONSE: {selectedIncident?.title}
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          {selectedIncident && (
            <Box>
              {/* Action Checklist */}
              <Typography
                variant="h6"
                sx={{
                  color: '#ffffff',
                  fontFamily: 'monospace',
                  mb: 2,
                  fontSize: '14px'
                }}
              >
                📋 RESPONSE ACTIONS
              </Typography>
              
              <List>
                {selectedIncident.actions.map((action) => (
                  <ListItem
                    key={action.id}
                    sx={{
                      backgroundColor: action.completed 
                        ? alpha('#00ff00', 0.1) 
                        : alpha('#ffaa00', 0.1),
                      border: `1px solid ${action.completed ? '#00ff00' : '#ffaa00'}`,
                      borderRadius: 1,
                      mb: 1
                    }}
                  >
                    <ListItemIcon>
                      {action.completed ? (
                        <CheckCircleIcon sx={{ color: '#00ff00' }} />
                      ) : (
                        <WarningIcon sx={{ color: '#ffaa00' }} />
                      )}
                    </ListItemIcon>
                    
                    <ListItemText
                      primary={
                        <Typography
                          sx={{
                            color: '#ffffff',
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            fontSize: '12px'
                          }}
                        >
                          {action.label}
                        </Typography>
                      }
                      secondary={
                        <Typography
                          sx={{
                            color: '#cccccc',
                            fontFamily: 'monospace',
                            fontSize: '11px'
                          }}
                        >
                          {action.description}
                          {action.completed && action.timestamp && (
                            <span style={{ color: '#00ff00' }}>
                              {' '}• Completed at {action.timestamp.toLocaleTimeString()}
                            </span>
                          )}
                        </Typography>
                      }
                    />
                    
                    {!action.completed && (
                      <ListItemSecondaryAction>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleQuickAction(selectedIncident, action.type)}
                          sx={{
                            backgroundColor: '#ffaa00',
                            color: '#000000',
                            fontWeight: 700,
                            fontSize: '10px',
                            fontFamily: 'monospace'
                          }}
                        >
                          COMPLETE
                        </Button>
                      </ListItemSecondaryAction>
                    )}
                  </ListItem>
                ))}
              </List>

              <Divider sx={{ my: 3, backgroundColor: '#444444' }} />

              {/* Notes Section */}
              <Typography
                variant="h6"
                sx={{
                  color: '#ffffff',
                  fontFamily: 'monospace',
                  mb: 2,
                  fontSize: '14px'
                }}
              >
                📝 INCIDENT NOTES
              </Typography>

              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Add incident note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: alpha('#ffffff', 0.05),
                      color: '#ffffff',
                      fontFamily: 'monospace',
                      '& fieldset': {
                        borderColor: '#444444'
                      },
                      '&:hover fieldset': {
                        borderColor: '#666666'
                      }
                    }
                  }}
                />
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleAddNote}
                  disabled={!newNote.trim()}
                  sx={{
                    mt: 1,
                    backgroundColor: '#00ff00',
                    color: '#000000',
                    fontWeight: 700,
                    fontSize: '11px',
                    fontFamily: 'monospace'
                  }}
                >
                  ADD NOTE
                </Button>
              </Box>

              {selectedIncident.notes.length > 0 && (
                <Box
                  sx={{
                    maxHeight: 150,
                    overflowY: 'auto',
                    backgroundColor: alpha('#ffffff', 0.05),
                    border: '1px solid #444444',
                    borderRadius: 1,
                    p: 2
                  }}
                >
                  {selectedIncident.notes.map((note, index) => (
                    <Typography
                      key={index}
                      sx={{
                        color: '#cccccc',
                        fontFamily: 'monospace',
                        fontSize: '11px',
                        mb: 1,
                        '&:last-child': { mb: 0 }
                      }}
                    >
                      {note}
                    </Typography>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 2, borderTop: '1px solid #444444' }}>
          <Button
            onClick={() => setResponseDialogOpen(false)}
            sx={{
              color: '#ffffff',
              fontFamily: 'monospace',
              fontWeight: 700
            }}
          >
            CLOSE
          </Button>
        </DialogActions>
      </Dialog>

      {/* Evidence Viewer Dialog */}
      <Dialog
        open={evidenceDialogOpen}
        onClose={() => setEvidenceDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#1a1a1a',
            border: '2px solid #444444'
          }
        }}
      >
        <DialogTitle
          sx={{
            color: '#ffffff',
            fontFamily: 'monospace',
            fontWeight: 700,
            borderBottom: '1px solid #444444'
          }}
        >
          📹 EVIDENCE VIEWER: {selectedIncident?.title}
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          {selectedIncident && (
            <Box>
              <Typography
                variant="body2"
                sx={{
                  color: '#cccccc',
                  fontFamily: 'monospace',
                  mb: 3
                }}
              >
                📍 {selectedIncident.location} • 🕐 {selectedIncident.timestamp.toLocaleString()}
                {selectedIncident.confidence && (
                  <span style={{ color: '#ffaa00' }}>
                    {' '}• 🎯 AI Confidence: {Math.round(selectedIncident.confidence * 100)}%
                  </span>
                )}
              </Typography>

              {/* Evidence Placeholder - In real implementation, this would show actual video/images */}
              <Grid container spacing={2}>
                {selectedIncident.evidenceUrls?.map((url, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Paper
                      sx={{
                        height: 200,
                        backgroundColor: '#2a2a2a',
                        border: '2px solid #444444',
                        borderRadius: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff'
                      }}
                    >
                      <CameraIcon sx={{ fontSize: 48, mb: 1, color: '#666666' }} />
                      <Typography
                        sx={{
                          fontFamily: 'monospace',
                          fontSize: '12px',
                          color: '#888888'
                        }}
                      >
                        EVIDENCE FILE {index + 1}
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: 'monospace',
                          fontSize: '10px',
                          color: '#666666'
                        }}
                      >
                        {url.split('/').pop()}
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<PlayArrowIcon />}
                        sx={{
                          mt: 2,
                          color: '#ffffff',
                          borderColor: '#666666',
                          fontFamily: 'monospace',
                          fontSize: '10px'
                        }}
                      >
                        VIEW
                      </Button>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              {/* Simple Evidence Notes */}
              <Box sx={{ mt: 3 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: '#ffffff',
                    fontFamily: 'monospace',
                    mb: 1
                  }}
                >
                  📋 EVIDENCE SUMMARY
                </Typography>
                <Paper
                  sx={{
                    p: 2,
                    backgroundColor: alpha('#ffffff', 0.05),
                    border: '1px solid #444444'
                  }}
                >
                  <Typography
                    sx={{
                      color: '#cccccc',
                      fontFamily: 'monospace',
                      fontSize: '12px'
                    }}
                  >
                    • Camera footage from {selectedIncident.location}
                    <br />
                    • Incident duration: ~2 minutes
                    <br />
                    • AI detection confidence: {selectedIncident.confidence ? Math.round(selectedIncident.confidence * 100) : 'N/A'}%
                    <br />
                    • Evidence automatically preserved for investigation
                  </Typography>
                </Paper>
              </Box>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 2, borderTop: '1px solid #444444' }}>
          <Button
            onClick={() => setEvidenceDialogOpen(false)}
            sx={{
              color: '#ffffff',
              fontFamily: 'monospace',
              fontWeight: 700
            }}
          >
            CLOSE
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IncidentResponsePanel;