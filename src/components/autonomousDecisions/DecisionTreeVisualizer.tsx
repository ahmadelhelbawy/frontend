import React, { useState } from 'react';
import { useSecurityTheme } from '../../theme/ThemeProvider';
import { DecisionNode, DecisionTreeVisualizerProps } from '../../types/autonomousDecisions';

export const DecisionTreeVisualizer: React.FC<DecisionTreeVisualizerProps> = ({
  decisionTree,
  selectedNode,
  onNodeSelect,
  compact = false
}) => {
  const theme = useSecurityTheme();
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['root']));

  const toggleNodeExpansion = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const renderNode = (node: DecisionNode, level: number = 0, isLast: boolean = true): React.ReactElement => {
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedNode === node.id;
    const hasChildren = node.children && node.children.length > 0;

    const nodeStyle: React.CSSProperties = {
      marginLeft: level > 0 ? theme.spacing.lg : 0,
      marginBottom: theme.spacing.sm,
      position: 'relative',
    };

    const nodeContentStyle: React.CSSProperties = {
      padding: compact ? theme.spacing.sm : theme.spacing.md,
      backgroundColor: isSelected 
        ? theme.colors.primary.main + '20' 
        : theme.colors.background.elevated,
      border: `1px solid ${isSelected ? theme.colors.primary.main : theme.colors.border.primary}`,
      borderRadius: theme.borderRadius.md,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing.sm,
    };

    const confidenceColor = node.confidence > 0.8 
      ? theme.colors.status.normal 
      : node.confidence > 0.6 
      ? theme.colors.status.warning 
      : theme.colors.status.critical;

    return (
      <div key={node.id} style={nodeStyle}>
        {/* Connection Lines */}
        {level > 0 && (
          <>
            {/* Horizontal line */}
            <div style={{
              position: 'absolute',
              left: `-${theme.spacing.lg}`,
              top: '50%',
              width: theme.spacing.lg,
              height: '1px',
              backgroundColor: theme.colors.border.primary,
            }} />
            
            {/* Vertical line */}
            {!isLast && (
              <div style={{
                position: 'absolute',
                left: `-${theme.spacing.lg}`,
                top: '50%',
                bottom: `-${theme.spacing.sm}`,
                width: '1px',
                backgroundColor: theme.colors.border.primary,
              }} />
            )}
          </>
        )}

        {/* Node Content */}
        <div
          style={nodeContentStyle}
          onClick={() => onNodeSelect(node.id)}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = isSelected 
              ? theme.colors.primary.main + '30' 
              : theme.colors.background.surface;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = isSelected 
              ? theme.colors.primary.main + '20' 
              : theme.colors.background.elevated;
          }}
        >
          {/* Expand/Collapse Button */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNodeExpansion(node.id);
              }}
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: theme.colors.primary.main,
                color: theme.colors.primary.contrast,
                border: 'none',
                cursor: 'pointer',
                fontSize: theme.typography.fontSize.xs,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {isExpanded ? '−' : '+'}
            </button>
          )}

          {/* Node Icon */}
          <div style={{
            width: compact ? '24px' : '32px',
            height: compact ? '24px' : '32px',
            borderRadius: '50%',
            backgroundColor: confidenceColor + '20',
            color: confidenceColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: compact ? '12px' : '16px',
            flexShrink: 0,
          }}>
            {getNodeIcon(node)}
          </div>

          {/* Node Details */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: compact ? theme.typography.fontSize.xs : theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
              color: theme.colors.text.primary,
              marginBottom: theme.spacing.xs,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {node.condition}
            </div>
            
            <div style={{
              fontSize: theme.typography.fontSize.xs,
              color: theme.colors.text.secondary,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              → {node.result}
            </div>
          </div>

          {/* Confidence Badge */}
          <div style={{
            padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
            backgroundColor: confidenceColor + '20',
            color: confidenceColor,
            borderRadius: theme.borderRadius.sm,
            fontSize: theme.typography.fontSize.xs,
            fontWeight: theme.typography.fontWeight.medium,
            flexShrink: 0,
          }}>
            {Math.round(node.confidence * 100)}%
          </div>
        </div>

        {/* Child Nodes */}
        {hasChildren && isExpanded && (
          <div style={{ marginTop: theme.spacing.sm }}>
            {node.children!.map((child, index) => 
              renderNode(child, level + 1, index === node.children!.length - 1)
            )}
          </div>
        )}
      </div>
    );
  };

  const getNodeIcon = (node: DecisionNode): string => {
    // Determine icon based on node type or condition
    if (node.condition.toLowerCase().includes('person')) return '👤';
    if (node.condition.toLowerCase().includes('behavior')) return '🧠';
    if (node.condition.toLowerCase().includes('threat')) return '⚠️';
    if (node.condition.toLowerCase().includes('risk')) return '🎯';
    if (node.condition.toLowerCase().includes('face')) return '👤';
    if (node.condition.toLowerCase().includes('movement')) return '🏃';
    if (node.condition.toLowerCase().includes('time')) return '⏰';
    if (node.condition.toLowerCase().includes('location')) return '📍';
    return '🔍';
  };

  const containerStyle: React.CSSProperties = {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    overflow: 'auto',
    maxHeight: compact ? '300px' : '500px',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottom: `1px solid ${theme.colors.border.secondary}`,
  };

  const statsStyle: React.CSSProperties = {
    display: 'flex',
    gap: theme.spacing.md,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
  };

  if (!decisionTree || decisionTree.length === 0) {
    return (
      <div style={containerStyle}>
        <div style={{
          textAlign: 'center',
          padding: theme.spacing.lg,
          color: theme.colors.text.secondary,
        }}>
          <div style={{ fontSize: '32px', marginBottom: theme.spacing.md }}>🌳</div>
          <p>No decision tree data available</p>
        </div>
      </div>
    );
  }

  // Calculate tree statistics
  const totalNodes = decisionTree.reduce((count, node) => {
    const countChildren = (n: DecisionNode): number => {
      return 1 + (n.children?.reduce((sum, child) => sum + countChildren(child), 0) || 0);
    };
    return count + countChildren(node);
  }, 0);

  const averageConfidence = decisionTree.reduce((sum, node) => {
    const sumConfidence = (n: DecisionNode): { sum: number; count: number } => {
      const childStats = n.children?.reduce((acc, child) => {
        const childSum = sumConfidence(child);
        return { sum: acc.sum + childSum.sum, count: acc.count + childSum.count };
      }, { sum: 0, count: 0 }) || { sum: 0, count: 0 };
      
      return { sum: n.confidence + childStats.sum, count: 1 + childStats.count };
    };
    
    const nodeStats = sumConfidence(node);
    return { sum: sum.sum + nodeStats.sum, count: sum.count + nodeStats.count };
  }, { sum: 0, count: 0 });

  const avgConfidence = averageConfidence.count > 0 ? averageConfidence.sum / averageConfidence.count : 0;

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h4 style={{
          fontSize: compact ? theme.typography.fontSize.sm : theme.typography.fontSize.md,
          fontWeight: theme.typography.fontWeight.bold,
          color: theme.colors.text.primary,
          margin: 0,
        }}>
          Decision Tree Analysis
        </h4>
        
        <div style={statsStyle}>
          <span>Nodes: {totalNodes}</span>
          <span>Avg Confidence: {Math.round(avgConfidence * 100)}%</span>
          <span>Expanded: {expandedNodes.size}</span>
        </div>
      </div>

      {/* Controls */}
      <div style={{
        marginBottom: theme.spacing.md,
        display: 'flex',
        gap: theme.spacing.sm,
      }}>
        <button
          onClick={() => setExpandedNodes(new Set(getAllNodeIds(decisionTree)))}
          style={{
            padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
            backgroundColor: theme.colors.primary.main,
            color: theme.colors.primary.contrast,
            border: 'none',
            borderRadius: theme.borderRadius.sm,
            cursor: 'pointer',
            fontSize: theme.typography.fontSize.xs,
          }}
        >
          Expand All
        </button>
        
        <button
          onClick={() => setExpandedNodes(new Set(['root']))}
          style={{
            padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
            backgroundColor: theme.colors.background.elevated,
            color: theme.colors.text.primary,
            border: `1px solid ${theme.colors.border.primary}`,
            borderRadius: theme.borderRadius.sm,
            cursor: 'pointer',
            fontSize: theme.typography.fontSize.xs,
          }}
        >
          Collapse All
        </button>
      </div>

      {/* Tree Visualization */}
      <div style={{ overflow: 'auto' }}>
        {decisionTree.map(node => renderNode(node, 0, true))}
      </div>

      {/* Legend */}
      <div style={{
        marginTop: theme.spacing.md,
        paddingTop: theme.spacing.sm,
        borderTop: `1px solid ${theme.colors.border.secondary}`,
        fontSize: theme.typography.fontSize.xs,
        color: theme.colors.text.secondary,
      }}>
        <div style={{ marginBottom: theme.spacing.xs }}>
          <strong>Confidence Levels:</strong>
        </div>
        <div style={{ display: 'flex', gap: theme.spacing.md, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: theme.colors.status.normal,
            }} />
            <span>High (80%+)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: theme.colors.status.warning,
            }} />
            <span>Medium (60-80%)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: theme.colors.status.critical,
            }} />
            <span>Low (&lt;60%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get all node IDs
const getAllNodeIds = (nodes: DecisionNode[]): string[] => {
  const ids: string[] = [];
  
  const traverse = (node: DecisionNode) => {
    ids.push(node.id);
    if (node.children) {
      node.children.forEach(traverse);
    }
  };
  
  nodes.forEach(traverse);
  return ids;
};