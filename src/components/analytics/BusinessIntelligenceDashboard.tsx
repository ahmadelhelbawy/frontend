import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Tabs,
  Tab,
  Paper,
  Chip,
  LinearProgress,
  Alert,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Security,
  People,
  AttachMoney,
  Warning,
  CheckCircle,
  Info,
  BusinessCenter,
  Analytics,
  Insights,
  AutoGraph
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar
} from 'recharts';
import { apiService } from '../../services/apiService';

interface BusinessMetric {
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  target?: number;
  status: 'good' | 'warning' | 'critical';
}

interface CustomerSegment {
  segment_id: number;
  segment_name: string;
  size: number;
  characteristics: {
    avg_visit_duration: number;
    avg_purchase_amount: number;
    avg_zones_visited: number;
    risk_score: number;
  };
  behavioral_patterns: string[];
  risk_level: string;
  conversion_rate: number;
  recommendations: string[];
}

interface AutomatedInsight {
  insight_id: string;
  insight_type: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  confidence: number;
  supporting_data: Record<string, any>;
  recommended_actions: string[];
  auto_generated: boolean;
  timestamp: string;
}

interface BusinessIntelligenceReport {
  report_id: string;
  store_id: string;
  time_period: [string, string];
  executive_summary: {
    total_incidents_prevented: number;
    estimated_loss_prevention: number;
    system_uptime: number;
    customer_satisfaction_impact: number;
    operational_efficiency_gain: number;
  };
  key_metrics: {
    theft_prevention_rate: number;
    false_positive_rate: number;
    response_time_avg: number;
    customer_conversion_rate: number;
    staff_efficiency_score: number;
  };
  customer_segments: CustomerSegment[];
  operational_recommendations: string[];
  roi_analysis: {
    system_investment: number;
    annual_savings: number;
    roi_percentage: number;
    payback_period_months: number;
    net_present_value: number;
  };
  generated_at: string;
}

type TimeRange = '24h' | '7d' | '30d' | '90d';

const BusinessIntelligenceDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [loading, setLoading] = useState(true);
  const [biReport, setBiReport] = useState<BusinessIntelligenceReport | null>(null);
  const [automatedInsights, setAutomatedInsights] = useState<AutomatedInsight[]>([]);
  const [businessMetrics, setBusinessMetrics] = useState<BusinessMetric[]>([]);

  useEffect(() => {
    loadBusinessIntelligenceData();
  }, [timeRange]);

  const loadBusinessIntelligenceData = async () => {
    setLoading(true);
    try {
      // Load BI report
      const biResponse = await apiService.get(`/analytics/business-intelligence?range=${timeRange}`);
      setBiReport(biResponse.data as BusinessIntelligenceReport);

      // Load automated insights
      const insightsResponse = await apiService.get('/analytics/automated-insights');
      setAutomatedInsights(insightsResponse.data as AutomatedInsight[]);

      // Generate business metrics
      generateBusinessMetrics(biResponse.data as BusinessIntelligenceReport);
    } catch (error) {
      console.error('Failed to load business intelligence data:', error);
      // Load mock data for development
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    // Mock BI report
    const mockReport: BusinessIntelligenceReport = {
      report_id: 'BI_STORE_001_20241220',
      store_id: 'store_001',
      time_period: ['2024-11-20T00:00:00Z', '2024-12-20T00:00:00Z'],
      executive_summary: {
        total_incidents_prevented: 32,
        estimated_loss_prevention: 18500,
        system_uptime: 0.987,
        customer_satisfaction_impact: 0.045,
        operational_efficiency_gain: 0.28
      },
      key_metrics: {
        theft_prevention_rate: 0.89,
        false_positive_rate: 0.08,
        response_time_avg: 67,
        customer_conversion_rate: 0.24,
        staff_efficiency_score: 0.82
      },
      customer_segments: [
        {
          segment_id: 0,
          segment_name: 'High-Value Shoppers',
          size: 45,
          characteristics: {
            avg_visit_duration: 720,
            avg_purchase_amount: 125,
            avg_zones_visited: 6,
            risk_score: 0.15
          },
          behavioral_patterns: ['Long browsing sessions', 'High purchase amounts', 'Loyal customers'],
          risk_level: 'low',
          conversion_rate: 0.85,
          recommendations: ['Provide VIP customer service', 'Offer personalized recommendations']
        },
        {
          segment_id: 1,
          segment_name: 'Quick Shoppers',
          size: 78,
          characteristics: {
            avg_visit_duration: 180,
            avg_purchase_amount: 35,
            avg_zones_visited: 2,
            risk_score: 0.25
          },
          behavioral_patterns: ['Short visits', 'Targeted purchases', 'Efficient shopping'],
          risk_level: 'low',
          conversion_rate: 0.72,
          recommendations: ['Optimize store layout', 'Implement express checkout']
        },
        {
          segment_id: 2,
          segment_name: 'High-Risk Customers',
          size: 12,
          characteristics: {
            avg_visit_duration: 95,
            avg_purchase_amount: 8,
            avg_zones_visited: 4,
            risk_score: 0.78
          },
          behavioral_patterns: ['Suspicious behavior patterns', 'Requires monitoring'],
          risk_level: 'high',
          conversion_rate: 0.15,
          recommendations: ['Increase security monitoring', 'Deploy staff assistance']
        }
      ],
      operational_recommendations: [
        'Increase staff presence during peak hours (2-4 PM)',
        'Implement dynamic pricing for slow-moving inventory',
        'Optimize product placement based on customer flow patterns',
        'Enhance security monitoring in high-risk zones'
      ],
      roi_analysis: {
        system_investment: 50000,
        annual_savings: 125000,
        roi_percentage: 250,
        payback_period_months: 12,
        net_present_value: 185000
      },
      generated_at: new Date().toISOString()
    };

    setBiReport(mockReport);
    generateBusinessMetrics(mockReport);

    // Mock automated insights
    const mockInsights: AutomatedInsight[] = [
      {
        insight_id: 'insight_001',
        insight_type: 'security_pattern',
        title: 'High-Risk Time Period Identified',
        description: 'Increased theft attempts detected between 3-5 PM on weekdays',
        severity: 'warning',
        confidence: 0.88,
        supporting_data: { risk_time_period: '3-5 PM weekdays', incident_increase: 60 },
        recommended_actions: ['Increase security staff during 3-5 PM', 'Implement enhanced monitoring'],
        auto_generated: true,
        timestamp: new Date().toISOString()
      },
      {
        insight_id: 'insight_002',
        insight_type: 'business_opportunity',
        title: 'Revenue Optimization Opportunity',
        description: 'High-value customers show 30% longer dwell time near premium products',
        severity: 'info',
        confidence: 0.82,
        supporting_data: { dwell_time_increase: 30, customer_segment: 'High-value' },
        recommended_actions: ['Expand premium product display area', 'Implement targeted promotions'],
        auto_generated: true,
        timestamp: new Date().toISOString()
      }
    ];

    setAutomatedInsights(mockInsights);
  };

  const generateBusinessMetrics = (report: BusinessIntelligenceReport) => {
    const metrics: BusinessMetric[] = [
      {
        name: 'Theft Prevention Rate',
        value: report.key_metrics.theft_prevention_rate * 100,
        unit: '%',
        trend: 'up',
        trendPercentage: 5.2,
        target: 85,
        status: report.key_metrics.theft_prevention_rate > 0.85 ? 'good' : 'warning'
      },
      {
        name: 'Loss Prevention Savings',
        value: report.executive_summary.estimated_loss_prevention,
        unit: '$',
        trend: 'up',
        trendPercentage: 12.8,
        status: 'good'
      },
      {
        name: 'System Uptime',
        value: report.executive_summary.system_uptime * 100,
        unit: '%',
        trend: 'stable',
        trendPercentage: 0.1,
        target: 99,
        status: report.executive_summary.system_uptime > 0.98 ? 'good' : 'warning'
      },
      {
        name: 'Customer Conversion Rate',
        value: report.key_metrics.customer_conversion_rate * 100,
        unit: '%',
        trend: 'up',
        trendPercentage: 3.4,
        target: 25,
        status: 'good'
      },
      {
        name: 'False Positive Rate',
        value: report.key_metrics.false_positive_rate * 100,
        unit: '%',
        trend: 'down',
        trendPercentage: -2.1,
        target: 10,
        status: report.key_metrics.false_positive_rate < 0.1 ? 'good' : 'warning'
      },
      {
        name: 'Response Time',
        value: report.key_metrics.response_time_avg,
        unit: 's',
        trend: 'down',
        trendPercentage: -8.5,
        target: 60,
        status: report.key_metrics.response_time_avg < 60 ? 'good' : 'warning'
      }
    ];

    setBusinessMetrics(metrics);
  };

  const renderMetricCard = (metric: BusinessMetric) => (
    <Card key={metric.name} sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" component="div" sx={{ fontSize: '0.9rem', fontWeight: 500 }}>
            {metric.name}
          </Typography>
          <Chip
            size="small"
            color={metric.status === 'good' ? 'success' : metric.status === 'warning' ? 'warning' : 'error'}
            label={metric.status}
          />
        </Box>
        
        <Typography variant="h4" component="div" sx={{ mb: 1 }}>
          {metric.unit === '$' ? '$' : ''}{metric.value.toLocaleString()}{metric.unit !== '$' ? metric.unit : ''}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {metric.trend === 'up' ? (
            <TrendingUp color="success" fontSize="small" />
          ) : metric.trend === 'down' ? (
            <TrendingDown color={metric.name === 'False Positive Rate' || metric.name === 'Response Time' ? 'success' : 'error'} fontSize="small" />
          ) : null}
          <Typography
            variant="body2"
            color={metric.trend === 'up' ? 'success.main' : metric.trend === 'down' ? 
              (metric.name === 'False Positive Rate' || metric.name === 'Response Time' ? 'success.main' : 'error.main') : 'text.secondary'}
          >
            {metric.trendPercentage > 0 ? '+' : ''}{metric.trendPercentage}% vs last period
          </Typography>
        </Box>
        
        {metric.target && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Target: {metric.target}{metric.unit}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={Math.min((metric.value / metric.target) * 100, 100)}
              color={metric.value >= metric.target ? 'success' : 'primary'}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const renderCustomerSegments = () => {
    if (!biReport) return null;

    const segmentColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff'];

    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Customer Segment Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={biReport.customer_segments.map((segment, index) => ({
                      name: segment.segment_name,
                      value: segment.size,
                      fill: segmentColors[index % segmentColors.length]
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {biReport.customer_segments.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={segmentColors[index % segmentColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Conversion Rate by Segment
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={biReport.customer_segments}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="segment_name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${(value as number * 100).toFixed(1)}%`, 'Conversion Rate']} />
                  <Bar dataKey="conversion_rate" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Segment Details & Recommendations
              </Typography>
              <Grid container spacing={2}>
                {biReport.customer_segments.map((segment) => (
                  <Grid item xs={12} md={4} key={segment.segment_id}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" component="div">
                          {segment.segment_name}
                        </Typography>
                        <Chip
                          size="small"
                          color={segment.risk_level === 'low' ? 'success' : segment.risk_level === 'medium' ? 'warning' : 'error'}
                          label={`${segment.risk_level} risk`}
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {segment.size} customers ({((segment.size / biReport.customer_segments.reduce((sum, s) => sum + s.size, 0)) * 100).toFixed(1)}%)
                      </Typography>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          Avg. Visit: {Math.round(segment.characteristics.avg_visit_duration / 60)} min
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          Avg. Purchase: ${segment.characteristics.avg_purchase_amount.toFixed(0)}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          Conversion: {(segment.conversion_rate * 100).toFixed(1)}%
                        </Typography>
                      </Box>
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Recommendations:
                      </Typography>
                      <List dense>
                        {segment.recommendations.slice(0, 2).map((rec, index) => (
                          <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
                            <ListItemIcon sx={{ minWidth: 20 }}>
                              <CheckCircle fontSize="small" color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary={rec}
                              primaryTypographyProps={{ variant: 'body2' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderAutomatedInsights = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          AI-Generated Insights
        </Typography>
      </Grid>
      
      {automatedInsights.map((insight) => (
        <Grid item xs={12} md={6} key={insight.insight_id}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {insight.severity === 'critical' ? (
                    <Warning color="error" />
                  ) : insight.severity === 'warning' ? (
                    <Warning color="warning" />
                  ) : (
                    <Info color="info" />
                  )}
                  <Typography variant="h6" component="div">
                    {insight.title}
                  </Typography>
                </Box>
                <Chip
                  size="small"
                  label={`${(insight.confidence * 100).toFixed(0)}% confidence`}
                  color="primary"
                  variant="outlined"
                />
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {insight.description}
              </Typography>
              
              <Alert
                severity={insight.severity === 'critical' ? 'error' : insight.severity as 'error' | 'warning' | 'info' | 'success'}
                sx={{ mb: 2 }}
              >
                <Typography variant="body2">
                  <strong>Recommended Actions:</strong>
                </Typography>
                <List dense>
                  {insight.recommended_actions.map((action, index) => (
                    <ListItem key={index} sx={{ py: 0, px: 0 }}>
                      <ListItemText
                        primary={`• ${action}`}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Alert>
              
              <Typography variant="caption" color="text.secondary">
                Generated: {new Date(insight.timestamp).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderROIAnalysis = () => {
    if (!biReport) return null;

    const roiData = [
      { name: 'Investment', value: biReport.roi_analysis.system_investment, fill: '#ff7300' },
      { name: 'Annual Savings', value: biReport.roi_analysis.annual_savings, fill: '#00ff00' },
      { name: 'Net Present Value', value: biReport.roi_analysis.net_present_value, fill: '#8884d8' }
    ];

    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ROI Analysis
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={roiData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(value) => [`$${(value as number).toLocaleString()}`, '']} />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Key ROI Metrics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main">
                      {biReport.roi_analysis.roi_percentage.toFixed(0)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ROI Percentage
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="primary.main">
                      {biReport.roi_analysis.payback_period_months.toFixed(1)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Payback (Months)
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h5" color="success.main">
                      ${biReport.roi_analysis.net_present_value.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Net Present Value
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Operational Recommendations
              </Typography>
              <List>
                {biReport.operational_recommendations.map((recommendation, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <BusinessCenter color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={recommendation}
                      primaryTypographyProps={{ variant: 'body1' }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Business Intelligence Dashboard
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            >
              <MenuItem value="24h">Last 24 Hours</MenuItem>
              <MenuItem value="7d">Last 7 Days</MenuItem>
              <MenuItem value="30d">Last 30 Days</MenuItem>
              <MenuItem value="90d">Last 90 Days</MenuItem>
            </Select>
          </FormControl>
          
          <Button
            variant="outlined"
            startIcon={<AutoGraph />}
            onClick={loadBusinessIntelligenceData}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Key Metrics Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {businessMetrics.map((metric) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={metric.name}>
            {renderMetricCard(metric)}
          </Grid>
        ))}
      </Grid>

      {/* Tabbed Content */}
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
            <Tab label="Customer Segments" icon={<People />} />
            <Tab label="AI Insights" icon={<Insights />} />
            <Tab label="ROI Analysis" icon={<AttachMoney />} />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          {activeTab === 0 && renderCustomerSegments()}
          {activeTab === 1 && renderAutomatedInsights()}
          {activeTab === 2 && renderROIAnalysis()}
        </Box>
      </Paper>
    </Box>
  );
};

export default BusinessIntelligenceDashboard;