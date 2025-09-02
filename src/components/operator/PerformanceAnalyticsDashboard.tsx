/**
 * PerformanceAnalyticsDashboard - Comprehensive operator performance analytics
 * Provides detailed metrics, KPIs, detection accuracy, response times, and operational efficiency reporting
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
  Button,
  IconButton,
  Tooltip,
  Chip,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Switch,
  FormControlLabel,
  LinearProgress,
  CircularProgress,
  Badge,
  Alert,
  Snackbar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  alpha,
  useTheme
} from '@mui/material';
import {
  Analytics,
  TrendingUp,
  TrendingDown,
  Speed,
  CheckCircleOutline,
  Timer,
  CheckCircle,
  Error,
  Warning,
  Info,
  Person,
  Group,
  Timeline,
  Assessment,
  BarChart,
  PieChart as PieChartIcon,
  ShowChart,
  TableChart,
  Download,
  Print,
  Share,
  Refresh,
  DateRange,
  FilterList,
  Visibility,
  Security,
  Assignment,
  Notifications,
  Schedule,
  Computer,
  Memory,
  DeviceHub,
  Storage,
  NetworkCheck,
  Psychology,
  Settings,
  ExpandMore,
  Close,
  Save,
  Compare,
  Leaderboard,
  EmojiEvents,
  Star,
  ThumbUp,
  ThumbDown
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  ComposedChart,
  ScatterChart,
  Scatter
} from 'recharts';

export interface PerformanceMetrics {
  operator_id: string;
  operator_name: string;
  time_period: {
    start: string;
    end: string;
  };
  
  // Detection Performance
  detection_metrics: {
    total_detections: number;
    true_positives: number;
    false_positives: number;
    false_negatives: number;
    accuracy: number; // percentage
    precision: number; // percentage
    recall: number; // percentage
    f1_score: number;
  };
  
  // Response Performance
  response_metrics: {
    total_alerts: number;
    alerts_acknowledged: number;
    alerts_resolved: number;
    avg_response_time: number; // seconds
    avg_resolution_time: number; // minutes
    sla_compliance: number; // percentage
    escalations: number;
  };
  
  // Incident Management
  incident_metrics: {
    incidents_created: number;
    incidents_resolved: number;
    avg_incident_duration: number; // hours
    incident_categories: Record<string, number>;
    priority_distribution: Record<string, number>;
  };
  
  // System Interaction
  system_metrics: {
    active_hours: number;
    camera_interactions: number;
    system_commands: number;
    ui_actions: number;
    efficiency_score: number; // 0-100
  };
  
  // Quality Metrics
  quality_metrics: {
    peer_reviews: number;
    supervisor_ratings: number;
    training_completions: number;
    certification_status: 'valid' | 'expiring' | 'expired';
    feedback_score: number; // 1-5
  };
}

export interface TeamMetrics {
  team_id: string;
  team_name: string;
  members: string[];
  
  // Aggregate Performance
  aggregate_metrics: {
    total_coverage_hours: number;
    total_incidents: number;
    avg_response_time: number;
    team_efficiency: number;
    collaboration_score: number;
  };
  
  // Comparative Data
  performance_trends: Array<{
    date: string;
    accuracy: number;
    response_time: number;
    incidents: number;
    efficiency: number;
  }>;
  
  // Benchmarks
  benchmarks: {
    industry_average: Record<string, number>;
    internal_target: Record<string, number>;
    best_practice: Record<string, number>;
  };
}

export interface SystemPerformance {
  timestamp: string;
  
  // AI Performance
  ai_metrics: {
    model_accuracy: Record<string, number>;
    inference_times: Record<string, number>;
    throughput: Record<string, number>;
    resource_utilization: Record<string, number>;
  };
  
  // Infrastructure
  infrastructure_metrics: {
    cpu_usage: number;
    memory_usage: number;
    gpu_usage: number;
    network_latency: number;
    storage_usage: number;
    uptime: number;
  };
  
  // Business Impact
  business_metrics: {
    incidents_prevented: number;
    estimated_loss_prevented: number;
    false_alarm_rate: number;
    customer_satisfaction: number;
    operational_savings: number;
  };
}

interface PerformanceAnalyticsDashboardProps {
  operatorMetrics: PerformanceMetrics[];
  teamMetrics: TeamMetrics[];
  systemPerformance: SystemPerformance[];
  currentUser: {
    id: string;
    name: string;
    role: string;
    permissions: string[];
  };
  dateRange: {
    start: string;
    end: string;
  };
  onDateRangeChange: (range: { start: string; end: string }) => void;
  onExportReport: (format: 'pdf' | 'excel' | 'csv', data: any) => Promise<void>;
  onGenerateInsights: (metrics: any) => Promise<string[]>;
  realTimeUpdates?: boolean;
}

const PerformanceAnalyticsDashboard: React.FC<PerformanceAnalyticsDashboardProps> = ({
  operatorMetrics,
  teamMetrics,
  systemPerformance,
  currentUser,
  dateRange,
  onDateRangeChange,
  onExportReport,
  onGenerateInsights,
  realTimeUpdates = true
}) => {
  const theme = useTheme();
  
  // State management
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedMetric, setSelectedMetric] = useState<string>('accuracy');
  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedOperators, setSelectedOperators] = useState<string[]>([]);
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('line');
  const [exportDialog, setExportDialog] = useState(false);
  const [insightsDialog, setInsightsDialog] = useState(false);
  const [generatedInsights, setGeneratedInsights] = useState<string[]>([]);
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
    textSecondary: '#cbd5e1',
    accent1: '#8b5cf6',
    accent2: '#06b6d4',
    accent3: '#f59e0b',
    accent4: '#ef4444'
  };

  // Chart colors
  const chartColors = [
    colors.secondary,
    colors.success,
    colors.warning,
    colors.accent1,
    colors.accent2,
    colors.accent3,
    colors.accent4
  ];

  // Current operator metrics
  const currentOperatorMetrics = useMemo(() => {
    return operatorMetrics.find(m => m.operator_id === currentUser.id);
  }, [operatorMetrics, currentUser.id]);

  // Aggregate team performance
  const aggregatePerformance = useMemo(() => {
    if (operatorMetrics.length === 0) return null;
    
    const totals = operatorMetrics.reduce((acc, metrics) => {
      acc.totalDetections += metrics.detection_metrics.total_detections;
      acc.totalTruePositives += metrics.detection_metrics.true_positives;
      acc.totalFalsePositives += metrics.detection_metrics.false_positives;
      acc.totalAlerts += metrics.response_metrics.total_alerts;
      acc.totalResponseTime += metrics.response_metrics.avg_response_time;
      acc.totalIncidents += metrics.incident_metrics.incidents_created;
      acc.totalActiveHours += metrics.system_metrics.active_hours;
      return acc;
    }, {
      totalDetections: 0,
      totalTruePositives: 0,
      totalFalsePositives: 0,
      totalAlerts: 0,
      totalResponseTime: 0,
      totalIncidents: 0,
      totalActiveHours: 0
    });
    
    const avgAccuracy = (totals.totalTruePositives / totals.totalDetections) * 100 || 0;
    const avgResponseTime = totals.totalResponseTime / operatorMetrics.length || 0;
    const falsePositiveRate = (totals.totalFalsePositives / totals.totalDetections) * 100 || 0;
    
    return {
      ...totals,
      avgAccuracy,
      avgResponseTime,
      falsePositiveRate,
      operatorCount: operatorMetrics.length
    };
  }, [operatorMetrics]);

  // Performance trend data
  const performanceTrendData = useMemo(() => {
    if (teamMetrics.length === 0) return [];
    
    const trends = teamMetrics[0]?.performance_trends || [];
    return trends.map(trend => ({
      date: new Date(trend.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' }),
      accuracy: trend.accuracy,
      responseTime: trend.response_time,
      incidents: trend.incidents,
      efficiency: trend.efficiency
    }));
  }, [teamMetrics]);

  // Top performers
  const topPerformers = useMemo(() => {
    return operatorMetrics
      .sort((a, b) => {
        switch (selectedMetric) {
          case 'accuracy':
            return b.detection_metrics.accuracy - a.detection_metrics.accuracy;
          case 'response_time':
            return a.response_metrics.avg_response_time - b.response_metrics.avg_response_time;
          case 'efficiency':
            return b.system_metrics.efficiency_score - a.system_metrics.efficiency_score;
          default:
            return b.detection_metrics.accuracy - a.detection_metrics.accuracy;
        }
      })
      .slice(0, 5);
  }, [operatorMetrics, selectedMetric]);

  // KPI Cards data
  const kpiCards = useMemo(() => {
    if (!aggregatePerformance) return [];
    
    return [
      {
        title: 'Overall Accuracy',
        value: `${aggregatePerformance.avgAccuracy.toFixed(1)}%`,
        change: '+2.3%',
        trend: 'up',
        icon: <CheckCircleOutline />,
        color: colors.success
      },
      {
        title: 'Avg Response Time',
        value: `${aggregatePerformance.avgResponseTime.toFixed(1)}s`,
        change: '-15%',
        trend: 'up',
        icon: <Timer />,
        color: colors.secondary
      },
      {
        title: 'False Positive Rate',
        value: `${aggregatePerformance.falsePositiveRate.toFixed(1)}%`,
        change: '-8%',
        trend: 'up',
        icon: <Error />,
        color: colors.warning
      },
      {
        title: 'Total Incidents',
        value: aggregatePerformance.totalIncidents.toString(),
        change: '+12%',
        trend: 'down',
        icon: <Assignment />,
        color: colors.danger
      },
      {
        title: 'Active Operators',
        value: aggregatePerformance.operatorCount.toString(),
        change: '0%',
        trend: 'neutral',
        icon: <Person />,
        color: colors.textSecondary
      },
      {
        title: 'Coverage Hours',
        value: `${aggregatePerformance.totalActiveHours.toFixed(0)}h`,
        change: '+5%',
        trend: 'up',
        icon: <Schedule />,
        color: colors.accent1
      }
    ];
  }, [aggregatePerformance]);

  // Handle insights generation
  const handleGenerateInsights = async () => {
    try {
      const insights = await onGenerateInsights({
        operatorMetrics,
        teamMetrics,
        systemPerformance,
        dateRange
      });
      setGeneratedInsights(insights);
      setInsightsDialog(true);
    } catch (error) {
      setNotification({ message: 'Failed to generate insights', severity: 'error' });
    }
  };

  // Handle export
  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      await onExportReport(format, {
        operatorMetrics,
        teamMetrics,
        systemPerformance,
        dateRange,
        aggregatePerformance
      });
      setExportDialog(false);
      setNotification({ message: `Report exported as ${format.toUpperCase()}`, severity: 'success' });
    } catch (error) {
      setNotification({ message: 'Failed to export report', severity: 'error' });
    }
  };

  // Render KPI card
  const renderKPICard = (kpi: any, index: number) => (
    <Grid item xs={12} sm={6} lg={2} key={index}>
      <Card
        sx={{
          backgroundColor: alpha(kpi.color, 0.1),
          border: `1px solid ${alpha(kpi.color, 0.2)}`,
          height: '100%'
        }}
      >
        <CardContent sx={{ p: 2, textAlign: 'center' }}>
          <Box sx={{ color: kpi.color, mb: 1 }}>
            {kpi.icon}
          </Box>
          <Typography variant="h4" sx={{ color: colors.text, fontWeight: 700, mb: 0.5 }}>
            {kpi.value}
          </Typography>
          <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 1 }}>
            {kpi.title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
            {kpi.trend === 'up' ? (
              <TrendingUp sx={{ color: colors.success, fontSize: 16 }} />
            ) : kpi.trend === 'down' ? (
              <TrendingDown sx={{ color: colors.danger, fontSize: 16 }} />
            ) : null}
            <Typography
              variant="caption"
              sx={{
                color: kpi.trend === 'up' ? colors.success : 
                       kpi.trend === 'down' ? colors.danger : colors.textSecondary
              }}
            >
              {kpi.change}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );

  // Render performance chart
  const renderPerformanceChart = () => {
    const ChartComponent = chartType === 'line' ? LineChart : 
                          chartType === 'bar' ? RechartsBarChart : AreaChart;
    
    return (
      <ResponsiveContainer width="100%" height={300}>
        <ChartComponent data={performanceTrendData}>
          <CartesianGrid strokeDasharray="3 3" stroke={alpha(colors.primary, 0.2)} />
          <XAxis dataKey="date" stroke={colors.textSecondary} fontSize={12} />
          <YAxis stroke={colors.textSecondary} fontSize={12} />
          <RechartsTooltip
            contentStyle={{
              backgroundColor: colors.surface,
              border: `1px solid ${alpha(colors.primary, 0.2)}`,
              color: colors.text
            }}
          />
          <Legend />
          
          {chartType === 'line' ? (
            <>
              <Line
                type="monotone"
                dataKey="accuracy"
                stroke={colors.success}
                strokeWidth={2}
                dot={{ fill: colors.success }}
              />
              <Line
                type="monotone"
                dataKey="efficiency"
                stroke={colors.secondary}
                strokeWidth={2}
                dot={{ fill: colors.secondary }}
              />
            </>
          ) : chartType === 'area' ? (
            <>
              <Area
                type="monotone"
                dataKey="accuracy"
                stackId="1"
                stroke={colors.success}
                fill={alpha(colors.success, 0.3)}
              />
              <Area
                type="monotone"
                dataKey="efficiency"
                stackId="1"
                stroke={colors.secondary}
                fill={alpha(colors.secondary, 0.3)}
              />
            </>
          ) : (
            <>
              <Bar dataKey="accuracy" fill={colors.success} />
              <Bar dataKey="efficiency" fill={colors.secondary} />
            </>
          )}
        </ChartComponent>
      </ResponsiveContainer>
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
            Performance Analytics
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              startIcon={<Psychology />}
              onClick={handleGenerateInsights}
              variant="outlined"
              size="small"
              sx={{ color: colors.accent1, borderColor: colors.accent1 }}
            >
              AI Insights
            </Button>
            <Button
              startIcon={<Download />}
              onClick={() => setExportDialog(true)}
              size="small"
              sx={{ color: colors.textSecondary }}
            >
              Export
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

        {/* Date Range and Controls */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Time Range</InputLabel>
              <Select
                value="7d"
                onChange={(e) => {
                  const days = parseInt(e.target.value.replace('d', ''));
                  const end = new Date();
                  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
                  onDateRangeChange({
                    start: start.toISOString(),
                    end: end.toISOString()
                  });
                }}
                sx={{ color: colors.text }}
              >
                <MenuItem value="1d">Last Day</MenuItem>
                <MenuItem value="7d">Last Week</MenuItem>
                <MenuItem value="30d">Last Month</MenuItem>
                <MenuItem value="90d">Last Quarter</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Metric</InputLabel>
              <Select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                sx={{ color: colors.text }}
              >
                <MenuItem value="accuracy">Accuracy</MenuItem>
                <MenuItem value="response_time">Response Time</MenuItem>
                <MenuItem value="efficiency">Efficiency</MenuItem>
                <MenuItem value="incidents">Incidents</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={comparisonMode}
                  onChange={(e) => setComparisonMode(e.target.checked)}
                  size="small"
                />
              }
              label="Compare"
              sx={{ color: colors.textSecondary }}
            />
            
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <Select
                value={chartType}
                onChange={(e) => setChartType(e.target.value as any)}
                sx={{ color: colors.text }}
              >
                <MenuItem value="line">Line</MenuItem>
                <MenuItem value="bar">Bar</MenuItem>
                <MenuItem value="area">Area</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Paper>

      {/* KPI Cards */}
      <Box sx={{ p: 2, pb: 0 }}>
        <Grid container spacing={2}>
          {kpiCards.map(renderKPICard)}
        </Grid>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
        <Tabs
          value={selectedTab}
          onChange={(_, newValue) => setSelectedTab(newValue)}
          sx={{
            mb: 2,
            '& .MuiTab-root': { color: colors.textSecondary },
            '& .MuiTab-root.Mui-selected': { color: colors.secondary },
            '& .MuiTabs-indicator': { backgroundColor: colors.secondary }
          }}
        >
          <Tab label="Overview" />
          <Tab label="Individual Performance" />
          <Tab label="Team Analytics" />
          <Tab label="System Performance" />
          <Tab label="Benchmarking" />
        </Tabs>

        {/* Overview Tab */}
        {selectedTab === 0 && (
          <Grid container spacing={3}>
            {/* Performance Trends */}
            <Grid item xs={12} lg={8}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  backgroundColor: alpha(colors.surface, 0.95),
                  border: `1px solid ${alpha(colors.primary, 0.2)}`
                }}
              >
                <Typography variant="h6" sx={{ color: colors.text, mb: 2 }}>
                  Performance Trends
                </Typography>
                {renderPerformanceChart()}
              </Paper>
            </Grid>

            {/* Top Performers */}
            <Grid item xs={12} lg={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  backgroundColor: alpha(colors.surface, 0.95),
                  border: `1px solid ${alpha(colors.primary, 0.2)}`
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <EmojiEvents sx={{ color: colors.warning }} />
                  <Typography variant="h6" sx={{ color: colors.text }}>
                    Top Performers
                  </Typography>
                </Box>
                
                <List>
                  {topPerformers.map((operator, index) => (
                    <ListItem key={operator.operator_id} sx={{ px: 0 }}>
                      <ListItemIcon>
                        <Badge
                          badgeContent={index + 1}
                          color={index === 0 ? 'warning' : 'primary'}
                        >
                          <Person sx={{ color: colors.textSecondary }} />
                        </Badge>
                      </ListItemIcon>
                      <ListItemText
                        primary={operator.operator_name}
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Chip
                              label={`${operator.detection_metrics.accuracy.toFixed(1)}%`}
                              size="small"
                              sx={{
                                backgroundColor: alpha(colors.success, 0.2),
                                color: colors.success,
                                fontSize: '10px'
                              }}
                            />
                            <Chip
                              label={`${operator.response_metrics.avg_response_time.toFixed(1)}s`}
                              size="small"
                              sx={{
                                backgroundColor: alpha(colors.secondary, 0.2),
                                color: colors.secondary,
                                fontSize: '10px'
                              }}
                            />
                          </Box>
                        }
                      />
                      {index === 0 && <Star sx={{ color: colors.warning }} />}
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>

            {/* Detection Accuracy Distribution */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  backgroundColor: alpha(colors.surface, 0.95),
                  border: `1px solid ${alpha(colors.primary, 0.2)}`
                }}
              >
                <Typography variant="h6" sx={{ color: colors.text, mb: 2 }}>
                  Accuracy Distribution
                </Typography>
                
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'True Positives', value: aggregatePerformance?.totalTruePositives || 0 },
                        { name: 'False Positives', value: aggregatePerformance?.totalFalsePositives || 0 },
                        { name: 'False Negatives', value: 50 } // This would come from actual data
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      <Cell fill={colors.success} />
                      <Cell fill={colors.danger} />
                      <Cell fill={colors.warning} />
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: colors.surface,
                        border: `1px solid ${alpha(colors.primary, 0.2)}`,
                        color: colors.text
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Response Time Analysis */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  backgroundColor: alpha(colors.surface, 0.95),
                  border: `1px solid ${alpha(colors.primary, 0.2)}`
                }}
              >
                <Typography variant="h6" sx={{ color: colors.text, mb: 2 }}>
                  Response Time Analysis
                </Typography>
                
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsBarChart
                    data={operatorMetrics.map(m => ({
                      name: m.operator_name.split(' ')[0],
                      responseTime: m.response_metrics.avg_response_time,
                      slaCompliance: m.response_metrics.sla_compliance
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(colors.primary, 0.2)} />
                    <XAxis dataKey="name" stroke={colors.textSecondary} fontSize={12} />
                    <YAxis stroke={colors.textSecondary} fontSize={12} />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: colors.surface,
                        border: `1px solid ${alpha(colors.primary, 0.2)}`,
                        color: colors.text
                      }}
                    />
                    <Bar dataKey="responseTime" fill={colors.secondary} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Individual Performance Tab */}
        {selectedTab === 1 && currentOperatorMetrics && (
          <Grid container spacing={3}>
            {/* Personal Performance Card */}
            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  backgroundColor: alpha(colors.surface, 0.95),
                  border: `1px solid ${alpha(colors.primary, 0.2)}`
                }}
              >
                <Typography variant="h6" sx={{ color: colors.text, mb: 2 }}>
                  Your Performance - {currentOperatorMetrics.operator_name}
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" sx={{ color: colors.success, fontWeight: 700 }}>
                        {currentOperatorMetrics.detection_metrics.accuracy.toFixed(1)}%
                      </Typography>
                      <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                        Detection Accuracy
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={currentOperatorMetrics.detection_metrics.accuracy}
                        sx={{
                          mt: 1,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: alpha(colors.success, 0.2),
                          '& .MuiLinearProgress-bar': { backgroundColor: colors.success }
                        }}
                      />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" sx={{ color: colors.secondary, fontWeight: 700 }}>
                        {currentOperatorMetrics.response_metrics.avg_response_time.toFixed(1)}s
                      </Typography>
                      <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                        Avg Response Time
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={Math.max(0, 100 - currentOperatorMetrics.response_metrics.avg_response_time)}
                        sx={{
                          mt: 1,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: alpha(colors.secondary, 0.2),
                          '& .MuiLinearProgress-bar': { backgroundColor: colors.secondary }
                        }}
                      />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" sx={{ color: colors.accent1, fontWeight: 700 }}>
                        {currentOperatorMetrics.system_metrics.efficiency_score}
                      </Typography>
                      <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                        Efficiency Score
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={currentOperatorMetrics.system_metrics.efficiency_score}
                        sx={{
                          mt: 1,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: alpha(colors.accent1, 0.2),
                          '& .MuiLinearProgress-bar': { backgroundColor: colors.accent1 }
                        }}
                      />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" sx={{ color: colors.warning, fontWeight: 700 }}>
                        {currentOperatorMetrics.response_metrics.sla_compliance.toFixed(1)}%
                      </Typography>
                      <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                        SLA Compliance
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={currentOperatorMetrics.response_metrics.sla_compliance}
                        sx={{
                          mt: 1,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: alpha(colors.warning, 0.2),
                          '& .MuiLinearProgress-bar': { backgroundColor: colors.warning }
                        }}
                      />
                    </Box>
                  </Grid>
                </Grid>
                
                {/* Detailed Metrics */}
                <Divider sx={{ my: 3, borderColor: alpha(colors.primary, 0.2) }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle1" sx={{ color: colors.text, mb: 1 }}>
                      Detection Performance
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                          Precision
                        </Typography>
                        <Typography variant="body2" sx={{ color: colors.text }}>
                          {currentOperatorMetrics.detection_metrics.precision.toFixed(1)}%
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                          Recall
                        </Typography>
                        <Typography variant="body2" sx={{ color: colors.text }}>
                          {currentOperatorMetrics.detection_metrics.recall.toFixed(1)}%
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                          F1 Score
                        </Typography>
                        <Typography variant="body2" sx={{ color: colors.text }}>
                          {currentOperatorMetrics.detection_metrics.f1_score.toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle1" sx={{ color: colors.text, mb: 1 }}>
                      Response Metrics
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                          Alerts Handled
                        </Typography>
                        <Typography variant="body2" sx={{ color: colors.text }}>
                          {currentOperatorMetrics.response_metrics.alerts_acknowledged}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                          Resolution Time
                        </Typography>
                        <Typography variant="body2" sx={{ color: colors.text }}>
                          {currentOperatorMetrics.response_metrics.avg_resolution_time.toFixed(1)}m
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                          Escalations
                        </Typography>
                        <Typography variant="body2" sx={{ color: colors.text }}>
                          {currentOperatorMetrics.response_metrics.escalations}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle1" sx={{ color: colors.text, mb: 1 }}>
                      Quality Metrics
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                          Feedback Score
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography variant="body2" sx={{ color: colors.text }}>
                            {currentOperatorMetrics.quality_metrics.feedback_score.toFixed(1)}
                          </Typography>
                          <Star sx={{ color: colors.warning, fontSize: 16 }} />
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                          Certification
                        </Typography>
                        <Chip
                          label={currentOperatorMetrics.quality_metrics.certification_status.toUpperCase()}
                          size="small"
                          color={
                            currentOperatorMetrics.quality_metrics.certification_status === 'valid' ? 'success' :
                            currentOperatorMetrics.quality_metrics.certification_status === 'expiring' ? 'warning' : 'error'
                          }
                          sx={{ fontSize: '10px', height: 20 }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                          Training Complete
                        </Typography>
                        <Typography variant="body2" sx={{ color: colors.text }}>
                          {currentOperatorMetrics.quality_metrics.training_completions}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* System Performance Tab */}
        {selectedTab === 3 && systemPerformance.length > 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  backgroundColor: alpha(colors.surface, 0.95),
                  border: `1px solid ${alpha(colors.primary, 0.2)}`
                }}
              >
                <Typography variant="h6" sx={{ color: colors.text, mb: 2 }}>
                  System Performance Overview
                </Typography>
                
                <Grid container spacing={3}>
                  {/* AI Performance */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" sx={{ color: colors.text, mb: 2 }}>
                      AI Model Performance
                    </Typography>
                    <ResponsiveContainer width="100%" height={200}>
                      <RadialBarChart
                        innerRadius="20%"
                        outerRadius="80%"
                        data={[
                          { name: 'Model 1', value: 95, fill: colors.success },
                          { name: 'Model 2', value: 88, fill: colors.secondary },
                          { name: 'Model 3', value: 92, fill: colors.accent1 }
                        ]}
                      >
                        <RadialBar dataKey="value" cornerRadius={10} fill="#8884d8" />
                        <RechartsTooltip />
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </Grid>
                  
                  {/* Infrastructure */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" sx={{ color: colors.text, mb: 2 }}>
                      Infrastructure Health
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {[
                        { label: 'CPU Usage', value: systemPerformance[0]?.infrastructure_metrics.cpu_usage || 0, color: colors.secondary },
                        { label: 'Memory Usage', value: systemPerformance[0]?.infrastructure_metrics.memory_usage || 0, color: colors.success },
                        { label: 'GPU Usage', value: systemPerformance[0]?.infrastructure_metrics.gpu_usage || 0, color: colors.warning },
                        { label: 'Network Latency', value: Math.min(100, (systemPerformance[0]?.infrastructure_metrics.network_latency || 0) / 10), color: colors.danger }
                      ].map((metric, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography variant="body2" sx={{ color: colors.textSecondary, minWidth: 120 }}>
                            {metric.label}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={metric.value}
                            sx={{
                              flex: 1,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: alpha(metric.color, 0.2),
                              '& .MuiLinearProgress-bar': { backgroundColor: metric.color }
                            }}
                          />
                          <Typography variant="body2" sx={{ color: colors.text, minWidth: 50 }}>
                            {metric.value.toFixed(1)}%
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Box>

      {/* Export Dialog */}
      <Dialog open={exportDialog} onClose={() => setExportDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Export Performance Report</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: colors.textSecondary }}>
            Choose the format for your performance report:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              variant="outlined"
              onClick={() => handleExport('pdf')}
              startIcon={<Download />}
              sx={{ justifyContent: 'flex-start' }}
            >
              Export as PDF
            </Button>
            <Button
              variant="outlined"
              onClick={() => handleExport('excel')}
              startIcon={<Download />}
              sx={{ justifyContent: 'flex-start' }}
            >
              Export as Excel
            </Button>
            <Button
              variant="outlined"
              onClick={() => handleExport('csv')}
              startIcon={<Download />}
              sx={{ justifyContent: 'flex-start' }}
            >
              Export as CSV
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* AI Insights Dialog */}
      <Dialog open={insightsDialog} onClose={() => setInsightsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Psychology sx={{ color: colors.accent1 }} />
            <Typography variant="h6">AI-Generated Insights</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {generatedInsights.map((insight, index) => (
              <Alert
                key={index}
                severity="info"
                icon={<Psychology />}
                sx={{
                  backgroundColor: alpha(colors.accent1, 0.1),
                  color: colors.text,
                  '& .MuiAlert-icon': { color: colors.accent1 }
                }}
              >
                {insight}
              </Alert>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInsightsDialog(false)}>Close</Button>
          <Button variant="contained" startIcon={<Save />}>
            Save Insights
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

export default PerformanceAnalyticsDashboard;
