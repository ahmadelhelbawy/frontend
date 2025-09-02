import React from 'react';
import { useSecurityTheme } from '../../theme/ThemeProvider';
import { DecisionMetrics as DecisionMetricsType, DecisionMetricsProps } from '../../types/autonomousDecisions';

export const DecisionMetrics: React.FC<DecisionMetricsProps> = ({
  metrics,
  loading = false
}) => {
  const theme = useSecurityTheme();

  const containerStyle: React.CSSProperties = {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background.surface,
    borderBottom: `1px solid ${theme.colors.border.primary}`,
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: theme.spacing.md,
  };

  const metricCardStyle: React.CSSProperties = {
    backgroundColor: theme.colors.background.elevated,
    border: `1px solid ${theme.colors.border.primary}`,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.md,
    transition: 'all 0.2s ease',
  };

  const iconStyle: React.CSSProperties = {
    fontSize: '32px',
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.md,
    flexShrink: 0,
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
  };

  const valueStyle: React.CSSProperties = {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    margin: 0,
    lineHeight: 1,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    margin: `${theme.spacing.xs} 0 0 0`,
    lineHeight: 1,
  };

  const loadingStyle: React.CSSProperties = {
    opacity: 0.6,
    pointerEvents: 'none',
  };

  const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const metricsData = [
    {
      icon: '🤖',
      value: metrics.totalDecisions,
      label: 'Total Decisions',
      color: theme.colors.primary.main,
      bgColor: theme.colors.primary.main + '20',
    },
    {
      icon: '📊',
      value: metrics.decisionsToday,
      label: 'Decisions Today',
      color: theme.colors.status.active,
      bgColor: theme.colors.status.active + '20',
    },
    {
      icon: '🎯',
      value: formatPercentage(metrics.averageConfidence),
      label: 'Avg Confidence',
      color: metrics.averageConfidence > 0.8 ? theme.colors.status.normal : theme.colors.status.warning,
      bgColor: (metrics.averageConfidence > 0.8 ? theme.colors.status.normal : theme.colors.status.warning) + '20',
    },
    {
      icon: '⚡',
      value: formatTime(metrics.averageProcessingTime),
      label: 'Avg Processing Time',
      color: metrics.averageProcessingTime < 200 ? theme.colors.status.normal : theme.colors.status.warning,
      bgColor: (metrics.averageProcessingTime < 200 ? theme.colors.status.normal : theme.colors.status.warning) + '20',
    },
    {
      icon: '✅',
      value: formatPercentage(metrics.accuracy),
      label: 'Accuracy',
      color: metrics.accuracy > 0.9 ? theme.colors.status.normal : metrics.accuracy > 0.8 ? theme.colors.status.warning : theme.colors.status.critical,
      bgColor: (metrics.accuracy > 0.9 ? theme.colors.status.normal : metrics.accuracy > 0.8 ? theme.colors.status.warning : theme.colors.status.critical) + '20',
    },
    {
      icon: '🔍',
      value: formatPercentage(metrics.precision),
      label: 'Precision',
      color: metrics.precision > 0.85 ? theme.colors.status.normal : theme.colors.status.warning,
      bgColor: (metrics.precision > 0.85 ? theme.colors.status.normal : theme.colors.status.warning) + '20',
    },
    {
      icon: '📈',
      value: formatPercentage(metrics.recall),
      label: 'Recall',
      color: metrics.recall > 0.8 ? theme.colors.status.normal : theme.colors.status.warning,
      bgColor: (metrics.recall > 0.8 ? theme.colors.status.normal : theme.colors.status.warning) + '20',
    },
    {
      icon: '⚖️',
      value: formatPercentage(metrics.f1Score),
      label: 'F1 Score',
      color: metrics.f1Score > 0.85 ? theme.colors.status.normal : theme.colors.status.warning,
      bgColor: (metrics.f1Score > 0.85 ? theme.colors.status.normal : theme.colors.status.warning) + '20',
    },
    {
      icon: '🚀',
      value: `${metrics.actionsExecuted}`,
      label: 'Actions Executed',
      color: theme.colors.status.active,
      bgColor: theme.colors.status.active + '20',
    },
    {
      icon: '👤',
      value: metrics.humanOverrides,
      label: 'Human Overrides',
      color: metrics.humanOverrides > 5 ? theme.colors.status.warning : theme.colors.text.secondary,
      bgColor: (metrics.humanOverrides > 5 ? theme.colors.status.warning : theme.colors.text.secondary) + '20',
    },
  ];

  return (
    <div style={{ ...containerStyle, ...(loading ? loadingStyle : {}) }}>
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
          🤖 AI Decision Metrics
        </h2>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing.sm,
          fontSize: theme.typography.fontSize.sm,
          color: theme.colors.text.secondary,
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: theme.colors.status.normal,
            animation: 'pulse 2s infinite',
          }} />
          System Active • {formatPercentage(metrics.systemUptime / 100)} Uptime
          <style>
            {`
              @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.5; }
                100% { opacity: 1; }
              }
            `}
          </style>
        </div>
      </div>

      <div style={gridStyle}>
        {metricsData.map((metric, index) => (
          <div
            key={index}
            style={{
              ...metricCardStyle,
              ...(loading ? { opacity: 0.6 } : {}),
            }}
          >
            <div style={{
              ...iconStyle,
              backgroundColor: metric.bgColor,
              color: metric.color,
            }}>
              {metric.icon}
            </div>
            
            <div style={contentStyle}>
              <div style={valueStyle}>
                {loading ? (
                  <div style={{
                    width: '60px',
                    height: '24px',
                    backgroundColor: theme.colors.background.primary,
                    borderRadius: theme.borderRadius.sm,
                    animation: 'shimmer 1.5s infinite',
                  }} />
                ) : (
                  metric.value
                )}
              </div>
              <div style={labelStyle}>
                {metric.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Performance Metrics */}
      <div style={{
        marginTop: theme.spacing.lg,
        padding: theme.spacing.md,
        backgroundColor: theme.colors.background.primary,
        borderRadius: theme.borderRadius.md,
        border: `1px solid ${theme.colors.border.secondary}`,
      }}>
        <h3 style={{
          fontSize: theme.typography.fontSize.md,
          fontWeight: theme.typography.fontWeight.medium,
          color: theme.colors.text.primary,
          margin: `0 0 ${theme.spacing.sm} 0`,
        }}>
          📊 Performance Breakdown
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: theme.spacing.md,
          fontSize: theme.typography.fontSize.sm,
        }}>
          <div>
            <span style={{ color: theme.colors.text.secondary }}>Decisions/Hour: </span>
            <span style={{ 
              color: theme.colors.text.primary,
              fontWeight: theme.typography.fontWeight.medium 
            }}>
              {metrics.decisionsPerHour}
            </span>
          </div>
          
          <div>
            <span style={{ color: theme.colors.text.secondary }}>Response Time: </span>
            <span style={{ 
              color: metrics.averageResponseTime < 1 ? theme.colors.status.normal : theme.colors.status.warning,
              fontWeight: theme.typography.fontWeight.medium 
            }}>
              {metrics.averageResponseTime.toFixed(2)}s
            </span>
          </div>
          
          <div>
            <span style={{ color: theme.colors.text.secondary }}>Success Rate: </span>
            <span style={{ 
              color: theme.colors.status.normal,
              fontWeight: theme.typography.fontWeight.medium 
            }}>
              {metrics.actionsExecuted > 0 ? formatPercentage(metrics.successfulActions / metrics.actionsExecuted) : '0%'}
            </span>
          </div>
          
          <div>
            <span style={{ color: theme.colors.text.secondary }}>Override Rate: </span>
            <span style={{ 
              color: metrics.humanOverrides / metrics.totalDecisions > 0.1 ? theme.colors.status.warning : theme.colors.status.normal,
              fontWeight: theme.typography.fontWeight.medium 
            }}>
              {metrics.totalDecisions > 0 ? formatPercentage(metrics.humanOverrides / metrics.totalDecisions) : '0%'}
            </span>
          </div>
        </div>
      </div>

      {/* Risk Distribution */}
      <div style={{
        marginTop: theme.spacing.lg,
        padding: theme.spacing.md,
        backgroundColor: theme.colors.background.primary,
        borderRadius: theme.borderRadius.md,
        border: `1px solid ${theme.colors.border.secondary}`,
      }}>
        <h3 style={{
          fontSize: theme.typography.fontSize.md,
          fontWeight: theme.typography.fontWeight.medium,
          color: theme.colors.text.primary,
          margin: `0 0 ${theme.spacing.sm} 0`,
        }}>
          ⚠️ Risk Distribution
        </h3>
        
        <div style={{
          display: 'flex',
          gap: theme.spacing.md,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}>
          {[
            { level: 'Critical', count: metrics.criticalRiskDecisions, color: theme.colors.status.critical },
            { level: 'High', count: metrics.highRiskDecisions, color: '#FF6B35' },
            { level: 'Medium', count: metrics.mediumRiskDecisions, color: theme.colors.status.warning },
            { level: 'Low', count: metrics.lowRiskDecisions, color: theme.colors.status.normal },
          ].map(risk => (
            <div key={risk.level} style={{
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing.sm,
              padding: `${theme.spacing.sm} ${theme.spacing.md}`,
              backgroundColor: risk.color + '20',
              borderRadius: theme.borderRadius.md,
              border: `1px solid ${risk.color}`,
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: risk.color,
              }} />
              <span style={{
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text.primary,
                fontWeight: theme.typography.fontWeight.medium,
              }}>
                {risk.level}: {risk.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Model Performance Alert */}
      {(metrics.accuracy < 0.8 || metrics.humanOverrides / metrics.totalDecisions > 0.15) && (
        <div style={{
          marginTop: theme.spacing.lg,
          padding: theme.spacing.md,
          backgroundColor: theme.colors.status.warning + '20',
          borderRadius: theme.borderRadius.md,
          border: `2px solid ${theme.colors.status.warning}`,
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing.md,
        }}>
          <div style={{
            fontSize: '32px',
          }}>
            ⚠️
          </div>
          <div>
            <h3 style={{
              fontSize: theme.typography.fontSize.md,
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.status.warning,
              margin: 0,
            }}>
              MODEL PERFORMANCE ALERT
            </h3>
            <p style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.text.primary,
              margin: `${theme.spacing.xs} 0 0 0`,
            }}>
              {metrics.accuracy < 0.8 && 'Model accuracy is below 80%. '}
              {metrics.humanOverrides / metrics.totalDecisions > 0.15 && 'High override rate detected. '}
              Consider model retraining or parameter adjustment.
            </p>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes shimmer {
            0% { opacity: 1; }
            50% { opacity: 0.4; }
            100% { opacity: 1; }
          }
        `}
      </style>
    </div>
  );
};