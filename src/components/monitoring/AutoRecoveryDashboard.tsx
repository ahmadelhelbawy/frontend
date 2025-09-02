/**
 * AutoRecoveryDashboard - Self-Healing System Monitoring
 * Features: Real-time recovery status, predictive alerts, system health visualization
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
  Alert,
  AlertTitle,
  Collapse,
  Divider,
  Paper,
  CircularProgress,
  Badge,
  alpha,
  useTheme
} from '@mui/material';
import {
  Healing as HealingIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon,
  Wifi as WifiIcon,
  Speed as SpeedIcon,
  Timeline as TimelineIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  AutoFixHigh as AutoFixHighIcon,
  Psychology as PsychologyIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import SelfHealingService, { 
  SystemFailure, 
  RecoveryResult, 
  FailurePrediction, 
  SystemMetrics 
} from '../../services/SelfHealingService';

interface RecoveryStatus {
  status: 'healthy' | 'recovering' | 'degraded' | 'critical';
  activeRecoveries: number;
  totalRecoveries: number;
  successRate: number;
  lastRecovery?: Date;
}

const AutoRecoveryDashboard: React.FC = () => {
  const theme = useTheme();
  const [selfHealingService] = useState(() => new SelfHealingService());
  const [recoveryStatus, setRecoveryStatus] = useState<RecoveryStatus>({
    status: 'healthy',
    activeRecoveries: 0,
    totalRecoveries: 0,
    successRate: 100
  });
  const [activeRecoveries, setActiveRecoveries] = useState<Map<string, RecoveryResult>>(new Map());
  const [systemHealth, setSystemHealth] = useState<SystemMetrics | null>(null);
  const [failurePredictions, setFailurePredictions] = useState<FailurePrediction[]>([]);
  const [failureHistory, setFailureHistory] = useState<SystemFailure[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));

  useEffect(() => {
    // Initialize self-healing service
    selfHealingService.startSelfHealing();

    // Set up event listeners
    selfHealingService.on('failureDetected', handleFailureDetected);
    selfHealingService.on('recoveryStarted', handleRecoveryStarted);
    selfHealingService.on('recoveryCompleted', handleRecoveryCompleted);
    selfHealingService.on('recoveryFailed', handleRecoveryFailed);
    selfHealingService.on('failurePredicted', handleFailurePredicted);

    // Start monitoring intervals
    const statusInterval = setInterval(updateRecoveryStatus, 5000);
    const predictionsInterval = setInterval(updatePredictions, 30000);

    return () => {
      selfHealingService.stopSelfHealing();
      selfHealingService.removeAllListeners();
      clearInterval(statusInterval);
      clearInterval(predictionsInterval);
    };
  }, [selfHealingService]);

  const handleFailureDetected = (failure: SystemFailure) => {
    setFailureHistory(prev => [failure, ...prev.slice(0, 9)]);
    updateRecoveryStatus();
  };

  const handleRecoveryStarted = ({ failure, recoveryId }: { failure: SystemFailure; recoveryId: string }) => {
    setRecoveryStatus(prev => ({
      ...prev,
      status: 'recovering',
      activeRecoveries: prev.activeRecoveries + 1
    }));
  };

  const handleRecoveryCompleted = ({ failure, result, recoveryId }: { 
    failure: SystemFailure; 
    result: RecoveryResult; 
    recoveryId: string 
  }) => {
    setActiveRecoveries(prev => {
      const updated = new Map(prev);
      updated.set(recoveryId, result);
      return updated;
    });
    
    setRecoveryStatus(prev => ({
      ...prev,
      status: 'healthy',
      activeRecoveries: Math.max(0, prev.activeRecoveries - 1),
      totalRecoveries: prev.totalRecoveries + 1,
      lastRecovery: new Date()
    }));
  };

  const handleRecoveryFailed = ({ failure, error }: { failure: SystemFailure; error: Error }) => {
    setRecoveryStatus(prev => ({
      ...prev,
      status: 'degraded',
      activeRecoveries: Math.max(0, prev.activeRecoveries - 1)
    }));
  };

  const handleFailurePredicted = (prediction: FailurePrediction) => {
    setFailurePredictions(prev => [prediction, ...prev.slice(0, 4)]);
  };

  const updateRecoveryStatus = async () => {
    const activeRecoveries = selfHealingService.getActiveRecoveries();
    const failureHistory = selfHealingService.getFailureHistory();
    
    setActiveRecoveries(activeRecoveries);
    
    const successfulRecoveries = Array.from(activeRecoveries.values()).filter(r => r.success).length;
    const totalRecoveries = activeRecoveries.size;
    const successRate = totalRecoveries > 0 ? (successfulRecoveries / totalRecoveries) * 100 : 100;
    
    setRecoveryStatus(prev => ({
      ...prev,
      successRate,
      status: selfHealingService.isHealthy() ? 'healthy' : 'degraded'
    }));
  };

  const updatePredictions = async () => {
    try {
      const predictions = await selfHealingService.predictFailures();
      setFailurePredictions(predictions);
    } catch (error) {
      console.error('Failed to update predictions:', error);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const updated = new Set(prev);
      if (updated.has(section)) {
        updated.delete(section);
      } else {
        updated.add(section);
      }
      return updated;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return theme.palette.success.main;
      case 'recovering': return theme.palette.info.main;
      case 'degraded': return theme.palette.warning.main;
      case 'critical': return theme.palette.error.main;
      default: return theme.palette.grey[500];
    }
  };

  return (
    <motion.div
      className="auto-recovery-dashboard"
      layout
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: `linear-gradient(135deg, ${alpha(theme.palette.background.default, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
        borderRadius: 16,
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 3,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <motion.div
              animate={{
                rotate: recoveryStatus.status === 'recovering' ? 360 : 0,
                scale: recoveryStatus.status === 'healthy' ? [1, 1.1, 1] : 1
              }}
              transition={{
                rotate: { duration: 2, repeat: recoveryStatus.status === 'recovering' ? Infinity : 0 },
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              <HealingIcon 
                sx={{ 
                  fontSize: 32, 
                  color: getStatusColor(recoveryStatus.status)
                }} 
              />
            </motion.div>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Self-Healing System
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                Intelligent Auto-Recovery & Predictive Maintenance
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              icon={<CheckCircleIcon />}
              label={`${recoveryStatus.successRate.toFixed(1)}% Success Rate`}
              color="success"
              variant="outlined"
            />
            <Chip
              label={recoveryStatus.status.toUpperCase()}
              sx={{
                backgroundColor: alpha(getStatusColor(recoveryStatus.status), 0.2),
                color: getStatusColor(recoveryStatus.status),
                fontWeight: 600
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
        <Grid container spacing={3}>
          {/* System Health Overview */}
          <Grid item xs={12} lg={8}>
            <SystemHealthOverview
              recoveryStatus={recoveryStatus}
              systemHealth={systemHealth}
              expanded={expandedSections.has('overview')}
              onToggle={() => toggleSection('overview')}
            />
          </Grid>

          {/* Quick Stats */}
          <Grid item xs={12} lg={4}>
            <QuickStatsPanel recoveryStatus={recoveryStatus} />
          </Grid>

          {/* Active Recoveries */}
          <Grid item xs={12} lg={6}>
            <ActiveRecoveriesPanel
              activeRecoveries={activeRecoveries}
              expanded={expandedSections.has('recoveries')}
              onToggle={() => toggleSection('recoveries')}
            />
          </Grid>

          {/* Predictive Alerts */}
          <Grid item xs={12} lg={6}>
            <PredictiveAlertsPanel
              predictions={failurePredictions}
              expanded={expandedSections.has('predictions')}
              onToggle={() => toggleSection('predictions')}
            />
          </Grid>

          {/* Recovery History */}
          <Grid item xs={12}>
            <RecoveryHistoryPanel
              failureHistory={failureHistory}
              expanded={expandedSections.has('history')}
              onToggle={() => toggleSection('history')}
            />
          </Grid>
        </Grid>
      </Box>
    </motion.div>
  );
};

// System Health Overview Component
const SystemHealthOverview: React.FC<{
  recoveryStatus: RecoveryStatus;
  systemHealth: SystemMetrics | null;
  expanded: boolean;
  onToggle: () => void;
}> = ({ recoveryStatus, systemHealth, expanded, onToggle }) => {
  const theme = useTheme();

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            System Health Overview
          </Typography>
          <IconButton onClick={onToggle} size="small">
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>

        <Collapse in={expanded}>
          <Grid container spacing={2}>
            {/* Recovery Status Indicator */}
            <Grid item xs={12} md={6}>
              <motion.div
                animate={{
                  borderColor: recoveryStatus.status === 'healthy' ? theme.palette.success.main : theme.palette.warning.main
                }}
                style={{
                  border: `2px solid`,
                  borderRadius: 12,
                  padding: 16,
                  textAlign: 'center'
                }}
              >
                <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                  {recoveryStatus.status === 'healthy' ? '✅' : '🔧'}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {recoveryStatus.status.charAt(0).toUpperCase() + recoveryStatus.status.slice(1)}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                  System Status
                </Typography>
              </motion.div>
            </Grid>

            {/* Active Recoveries */}
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <motion.div
                  animate={{
                    scale: recoveryStatus.activeRecoveries > 0 ? [1, 1.1, 1] : 1
                  }}
                  transition={{
                    duration: 1,
                    repeat: recoveryStatus.activeRecoveries > 0 ? Infinity : 0
                  }}
                >
                  <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.info.main }}>
                    {recoveryStatus.activeRecoveries}
                  </Typography>
                </motion.div>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  Active Recoveries
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                  Currently Running
                </Typography>
              </Box>
            </Grid>

            {/* System Metrics */}
            {systemHealth && (
              <>
                <Grid item xs={6} md={3}>
                  <SystemMetricCard
                    icon={<MemoryIcon />}
                    label="Memory"
                    value={`${systemHealth.memory.percentage}%`}
                    color={systemHealth.memory.percentage > 80 ? 'error' : 'success'}
                  />
                </Grid>
                <Grid item xs={6} md={3}>
                  <SystemMetricCard
                    icon={<SpeedIcon />}
                    label="CPU"
                    value={`${systemHealth.cpu.usage}%`}
                    color={systemHealth.cpu.usage > 80 ? 'error' : 'success'}
                  />
                </Grid>
                <Grid item xs={6} md={3}>
                  <SystemMetricCard
                    icon={<StorageIcon />}
                    label="Database"
                    value={`${systemHealth.database.queryTime}ms`}
                    color={systemHealth.database.queryTime > 1000 ? 'error' : 'success'}
                  />
                </Grid>
                <Grid item xs={6} md={3}>
                  <SystemMetricCard
                    icon={<WifiIcon />}
                    label="Network"
                    value={`${systemHealth.network.latency}ms`}
                    color={systemHealth.network.latency > 100 ? 'error' : 'success'}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </Collapse>
      </CardContent>
    </Card>
  );
};

// System Metric Card Component
const SystemMetricCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'success' | 'warning' | 'error';
}> = ({ icon, label, value, color }) => {
  const theme = useTheme();
  
  const colorMap = {
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    error: theme.palette.error.main
  };

  return (
    <Paper
      sx={{
        p: 2,
        textAlign: 'center',
        backgroundColor: alpha(colorMap[color], 0.1),
        border: `1px solid ${alpha(colorMap[color], 0.2)}`
      }}
    >
      <Box sx={{ color: colorMap[color], mb: 1 }}>
        {icon}
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 600, color: colorMap[color] }}>
        {value}
      </Typography>
      <Typography variant="caption" sx={{ opacity: 0.7 }}>
        {label}
      </Typography>
    </Paper>
  );
};

// Quick Stats Panel Component
const QuickStatsPanel: React.FC<{
  recoveryStatus: RecoveryStatus;
}> = ({ recoveryStatus }) => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
          Recovery Statistics
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Success Rate</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {recoveryStatus.successRate.toFixed(1)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={recoveryStatus.successRate}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>

          <Box>
            <Typography variant="body2" sx={{ mb: 1 }}>Total Recoveries</Typography>
            <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
              {recoveryStatus.totalRecoveries}
            </Typography>
          </Box>

          {recoveryStatus.lastRecovery && (
            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>Last Recovery</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {recoveryStatus.lastRecovery.toLocaleTimeString()}
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

// Active Recoveries Panel Component
const ActiveRecoveriesPanel: React.FC<{
  activeRecoveries: Map<string, RecoveryResult>;
  expanded: boolean;
  onToggle: () => void;
}> = ({ activeRecoveries, expanded, onToggle }) => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Active Recoveries
          </Typography>
          <Badge badgeContent={activeRecoveries.size} color="primary">
            <IconButton onClick={onToggle} size="small">
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Badge>
        </Box>

        <Collapse in={expanded}>
          {activeRecoveries.size === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                All Systems Healthy
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                No active recoveries running
              </Typography>
            </Box>
          ) : (
            <List>
              <AnimatePresence>
                {Array.from(activeRecoveries.entries()).map(([recoveryId, result]) => (
                  <motion.div
                    key={recoveryId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <RecoveryProgressIndicator
                      recoveryId={recoveryId}
                      result={result}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </List>
          )}
        </Collapse>
      </CardContent>
    </Card>
  );
};

// Recovery Progress Indicator Component
const RecoveryProgressIndicator: React.FC<{
  recoveryId: string;
  result: RecoveryResult;
}> = ({ recoveryId, result }) => {
  const theme = useTheme();

  return (
    <ListItem
      sx={{
        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
        borderRadius: 2,
        mb: 1
      }}
    >
      <ListItemIcon>
        {result.success ? (
          <CheckCircleIcon sx={{ color: 'success.main' }} />
        ) : (
          <ErrorIcon sx={{ color: 'error.main' }} />
        )}
      </ListItemIcon>
      <ListItemText
        primary={`Recovery ${recoveryId.split('_')[1]}`}
        secondary={
          <Box>
            <Typography variant="caption" sx={{ display: 'block' }}>
              Duration: {result.recoveryTime}ms
            </Typography>
            <Typography variant="caption" sx={{ display: 'block' }}>
              Actions: {result.actions.join(', ')}
            </Typography>
          </Box>
        }
      />
      {!result.success && (
        <CircularProgress size={20} />
      )}
    </ListItem>
  );
};

// Predictive Alerts Panel Component
const PredictiveAlertsPanel: React.FC<{
  predictions: FailurePrediction[];
  expanded: boolean;
  onToggle: () => void;
}> = ({ predictions, expanded, onToggle }) => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Predictive Alerts
          </Typography>
          <Badge badgeContent={predictions.length} color="warning">
            <IconButton onClick={onToggle} size="small">
              <PsychologyIcon />
            </IconButton>
          </Badge>
        </Box>

        <Collapse in={expanded}>
          {predictions.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <SecurityIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                No Threats Detected
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                All systems operating normally
              </Typography>
            </Box>
          ) : (
            <List>
              <AnimatePresence>
                {predictions.map((prediction, index) => (
                  <motion.div
                    key={`${prediction.type}_${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <PredictiveAlertItem prediction={prediction} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </List>
          )}
        </Collapse>
      </CardContent>
    </Card>
  );
};

// Predictive Alert Item Component
const PredictiveAlertItem: React.FC<{
  prediction: FailurePrediction;
}> = ({ prediction }) => {
  const theme = useTheme();
  
  const getSeverityColor = (probability: number) => {
    if (probability > 0.8) return theme.palette.error.main;
    if (probability > 0.6) return theme.palette.warning.main;
    return theme.palette.info.main;
  };

  return (
    <Alert
      severity={prediction.probability > 0.8 ? 'error' : prediction.probability > 0.6 ? 'warning' : 'info'}
      sx={{ mb: 1 }}
    >
      <AlertTitle>
        {prediction.type.replace('_', ' ').toUpperCase()}
      </AlertTitle>
      <Typography variant="body2" sx={{ mb: 1 }}>
        Probability: {Math.round(prediction.probability * 100)}% 
        (Confidence: {Math.round(prediction.confidence * 100)}%)
      </Typography>
      <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
        ETA: {Math.round(prediction.estimatedTimeToFailure / 60000)} minutes
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {prediction.preventiveActions.slice(0, 2).map((action, index) => (
          <Chip
            key={index}
            size="small"
            label={action}
            sx={{ fontSize: '0.7rem' }}
          />
        ))}
      </Box>
    </Alert>
  );
};

// Recovery History Panel Component
const RecoveryHistoryPanel: React.FC<{
  failureHistory: SystemFailure[];
  expanded: boolean;
  onToggle: () => void;
}> = ({ failureHistory, expanded, onToggle }) => {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Recent Failures & Recoveries
          </Typography>
          <IconButton onClick={onToggle} size="small">
            <TimelineIcon />
          </IconButton>
        </Box>

        <Collapse in={expanded}>
          {failureHistory.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                No Recent Failures
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                System has been running smoothly
              </Typography>
            </Box>
          ) : (
            <List>
              {failureHistory.map((failure, index) => (
                <motion.div
                  key={failure.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ListItem
                    sx={{
                      border: '1px solid rgba(71, 85, 105, 0.2)',
                      borderRadius: 2,
                      mb: 1
                    }}
                  >
                    <ListItemIcon>
                      <ErrorIcon 
                        sx={{ 
                          color: failure.severity === 'critical' ? 'error.main' : 'warning.main' 
                        }} 
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={failure.description}
                      secondary={
                        <Box>
                          <Typography variant="caption" sx={{ display: 'block' }}>
                            Type: {failure.type} • Severity: {failure.severity}
                          </Typography>
                          <Typography variant="caption" sx={{ display: 'block' }}>
                            {new Date(failure.timestamp).toLocaleString()}
                          </Typography>
                        </Box>
                      }
                    />
                    <Chip
                      size="small"
                      label={failure.severity}
                      color={failure.severity === 'critical' ? 'error' : 'warning'}
                    />
                  </ListItem>
                </motion.div>
              ))}
            </List>
          )}
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default AutoRecoveryDashboard;