import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  IconButton,
  useTheme,
  alpha,
  Tooltip,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Psychology as PsychologyIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  AccessTime as TimeIcon,
  Visibility as VisibilityIcon,
  ExpandMore as ExpandMoreIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';

interface AutonomousDecision {
  id: string;
  timestamp: Date;
  type: 'shoplifting_detection' | 'behavior_analysis' | 'face_recognition' | 'risk_assessment';
  action: 'alert_generated' | 'evidence_collected' | 'staff_notified' | 'monitoring_escalated';
  confidence: number;
  reasoning: string[];
  outcome: 'pending' | 'confirmed' | 'false_positive' | 'escalated';
  processingTime: number; // in milliseconds
  personId?: string;
  cameraId: string;
  cameraName: string;
  evidenceCollected: boolean;
}

interface AutonomousDecisionMonitorProps {
  onDecisionSelect: (decisionId: string) => void;
}

const AutonomousDecisionMonitor: React.FC<AutonomousDecisionMonitorProps> = ({
  onDecisionSelect
}) => {
  const theme = useTheme();
  const [decisions, setDecisions] = useState<AutonomousDecision[]>([]);
  const [expandedDecision, setExpandedDecision] = useState<string | null>(null);

  // Generate mock autonomous decisions
  useEffect(() => {
    const generateMockDecisions = () => {
      const mockData: AutonomousDecision[] = [
        {
          id: 'decision-001',
          timestamp: new Date(Date.now() - 2 * 60 * 1000),
          type: 'shoplifting_detection',
          action: 'alert_generated',
          confidence: 0.92,
          reasoning: [
            'Person detected concealing item in clothing',
            'Facial recognition matched known offender database',
            'Behavior pattern consistent with previous incidents',
            'High-value item detected in concealment area'
          ],
          outcome: 'confirmed',
          processingTime: 847,
          personId: 'person-001',
          cameraId: 'cam-electronics-02',
          cameraName: 'Electronics Section',
          evidenceCollected: true
        },
        {
          id: 'decision-002',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          type: 'behavior_analysis',
          action: 'monitoring_escalated',
          confidence: 0.78,
          reasoning: [
            'Extended loitering behavior detected (>10 minutes)',
            'Frequent glances toward security cameras',
            'Unusual movement patterns in high-value area',
            'No purchase intent indicators observed'
          ],
          outcome: 'pending',
          processingTime: 623,
          personId: 'person-002',
          cameraId: 'cam-electronics-02',
          cameraName: 'Electronics Section',
          evidenceCollected: false
        },
        {
          id: 'decision-003',
          timestamp: new Date(Date.now() - 8 * 60 * 1000),
          type: 'face_recognition',
          action: 'staff_notified',
          confidence: 0.87,
          reasoning: [
            'Facial recognition match with 87% confidence',
            'Person identified as John Doe (known offender)',
            'Previous incidents: 3 confirmed shoplifting cases',
            'Automatic staff notification triggered'
          ],
          outcome: 'escalated',
          processingTime: 234,
          personId: 'person-001',
          cameraId: 'cam-entrance-01',
          cameraName: 'Main Entrance',
          evidenceCollected: true
        },
        {
          id: 'decision-004',
          timestamp: new Date(Date.now() - 12 * 60 * 1000),
          type: 'risk_assessment',
          action: 'evidence_collected',
          confidence: 0.65,
          reasoning: [
            'Multiple persons detected in coordinated movement',
            'Suspicious timing patterns observed',
            'Group behavior analysis indicates potential coordination',
            'Precautionary evidence collection initiated'
          ],
          outcome: 'false_positive',
          processingTime: 1205,
          cameraId: 'cam-checkout-03',
          cameraName: 'Checkout Area',
          evidenceCollected: true
        }
      ];
      setDecisions(mockData);
    };

    generateMockDecisions();
    
    // Simulate new decisions every 30 seconds
    const interval = setInterval(() => {
      const newDecision: AutonomousDecision = {
        id: `decision-${Date.now()}`,
        timestamp: new Date(),
        type: ['shoplifting_detection', 'behavior_analysis', 'face_recognition', 'risk_assessment'][Math.floor(Math.random() * 4)] as any,
        action: ['alert_generated', 'evidence_collected', 'staff_notified', 'monitoring_escalated'][Math.floor(Math.random() * 4)] as any,
        confidence: 0.6 + Math.random() * 0.4,
        reasoning: [
          'AI analysis detected suspicious behavior pattern',
          'Confidence threshold exceeded for autonomous action',
          'Real-time processing completed in <1 second'
        ],
        outcome: 'pending',
        processingTime: Math.floor(Math.random() * 1000) + 200,
        cameraId: `cam-${Math.floor(Math.random() * 6) + 1}`,
        cameraName: ['Main Entrance', 'Electronics Section', 'Checkout Area'][Math.floor(Math.random() * 3)] || 'Unknown Camera',
        evidenceCollected: Math.random() > 0.5
      };
      
      setDecisions(prev => [newDecision, ...prev.slice(0, 9)]); // Keep only 10 most recent
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getDecisionTypeColor = (type: string) => {
    switch (type) {
      case 'shoplifting_detection': return theme.palette.error.main;
      case 'behavior_analysis': return theme.palette.warning.main;
      case 'face_recognition': return theme.palette.info.main;
      case 'risk_assessment': return theme.palette.primary.main;
      default: return theme.palette.grey[500];
    }
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'confirmed': return theme.palette.success.main;
      case 'false_positive': return theme.palette.error.main;
      case 'escalated': return theme.palette.warning.main;
      case 'pending': return theme.palette.info.main;
      default: return theme.palette.grey[500];
    }
  };

  const getDecisionIcon = (type: string) => {
    switch (type) {
      case 'shoplifting_detection': return <ErrorIcon />;
      case 'behavior_analysis': return <AssessmentIcon />;
      case 'face_recognition': return <CheckCircleIcon />;
      case 'risk_assessment': return <WarningIcon />;
      default: return <PsychologyIcon />;
    }
  };

  const formatProcessingTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ago`;
  };

  const pendingDecisions = decisions.filter(d => d.outcome === 'pending');
  const confirmedDecisions = decisions.filter(d => d.outcome === 'confirmed');

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: alpha(theme.palette.background.default, 0.5)
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
            AI Decision Monitor
          </Typography>
          <Chip
            icon={<PsychologyIcon />}
            label="Autonomous"
            size="small"
            color="primary"
            variant="filled"
          />
        </Box>

        {/* Quick Stats */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            size="small"
            label={`${pendingDecisions.length} Pending`}
            color="info"
            variant="outlined"
            sx={{ fontSize: '0.7rem' }}
          />
          <Chip
            size="small"
            label={`${confirmedDecisions.length} Confirmed`}
            color="success"
            variant="outlined"
            sx={{ fontSize: '0.7rem' }}
          />
        </Box>
      </Box>

      {/* Decision List */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {decisions.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: theme.palette.text.secondary
            }}
          >
            <PsychologyIcon sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="body2">No AI decisions</Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {decisions.map((decision) => (
              <ListItem
                key={decision.id}
                sx={{
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  backgroundColor: decision.outcome === 'pending' 
                    ? alpha(theme.palette.info.main, 0.05)
                    : 'transparent',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                    cursor: 'pointer'
                  },
                  flexDirection: 'column',
                  alignItems: 'stretch',
                  p: 0
                }}
              >
                {/* Main Decision Info */}
                <Box
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    width: '100%', 
                    p: 2,
                    cursor: 'pointer'
                  }}
                  onClick={() => onDecisionSelect(decision.id)}
                >
                  <Box sx={{ mr: 2 }}>
                    <Box
                      sx={{
                        color: getDecisionTypeColor(decision.type),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {getDecisionIcon(decision.type)}
                    </Box>
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 'bold',
                          color: theme.palette.text.primary,
                          flex: 1,
                          textTransform: 'capitalize'
                        }}
                      >
                        {decision.type.replace('_', ' ')}
                      </Typography>
                      <Chip
                        label={decision.outcome.toUpperCase()}
                        size="small"
                        sx={{
                          height: 16,
                          fontSize: '0.6rem',
                          backgroundColor: alpha(getOutcomeColor(decision.outcome), 0.1),
                          color: getOutcomeColor(decision.outcome),
                          border: `1px solid ${getOutcomeColor(decision.outcome)}`
                        }}
                      />
                    </Box>

                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', mb: 0.5 }}>
                      {decision.cameraName} • {decision.action.replace('_', ' ')}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <TimeIcon sx={{ fontSize: 12 }} />
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        {formatTimeAgo(decision.timestamp)}
                      </Typography>
                      <SpeedIcon sx={{ fontSize: 12 }} />
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        {formatProcessingTime(decision.processingTime)}
                      </Typography>
                    </Box>

                    {/* Confidence Bar */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary, minWidth: 60 }}>
                        {Math.round(decision.confidence * 100)}% conf
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={decision.confidence * 100}
                        sx={{
                          flex: 1,
                          height: 4,
                          borderRadius: 2,
                          backgroundColor: alpha(theme.palette.grey[300], 0.3),
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: getDecisionTypeColor(decision.type)
                          }
                        }}
                      />
                    </Box>
                  </Box>

                  <Box sx={{ ml: 1 }}>
                    <Tooltip title="View Decision Details">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedDecision(expandedDecision === decision.id ? null : decision.id);
                        }}
                      >
                        <ExpandMoreIcon 
                          sx={{ 
                            fontSize: 16,
                            transform: expandedDecision === decision.id ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s'
                          }} 
                        />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                {/* Expanded Decision Details */}
                {expandedDecision === decision.id && (
                  <Box
                    sx={{
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                      p: 2,
                      borderTop: `1px solid ${theme.palette.divider}`
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      AI Reasoning:
                    </Typography>
                    <List dense sx={{ pl: 0 }}>
                      {decision.reasoning.map((reason, index) => (
                        <ListItem key={index} sx={{ pl: 0, py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 20 }}>
                            <Box
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                backgroundColor: getDecisionTypeColor(decision.type)
                              }}
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                {reason}
                              </Typography>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>

                    <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                      {decision.evidenceCollected && (
                        <Chip
                          label="Evidence Collected"
                          size="small"
                          color="success"
                          variant="outlined"
                          sx={{ fontSize: '0.6rem' }}
                        />
                      )}
                      <Chip
                        label={`${formatProcessingTime(decision.processingTime)} processing`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.6rem' }}
                      />
                    </Box>
                  </Box>
                )}
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
};

export default AutonomousDecisionMonitor;