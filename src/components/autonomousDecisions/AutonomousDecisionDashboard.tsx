import React, { useState, useEffect, useCallback } from 'react';
import { useSecurityTheme } from '../../theme/ThemeProvider';
import { useAuth } from '../../auth/AuthContext';
import { Permission } from '../../auth/types';
import { ProtectedRoute } from '../auth/ProtectedRoute';
import {
  AutonomousDecision,
  AutonomousDecisionState,
  DecisionFilterOptions,
  DecisionSortOptions,
  DecisionViewMode,
  DecisionMetrics,
  DecisionUpdate,
  DecisionType,
  DecisionStatus,
  DecisionPriority,
  HumanOverride,
  DecisionFeedback,
  DecisionOutcome
} from '../../types/autonomousDecisions';
import { DecisionGrid } from './DecisionGrid';
import { DecisionFilters } from './DecisionFilters';
import { DecisionMetrics as MetricsComponent } from './DecisionMetrics';
import { DecisionDetailsPanel } from './DecisionDetailsPanel';
import { DecisionAnalytics } from './DecisionAnalytics';

// Mock data generator for autonomous decisions
const generateMockDecision = (id: string): AutonomousDecision => {
  const decisionTypes: DecisionType[] = [
    'threat_assessment',
    'behavior_analysis',
    'facial_recognition_match',
    'shoplifting_detection',
    'loitering_detection',
    'suspicious_activity',
    'staff_alert_decision',
    'evidence_collection_trigger'
  ];
  
  const statuses: DecisionStatus[] = ['processing', 'completed', 'executed', 'pending_review'];
  const priorities: DecisionPriority[] = ['low', 'medium', 'high', 'critical'];
  const riskLevels = ['low', 'medium', 'high', 'critical'];
  
  const decisionType = decisionTypes[Math.floor(Math.random() * decisionTypes.length)];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const priority = priorities[Math.floor(Math.random() * priorities.length)];
  const riskLevel = riskLevels[Math.floor(Math.random() * riskLevels.length)];
  
  const processingTime = Math.floor(Math.random() * 500) + 50; // 50-550ms
  const confidence = 0.6 + Math.random() * 0.4; // 60-100%
  const riskScore = Math.floor(Math.random() * 100);
  
  const decision: AutonomousDecision = {
    id,
    decisionType: decisionType || 'alert_approval',
    
    triggeredBy: {
      type: 'person_detection',
      source: `CAM-${Math.floor(Math.random() * 5) + 1}`,
      data: { personId: `PERSON-${Math.floor(Math.random() * 100)}` },
      timestamp: new Date(Date.now() - Math.random() * 3600000)
    },
    
    personId: `PERSON-${Math.floor(Math.random() * 100)}`,
    personTrackId: `TRACK-${Math.floor(Math.random() * 1000)}`,
    
    title: getDecisionTitle(decisionType || 'alert_approval'),
    description: getDecisionDescription(decisionType || 'alert_approval'),
    reasoning: getDecisionReasoning(decisionType || 'alert_approval'),
    confidence,
    
    riskAssessment: {
      overallRisk: riskLevel as any,
      riskFactors: [
        {
          factor: 'Behavioral Pattern',
          weight: 0.4,
          impact: 'negative',
          confidence: 0.85,
          description: 'Suspicious movement patterns detected'
        },
        {
          factor: 'Time in Store',
          weight: 0.3,
          impact: 'negative',
          confidence: 0.75,
          description: 'Extended loitering time'
        },
        {
          factor: 'Historical Data',
          weight: 0.3,
          impact: Math.random() > 0.5 ? 'negative' : 'neutral',
          confidence: 0.65,
          description: 'Previous incident history'
        }
      ],
      riskScore,
      threatLevel: riskScore > 80 ? 'severe' : riskScore > 60 ? 'significant' : riskScore > 40 ? 'moderate' : 'minimal',
      immediateAction: riskScore > 70
    },
    
    timestamp: new Date(Date.now() - Math.random() * 7200000), // Within last 2 hours
    processingTime,
    
    inputData: {
      personData: {
        trackId: `TRACK-${Math.floor(Math.random() * 1000)}`,
        timeInStore: Math.floor(Math.random() * 3600),
        behaviorMetrics: {},
        movementPattern: 'suspicious'
      },
      environmentalData: {
        timeOfDay: new Date().getHours() > 12 ? 'afternoon' : 'morning',
        crowdDensity: Math.random(),
        storeActivity: 'normal'
      },
      historicalData: {
        previousIncidents: Math.floor(Math.random() * 5),
        locationHistory: []
      },
      sensorData: {
        videoFrames: [],
        motionData: {}
      }
    },
    
    actions: [
      {
        id: `action-${id}-1`,
        type: 'alert_security_staff',
        description: 'Security staff notified of suspicious activity',
        executed: Math.random() > 0.3,
        executedAt: new Date(),
        confidence: 0.9,
        priority: 'high',
        result: {
          success: true,
          message: 'Alert sent successfully',
          timestamp: new Date(),
          responseTime: 150
        }
      }
    ],
    
    recommendations: [
      {
        id: `rec-${id}-1`,
        recommendation: 'Continue monitoring person closely',
        reasoning: 'High risk behavior patterns detected',
        priority: 'high',
        confidence: 0.85,
        estimatedImpact: 'Prevent potential theft incident',
        requiredResources: ['Security staff attention', 'Camera focus']
      }
    ],
    
    modelVersion: `v${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 10)}`,
    modelConfidence: confidence,
    algorithmUsed: ['YOLO11', 'Behavioral CNN', 'Risk Assessment ML'],
    
    decisionTree: [
      {
        id: 'root',
        condition: 'Person detected in store',
        result: 'Analyze behavior',
        confidence: 0.95,
        metadata: {
          rule: 'person_detection',
          weight: 1.0,
          source: 'vision_pipeline'
        },
        children: [
          {
            id: 'behavior_check',
            condition: 'Suspicious behavior detected',
            result: 'Assess threat level',
            confidence: 0.8,
            metadata: {
              rule: 'behavior_analysis',
              weight: 0.7,
              source: 'behavior_model'
            }
          }
        ]
      }
    ],
    
    status: status || 'pending',
    priority: priority || 'medium',
    
    location: {
      cameraId: `CAM-${Math.floor(Math.random() * 5) + 1}`,
      cameraName: `Camera ${Math.floor(Math.random() * 5) + 1}`,
      zone: ['entrance', 'electronics', 'clothing', 'checkout', 'exit'][Math.floor(Math.random() * 5)],
      coordinates: { x: Math.random() * 1920, y: Math.random() * 1080 }
    }
  };

  // Add outcome for completed decisions
  if (status === 'completed' || status === 'executed') {
    const outcomes = ['true_positive', 'false_positive', 'true_negative', 'false_negative'];
    decision.outcome = {
      actualResult: outcomes[Math.floor(Math.random() * outcomes.length)] as any,
      verifiedBy: 'Security Officer',
      verificationDate: new Date(),
      notes: 'Decision outcome verified through manual review'
    };
  }

  // Add human override for some decisions
  if (Math.random() < 0.1) {
    decision.humanOverride = {
      overriddenBy: 'Security Manager',
      overrideReason: 'False positive - customer behavior was normal',
      overrideTimestamp: new Date(),
      originalDecision: 'High risk threat',
      newDecision: 'Low risk - no action needed',
      justification: 'Manual review showed normal shopping behavior'
    };
  }

  return decision;
};

const getDecisionTitle = (type: DecisionType): string => {
  const titles = {
    threat_assessment: '🎯 Threat Assessment Decision',
    behavior_analysis: '🧠 Behavior Analysis Decision',
    facial_recognition_match: '👤 Facial Recognition Decision',
    shoplifting_detection: '🚫 Shoplifting Detection Decision',
    loitering_detection: '⏰ Loitering Detection Decision',
    suspicious_activity: '⚠️ Suspicious Activity Decision',
    group_behavior_analysis: '👥 Group Behavior Decision',
    exit_monitoring: '🚪 Exit Monitoring Decision',
    staff_alert_decision: '📢 Staff Alert Decision',
    evidence_collection_trigger: '📁 Evidence Collection Decision',
    escalation_decision: '⬆️ Escalation Decision',
    intervention_recommendation: '🎯 Intervention Decision'
  };
  return titles[type] || 'AI Decision';
};

const getDecisionDescription = (type: DecisionType): string => {
  const descriptions = {
    threat_assessment: 'AI assessed threat level based on behavioral patterns and risk factors',
    behavior_analysis: 'Behavioral analysis completed with suspicious activity indicators',
    facial_recognition_match: 'Facial recognition system identified person of interest',
    shoplifting_detection: 'Potential shoplifting behavior detected and analyzed',
    loitering_detection: 'Extended loitering behavior identified in restricted area',
    suspicious_activity: 'Multiple suspicious behavior indicators triggered assessment',
    group_behavior_analysis: 'Coordinated group behavior patterns analyzed',
    exit_monitoring: 'Exit behavior monitoring detected potential theft attempt',
    staff_alert_decision: 'Decision made to alert security staff based on risk assessment',
    evidence_collection_trigger: 'Automatic evidence collection triggered by high-risk behavior',
    escalation_decision: 'Decision to escalate incident to higher authority level',
    intervention_recommendation: 'AI recommended immediate intervention based on threat analysis'
  };
  return descriptions[type] || 'Autonomous AI decision made';
};

const getDecisionReasoning = (type: DecisionType): string[] => {
  const reasoningMap = {
    threat_assessment: [
      'Person exhibited multiple suspicious behavior patterns',
      'Risk score exceeded threshold of 70/100',
      'Historical data indicates elevated threat potential',
      'Environmental factors support threat assessment'
    ],
    behavior_analysis: [
      'Concealment behavior detected with 85% confidence',
      'Evasive movement patterns identified',
      'Extended dwell time in high-value areas',
      'Avoiding staff and camera positions'
    ],
    facial_recognition_match: [
      'Face match found in known shoplifter database',
      'Confidence score of 92% for identity match',
      'Previous incident history confirms identity',
      'Biometric verification completed successfully'
    ],
    shoplifting_detection: [
      'Item concealment behavior observed',
      'Suspicious handling of merchandise',
      'Movement toward exit without payment',
      'Behavioral pattern matches known theft indicators'
    ],
    loitering_detection: [
      'Extended presence in restricted area',
      'Unusual movement patterns detected',
      'Time threshold exceeded for location',
      'Behavioral analysis indicates loitering'
    ]
  };
  
  return (reasoningMap as any)[type] || [
    'AI analysis completed with high confidence',
    'Multiple data sources corroborate decision',
    'Risk assessment indicates action required',
    'Decision aligns with security protocols'
  ];
};

export const AutonomousDecisionDashboard: React.FC = () => {
  const theme = useSecurityTheme();
  const { hasPermission } = useAuth();
  
  const [state, setState] = useState<AutonomousDecisionState>({
    decisions: [],
    activeDecisions: [],
    selectedDecision: undefined,
    filterOptions: {},
    sortOptions: { field: 'timestamp', direction: 'desc' },
    viewMode: 'list',
    realTimeUpdates: true,
    showDecisionTree: false
  });
  
  const [metrics, setMetrics] = useState<DecisionMetrics>({
    totalDecisions: 0,
    decisionsToday: 0,
    averageConfidence: 0,
    averageProcessingTime: 0,
    truePositives: 0,
    falsePositives: 0,
    trueNegatives: 0,
    falseNegatives: 0,
    accuracy: 0,
    precision: 0,
    recall: 0,
    f1Score: 0,
    decisionsPerHour: 0,
    averageResponseTime: 0,
    systemUptime: 99.8,
    actionsExecuted: 0,
    successfulActions: 0,
    failedActions: 0,
    humanOverrides: 0,
    lowRiskDecisions: 0,
    mediumRiskDecisions: 0,
    highRiskDecisions: 0,
    criticalRiskDecisions: 0
  });
  
  const [loading, setLoading] = useState(true);

  // Initialize mock data
  useEffect(() => {
    const mockDecisions = Array.from({ length: 20 }, (_, i) => generateMockDecision(`DECISION-${i + 1}`));
    
    setState(prev => ({
      ...prev,
      decisions: mockDecisions,
      activeDecisions: mockDecisions.filter(d => d.status === 'processing' || d.status === 'pending_review')
    }));
    
    // Calculate metrics
    const totalDecisions = mockDecisions.length;
    const decisionsToday = mockDecisions.filter(d => 
      d.timestamp.toDateString() === new Date().toDateString()
    ).length;
    
    const averageConfidence = mockDecisions.reduce((sum, d) => sum + d.confidence, 0) / totalDecisions;
    const averageProcessingTime = mockDecisions.reduce((sum, d) => sum + d.processingTime, 0) / totalDecisions;
    
    // Calculate accuracy metrics
    const withOutcomes = mockDecisions.filter(d => d.outcome);
    const truePositives = withOutcomes.filter(d => d.outcome?.actualResult === 'true_positive').length;
    const falsePositives = withOutcomes.filter(d => d.outcome?.actualResult === 'false_positive').length;
    const trueNegatives = withOutcomes.filter(d => d.outcome?.actualResult === 'true_negative').length;
    const falseNegatives = withOutcomes.filter(d => d.outcome?.actualResult === 'false_negative').length;
    
    const accuracy = withOutcomes.length > 0 ? (truePositives + trueNegatives) / withOutcomes.length : 0;
    const precision = (truePositives + falsePositives) > 0 ? truePositives / (truePositives + falsePositives) : 0;
    const recall = (truePositives + falseNegatives) > 0 ? truePositives / (truePositives + falseNegatives) : 0;
    const f1Score = (precision + recall) > 0 ? 2 * (precision * recall) / (precision + recall) : 0;
    
    const actionsExecuted = mockDecisions.reduce((sum, d) => sum + d.actions.filter(a => a.executed).length, 0);
    const successfulActions = mockDecisions.reduce((sum, d) => 
      sum + d.actions.filter(a => a.executed && a.result?.success).length, 0);
    const humanOverrides = mockDecisions.filter(d => d.humanOverride).length;
    
    // Risk distribution
    const lowRiskDecisions = mockDecisions.filter(d => d.riskAssessment.overallRisk === 'low').length;
    const mediumRiskDecisions = mockDecisions.filter(d => d.riskAssessment.overallRisk === 'medium').length;
    const highRiskDecisions = mockDecisions.filter(d => d.riskAssessment.overallRisk === 'high').length;
    const criticalRiskDecisions = mockDecisions.filter(d => d.riskAssessment.overallRisk === 'critical').length;
    
    setMetrics({
      totalDecisions,
      decisionsToday,
      averageConfidence,
      averageProcessingTime,
      truePositives,
      falsePositives,
      trueNegatives,
      falseNegatives,
      accuracy,
      precision,
      recall,
      f1Score,
      decisionsPerHour: Math.floor(totalDecisions / 24),
      averageResponseTime: averageProcessingTime / 1000, // Convert to seconds
      systemUptime: 99.8,
      actionsExecuted,
      successfulActions,
      failedActions: actionsExecuted - successfulActions,
      humanOverrides,
      lowRiskDecisions,
      mediumRiskDecisions,
      highRiskDecisions,
      criticalRiskDecisions
    });
    
    setLoading(false);
  }, []);

  // Real-time updates simulation
  useEffect(() => {
    if (!state.realTimeUpdates) return;

    const interval = setInterval(() => {
      // Randomly generate new decisions
      if (Math.random() < 0.15) { // 15% chance every 10 seconds
        const newDecision = generateMockDecision(`DECISION-${Date.now()}`);
        
        setState(prev => ({
          ...prev,
          decisions: [newDecision, ...prev.decisions].slice(0, 100), // Keep last 100 decisions
          activeDecisions: [newDecision, ...prev.activeDecisions.filter(d => 
            d.status === 'processing' || d.status === 'pending_review'
          )]
        }));

        // Update metrics
        setMetrics(prev => ({
          ...prev,
          totalDecisions: prev.totalDecisions + 1,
          decisionsToday: prev.decisionsToday + 1,
          decisionsPerHour: prev.decisionsPerHour + 0.1
        }));
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [state.realTimeUpdates]);

  const handleDecisionSelect = useCallback((decision: AutonomousDecision) => {
    setState(prev => ({
      ...prev,
      selectedDecision: decision
    }));
  }, []);

  const handleDecisionOverride = useCallback((decisionId: string, override: HumanOverride) => {
    setState(prev => ({
      ...prev,
      decisions: prev.decisions.map(decision => 
        decision.id === decisionId 
          ? { ...decision, humanOverride: override, status: 'overridden' }
          : decision
      ),
      activeDecisions: prev.activeDecisions.filter(d => d.id !== decisionId)
    }));
    
    setMetrics(prev => ({
      ...prev,
      humanOverrides: prev.humanOverrides + 1
    }));
  }, []);

  const handleDecisionFeedback = useCallback((decisionId: string, feedback: DecisionFeedback) => {
    setState(prev => ({
      ...prev,
      decisions: prev.decisions.map(decision => 
        decision.id === decisionId 
          ? { ...decision, feedback }
          : decision
      )
    }));
  }, []);

  const handleFiltersChange = useCallback((filters: DecisionFilterOptions) => {
    setState(prev => ({
      ...prev,
      filterOptions: filters
    }));
  }, []);

  const handleViewModeChange = useCallback((viewMode: DecisionViewMode) => {
    setState(prev => ({
      ...prev,
      viewMode
    }));
  }, []);

  const handleCloseDetails = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedDecision: undefined
    }));
  }, []);

  // Filter and sort decisions
  const filteredAndSortedDecisions = React.useMemo(() => {
    let filtered = state.decisions;

    // Apply filters
    if (state.filterOptions.decisionType?.length) {
      filtered = filtered.filter(d => state.filterOptions.decisionType!.includes(d.decisionType));
    }
    if (state.filterOptions.status?.length) {
      filtered = filtered.filter(d => state.filterOptions.status!.includes(d.status));
    }
    if (state.filterOptions.priority?.length) {
      filtered = filtered.filter(d => state.filterOptions.priority!.includes(d.priority));
    }
    if (state.filterOptions.riskLevel?.length) {
      filtered = filtered.filter(d => state.filterOptions.riskLevel!.includes(d.riskAssessment.overallRisk));
    }
    if (state.filterOptions.hasHumanOverride !== undefined) {
      filtered = filtered.filter(d => !!d.humanOverride === state.filterOptions.hasHumanOverride);
    }
    if (state.filterOptions.confidenceRange) {
      const { min, max } = state.filterOptions.confidenceRange;
      filtered = filtered.filter(d => d.confidence >= min && d.confidence <= max);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const { field, direction } = state.sortOptions;
      let aValue: any, bValue: any;

      switch (field) {
        case 'timestamp':
          aValue = a.timestamp.getTime();
          bValue = b.timestamp.getTime();
          break;
        case 'confidence':
          aValue = a.confidence;
          bValue = b.confidence;
          break;
        case 'riskScore':
          aValue = a.riskAssessment.riskScore;
          bValue = b.riskAssessment.riskScore;
          break;
        case 'processingTime':
          aValue = a.processingTime;
          bValue = b.processingTime;
          break;
        case 'priority':
          const priorityOrder = { low: 0, medium: 1, high: 2, critical: 3 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        default:
          return 0;
      }

      if (direction === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [state.decisions, state.filterOptions, state.sortOptions]);

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: theme.colors.background.primary,
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily,
  };

  const headerStyle: React.CSSProperties = {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background.surface,
    borderBottom: `1px solid ${theme.colors.border.primary}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const contentStyle: React.CSSProperties = {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  };

  const mainContentStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  };

  const sidebarStyle: React.CSSProperties = {
    width: state.selectedDecision ? '500px' : '0px',
    backgroundColor: theme.colors.background.surface,
    borderLeft: `1px solid ${theme.colors.border.primary}`,
    transition: 'width 0.3s ease',
    overflow: 'hidden',
  };

  return (
    <ProtectedRoute requiredPermission={Permission.VIEW_AI_DECISIONS}>
      <div style={containerStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div>
            <h1 style={{
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.bold,
              margin: 0,
              color: theme.colors.text.primary,
            }}>
              🤖 Autonomous Decision Monitoring
            </h1>
            <p style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.text.secondary,
              margin: `${theme.spacing.sm} 0 0 0`,
            }}>
              Monitor AI decision-making processes with full transparency and auditability
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: theme.spacing.md, alignItems: 'center' }}>
            {/* View Mode Toggle */}
            <div style={{ display: 'flex', gap: theme.spacing.sm }}>
              {(['list', 'grid', 'timeline', 'analytics'] as DecisionViewMode[]).map(mode => (
                <button
                  key={mode}
                  onClick={() => handleViewModeChange(mode)}
                  style={{
                    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                    backgroundColor: state.viewMode === mode 
                      ? theme.colors.primary.main 
                      : theme.colors.background.elevated,
                    color: state.viewMode === mode 
                      ? theme.colors.primary.contrast 
                      : theme.colors.text.primary,
                    border: `1px solid ${theme.colors.border.primary}`,
                    borderRadius: theme.borderRadius.md,
                    cursor: 'pointer',
                    fontSize: theme.typography.fontSize.sm,
                    textTransform: 'capitalize',
                  }}
                >
                  {mode}
                </button>
              ))}
            </div>
            
            {/* Controls */}
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing.sm,
              fontSize: theme.typography.fontSize.sm,
              cursor: 'pointer',
            }}>
              <input
                type="checkbox"
                checked={state.showDecisionTree}
                onChange={(e) => setState(prev => ({ ...prev, showDecisionTree: e.target.checked }))}
                style={{ accentColor: theme.colors.primary.main }}
              />
              🌳 Show Decision Trees
            </label>
            
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing.sm,
              fontSize: theme.typography.fontSize.sm,
              cursor: 'pointer',
            }}>
              <input
                type="checkbox"
                checked={state.realTimeUpdates}
                onChange={(e) => setState(prev => ({ ...prev, realTimeUpdates: e.target.checked }))}
                style={{ accentColor: theme.colors.primary.main }}
              />
              🔄 Real-time Updates
            </label>
          </div>
        </div>

        <div style={contentStyle}>
          <div style={mainContentStyle}>
            {/* Metrics */}
            <MetricsComponent metrics={metrics} loading={loading} />
            
            {/* Filters */}
            <DecisionFilters
              filters={state.filterOptions}
              onFiltersChange={handleFiltersChange}
              availableCameras={[
                { id: 'CAM-001', name: 'Camera 1' },
                { id: 'CAM-002', name: 'Camera 2' },
                { id: 'CAM-003', name: 'Camera 3' },
                { id: 'CAM-004', name: 'Camera 4' },
                { id: 'CAM-005', name: 'Camera 5' },
              ]}
              availableZones={['entrance', 'electronics', 'clothing', 'checkout', 'exit']}
              availableModels={['v1.0', 'v1.1', 'v2.0', 'v2.1', 'v3.0']}
            />
            
            {/* Decision Content */}
            {state.viewMode === 'analytics' ? (
              <DecisionAnalytics
                decisions={filteredAndSortedDecisions}
                timeRange={{
                  start: new Date(Date.now() - 24 * 60 * 60 * 1000),
                  end: new Date()
                }}
                onTimeRangeChange={(range) => {
                  // Handle time range change
                }}
              />
            ) : (
              <DecisionGrid
                decisions={filteredAndSortedDecisions}
                selectedDecision={state.selectedDecision}
                onDecisionSelect={handleDecisionSelect}
                onDecisionOverride={(decisionId) => {
                  // Handle override - would show override dialog
                  console.log('Override decision:', decisionId);
                }}
                onDecisionFeedback={(decisionId) => {
                  // Handle feedback - would show feedback dialog
                  console.log('Provide feedback for decision:', decisionId);
                }}
                viewMode={state.viewMode}
                showDecisionTree={state.showDecisionTree}
                loading={loading}
              />
            )}
          </div>
          
          {/* Details Sidebar */}
          <div style={sidebarStyle}>
            {state.selectedDecision && (
              <DecisionDetailsPanel
                decision={state.selectedDecision}
                onClose={handleCloseDetails}
                onOverride={handleDecisionOverride}
                onFeedback={handleDecisionFeedback}
                onUpdateOutcome={(decisionId, outcome) => {
                  setState(prev => ({
                    ...prev,
                    decisions: prev.decisions.map(d => 
                      d.id === decisionId ? { ...d, outcome } : d
                    )
                  }));
                }}
              />
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};