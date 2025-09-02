import React, { useState } from 'react';
import { useSecurityTheme } from '../../theme/ThemeProvider';
import { 
  AutonomousDecision, 
  DecisionDetailsProps, 
  HumanOverride,
  DecisionFeedback,
  DecisionOutcome 
} from '../../types/autonomousDecisions';
import { DecisionTreeVisualizer } from './DecisionTreeVisualizer';

export const DecisionDetailsPanel: React.FC<DecisionDetailsProps> = ({
  decision,
  onClose,
  onOverride,
  onFeedback,
  onUpdateOutcome
}) => {
  const theme = useSecurityTheme();
  const [activeTab, setActiveTab] = useState<'overview' | 'reasoning' | 'tree' | 'actions' | 'feedback'>('overview');
  const [feedbackForm, setFeedbackForm] = useState({
    type: 'accuracy' as DecisionFeedback['feedbackType'],
    rating: 5,
    comments: '',
    improvements: ''
  });

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'critical': return theme.colors.status.critical;
      case 'high': return '#FF6B35';
      case 'medium': return theme.colors.status.warning;
      case 'low': return theme.colors.status.normal;
      default: return theme.colors.text.secondary;
    }
  };

  const containerStyle: React.CSSProperties = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.colors.background.surface,
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily,
  };

  const headerStyle: React.CSSProperties = {
    padding: theme.spacing.lg,
    borderBottom: `1px solid ${theme.colors.border.primary}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  };

  const tabsStyle: React.CSSProperties = {
    display: 'flex',
    borderBottom: `1px solid ${theme.colors.border.primary}`,
    overflowX: 'auto',
  };

  const tabStyle = (isActive: boolean): React.CSSProperties => ({
    flex: '0 0 auto',
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    backgroundColor: isActive ? theme.colors.background.elevated : 'transparent',
    color: isActive ? theme.colors.text.primary : theme.colors.text.secondary,
    border: 'none',
    borderBottom: isActive ? `2px solid ${theme.colors.primary.main}` : '2px solid transparent',
    cursor: 'pointer',
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
  });

  const contentStyle: React.CSSProperties = {
    flex: 1,
    padding: theme.spacing.lg,
    overflow: 'auto',
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.elevated,
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.border.primary}`,
  };

  const fieldStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${theme.spacing.sm} 0`,
    borderBottom: `1px solid ${theme.colors.border.secondary}`,
    fontSize: theme.typography.fontSize.sm,
  };

  const renderOverview = () => (
    <div>
      {/* Decision Summary */}
      <div style={sectionStyle}>
        <h3 style={{
          fontSize: theme.typography.fontSize.md,
          fontWeight: theme.typography.fontWeight.bold,
          color: theme.colors.text.primary,
          margin: `0 0 ${theme.spacing.md} 0`,
        }}>
          🤖 Decision Summary
        </h3>
        
        <div style={fieldStyle}>
          <span style={{ color: theme.colors.text.secondary }}>Decision ID:</span>
          <span style={{ color: theme.colors.text.primary, fontWeight: theme.typography.fontWeight.medium }}>
            {decision.id}
          </span>
        </div>
        <div style={fieldStyle}>
          <span style={{ color: theme.colors.text.secondary }}>Type:</span>
          <span style={{ color: theme.colors.text.primary, fontWeight: theme.typography.fontWeight.medium }}>
            {decision.decisionType.replace('_', ' ')}
          </span>
        </div>
        <div style={fieldStyle}>
          <span style={{ color: theme.colors.text.secondary }}>Priority:</span>
          <span style={{ 
            color: getPriorityColor(decision.priority), 
            fontWeight: theme.typography.fontWeight.medium 
          }}>
            {decision.priority.toUpperCase()}
          </span>
        </div>
        <div style={fieldStyle}>
          <span style={{ color: theme.colors.text.secondary }}>Status:</span>
          <span style={{ color: theme.colors.text.primary, fontWeight: theme.typography.fontWeight.medium }}>
            {decision.status.replace('_', ' ')}
          </span>
        </div>
        <div style={fieldStyle}>
          <span style={{ color: theme.colors.text.secondary }}>Confidence:</span>
          <span style={{ color: theme.colors.text.primary, fontWeight: theme.typography.fontWeight.medium }}>
            {Math.round(decision.confidence * 100)}%
          </span>
        </div>
        <div style={fieldStyle}>
          <span style={{ color: theme.colors.text.secondary }}>Processing Time:</span>
          <span style={{ color: theme.colors.text.primary, fontWeight: theme.typography.fontWeight.medium }}>
            {decision.processingTime}ms
          </span>
        </div>
        <div style={fieldStyle}>
          <span style={{ color: theme.colors.text.secondary }}>Timestamp:</span>
          <span style={{ color: theme.colors.text.primary, fontWeight: theme.typography.fontWeight.medium }}>
            {decision.timestamp.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Risk Assessment */}
      <div style={sectionStyle}>
        <h3 style={{
          fontSize: theme.typography.fontSize.md,
          fontWeight: theme.typography.fontWeight.bold,
          color: theme.colors.text.primary,
          margin: `0 0 ${theme.spacing.md} 0`,
        }}>
          ⚠️ Risk Assessment
        </h3>
        
        <div style={fieldStyle}>
          <span style={{ color: theme.colors.text.secondary }}>Overall Risk:</span>
          <span style={{ 
            color: getPriorityColor(decision.riskAssessment.overallRisk), 
            fontWeight: theme.typography.fontWeight.medium 
          }}>
            {decision.riskAssessment.overallRisk.toUpperCase()}
          </span>
        </div>
        <div style={fieldStyle}>
          <span style={{ color: theme.colors.text.secondary }}>Risk Score:</span>
          <span style={{ 
            color: getPriorityColor(decision.riskAssessment.overallRisk), 
            fontWeight: theme.typography.fontWeight.medium 
          }}>
            {decision.riskAssessment.riskScore}/100
          </span>
        </div>
        <div style={fieldStyle}>
          <span style={{ color: theme.colors.text.secondary }}>Threat Level:</span>
          <span style={{ color: theme.colors.text.primary, fontWeight: theme.typography.fontWeight.medium }}>
            {decision.riskAssessment.threatLevel}
          </span>
        </div>
        <div style={fieldStyle}>
          <span style={{ color: theme.colors.text.secondary }}>Immediate Action:</span>
          <span style={{ 
            color: decision.riskAssessment.immediateAction ? theme.colors.status.critical : theme.colors.status.normal,
            fontWeight: theme.typography.fontWeight.medium 
          }}>
            {decision.riskAssessment.immediateAction ? 'Required' : 'Not Required'}
          </span>
        </div>
      </div>

      {/* Model Information */}
      <div style={sectionStyle}>
        <h3 style={{
          fontSize: theme.typography.fontSize.md,
          fontWeight: theme.typography.fontWeight.bold,
          color: theme.colors.text.primary,
          margin: `0 0 ${theme.spacing.md} 0`,
        }}>
          🧠 AI Model Information
        </h3>
        
        <div style={fieldStyle}>
          <span style={{ color: theme.colors.text.secondary }}>Model Version:</span>
          <span style={{ color: theme.colors.text.primary, fontWeight: theme.typography.fontWeight.medium }}>
            {decision.modelVersion}
          </span>
        </div>
        <div style={fieldStyle}>
          <span style={{ color: theme.colors.text.secondary }}>Model Confidence:</span>
          <span style={{ color: theme.colors.text.primary, fontWeight: theme.typography.fontWeight.medium }}>
            {Math.round(decision.modelConfidence * 100)}%
          </span>
        </div>
        <div style={fieldStyle}>
          <span style={{ color: theme.colors.text.secondary }}>Algorithms Used:</span>
          <span style={{ color: theme.colors.text.primary, fontWeight: theme.typography.fontWeight.medium }}>
            {decision.algorithmUsed.join(', ')}
          </span>
        </div>
      </div>

      {/* Human Override */}
      {decision.humanOverride && (
        <div style={{
          ...sectionStyle,
          backgroundColor: theme.colors.status.warning + '20',
          border: `1px solid ${theme.colors.status.warning}`,
        }}>
          <h3 style={{
            fontSize: theme.typography.fontSize.md,
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.status.warning,
            margin: `0 0 ${theme.spacing.md} 0`,
          }}>
            👤 Human Override
          </h3>
          
          <div style={fieldStyle}>
            <span style={{ color: theme.colors.text.secondary }}>Overridden By:</span>
            <span style={{ color: theme.colors.text.primary, fontWeight: theme.typography.fontWeight.medium }}>
              {decision.humanOverride.overriddenBy}
            </span>
          </div>
          <div style={fieldStyle}>
            <span style={{ color: theme.colors.text.secondary }}>Reason:</span>
            <span style={{ color: theme.colors.text.primary, fontWeight: theme.typography.fontWeight.medium }}>
              {decision.humanOverride.overrideReason}
            </span>
          </div>
          <div style={fieldStyle}>
            <span style={{ color: theme.colors.text.secondary }}>Override Time:</span>
            <span style={{ color: theme.colors.text.primary, fontWeight: theme.typography.fontWeight.medium }}>
              {decision.humanOverride.overrideTimestamp.toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );

  const renderReasoning = () => (
    <div>
      {/* AI Reasoning */}
      <div style={sectionStyle}>
        <h3 style={{
          fontSize: theme.typography.fontSize.md,
          fontWeight: theme.typography.fontWeight.bold,
          color: theme.colors.text.primary,
          margin: `0 0 ${theme.spacing.md} 0`,
        }}>
          🧠 AI Reasoning Process
        </h3>
        
        {decision.reasoning.map((reason, index) => (
          <div key={index} style={{
            padding: theme.spacing.sm,
            backgroundColor: theme.colors.background.primary,
            borderRadius: theme.borderRadius.sm,
            border: `1px solid ${theme.colors.border.secondary}`,
            marginBottom: theme.spacing.sm,
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing.sm,
              marginBottom: theme.spacing.xs,
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: theme.colors.primary.main,
                color: theme.colors.primary.contrast,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: theme.typography.fontSize.xs,
                fontWeight: theme.typography.fontWeight.bold,
              }}>
                {index + 1}
              </div>
              <span style={{
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text.primary,
              }}>
                {reason}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Risk Factors */}
      <div style={sectionStyle}>
        <h3 style={{
          fontSize: theme.typography.fontSize.md,
          fontWeight: theme.typography.fontWeight.bold,
          color: theme.colors.text.primary,
          margin: `0 0 ${theme.spacing.md} 0`,
        }}>
          ⚖️ Risk Factors Analysis
        </h3>
        
        {decision.riskAssessment.riskFactors.map((factor, index) => (
          <div key={index} style={{
            padding: theme.spacing.sm,
            backgroundColor: theme.colors.background.primary,
            borderRadius: theme.borderRadius.sm,
            border: `1px solid ${theme.colors.border.secondary}`,
            marginBottom: theme.spacing.sm,
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: theme.spacing.xs,
            }}>
              <span style={{
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.medium,
                color: theme.colors.text.primary,
              }}>
                {factor.factor}
              </span>
              <div style={{
                display: 'flex',
                gap: theme.spacing.sm,
                alignItems: 'center',
              }}>
                <span style={{
                  padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                  backgroundColor: factor.impact === 'negative' 
                    ? theme.colors.status.critical + '20'
                    : factor.impact === 'positive'
                    ? theme.colors.status.normal + '20'
                    : theme.colors.text.secondary + '20',
                  color: factor.impact === 'negative' 
                    ? theme.colors.status.critical
                    : factor.impact === 'positive'
                    ? theme.colors.status.normal
                    : theme.colors.text.secondary,
                  borderRadius: theme.borderRadius.sm,
                  fontSize: theme.typography.fontSize.xs,
                  textTransform: 'capitalize',
                }}>
                  {factor.impact}
                </span>
                <span style={{
                  fontSize: theme.typography.fontSize.xs,
                  color: theme.colors.text.secondary,
                }}>
                  Weight: {Math.round(factor.weight * 100)}%
                </span>
              </div>
            </div>
            <div style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.text.secondary,
            }}>
              {factor.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderActions = () => (
    <div>
      {/* Executed Actions */}
      <div style={sectionStyle}>
        <h3 style={{
          fontSize: theme.typography.fontSize.md,
          fontWeight: theme.typography.fontWeight.bold,
          color: theme.colors.text.primary,
          margin: `0 0 ${theme.spacing.md} 0`,
        }}>
          🚀 Autonomous Actions
        </h3>
        
        {decision.actions.length === 0 ? (
          <p style={{
            color: theme.colors.text.secondary,
            fontSize: theme.typography.fontSize.sm,
            textAlign: 'center',
            padding: theme.spacing.lg,
          }}>
            No actions were executed for this decision.
          </p>
        ) : (
          decision.actions.map((action) => (
            <div key={action.id} style={{
              padding: theme.spacing.sm,
              backgroundColor: action.executed 
                ? theme.colors.status.normal + '20' 
                : theme.colors.background.primary,
              borderRadius: theme.borderRadius.sm,
              border: `1px solid ${action.executed ? theme.colors.status.normal : theme.colors.border.secondary}`,
              marginBottom: theme.spacing.sm,
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: theme.spacing.xs,
              }}>
                <span style={{
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.medium,
                  color: theme.colors.text.primary,
                  textTransform: 'capitalize',
                }}>
                  {action.type.replace('_', ' ')}
                </span>
                <div style={{
                  display: 'flex',
                  gap: theme.spacing.sm,
                  alignItems: 'center',
                }}>
                  <span style={{
                    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                    backgroundColor: action.executed 
                      ? theme.colors.status.normal + '20'
                      : theme.colors.text.secondary + '20',
                    color: action.executed 
                      ? theme.colors.status.normal
                      : theme.colors.text.secondary,
                    borderRadius: theme.borderRadius.sm,
                    fontSize: theme.typography.fontSize.xs,
                  }}>
                    {action.executed ? 'Executed' : 'Pending'}
                  </span>
                  <span style={{
                    fontSize: theme.typography.fontSize.xs,
                    color: theme.colors.text.secondary,
                  }}>
                    {Math.round(action.confidence * 100)}% confidence
                  </span>
                </div>
              </div>
              <div style={{
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing.xs,
              }}>
                {action.description}
              </div>
              {action.result && (
                <div style={{
                  fontSize: theme.typography.fontSize.xs,
                  color: action.result.success ? theme.colors.status.normal : theme.colors.status.critical,
                }}>
                  Result: {action.result.message} ({action.result.responseTime}ms)
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Recommendations */}
      <div style={sectionStyle}>
        <h3 style={{
          fontSize: theme.typography.fontSize.md,
          fontWeight: theme.typography.fontWeight.bold,
          color: theme.colors.text.primary,
          margin: `0 0 ${theme.spacing.md} 0`,
        }}>
          💡 AI Recommendations
        </h3>
        
        {decision.recommendations.map((rec) => (
          <div key={rec.id} style={{
            padding: theme.spacing.sm,
            backgroundColor: theme.colors.background.primary,
            borderRadius: theme.borderRadius.sm,
            border: `1px solid ${theme.colors.border.secondary}`,
            marginBottom: theme.spacing.sm,
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: theme.spacing.xs,
            }}>
              <span style={{
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.medium,
                color: theme.colors.text.primary,
              }}>
                {rec.recommendation}
              </span>
              <span style={{
                padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                backgroundColor: getPriorityColor(rec.priority) + '20',
                color: getPriorityColor(rec.priority),
                borderRadius: theme.borderRadius.sm,
                fontSize: theme.typography.fontSize.xs,
                textTransform: 'uppercase',
              }}>
                {rec.priority}
              </span>
            </div>
            <div style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.text.secondary,
              marginBottom: theme.spacing.xs,
            }}>
              {rec.reasoning}
            </div>
            <div style={{
              fontSize: theme.typography.fontSize.xs,
              color: theme.colors.text.secondary,
            }}>
              Confidence: {Math.round(rec.confidence * 100)}% • Impact: {rec.estimatedImpact}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFeedback = () => (
    <div>
      {/* Existing Feedback */}
      {decision.feedback && (
        <div style={sectionStyle}>
          <h3 style={{
            fontSize: theme.typography.fontSize.md,
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.text.primary,
            margin: `0 0 ${theme.spacing.md} 0`,
          }}>
            💬 Existing Feedback
          </h3>
          
          <div style={{
            padding: theme.spacing.sm,
            backgroundColor: theme.colors.background.primary,
            borderRadius: theme.borderRadius.sm,
            border: `1px solid ${theme.colors.border.secondary}`,
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: theme.spacing.xs,
            }}>
              <span style={{
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.medium,
                color: theme.colors.text.primary,
                textTransform: 'capitalize',
              }}>
                {decision.feedback.feedbackType.replace('_', ' ')}
              </span>
              <div style={{
                display: 'flex',
                gap: theme.spacing.xs,
              }}>
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} style={{
                    color: i < decision.feedback!.rating ? theme.colors.status.warning : theme.colors.text.secondary,
                  }}>
                    ⭐
                  </span>
                ))}
              </div>
            </div>
            <div style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.text.primary,
              marginBottom: theme.spacing.xs,
            }}>
              {decision.feedback.comments}
            </div>
            <div style={{
              fontSize: theme.typography.fontSize.xs,
              color: theme.colors.text.secondary,
            }}>
              By: {decision.feedback.providedBy} • {decision.feedback.providedAt.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Provide Feedback */}
      {!decision.feedback && (
        <div style={sectionStyle}>
          <h3 style={{
            fontSize: theme.typography.fontSize.md,
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.text.primary,
            margin: `0 0 ${theme.spacing.md} 0`,
          }}>
            💬 Provide Feedback
          </h3>
          
          <div style={{ marginBottom: theme.spacing.md }}>
            <label style={{
              display: 'block',
              marginBottom: theme.spacing.sm,
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
              color: theme.colors.text.primary,
            }}>
              Feedback Type:
            </label>
            <select
              value={feedbackForm.type}
              onChange={(e) => setFeedbackForm(prev => ({ ...prev, type: e.target.value as any }))}
              style={{
                width: '100%',
                padding: theme.spacing.sm,
                backgroundColor: theme.colors.background.primary,
                color: theme.colors.text.primary,
                border: `1px solid ${theme.colors.border.primary}`,
                borderRadius: theme.borderRadius.md,
                fontSize: theme.typography.fontSize.sm,
              }}
            >
              <option value="accuracy">Accuracy</option>
              <option value="timing">Timing</option>
              <option value="appropriateness">Appropriateness</option>
              <option value="effectiveness">Effectiveness</option>
            </select>
          </div>

          <div style={{ marginBottom: theme.spacing.md }}>
            <label style={{
              display: 'block',
              marginBottom: theme.spacing.sm,
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
              color: theme.colors.text.primary,
            }}>
              Rating:
            </label>
            <div style={{ display: 'flex', gap: theme.spacing.xs }}>
              {Array.from({ length: 5 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setFeedbackForm(prev => ({ ...prev, rating: i + 1 }))}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: i < feedbackForm.rating ? theme.colors.status.warning : theme.colors.text.secondary,
                  }}
                >
                  ⭐
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: theme.spacing.md }}>
            <label style={{
              display: 'block',
              marginBottom: theme.spacing.sm,
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
              color: theme.colors.text.primary,
            }}>
              Comments:
            </label>
            <textarea
              value={feedbackForm.comments}
              onChange={(e) => setFeedbackForm(prev => ({ ...prev, comments: e.target.value }))}
              placeholder="Provide detailed feedback about this decision..."
              style={{
                width: '100%',
                minHeight: '80px',
                padding: theme.spacing.sm,
                backgroundColor: theme.colors.background.primary,
                color: theme.colors.text.primary,
                border: `1px solid ${theme.colors.border.primary}`,
                borderRadius: theme.borderRadius.md,
                fontSize: theme.typography.fontSize.sm,
                fontFamily: theme.typography.fontFamily,
                resize: 'vertical',
              }}
            />
          </div>

          <button
            onClick={() => {
              const feedback: DecisionFeedback = {
                feedbackType: feedbackForm.type,
                rating: feedbackForm.rating,
                comments: feedbackForm.comments,
                providedBy: 'Current User',
                providedAt: new Date(),
                improvements: feedbackForm.improvements.split(',').map(s => s.trim()).filter(s => s)
              };
              onFeedback(decision.id, feedback);
            }}
            style={{
              padding: `${theme.spacing.sm} ${theme.spacing.md}`,
              backgroundColor: theme.colors.primary.main,
              color: theme.colors.primary.contrast,
              border: 'none',
              borderRadius: theme.borderRadius.md,
              cursor: 'pointer',
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
            }}
          >
            💾 Submit Feedback
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div>
          <h2 style={{
            fontSize: theme.typography.fontSize.lg,
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.text.primary,
            margin: 0,
          }}>
            Decision Details
          </h2>
          <p style={{
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.text.secondary,
            margin: `${theme.spacing.xs} 0 0 0`,
          }}>
            {decision.title}
          </p>
        </div>
        
        <button
          onClick={onClose}
          style={{
            padding: theme.spacing.sm,
            backgroundColor: 'transparent',
            color: theme.colors.text.secondary,
            border: `1px solid ${theme.colors.border.primary}`,
            borderRadius: theme.borderRadius.md,
            cursor: 'pointer',
            fontSize: theme.typography.fontSize.lg,
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ✕
        </button>
      </div>

      {/* Tabs */}
      <div style={tabsStyle}>
        <button
          style={tabStyle(activeTab === 'overview')}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          style={tabStyle(activeTab === 'reasoning')}
          onClick={() => setActiveTab('reasoning')}
        >
          Reasoning
        </button>
        <button
          style={tabStyle(activeTab === 'tree')}
          onClick={() => setActiveTab('tree')}
        >
          Decision Tree
        </button>
        <button
          style={tabStyle(activeTab === 'actions')}
          onClick={() => setActiveTab('actions')}
        >
          Actions
        </button>
        <button
          style={tabStyle(activeTab === 'feedback')}
          onClick={() => setActiveTab('feedback')}
        >
          Feedback
        </button>
      </div>

      {/* Content */}
      <div style={contentStyle}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'reasoning' && renderReasoning()}
        {activeTab === 'tree' && (
          <DecisionTreeVisualizer
            decisionTree={decision.decisionTree}
            onNodeSelect={(nodeId) => {
              console.log('Selected decision tree node:', nodeId);
            }}
          />
        )}
        {activeTab === 'actions' && renderActions()}
        {activeTab === 'feedback' && renderFeedback()}
      </div>
    </div>
  );
};