import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Psychology as PsychologyIcon,
  Visibility as VisibilityIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  Timeline as TimelineIcon,
  SmartToy as SmartToyIcon,
  VolumeUp as VolumeUpIcon,
  Face as FaceIcon,
  Store as StoreIcon
} from '@mui/icons-material';
import { useWebSocket } from '../../contexts/WebSocketContext';

interface CognitiveAgentStatus {
  status: 'active' | 'idle' | 'processing' | 'error';
  processingSpeed: number; // events per second
  memoryUsage: number; // percentage
  confidenceLevel: number; // percentage
  activeDecisions: number;
  totalDecisionsToday: number;
  threatLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
}

interface AIDecision {
  id: string;
  timestamp: string;
  eventType: 'vision' | 'audio' | 'multimodal';
  threatLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  decision: string;
  reasoning: string;
  cameraId: string;
  storeId: string;
  actionTaken: string;
}

interface ThreatAssessment {
  overallThreatLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  activeThreats: number;
  resolvedThreats: number;
  falsePositives: number;
  accuracy: number;
}

const CognitiveAgentDashboard: React.FC = () => {
  const [agentStatus, setAgentStatus] = useState<CognitiveAgentStatus>({
    status: 'active',
    processingSpeed: 15.7,
    memoryUsage: 68,
    confidenceLevel: 94.2,
    activeDecisions: 3,
    totalDecisionsToday: 127,
    threatLevel: 'medium'
  });

  const [recentDecisions, setRecentDecisions] = useState<AIDecision[]>([]);
  const [threatAssessment, setThreatAssessment] = useState<ThreatAssessment>({
    overallThreatLevel: 'medium',
    activeThreats: 2,
    resolvedThreats: 15,
    falsePositives: 1,
    accuracy: 96.8
  });

  const { socket } = useWebSocket();

  useEffect(() => {
    if (socket) {
      // Listen for cognitive agent updates
      socket.on('cognitive_agent_status', (status: CognitiveAgentStatus) => {
        setAgentStatus(status);
      });

      socket.on('ai_decision', (decision: AIDecision) => {
        setRecentDecisions(prev => [decision, ...prev.slice(0, 9)]);
      });

      socket.on('threat_assessment', (assessment: ThreatAssessment) => {
        setThreatAssessment(assessment);
      });

      // Request initial data
      socket.emit('get_cognitive_agent_status');
      socket.emit('get_recent_decisions');
      socket.emit('get_threat_assessment');

      return () => {
        socket.off('cognitive_agent_status');
        socket.off('ai_decision');
        socket.off('threat_assessment');
      };
    }
  }, [socket]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'processing': return 'warning';
      case 'idle': return 'info';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'none': return '#4caf50';
      case 'low': return '#2196f3';
      case 'medium': return '#ff9800';
      case 'high': return '#f44336';
      case 'critical': return '#9c27b0';
      default: return '#757575';
    }
  };

  const getThreatIcon = (level: string) => {
    switch (level) {
      case 'none': return <CheckCircleIcon />;
      case 'low': return <VisibilityIcon />;
      case 'medium': return <WarningIcon />;
      case 'high': return <ErrorIcon />;
      case 'critical': return <ErrorIcon />;
      default: return <CheckCircleIcon />;
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'vision': return <VisibilityIcon />;
      case 'audio': return <VolumeUpIcon />;
      case 'multimodal': return <SmartToyIcon />;
      default: return <VisibilityIcon />;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <PsychologyIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
        <Typography variant="h4" gutterBottom>
          Cognitive AI Security Agent
        </Typography>
        <Chip 
          label={agentStatus.status.toUpperCase()} 
          color={getStatusColor(agentStatus.status) as any}
          sx={{ ml: 2 }}
        />
      </Box>

      <Grid container spacing={3}>
        {/* Agent Status Panel */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Agent Performance
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <SpeedIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="body2">Processing Speed</Typography>
                </Box>
                <Typography variant="h5" color="primary">
                  {agentStatus.processingSpeed} events/sec
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <MemoryIcon sx={{ mr: 1, color: 'warning.main' }} />
                  <Typography variant="body2">Memory Usage</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={agentStatus.memoryUsage} 
                  sx={{ mb: 1 }}
                />
                <Typography variant="body2" color="textSecondary">
                  {agentStatus.memoryUsage}%
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PsychologyIcon sx={{ mr: 1, color: 'success.main' }} />
                  <Typography variant="body2">Confidence Level</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={agentStatus.confidenceLevel} 
                  color="success"
                  sx={{ mb: 1 }}
                />
                <Typography variant="body2" color="textSecondary">
                  {agentStatus.confidenceLevel}%
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Active Decisions
                  </Typography>
                  <Typography variant="h6">
                    {agentStatus.activeDecisions}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Today's Total
                  </Typography>
                  <Typography variant="h6">
                    {agentStatus.totalDecisionsToday}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Threat Assessment */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Threat Assessment
              </Typography>

              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Avatar 
                  sx={{ 
                    width: 80, 
                    height: 80, 
                    bgcolor: getThreatColor(threatAssessment.overallThreatLevel),
                    mx: 'auto',
                    mb: 2
                  }}
                >
                  {getThreatIcon(threatAssessment.overallThreatLevel)}
                </Avatar>
                <Typography variant="h5" sx={{ textTransform: 'capitalize' }}>
                  {threatAssessment.overallThreatLevel} Threat Level
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'error.dark' }}>
                    <Typography variant="h4" color="white">
                      {threatAssessment.activeThreats}
                    </Typography>
                    <Typography variant="body2" color="white">
                      Active Threats
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.dark' }}>
                    <Typography variant="h4" color="white">
                      {threatAssessment.resolvedThreats}
                    </Typography>
                    <Typography variant="body2" color="white">
                      Resolved Today
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Detection Accuracy
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={threatAssessment.accuracy} 
                  color="info"
                  sx={{ mb: 1 }}
                />
                <Typography variant="body2" color="textSecondary">
                  {threatAssessment.accuracy}% (False Positives: {threatAssessment.falsePositives})
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent AI Decisions */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent AI Decisions
              </Typography>
              
              <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                {recentDecisions.map((decision, index) => (
                  <React.Fragment key={decision.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: getThreatColor(decision.threatLevel) }}>
                          {getEventTypeIcon(decision.eventType)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" component="span">
                              {decision.decision}
                            </Typography>
                            <Chip 
                              label={`${decision.confidence}%`} 
                              size="small" 
                              color="primary"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" color="textSecondary">
                              {decision.reasoning}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                              <StoreIcon sx={{ fontSize: 12 }} />
                              <Typography variant="caption">
                                {decision.cameraId} • {new Date(decision.timestamp).toLocaleTimeString()}
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < recentDecisions.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* AI Decision Timeline */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TimelineIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">
                  Real-time Decision Timeline
                </Typography>
                <Tooltip title="AI decisions are processed and displayed in real-time">
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <PsychologyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              
              <Box sx={{ 
                height: 200, 
                bgcolor: 'background.paper', 
                border: 1, 
                borderColor: 'divider',
                borderRadius: 1,
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Typography variant="body2" color="textSecondary">
                  Real-time AI decision visualization will appear here
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CognitiveAgentDashboard;