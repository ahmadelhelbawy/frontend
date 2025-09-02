/**
 * IncidentPopupSystem - Advanced incident management with snapshots and timeline
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Avatar,
  Stack,
  Paper,
  IconButton,
  Tooltip,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Card,
  CardMedia,
  CardContent,
  Grid,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
  Divider,
  Badge,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tabs,
  Tab,
  useTheme,
  alpha
} from '@mui/material';
import {
  Close as CloseIcon,
  Warning as WarningIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  CameraAlt as CameraIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Print as PrintIcon,
  ExpandMore as ExpandMoreIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  SkipNext as NextIcon,
  SkipPrevious as PrevIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  FullscreenIcon,
  Visibility as EyeIcon,
  Flag as FlagIcon,
  Check as CheckIcon,
  PersonSearch as InvestigateIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

interface IncidentSnapshot {
  id: string;
  timestamp: string;
  imageUrl: string;
  cameraId: string;
  cameraName: string;
  detectionType: string;
  confidence: number;
  boundingBoxes: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
    confidence: number;
  }>;
  metadata: {
    personCount: number;
    suspiciousActivity: string[];
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  };
}

interface IncidentTimeline {
  timestamp: string;
  event: string;
  description: string;
  actor: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  icon: React.ReactNode;
  metadata?: any;
}

interface Incident {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'investigating' | 'resolved' | 'false_positive';
  timestamp: string;
  location: string;
  cameraIds: string[];
  assignedTo?: string;
  tags: string[];
  snapshots: IncidentSnapshot[];
  timeline: IncidentTimeline[];
  aiAnalysis: {
    confidence: number;
    riskAssessment: string;
    recommendations: string[];
    suspiciousPatterns: string[];
  };
  evidence: {
    videoClips: string[];
    images: string[];
    audioClips: string[];
  };
}

interface IncidentPopupProps {
  incident: Incident | null;
  open: boolean;
  onClose: () => void;
  onAction: (incidentId: string, action: string, data?: any) => void;
}

const IncidentPopupSystem: React.FC<IncidentPopupProps> = ({
  incident,
  open,
  onClose,
  onAction
}) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedSnapshot, setSelectedSnapshot] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isPlayingTimeline, setIsPlayingTimeline] = useState(false);
  const [timelinePosition, setTimelinePosition] = useState(0);

  if (!incident) return null;

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleAction = (action: string, data?: any) => {
    onAction(incident.id, action, data);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return theme.palette.error.main;
      case 'high': return theme.palette.warning.main;
      case 'medium': return theme.palette.info.main;
      case 'low': return theme.palette.success.main;
      default: return theme.palette.grey[500];
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <FlagIcon />;
      case 'investigating': return <InvestigateIcon />;
      case 'resolved': return <CheckIcon />;
      case 'false_positive': return <CloseIcon />;
      default: return <FlagIcon />;
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <Dialog
          open={open}
          onClose={onClose}
          maxWidth="xl"
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(71, 85, 105, 0.3)',
              borderRadius: 3,
              minHeight: '80vh'
            }
          }}
          TransitionComponent={motion.div}
          TransitionProps={{
            initial: { opacity: 0, scale: 0.9, y: 50 },
            animate: { opacity: 1, scale: 1, y: 0 },
            exit: { opacity: 0, scale: 0.9, y: 50 },
            transition: { duration: 0.3, type: "spring", stiffness: 300, damping: 30 }
          } as any}
        >
          {/* Header */}
          <DialogTitle sx={{ pb: 1 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={2} alignItems="center">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Avatar sx={{ bgcolor: getSeverityColor(incident.severity) }}>
                    <SecurityIcon />
                  </Avatar>
                </motion.div>
                
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {incident.title}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                    <Chip
                      icon={getStatusIcon(incident.status)}
                      label={incident.status.toUpperCase()}
                      size="small"
                      color={incident.status === 'resolved' ? 'success' : 'warning'}
                    />
                    <Chip
                      label={incident.severity.toUpperCase()}
                      size="small"
                      sx={{ 
                        backgroundColor: getSeverityColor(incident.severity),
                        color: 'white'
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {new Date(incident.timestamp).toLocaleString()}
                    </Typography>
                  </Stack>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1}>
                <Tooltip title="Download Report">
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <IconButton onClick={() => handleAction('download')}>
                      <DownloadIcon />
                    </IconButton>
                  </motion.div>
                </Tooltip>
                <Tooltip title="Share Incident">
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <IconButton onClick={() => handleAction('share')}>
                      <ShareIcon />
                    </IconButton>
                  </motion.div>
                </Tooltip>
                <Tooltip title="Print Report">
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <IconButton onClick={() => handleAction('print')}>
                      <PrintIcon />
                    </IconButton>
                  </motion.div>
                </Tooltip>
                <IconButton onClick={onClose}>
                  <CloseIcon />
                </IconButton>
              </Stack>
            </Stack>
          </DialogTitle>

          {/* Content Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab label="Overview" />
              <Tab label="Snapshots" />
              <Tab label="Timeline" />
              <Tab label="AI Analysis" />
              <Tab label="Evidence" />
            </Tabs>
          </Box>

          <DialogContent sx={{ p: 3, minHeight: 500 }}>
            <AnimatePresence mode="wait">
              {/* Overview Tab */}
              {activeTab === 0 && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>
                          Incident Details
                        </Typography>
                        <Stack spacing={2}>
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                              Description
                            </Typography>
                            <Typography variant="body1">
                              {incident.description}
                            </Typography>
                          </Box>
                          
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                              Location
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <LocationIcon fontSize="small" />
                              <Typography variant="body2">{incident.location}</Typography>
                            </Stack>
                          </Box>

                          <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                              Cameras Involved
                            </Typography>
                            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                              {incident.cameraIds.map(cameraId => (
                                <Chip
                                  key={cameraId}
                                  label={`Camera ${cameraId}`}
                                  size="small"
                                  variant="outlined"
                                  icon={<CameraIcon />}
                                />
                              ))}
                            </Stack>
                          </Box>

                          <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                              Tags
                            </Typography>
                            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                              {incident.tags.map(tag => (
                                <Chip
                                  key={tag}
                                  label={tag}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                              ))}
                            </Stack>
                          </Box>
                        </Stack>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Paper sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>
                          Quick Actions
                        </Typography>
                        <Stack spacing={2}>
                          <Button
                            variant="contained"
                            color="success"
                            fullWidth
                            startIcon={<CheckIcon />}
                            onClick={() => handleAction('resolve')}
                            disabled={incident.status === 'resolved'}
                          >
                            Mark as Resolved
                          </Button>
                          
                          <Button
                            variant="contained"
                            color="info"
                            fullWidth
                            startIcon={<InvestigateIcon />}
                            onClick={() => handleAction('investigate')}
                            disabled={incident.status === 'investigating'}
                          >
                            Start Investigation
                          </Button>
                          
                          <Button
                            variant="outlined"
                            color="warning"
                            fullWidth
                            onClick={() => handleAction('false_positive')}
                            disabled={incident.status === 'false_positive'}
                          >
                            Mark as False Positive
                          </Button>
                          
                          <Button
                            variant="outlined"
                            fullWidth
                            startIcon={<PersonIcon />}
                            onClick={() => handleAction('assign')}
                          >
                            Assign to Operator
                          </Button>
                        </Stack>

                        <Box sx={{ mt: 3 }}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            AI Confidence Score
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <LinearProgress
                              variant="determinate"
                              value={incident.aiAnalysis.confidence}
                              sx={{ 
                                flex: 1, 
                                height: 8, 
                                borderRadius: 4,
                                backgroundColor: alpha(theme.palette.primary.main, 0.2)
                              }}
                            />
                            <Typography variant="body2" fontWeight="bold">
                              {incident.aiAnalysis.confidence.toFixed(1)}%
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>
                  </Grid>
                </motion.div>
              )}

              {/* Snapshots Tab */}
              {activeTab === 1 && (
                <motion.div
                  key="snapshots"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Grid container spacing={2}>
                    {incident.snapshots.map((snapshot, index) => (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={snapshot.id}>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ y: -5 }}
                        >
                          <Card
                            sx={{
                              cursor: 'pointer',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              border: selectedSnapshot === snapshot.id ? '2px solid' : '1px solid',
                              borderColor: selectedSnapshot === snapshot.id ? 'primary.main' : 'divider',
                              '&:hover': {
                                boxShadow: 8,
                                borderColor: 'primary.main'
                              }
                            }}
                            onClick={() => setSelectedSnapshot(snapshot.id)}
                          >
                            <Box sx={{ position: 'relative' }}>
                              <CardMedia
                                component="img"
                                height="200"
                                image={snapshot.imageUrl || '/api/placeholder/400/300'}
                                alt={`Snapshot ${index + 1}`}
                                sx={{ 
                                  objectFit: 'cover',
                                  backgroundColor: '#1e293b'
                                }}
                              />
                              
                              {/* Detection Overlays */}
                              {snapshot.boundingBoxes.map((box, boxIndex) => (
                                <Box
                                  key={boxIndex}
                                  sx={{
                                    position: 'absolute',
                                    left: `${box.x}%`,
                                    top: `${box.y}%`,
                                    width: `${box.width}%`,
                                    height: `${box.height}%`,
                                    border: '2px solid #ff4444',
                                    backgroundColor: 'rgba(255, 68, 68, 0.1)',
                                    borderRadius: 1
                                  }}
                                >
                                  <Chip
                                    label={`${box.label} (${(box.confidence * 100).toFixed(1)}%)`}
                                    size="small"
                                    sx={{
                                      position: 'absolute',
                                      top: -24,
                                      left: 0,
                                      backgroundColor: '#ff4444',
                                      color: 'white',
                                      fontSize: '0.6rem',
                                      height: 20
                                    }}
                                  />
                                </Box>
                              ))}

                              {/* Timestamp Badge */}
                              <Chip
                                label={new Date(snapshot.timestamp).toLocaleTimeString()}
                                size="small"
                                sx={{
                                  position: 'absolute',
                                  bottom: 8,
                                  right: 8,
                                  backgroundColor: 'rgba(0,0,0,0.7)',
                                  color: 'white',
                                  fontSize: '0.7rem'
                                }}
                              />

                              {/* Risk Level Indicator */}
                              <Chip
                                label={snapshot.metadata.riskLevel.toUpperCase()}
                                size="small"
                                sx={{
                                  position: 'absolute',
                                  top: 8,
                                  right: 8,
                                  backgroundColor: getSeverityColor(snapshot.metadata.riskLevel),
                                  color: 'white',
                                  fontSize: '0.7rem'
                                }}
                              />
                            </Box>

                            <CardContent sx={{ p: 2 }}>
                              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                {snapshot.cameraName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {snapshot.detectionType} • {snapshot.metadata.personCount} person(s)
                              </Typography>
                              
                              <Box sx={{ mt: 1 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={snapshot.confidence}
                                  sx={{ 
                                    height: 4, 
                                    borderRadius: 2,
                                    backgroundColor: alpha(theme.palette.success.main, 0.2)
                                  }}
                                />
                                <Typography variant="caption" color="text.secondary">
                                  Confidence: {snapshot.confidence.toFixed(1)}%
                                </Typography>
                              </Box>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </Grid>
                    ))}
                  </Grid>

                  {/* Selected Snapshot Viewer */}
                  <AnimatePresence>
                    {selectedSnapshot && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                          position: 'fixed',
                          top: 0,
                          left: 0,
                          width: '100vw',
                          height: '100vh',
                          backgroundColor: 'rgba(0,0,0,0.9)',
                          zIndex: 2000,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onClick={() => setSelectedSnapshot(null)}
                      >
                        <motion.div
                          initial={{ scale: 0.8 }}
                          animate={{ scale: zoomLevel }}
                          style={{ maxWidth: '90%', maxHeight: '90%' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <img
                            src={incident.snapshots.find(s => s.id === selectedSnapshot)?.imageUrl || ''}
                            alt="Full size snapshot"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain'
                            }}
                          />
                        </motion.div>

                        {/* Zoom Controls */}
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 20,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            display: 'flex',
                            gap: 1,
                            backgroundColor: 'rgba(0,0,0,0.7)',
                            borderRadius: 2,
                            p: 1
                          }}
                        >
                          <IconButton onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}>
                            <ZoomOutIcon sx={{ color: 'white' }} />
                          </IconButton>
                          <Typography sx={{ color: 'white', px: 2, alignSelf: 'center' }}>
                            {Math.round(zoomLevel * 100)}%
                          </Typography>
                          <IconButton onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.25))}>
                            <ZoomInIcon sx={{ color: 'white' }} />
                          </IconButton>
                        </Box>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* Timeline Tab */}
              {activeTab === 2 && (
                <motion.div
                  key="timeline"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Paper sx={{ p: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                      <Typography variant="h6">Incident Timeline</Typography>
                      
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          onClick={() => setIsPlayingTimeline(!isPlayingTimeline)}
                          color="primary"
                        >
                          {isPlayingTimeline ? <PauseIcon /> : <PlayIcon />}
                        </IconButton>
                        <IconButton onClick={() => setTimelinePosition(Math.max(0, timelinePosition - 1))}>
                          <PrevIcon />
                        </IconButton>
                        <IconButton onClick={() => setTimelinePosition(Math.min(incident.timeline.length - 1, timelinePosition + 1))}>
                          <NextIcon />
                        </IconButton>
                      </Stack>
                    </Stack>

                    <Timeline>
                      {incident.timeline.map((event, index) => (
                        <TimelineItem key={index}>
                          <TimelineOppositeContent sx={{ m: 'auto 0' }}>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(event.timestamp).toLocaleTimeString()}
                            </Typography>
                          </TimelineOppositeContent>
                          
                          <TimelineSeparator>
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ 
                                scale: timelinePosition >= index ? 1 : 0.5,
                                backgroundColor: timelinePosition === index ? getSeverityColor(event.severity) : undefined
                              }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <TimelineDot color={event.severity as any}>
                                {event.icon}
                              </TimelineDot>
                            </motion.div>
                            {index < incident.timeline.length - 1 && <TimelineConnector />}
                          </TimelineSeparator>
                          
                          <TimelineContent sx={{ py: '12px', px: 2 }}>
                            <motion.div
                              initial={{ opacity: 0.5 }}
                              animate={{ opacity: timelinePosition >= index ? 1 : 0.5 }}
                            >
                              <Typography variant="subtitle2" component="span">
                                {event.event}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {event.description}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                by {event.actor}
                              </Typography>
                            </motion.div>
                          </TimelineContent>
                        </TimelineItem>
                      ))}
                    </Timeline>
                  </Paper>
                </motion.div>
              )}

              {/* AI Analysis Tab */}
              {activeTab === 3 && (
                <motion.div
                  key="analysis"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                          AI Risk Assessment
                        </Typography>
                        <Typography variant="body1" paragraph>
                          {incident.aiAnalysis.riskAssessment}
                        </Typography>
                        
                        <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                          Recommendations
                        </Typography>
                        <List dense>
                          {incident.aiAnalysis.recommendations.map((rec, index) => (
                            <ListItem key={index}>
                              <ListItemIcon>
                                <CheckIcon color="success" />
                              </ListItemIcon>
                              <ListItemText primary={rec} />
                            </ListItem>
                          ))}
                        </List>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                          Suspicious Patterns
                        </Typography>
                        <Stack spacing={1}>
                          {incident.aiAnalysis.suspiciousPatterns.map((pattern, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <Chip
                                label={pattern}
                                color="warning"
                                variant="outlined"
                                icon={<WarningIcon />}
                                sx={{ margin: 0.5 }}
                              />
                            </motion.div>
                          ))}
                        </Stack>
                      </Paper>
                    </Grid>
                  </Grid>
                </motion.div>
              )}

              {/* Evidence Tab */}
              {activeTab === 4 && (
                <motion.div
                  key="evidence"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                          Video Evidence
                        </Typography>
                        <Stack spacing={1}>
                          {incident.evidence.videoClips.map((clip, index) => (
                            <Button
                              key={index}
                              variant="outlined"
                              fullWidth
                              startIcon={<PlayIcon />}
                              onClick={() => handleAction('play_video', clip)}
                            >
                              Video Clip {index + 1}
                            </Button>
                          ))}
                        </Stack>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                          Image Evidence
                        </Typography>
                        <Stack spacing={1}>
                          {incident.evidence.images.map((image, index) => (
                            <Button
                              key={index}
                              variant="outlined"
                              fullWidth
                              startIcon={<EyeIcon />}
                              onClick={() => handleAction('view_image', image)}
                            >
                              Image {index + 1}
                            </Button>
                          ))}
                        </Stack>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                          Audio Evidence
                        </Typography>
                        <Stack spacing={1}>
                          {incident.evidence.audioClips.map((audio, index) => (
                            <Button
                              key={index}
                              variant="outlined"
                              fullWidth
                              startIcon={<PlayIcon />}
                              onClick={() => handleAction('play_audio', audio)}
                            >
                              Audio Clip {index + 1}
                            </Button>
                          ))}
                        </Stack>
                      </Paper>
                    </Grid>
                  </Grid>
                </motion.div>
              )}
            </AnimatePresence>
          </DialogContent>

          {/* Footer Actions */}
          <DialogActions sx={{ p: 3, backgroundColor: 'rgba(30, 41, 59, 0.5)' }}>
            <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
              <Button onClick={onClose} color="inherit">
                Close
              </Button>
              
              <Box sx={{ flex: 1 }} />
              
              <Button
                variant="contained"
                color="success"
                onClick={() => handleAction('resolve')}
                disabled={incident.status === 'resolved'}
              >
                Resolve Incident
              </Button>
              
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleAction('export_report')}
              >
                Export Report
              </Button>
            </Stack>
          </DialogActions>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default IncidentPopupSystem;
