import React, { useState } from 'react';
import { useSecurityTheme } from '../../theme/ThemeProvider';
import { 
  AutonomousDecision, 
  DecisionCardProps, 
  DecisionPriority, 
  DecisionStatus 
} from '../../types/autonomousDecisions';

export const DecisionCard: React.FC<DecisionCardProps> = ({
  decision,
  onSelect,
  onOverride,
  onFeedback,
  compact = false
}) => {
  const theme = useSecurityTheme();
  const [showActions, setShowActions] = useState(false);

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getPriorityColor = (priority: DecisionPriority): string => {
    switch (priority) {
      case 'critical': return theme.colors.status.critical;
      case 'high': return '#FF6B35';
      case 'medium': return theme.colors.status.warning;
      case 'low': return theme.colors.status.normal;
      default: return theme.colors.text.secondary;
    }
  };

  const getStatusColor = (status: DecisionStatus): string => {
    switch (status) {
      case 'processing': return theme.colors.status.active;
      case 'completed': return theme.colors.status.normal;
      case 'executed': return theme.colors.primary.main;
      case 'overridden': return theme.colors.status.warning;
      case 'failed': return theme.colors.status.critical;
      case 'pending_review': return theme.colors.status.warning;
      case 'archived': return theme.colors.text.secondary;
      default: return theme.colors.text.secondary;
    }
  };

  const getRiskColor = (riskLevel: string): string => {
    switch (riskLevel) {
      case 'critical': return theme.colors.status.critical;
      case 'high': return '#FF6B35';
      case 'medium': return theme.colors.status.warning;
      case 'low': return theme.colors.status.normal;
      default: return theme.colors.text.secondary;
    }
  };

  const getPriorityIcon = (priority: DecisionPriority): string => {
    switch (priority) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '⚡';
      case 'low': return '✅';
      default: return '❓';
    }
  };

  const getDecisionTypeIcon = (decisionType: string): string => {
    const icons = {
      threat_assessment: '🎯',
      behavior_analysis: '🧠',
      facial_recognition_match: '👤',
      shoplifting_detection: '🚫',
      loitering_detection: '⏰',
      suspicious_activity: '⚠️',
      group_behavior_analysis: '👥',
      exit_monitoring: '🚪',
      staff_alert_decision: '📢',
      evidence_collection_trigger: '📁',
      escalation_decision: '⬆️',
      intervention_recommendation: '🎯'
    };
    return icons[decisionType as keyof typeof icons] || '🤖';
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: theme.colors.background.surface,
    border: `2px solid ${getPriorityColor(decision.priority)}`,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    position: 'relative',
    minHeight: compact ? '120px' : '220px',
    display: 'flex',
    flexDirection: compact ? 'row' : 'column',
    gap: theme.spacing.md,
    boxShadow: decision.priority === 'critical' 
      ? `0 0 20px ${theme.colors.status.critical}40`
      : theme.shadows.md,
  };

  const pulseAnimation = decision.status === 'processing' && decision.priority === 'critical' ? {
    animation: 'pulse-border 2s infinite',
  } : {};

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: compact ? 0 : theme.spacing.sm,
    flex: compact ? '0 0 auto' : 'none',
  };

  const iconStyle: React.CSSProperties = {
    width: compact ? '50px' : '60px',
    height: compact ? '50px' : '60px',
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.elevated,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: compact ? '20px' : '24px',
    border: `2px solid ${getPriorityColor(decision.priority)}`,
    flexShrink: 0,
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.sm,
    minWidth: 0,
  };

  const badgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing.xs,
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    borderRadius: theme.borderRadius.sm,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
    textTransform: 'uppercase',
  };

  return (
    <div
      style={{ ...cardStyle, ...pulseAnimation }}
      onClick={() => onSelect(decision)}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Decision Icon */}
      <div style={iconStyle}>
        {getDecisionTypeIcon(decision.decisionType)}
      </div>

      <div style={contentStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{
              fontSize: compact ? theme.typography.fontSize.sm : theme.typography.fontSize.md,
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.text.primary,
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {decision.title}
            </h3>
            <p style={{
              fontSize: theme.typography.fontSize.xs,
              color: theme.colors.text.secondary,
              margin: `${theme.spacing.xs} 0 0 0`,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: compact ? 'nowrap' : 'normal',
              display: compact ? 'block' : '-webkit-box',
              WebkitLineClamp: compact ? 1 : 2,
              WebkitBoxOrient: 'vertical',
            }}>
              {decision.description}
            </p>
          </div>
          
          {/* Priority Badge */}
          <div style={{
            ...badgeStyle,
            backgroundColor: getPriorityColor(decision.priority) + '20',
            color: getPriorityColor(decision.priority),
            border: `1px solid ${getPriorityColor(decision.priority)}`,
            marginLeft: theme.spacing.sm,
          }}>
            {getPriorityIcon(decision.priority)} {decision.priority}
          </div>
        </div>

        {/* Status and Info Badges */}
        <div style={{
          display: 'flex',
          gap: theme.spacing.xs,
          flexWrap: 'wrap',
          marginBottom: theme.spacing.sm,
        }}>
          {/* Status Badge */}
          <div style={{
            ...badgeStyle,
            backgroundColor: getStatusColor(decision.status) + '20',
            color: getStatusColor(decision.status),
            border: `1px solid ${getStatusColor(decision.status)}`,
          }}>
            {decision.status.replace('_', ' ')}
          </div>

          {/* Risk Level Badge */}
          <div style={{
            ...badgeStyle,
            backgroundColor: getRiskColor(decision.riskAssessment.overallRisk) + '20',
            color: getRiskColor(decision.riskAssessment.overallRisk),
            border: `1px solid ${getRiskColor(decision.riskAssessment.overallRisk)}`,
          }}>
            Risk: {decision.riskAssessment.overallRisk}
          </div>

          {/* Human Override Badge */}
          {decision.humanOverride && (
            <div style={{
              ...badgeStyle,
              backgroundColor: theme.colors.status.warning + '20',
              color: theme.colors.status.warning,
              border: `1px solid ${theme.colors.status.warning}`,
            }}>
              👤 Overridden
            </div>
          )}

          {/* Model Version Badge */}
          <div style={{
            ...badgeStyle,
            backgroundColor: theme.colors.primary.main + '20',
            color: theme.colors.primary.main,
            border: `1px solid ${theme.colors.primary.main}`,
          }}>
            {decision.modelVersion}
          </div>
        </div>

        {/* Key Metrics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: compact ? '1fr 1fr' : '1fr 1fr 1fr',
          gap: theme.spacing.sm,
          fontSize: theme.typography.fontSize.xs,
        }}>
          <div>
            <div style={{ color: theme.colors.text.secondary }}>Confidence</div>
            <div style={{ 
              color: theme.colors.text.primary, 
              fontWeight: theme.typography.fontWeight.medium 
            }}>
              {Math.round(decision.confidence * 100)}%
            </div>
          </div>
          
          <div>
            <div style={{ color: theme.colors.text.secondary }}>Risk Score</div>
            <div style={{ 
              color: getRiskColor(decision.riskAssessment.overallRisk), 
              fontWeight: theme.typography.fontWeight.medium 
            }}>
              {decision.riskAssessment.riskScore}/100
            </div>
          </div>
          
          {!compact && (
            <div>
              <div style={{ color: theme.colors.text.secondary }}>Processing</div>
              <div style={{ 
                color: theme.colors.text.primary, 
                fontWeight: theme.typography.fontWeight.medium 
              }}>
                {decision.processingTime}ms
              </div>
            </div>
          )}
        </div>

        {/* AI Reasoning Preview */}
        {!compact && decision.reasoning.length > 0 && (
          <div style={{
            marginTop: theme.spacing.sm,
            padding: theme.spacing.sm,
            backgroundColor: theme.colors.background.elevated,
            borderRadius: theme.borderRadius.sm,
            border: `1px solid ${theme.colors.border.secondary}`,
          }}>
            <div style={{
              fontSize: theme.typography.fontSize.xs,
              color: theme.colors.text.secondary,
              marginBottom: theme.spacing.xs,
            }}>
              🤖 AI Reasoning:
            </div>
            <div style={{
              fontSize: theme.typography.fontSize.xs,
              color: theme.colors.text.primary,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {decision.reasoning[0]}
            </div>
          </div>
        )}

        {/* Actions Executed */}
        {decision.actions.length > 0 && (
          <div style={{
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.text.secondary,
            marginTop: 'auto',
          }}>
            Actions: {decision.actions.filter(a => a.executed).length}/{decision.actions.length} executed
          </div>
        )}

        {/* Time Information */}
        <div style={{
          fontSize: theme.typography.fontSize.xs,
          color: theme.colors.text.secondary,
          marginTop: 'auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span>Decision: {formatTimeAgo(decision.timestamp)}</span>
          <span>{decision.location.cameraName}</span>
        </div>
      </div>

      {/* Action Buttons (shown on hover) */}
      {showActions && !decision.humanOverride && (
        <div style={{
          position: 'absolute',
          top: theme.spacing.sm,
          right: theme.spacing.sm,
          display: 'flex',
          gap: theme.spacing.xs,
          opacity: showActions ? 1 : 0,
          transition: 'opacity 0.2s ease',
        }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFeedback(decision.id);
            }}
            style={{
              padding: theme.spacing.xs,
              backgroundColor: theme.colors.primary.main,
              color: theme.colors.primary.contrast,
              border: 'none',
              borderRadius: theme.borderRadius.sm,
              cursor: 'pointer',
              fontSize: theme.typography.fontSize.xs,
            }}
            title="Provide Feedback"
          >
            💬
          </button>
          
          {decision.status !== 'overridden' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOverride(decision.id);
              }}
              style={{
                padding: theme.spacing.xs,
                backgroundColor: theme.colors.status.warning,
                color: theme.colors.primary.contrast,
                border: 'none',
                borderRadius: theme.borderRadius.sm,
                cursor: 'pointer',
                fontSize: theme.typography.fontSize.xs,
              }}
              title="Override Decision"
            >
              👤
            </button>
          )}
        </div>
      )}

      <style>
        {`
          @keyframes pulse-border {
            0% { box-shadow: 0 0 20px ${theme.colors.status.critical}40; }
            50% { box-shadow: 0 0 30px ${theme.colors.status.critical}80; }
            100% { box-shadow: 0 0 20px ${theme.colors.status.critical}40; }
          }
        `}
      </style>
    </div>
  );
};