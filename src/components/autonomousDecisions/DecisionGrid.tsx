import React from 'react';
import { useSecurityTheme } from '../../theme/ThemeProvider';
import { 
  AutonomousDecision, 
  DecisionViewMode 
} from '../../types/autonomousDecisions';
import { DecisionCard } from './DecisionCard';
import { DecisionTreeVisualizer } from './DecisionTreeVisualizer';

interface DecisionGridProps {
  decisions: AutonomousDecision[];
  selectedDecision?: AutonomousDecision;
  onDecisionSelect: (decision: AutonomousDecision) => void;
  onDecisionOverride: (decisionId: string) => void;
  onDecisionFeedback: (decisionId: string) => void;
  viewMode: DecisionViewMode;
  showDecisionTree: boolean;
  loading?: boolean;
}

export const DecisionGrid: React.FC<DecisionGridProps> = ({
  decisions,
  selectedDecision,
  onDecisionSelect,
  onDecisionOverride,
  onDecisionFeedback,
  viewMode,
  showDecisionTree,
  loading = false
}) => {
  const theme = useSecurityTheme();

  const containerStyle: React.CSSProperties = {
    flex: 1,
    padding: theme.spacing.lg,
    overflow: 'auto',
    backgroundColor: theme.colors.background.primary,
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gap: theme.spacing.md,
    gridTemplateColumns: viewMode === 'grid' 
      ? 'repeat(auto-fill, minmax(400px, 1fr))'
      : viewMode === 'list'
      ? '1fr'
      : viewMode === 'timeline'
      ? '1fr'
      : '1fr',
  };

  const loadingStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '200px',
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.secondary,
  };

  const emptyStateStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '300px',
    color: theme.colors.text.secondary,
    textAlign: 'center',
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={loadingStyle}>
          <div style={{
            width: '40px',
            height: '40px',
            border: `3px solid ${theme.colors.border.primary}`,
            borderTop: `3px solid ${theme.colors.primary.main}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginRight: theme.spacing.md,
          }} />
          Loading autonomous decisions...
          <style>
            {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}
          </style>
        </div>
      </div>
    );
  }

  if (decisions.length === 0) {
    return (
      <div style={containerStyle}>
        <div style={emptyStateStyle}>
          <div style={{
            fontSize: '64px',
            marginBottom: theme.spacing.md,
            opacity: 0.5,
          }}>
            🤖
          </div>
          <h3 style={{
            fontSize: theme.typography.fontSize.lg,
            fontWeight: theme.typography.fontWeight.bold,
            margin: `0 0 ${theme.spacing.sm} 0`,
            color: theme.colors.text.primary,
          }}>
            No Autonomous Decisions
          </h3>
          <p style={{
            fontSize: theme.typography.fontSize.md,
            margin: 0,
            maxWidth: '400px',
            lineHeight: 1.5,
          }}>
            The AI system is processing data and making decisions. 
            When autonomous decisions are made, they will appear here with full transparency.
          </p>
        </div>
      </div>
    );
  }

  const renderTimelineView = () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing.sm,
    }}>
      {decisions.map((decision, index) => (
        <div key={decision.id} style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: theme.spacing.md,
          position: 'relative',
        }}>
          {/* Timeline Line */}
          {index < decisions.length - 1 && (
            <div style={{
              position: 'absolute',
              left: '15px',
              top: '40px',
              bottom: '-16px',
              width: '2px',
              backgroundColor: theme.colors.border.primary,
            }} />
          )}
          
          {/* Timeline Dot */}
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: decision.priority === 'critical' 
              ? theme.colors.status.critical 
              : decision.priority === 'high'
              ? '#FF6B35'
              : decision.priority === 'medium'
              ? theme.colors.status.warning
              : theme.colors.status.normal,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            color: theme.colors.primary.contrast,
            flexShrink: 0,
            zIndex: 1,
            position: 'relative',
          }}>
            {decision.priority === 'critical' ? '🚨' : 
             decision.priority === 'high' ? '⚠️' : 
             decision.priority === 'medium' ? '⚡' : '🤖'}
          </div>
          
          {/* Decision Card */}
          <div style={{ flex: 1 }}>
            <DecisionCard
              decision={decision}
              onSelect={onDecisionSelect}
              onOverride={onDecisionOverride}
              onFeedback={onDecisionFeedback}
              compact={true}
            />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div style={containerStyle}>
      {/* Summary Header */}
      <div style={{
        marginBottom: theme.spacing.lg,
        padding: theme.spacing.md,
        backgroundColor: theme.colors.background.surface,
        borderRadius: theme.borderRadius.md,
        border: `1px solid ${theme.colors.border.primary}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <span style={{
            fontSize: theme.typography.fontSize.md,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.text.primary,
          }}>
            {decisions.length} Autonomous {decisions.length === 1 ? 'Decision' : 'Decisions'}
          </span>
          {selectedDecision && (
            <span style={{
              marginLeft: theme.spacing.md,
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.text.secondary,
            }}>
              • Selected: {selectedDecision.title}
            </span>
          )}
        </div>
        
        <div style={{
          display: 'flex',
          gap: theme.spacing.lg,
          fontSize: theme.typography.fontSize.sm,
        }}>
          {/* Priority Summary */}
          {['critical', 'high', 'medium', 'low'].map(priority => {
            const count = decisions.filter(d => d.priority === priority).length;
            if (count === 0) return null;
            
            const colors = {
              critical: theme.colors.status.critical,
              high: '#FF6B35',
              medium: theme.colors.status.warning,
              low: theme.colors.status.normal,
            };
            
            return (
              <div key={priority} style={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing.sm,
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: colors[priority as keyof typeof colors],
                }} />
                <span style={{ color: theme.colors.text.secondary }}>
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}: {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Decision Content */}
      {viewMode === 'timeline' ? (
        renderTimelineView()
      ) : (
        <div style={gridStyle}>
          {decisions.map(decision => (
            <div key={decision.id}>
              <DecisionCard
                decision={decision}
                onSelect={onDecisionSelect}
                onOverride={onDecisionOverride}
                onFeedback={onDecisionFeedback}
                compact={viewMode === 'list'}
              />
              
              {/* Decision Tree Visualization */}
              {showDecisionTree && (
                <div style={{
                  marginTop: theme.spacing.md,
                  padding: theme.spacing.md,
                  backgroundColor: theme.colors.background.surface,
                  borderRadius: theme.borderRadius.md,
                  border: `1px solid ${theme.colors.border.primary}`,
                }}>
                  <h4 style={{
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.bold,
                    color: theme.colors.text.primary,
                    margin: `0 0 ${theme.spacing.md} 0`,
                  }}>
                    🌳 Decision Tree
                  </h4>
                  <DecisionTreeVisualizer
                    decisionTree={decision.decisionTree}
                    onNodeSelect={(nodeId) => {
                      console.log('Selected decision tree node:', nodeId);
                    }}
                    compact={true}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};