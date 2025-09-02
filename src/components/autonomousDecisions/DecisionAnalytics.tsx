import React from 'react';
import { useSecurityTheme } from '../../theme/ThemeProvider';
import { AutonomousDecision, DecisionAnalyticsProps } from '../../types/autonomousDecisions';

export const DecisionAnalytics: React.FC<DecisionAnalyticsProps> = ({
  decisions,
  timeRange,
  onTimeRangeChange
}) => {
  const theme = useSecurityTheme();

  // Calculate analytics data
  const analytics = React.useMemo(() => {
    const filteredDecisions = decisions.filter(d => 
      d.timestamp >= timeRange.start && d.timestamp <= timeRange.end
    );

    // Decision type distribution
    const typeDistribution = filteredDecisions.reduce((acc, d) => {
      acc[d.decisionType] = (acc[d.decisionType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Priority distribution
    const priorityDistribution = filteredDecisions.reduce((acc, d) => {
      acc[d.priority] = (acc[d.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Status distribution
    const statusDistribution = filteredDecisions.reduce((acc, d) => {
      acc[d.status] = (acc[d.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Confidence distribution
    const confidenceRanges = {
      'High (90-100%)': filteredDecisions.filter(d => d.confidence >= 0.9).length,
      'Medium (70-89%)': filteredDecisions.filter(d => d.confidence >= 0.7 && d.confidence < 0.9).length,
      'Low (50-69%)': filteredDecisions.filter(d => d.confidence >= 0.5 && d.confidence < 0.7).length,
      'Very Low (<50%)': filteredDecisions.filter(d => d.confidence < 0.5).length,
    };

    // Processing time analysis
    const processingTimes = filteredDecisions.map(d => d.processingTime);
    const avgProcessingTime = processingTimes.length > 0 
      ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length 
      : 0;

    // Hourly distribution
    const hourlyDistribution = Array.from({ length: 24 }, (_, hour) => {
      const count = filteredDecisions.filter(d => d.timestamp.getHours() === hour).length;
      return { hour, count };
    });

    return {
      total: filteredDecisions.length,
      typeDistribution,
      priorityDistribution,
      statusDistribution,
      confidenceRanges,
      avgProcessingTime,
      hourlyDistribution,
      avgConfidence: filteredDecisions.length > 0 
        ? filteredDecisions.reduce((sum, d) => sum + d.confidence, 0) / filteredDecisions.length 
        : 0
    };
  }, [decisions, timeRange]);

  const containerStyle: React.CSSProperties = {
    flex: 1,
    padding: theme.spacing.lg,
    overflow: 'auto',
    backgroundColor: theme.colors.background.primary,
  };

  const chartContainerStyle: React.CSSProperties = {
    backgroundColor: theme.colors.background.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    border: `1px solid ${theme.colors.border.primary}`,
  };

  const chartTitleStyle: React.CSSProperties = {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  };

  const barChartStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.sm,
  };

  const barStyle = (value: number, maxValue: number): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.md,
    fontSize: theme.typography.fontSize.sm,
  });

  const barFillStyle = (value: number, maxValue: number, color: string): React.CSSProperties => ({
    height: '20px',
    backgroundColor: color,
    borderRadius: theme.borderRadius.sm,
    width: maxValue > 0 ? `${(value / maxValue) * 100}%` : '0%',
    minWidth: value > 0 ? '20px' : '0px',
    transition: 'width 0.3s ease',
  });

  const renderBarChart = (data: Record<string, number>, colors: Record<string, string>) => {
    const maxValue = Math.max(...Object.values(data));
    
    return (
      <div style={barChartStyle}>
        {Object.entries(data).map(([key, value]) => (
          <div key={key} style={barStyle(value, maxValue)}>
            <div style={{ minWidth: '120px', color: theme.colors.text.secondary }}>
              {key.replace('_', ' ')}:
            </div>
            <div style={{ flex: 1, backgroundColor: theme.colors.background.elevated, borderRadius: theme.borderRadius.sm }}>
              <div style={barFillStyle(value, maxValue, colors[key] || theme.colors.primary.main)} />
            </div>
            <div style={{ minWidth: '40px', textAlign: 'right', color: theme.colors.text.primary, fontWeight: theme.typography.fontWeight.medium }}>
              {value}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderHourlyChart = () => {
    const maxCount = Math.max(...analytics.hourlyDistribution.map(h => h.count));
    
    return (
      <div style={{
        display: 'flex',
        alignItems: 'end',
        gap: '2px',
        height: '200px',
        padding: `${theme.spacing.md} 0`,
      }}>
        {analytics.hourlyDistribution.map(({ hour, count }) => (
          <div key={hour} style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: theme.spacing.xs,
          }}>
            <div
              style={{
                width: '100%',
                backgroundColor: theme.colors.primary.main,
                borderRadius: `${theme.borderRadius.sm} ${theme.borderRadius.sm} 0 0`,
                height: maxCount > 0 ? `${(count / maxCount) * 160}px` : '0px',
                minHeight: count > 0 ? '4px' : '0px',
                transition: 'height 0.3s ease',
              }}
              title={`${hour}:00 - ${count} decisions`}
            />
            <div style={{
              fontSize: theme.typography.fontSize.xs,
              color: theme.colors.text.secondary,
              transform: 'rotate(-45deg)',
              transformOrigin: 'center',
              whiteSpace: 'nowrap',
            }}>
              {hour}:00
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
      }}>
        <h2 style={{
          fontSize: theme.typography.fontSize.lg,
          fontWeight: theme.typography.fontWeight.bold,
          color: theme.colors.text.primary,
          margin: 0,
        }}>
          📊 Decision Analytics
        </h2>
        
        <div style={{
          fontSize: theme.typography.fontSize.sm,
          color: theme.colors.text.secondary,
        }}>
          Analyzing {analytics.total} decisions
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: theme.spacing.md,
        marginBottom: theme.spacing.lg,
      }}>
        {[
          { label: 'Total Decisions', value: analytics.total, icon: '🤖', color: theme.colors.primary.main },
          { label: 'Avg Confidence', value: `${Math.round(analytics.avgConfidence * 100)}%`, icon: '🎯', color: theme.colors.status.normal },
          { label: 'Avg Processing', value: `${Math.round(analytics.avgProcessingTime)}ms`, icon: '⚡', color: theme.colors.status.active },
          { label: 'Critical Priority', value: analytics.priorityDistribution.critical || 0, icon: '🚨', color: theme.colors.status.critical },
        ].map((card, index) => (
          <div key={index} style={{
            ...chartContainerStyle,
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing.md,
            marginBottom: 0,
          }}>
            <div style={{
              fontSize: '32px',
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: card.color + '20',
              borderRadius: theme.borderRadius.md,
            }}>
              {card.icon}
            </div>
            <div>
              <div style={{
                fontSize: theme.typography.fontSize.xl,
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.text.primary,
              }}>
                {card.value}
              </div>
              <div style={{
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text.secondary,
              }}>
                {card.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: theme.spacing.lg,
      }}>
        {/* Decision Type Distribution */}
        <div style={chartContainerStyle}>
          <h3 style={chartTitleStyle}>Decision Types</h3>
          {renderBarChart(analytics.typeDistribution, {
            threat_assessment: theme.colors.status.critical,
            behavior_analysis: theme.colors.status.warning,
            facial_recognition_match: theme.colors.primary.main,
            shoplifting_detection: theme.colors.status.critical,
            loitering_detection: theme.colors.status.warning,
            suspicious_activity: '#FF6B35',
            staff_alert_decision: theme.colors.status.active,
            evidence_collection_trigger: theme.colors.primary.main,
          })}
        </div>

        {/* Priority Distribution */}
        <div style={chartContainerStyle}>
          <h3 style={chartTitleStyle}>Priority Levels</h3>
          {renderBarChart(analytics.priorityDistribution, {
            critical: theme.colors.status.critical,
            high: '#FF6B35',
            medium: theme.colors.status.warning,
            low: theme.colors.status.normal,
          })}
        </div>

        {/* Status Distribution */}
        <div style={chartContainerStyle}>
          <h3 style={chartTitleStyle}>Decision Status</h3>
          {renderBarChart(analytics.statusDistribution, {
            processing: theme.colors.status.active,
            completed: theme.colors.status.normal,
            executed: theme.colors.primary.main,
            overridden: theme.colors.status.warning,
            failed: theme.colors.status.critical,
            pending_review: theme.colors.status.warning,
          })}
        </div>

        {/* Confidence Distribution */}
        <div style={chartContainerStyle}>
          <h3 style={chartTitleStyle}>Confidence Ranges</h3>
          {renderBarChart(analytics.confidenceRanges, {
            'High (90-100%)': theme.colors.status.normal,
            'Medium (70-89%)': theme.colors.status.warning,
            'Low (50-69%)': '#FF6B35',
            'Very Low (<50%)': theme.colors.status.critical,
          })}
        </div>
      </div>

      {/* Hourly Distribution */}
      <div style={chartContainerStyle}>
        <h3 style={chartTitleStyle}>Hourly Decision Distribution</h3>
        {renderHourlyChart()}
      </div>

      {/* Insights */}
      <div style={chartContainerStyle}>
        <h3 style={chartTitleStyle}>🧠 AI Insights</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: theme.spacing.md,
        }}>
          <div style={{
            padding: theme.spacing.md,
            backgroundColor: theme.colors.background.elevated,
            borderRadius: theme.borderRadius.md,
            border: `1px solid ${theme.colors.border.secondary}`,
          }}>
            <h4 style={{
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.text.primary,
              margin: `0 0 ${theme.spacing.sm} 0`,
            }}>
              Performance Summary
            </h4>
            <p style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.text.secondary,
              margin: 0,
              lineHeight: 1.5,
            }}>
              {analytics.avgConfidence > 0.8 
                ? 'High confidence decisions indicate strong model performance.'
                : 'Lower confidence levels may require model tuning or additional training data.'
              }
            </p>
          </div>

          <div style={{
            padding: theme.spacing.md,
            backgroundColor: theme.colors.background.elevated,
            borderRadius: theme.borderRadius.md,
            border: `1px solid ${theme.colors.border.secondary}`,
          }}>
            <h4 style={{
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.text.primary,
              margin: `0 0 ${theme.spacing.sm} 0`,
            }}>
              Processing Efficiency
            </h4>
            <p style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.text.secondary,
              margin: 0,
              lineHeight: 1.5,
            }}>
              {analytics.avgProcessingTime < 200 
                ? 'Excellent processing speed meets real-time requirements.'
                : 'Processing times may need optimization for better real-time performance.'
              }
            </p>
          </div>

          <div style={{
            padding: theme.spacing.md,
            backgroundColor: theme.colors.background.elevated,
            borderRadius: theme.borderRadius.md,
            border: `1px solid ${theme.colors.border.secondary}`,
          }}>
            <h4 style={{
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.text.primary,
              margin: `0 0 ${theme.spacing.sm} 0`,
            }}>
              Decision Patterns
            </h4>
            <p style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.text.secondary,
              margin: 0,
              lineHeight: 1.5,
            }}>
              {Object.keys(analytics.typeDistribution).length > 0 
                ? `Most common decision type: ${Object.entries(analytics.typeDistribution).sort(([,a], [,b]) => b - a)[0]?.[0]?.replace('_', ' ') || 'N/A'}`
                : 'No decision patterns available.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};