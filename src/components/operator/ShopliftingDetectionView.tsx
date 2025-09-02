/**
 * ShopliftingDetectionView - Real-time shoplifting detection monitoring component
 * 
 * Features:
 * - Live camera feeds with AI detection overlays
 * - Real-time suspicious behavior alerts
 * - Theft probability indicators
 * - Behavior pattern analysis
 * - Incident capturing (5-15 second clips)
 * - Customer and employee differentiation
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Chip,
  Button,
  IconButton,
  Paper,
  Alert,
  AlertTitle,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  LinearProgress,
  Tooltip,
  Badge,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Avatar,
  useTheme,
  alpha
} from '@mui/material';
import {
  Videocam,
  Warning,
  Person,
  PersonOutline,
  Security,
  Visibility,
  VisibilityOff,
  CameraAlt,
  RecordVoiceOver,
  Stop,
  PlayArrow,
  Pause,
  FullscreenExit,
  Fullscreen,
  Warning as AlertIcon,
  CheckCircle,
  Error,
  Download,
  Share,
  Block,
  Speed,
  Timeline,
  PersonPin,
  ShoppingCart,
  ExitToApp,
  AccessTime,
  TrendingUp,
  LocationOn,
  Settings,
  FilterList,
  Search,
  Refresh
} from '@mui/icons-material';

// Enhanced interfaces for shoplifting detection
interface DetectionBoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  class: string;
  class_id: number;
  tracking_id?: string;
}

interface BehaviorAnalysis {
  suspicious_movement: boolean;
  concealment_detected: boolean;
  nervous_behavior: boolean;
  exit_without_payment: boolean;
  item_manipulation: boolean;
  avoiding_staff: boolean;
  prolonged_interaction: boolean;
  bag_stuffing: boolean;
}

interface ShopliftingDetection {
  id: string;
  camera_id: string;
  camera_name: string;
  timestamp: string;
  risk_score: number; // 0-1
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  object_detections: DetectionBoundingBox[];
  behavior_analysis: BehaviorAnalysis;
  person_type: 'customer' | 'employee' | 'unknown';
  person_id?: string;
  incident_clip_url?: string;
  metadata: {
    location: string;
    duration_seconds: number;
    confidence: number;
    alert_triggered: boolean;
  };
}

interface PersonProfile {
  id: string;
  type: 'customer' | 'employee';
  name?: string;
  face_encoding?: string;
  first_seen: string;
  last_seen: string;
  total_visits: number;
  suspicious_incidents: number;
  employee_data?: {
    employee_id: string;
    department: string;
    shift_start: string;
    shift_end: string;
    break_times: string[];
  };
}

interface ShopliftingDetectionViewProps {
  cameras: any[];
  onIncidentAlert: (detection: ShopliftingDetection) => void;
  onPersonIdentified: (person: PersonProfile) => void;
}

const ShopliftingDetectionView: React.FC<ShopliftingDetectionViewProps> = ({
  cameras,
  onIncidentAlert,
  onPersonIdentified
}) => {
  const theme = useTheme();
  
  // State management
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [liveDetections, setLiveDetections] = useState<ShopliftingDetection[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [detectionSensitivity, setDetectionSensitivity] = useState(75);
  const [showPersonProfiles, setShowPersonProfiles] = useState(false);
  const [personProfiles, setPersonProfiles] = useState<PersonProfile[]>([]);
  const [incidentDialogOpen, setIncidentDialogOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<ShopliftingDetection | null>(null);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [behaviorFilter, setBehaviorFilter] = useState<string>('all');
  const [riskThreshold, setRiskThreshold] = useState(0.6);

  // Professional color scheme
  const colors = {
    primary: '#1e3a8a',
    secondary: '#3b82f6', 
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    critical: '#dc2626',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f8fafc',
    textSecondary: '#cbd5e1'
  };

  // Mock real-time detection data (in production, this would come from WebSocket)
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate new detections
      const mockDetection: ShopliftingDetection = {
        id: `detection_${Date.now()}`,
        camera_id: cameras[Math.floor(Math.random() * cameras.length)]?.id || 'cam-1',
        camera_name: `Camera ${Math.floor(Math.random() * cameras.length) + 1}`,
        timestamp: new Date().toISOString(),
        risk_score: Math.random(),
        risk_level: Math.random() > 0.8 ? 'critical' : Math.random() > 0.6 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
        object_detections: [
          {
            x: Math.random() * 500,
            y: Math.random() * 300,
            width: 80 + Math.random() * 40,
            height: 120 + Math.random() * 60,
            confidence: 0.7 + Math.random() * 0.3,
            class: Math.random() > 0.7 ? 'handbag' : 'person',
            class_id: Math.random() > 0.7 ? 1 : 0,
            tracking_id: `track_${Math.floor(Math.random() * 100)}`
          }
        ],
        behavior_analysis: {
          suspicious_movement: Math.random() > 0.8,
          concealment_detected: Math.random() > 0.85,
          nervous_behavior: Math.random() > 0.7,
          exit_without_payment: Math.random() > 0.9,
          item_manipulation: Math.random() > 0.75,
          avoiding_staff: Math.random() > 0.8,
          prolonged_interaction: Math.random() > 0.6,
          bag_stuffing: Math.random() > 0.85
        },
        person_type: Math.random() > 0.8 ? 'employee' : 'customer',
        metadata: {
          location: ['Electronics', 'Clothing', 'Cosmetics', 'Checkout'][Math.floor(Math.random() * 4)] || 'Unknown Location',
          duration_seconds: 5 + Math.random() * 10,
          confidence: 0.6 + Math.random() * 0.4,
          alert_triggered: Math.random() > 0.7
        }
      };

      // Only add detections that meet the risk threshold
      if (mockDetection.risk_score >= riskThreshold) {
        setLiveDetections(prev => [mockDetection, ...prev].slice(0, 50)); // Keep last 50 detections
        
        // Trigger alert for high-risk detections
        if (mockDetection.risk_score > 0.8 && alertsEnabled) {
          onIncidentAlert(mockDetection);
        }
      }
    }, 3000 + Math.random() * 2000); // 3-5 second intervals

    return () => clearInterval(interval);
  }, [cameras, riskThreshold, alertsEnabled, onIncidentAlert]);

  // Filter detections based on behavior filter
  const filteredDetections = useMemo(() => {
    if (behaviorFilter === 'all') return liveDetections;
    
    return liveDetections.filter(detection => {
      const behaviors = detection.behavior_analysis;
      switch (behaviorFilter) {
        case 'concealment':
          return behaviors.concealment_detected || behaviors.bag_stuffing;
        case 'suspicious':
          return behaviors.suspicious_movement || behaviors.nervous_behavior;
        case 'theft':
          return behaviors.exit_without_payment || behaviors.item_manipulation;
        case 'avoidance':
          return behaviors.avoiding_staff;
        default:
          return true;
      }
    });
  }, [liveDetections, behaviorFilter]);

  // Get risk color based on level
  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return colors.critical;
      case 'high': return colors.danger;
      case 'medium': return colors.warning;
      case 'low': return colors.success;
      default: return colors.textSecondary;
    }
  };

  // Handle incident click
  const handleIncidentClick = (detection: ShopliftingDetection) => {
    setSelectedIncident(detection);
    setIncidentDialogOpen(true);
  };

  // Generate incident report
  const generateIncidentReport = (detection: ShopliftingDetection) => {
    const report = {
      incident_id: detection.id,
      timestamp: detection.timestamp,
      camera: detection.camera_name,
      risk_assessment: {
        score: detection.risk_score,
        level: detection.risk_level
      },
      person_details: {
        type: detection.person_type,
        tracking_id: detection.object_detections[0]?.tracking_id
      },
      behaviors_detected: Object.entries(detection.behavior_analysis)
        .filter(([_, detected]) => detected)
        .map(([behavior, _]) => behavior.replace('_', ' ').toUpperCase()),
      location: detection.metadata.location,
      duration: detection.metadata.duration_seconds,
      evidence: {
        video_clip_url: detection.incident_clip_url || 'pending',
        screenshots: [`screenshot_${detection.id}_1.jpg`, `screenshot_${detection.id}_2.jpg`]
      }
    };

    console.log('Generated incident report:', report);
    // In production, this would be sent to the backend
  };

  return (
    <Box sx={{ p: 3, bgcolor: colors.background, minHeight: '100vh' }}>
      {/* Header Controls */}
      <Paper sx={{ p: 3, mb: 3, background: alpha(colors.surface, 0.9) }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h4" sx={{ color: colors.text, fontWeight: 700 }}>
              🚨 Real-time Shoplifting Detection
            </Typography>
            <Typography variant="body1" sx={{ color: colors.textSecondary, mt: 1 }}>
              AI-powered behavioral analysis and theft prevention monitoring
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <FormControlLabel
                control={
                  <Switch
                    checked={alertsEnabled}
                    onChange={(e) => setAlertsEnabled(e.target.checked)}
                    color="primary"
                  />
                }
                label="Live Alerts"
                sx={{ color: colors.text }}
              />
              
              <Button
                variant={isRecording ? "outlined" : "contained"}
                startIcon={isRecording ? <Stop /> : <RecordVoiceOver />}
                onClick={() => setIsRecording(!isRecording)}
                color={isRecording ? "error" : "primary"}
                sx={{ minWidth: 140 }}
              >
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </Button>
            </Stack>
          </Grid>
        </Grid>

        {/* Detection Controls */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: colors.text }}>Behavior Filter</InputLabel>
              <Select
                value={behaviorFilter}
                onChange={(e) => setBehaviorFilter(e.target.value)}
                sx={{ color: colors.text }}
              >
                <MenuItem value="all">All Behaviors</MenuItem>
                <MenuItem value="concealment">Concealment</MenuItem>
                <MenuItem value="suspicious">Suspicious Movement</MenuItem>
                <MenuItem value="theft">Theft Indicators</MenuItem>
                <MenuItem value="avoidance">Staff Avoidance</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="body2" sx={{ color: colors.text, mb: 1 }}>
              Risk Threshold: {Math.round(riskThreshold * 100)}%
            </Typography>
            <Slider
              value={riskThreshold}
              onChange={(_, value) => setRiskThreshold(value as number)}
              min={0}
              max={1}
              step={0.1}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
              sx={{ color: colors.secondary }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <Typography variant="body2" sx={{ color: colors.text, mb: 1 }}>
              Detection Sensitivity: {detectionSensitivity}%
            </Typography>
            <Slider
              value={detectionSensitivity}
              onChange={(_, value) => setDetectionSensitivity(value as number)}
              min={0}
              max={100}
              step={5}
              valueLabelDisplay="auto"
              sx={{ color: colors.warning }}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <Stack direction="row" spacing={1}>
              <IconButton
                onClick={() => setShowPersonProfiles(!showPersonProfiles)}
                sx={{ color: colors.text }}
              >
                <PersonPin />
              </IconButton>
              <IconButton sx={{ color: colors.text }}>
                <Refresh />
              </IconButton>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {/* Live Detections Feed */}
        <Grid item xs={12} md={8}>
          <Card sx={{ background: alpha(colors.surface, 0.9), height: 600 }}>
            <CardHeader
              title={
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Badge badgeContent={filteredDetections.length} color="error" max={99}>
                    <Security sx={{ color: colors.secondary }} />
                  </Badge>
                  <Typography variant="h6" sx={{ color: colors.text }}>
                    Live Detections
                  </Typography>
                  <Chip
                    label={`${filteredDetections.length} Active`}
                    color="primary"
                    size="small"
                  />
                </Stack>
              }
              sx={{ borderBottom: `1px solid ${alpha(colors.secondary, 0.2)}` }}
            />
            <CardContent sx={{ height: 500, overflow: 'auto', p: 0 }}>
              <List>
                {filteredDetections.map((detection) => (
                  <React.Fragment key={detection.id}>
                    <ListItem
                      button
                      onClick={() => handleIncidentClick(detection)}
                      sx={{
                        '&:hover': {
                          backgroundColor: alpha(colors.secondary, 0.1)
                        }
                      }}
                    >
                      <ListItemIcon>
                        <Badge
                          variant="dot"
                          color={detection.risk_level === 'critical' ? 'error' : 'warning'}
                        >
                          <Avatar
                            sx={{
                              bgcolor: getRiskColor(detection.risk_level),
                              width: 40,
                              height: 40
                            }}
                          >
                            {detection.person_type === 'employee' ? <PersonOutline /> : <Person />}
                          </Avatar>
                        </Badge>
                      </ListItemIcon>
                      
                      <ListItemText
                        primary={
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography
                              variant="subtitle2"
                              sx={{ color: colors.text, fontWeight: 600 }}
                            >
                              {detection.camera_name}
                            </Typography>
                            <Chip
                              label={detection.risk_level.toUpperCase()}
                              size="small"
                              sx={{
                                bgcolor: alpha(getRiskColor(detection.risk_level), 0.2),
                                color: getRiskColor(detection.risk_level),
                                fontWeight: 600
                              }}
                            />
                            <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                              Risk: {Math.round(detection.risk_score * 100)}%
                            </Typography>
                          </Stack>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                              {detection.metadata.location} • {detection.person_type.toUpperCase()}
                            </Typography>
                            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                              {Object.entries(detection.behavior_analysis)
                                .filter(([_, detected]) => detected)
                                .slice(0, 3)
                                .map(([behavior, _]) => (
                                  <Chip
                                    key={behavior}
                                    label={behavior.replace('_', ' ')}
                                    size="small"
                                    variant="outlined"
                                    sx={{
                                      color: colors.warning,
                                      borderColor: colors.warning,
                                      fontSize: '0.7rem'
                                    }}
                                  />
                                ))}
                            </Stack>
                          </Box>
                        }
                      />
                      
                      <ListItemSecondaryAction>
                        <Stack alignItems="flex-end" spacing={1}>
                          <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                            {new Date(detection.timestamp).toLocaleTimeString()}
                          </Typography>
                          {detection.metadata.alert_triggered && (
                            <AlertIcon sx={{ color: colors.danger, fontSize: 20 }} />
                          )}
                        </Stack>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
                
                {filteredDetections.length === 0 && (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <CheckCircle sx={{ fontSize: 48, color: colors.success, mb: 2 }} />
                    <Typography variant="h6" sx={{ color: colors.text }}>
                      No Suspicious Activity
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                      All monitored areas are secure
                    </Typography>
                  </Box>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Statistics and Quick Actions */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            {/* Risk Level Distribution */}
            <Card sx={{ background: alpha(colors.surface, 0.9) }}>
              <CardHeader
                title="Risk Distribution"
                titleTypographyProps={{ color: colors.text, variant: 'h6' }}
              />
              <CardContent>
                {['critical', 'high', 'medium', 'low'].map((level) => {
                  const count = liveDetections.filter(d => d.risk_level === level).length;
                  const percentage = liveDetections.length > 0 ? (count / liveDetections.length) * 100 : 0;
                  
                  return (
                    <Box key={level} sx={{ mb: 2 }}>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                        <Typography variant="body2" sx={{ color: colors.text, textTransform: 'capitalize' }}>
                          {level} Risk
                        </Typography>
                        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                          {count} ({Math.round(percentage)}%)
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={percentage}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: alpha(colors.textSecondary, 0.2),
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: getRiskColor(level),
                            borderRadius: 3
                          }
                        }}
                      />
                    </Box>
                  );
                })}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card sx={{ background: alpha(colors.surface, 0.9) }}>
              <CardHeader
                title="Quick Actions"
                titleTypographyProps={{ color: colors.text, variant: 'h6' }}
              />
              <CardContent>
                <Stack spacing={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Download />}
                    sx={{ color: colors.text }}
                  >
                    Export Incidents
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Timeline />}
                    sx={{ color: colors.text }}
                  >
                    View Analytics
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<PersonPin />}
                    onClick={() => setShowPersonProfiles(true)}
                    sx={{ color: colors.text }}
                  >
                    Person Database
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Settings />}
                    sx={{ color: colors.text }}
                  >
                    Detection Settings
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            {/* Real-time Statistics */}
            <Card sx={{ background: alpha(colors.surface, 0.9) }}>
              <CardHeader
                title="Live Statistics"
                titleTypographyProps={{ color: colors.text, variant: 'h6' }}
              />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="h4" sx={{ color: colors.danger, fontWeight: 700 }}>
                      {liveDetections.filter(d => d.risk_level === 'critical' || d.risk_level === 'high').length}
                    </Typography>
                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                      High Risk Events
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h4" sx={{ color: colors.warning, fontWeight: 700 }}>
                      {liveDetections.filter(d => d.person_type === 'customer').length}
                    </Typography>
                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                      Customer Events
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h4" sx={{ color: colors.success, fontWeight: 700 }}>
                      {liveDetections.filter(d => d.metadata.alert_triggered).length}
                    </Typography>
                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                      Alerts Triggered
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h4" sx={{ color: colors.secondary, fontWeight: 700 }}>
                      {cameras.filter(c => c.status === 'online').length}
                    </Typography>
                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                      Active Cameras
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {/* Incident Detail Dialog */}
      <Dialog
        open={incidentDialogOpen}
        onClose={() => setIncidentDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedIncident && (
          <>
            <DialogTitle>
              <Stack direction="row" alignItems="center" spacing={2}>
                <AlertIcon sx={{ color: getRiskColor(selectedIncident.risk_level) }} />
                <Typography variant="h6">
                  Shoplifting Incident Details
                </Typography>
                <Chip
                  label={selectedIncident.risk_level.toUpperCase()}
                  sx={{
                    bgcolor: alpha(getRiskColor(selectedIncident.risk_level), 0.2),
                    color: getRiskColor(selectedIncident.risk_level)
                  }}
                />
              </Stack>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Incident Information</Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell>Camera</TableCell>
                          <TableCell>{selectedIncident.camera_name}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Location</TableCell>
                          <TableCell>{selectedIncident.metadata.location}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Time</TableCell>
                          <TableCell>{new Date(selectedIncident.timestamp).toLocaleString()}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Person Type</TableCell>
                          <TableCell>
                            <Chip 
                              label={selectedIncident.person_type.toUpperCase()} 
                              size="small"
                              color={selectedIncident.person_type === 'employee' ? 'info' : 'default'}
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Duration</TableCell>
                          <TableCell>{selectedIncident.metadata.duration_seconds.toFixed(1)}s</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Risk Score</TableCell>
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Typography>{Math.round(selectedIncident.risk_score * 100)}%</Typography>
                              <LinearProgress
                                variant="determinate"
                                value={selectedIncident.risk_score * 100}
                                sx={{ flex: 1, height: 6, borderRadius: 3 }}
                              />
                            </Stack>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Detected Behaviors</Typography>
                  <Stack spacing={1}>
                    {Object.entries(selectedIncident.behavior_analysis).map(([behavior, detected]) => (
                      <Chip
                        key={behavior}
                        label={behavior.replace('_', ' ').toUpperCase()}
                        variant={detected ? 'filled' : 'outlined'}
                        color={detected ? 'error' : 'default'}
                        size="small"
                        icon={detected ? <CheckCircle /> : undefined}
                      />
                    ))}
                  </Stack>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setIncidentDialogOpen(false)}>
                Close
              </Button>
              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={() => generateIncidentReport(selectedIncident)}
              >
                Generate Report
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default ShopliftingDetectionView;
