// Autonomous Decision Monitoring Types

export interface AutonomousDecision {
  id: string;
  decisionType: DecisionType;
  
  // Decision Context
  triggeredBy: DecisionTrigger;
  personId: string;
  personTrackId: string;
  
  // Decision Details
  title: string;
  description: string;
  reasoning: string[];
  confidence: number;
  riskAssessment: RiskAssessment;
  
  // Timing
  timestamp: Date;
  processingTime: number; // milliseconds
  
  // Input Data
  inputData: DecisionInputData;
  
  // Decision Output
  actions: AutonomousAction[];
  recommendations: DecisionRecommendation[];
  
  // AI Model Information
  modelVersion: string;
  modelConfidence: number;
  algorithmUsed: string[];
  
  // Decision Tree
  decisionTree: DecisionNode[];
  
  // Outcome Tracking
  outcome?: DecisionOutcome;
  humanOverride?: HumanOverride;
  feedback?: DecisionFeedback;
  
  // Status
  status: DecisionStatus;
  priority: DecisionPriority;
  
  // Location Context
  location: {
    cameraId: string;
    cameraName: string;
    zone: string;
    coordinates: { x: number; y: number };
  };
}

export type DecisionType = 
  | 'threat_assessment'
  | 'behavior_analysis'
  | 'facial_recognition_match'
  | 'shoplifting_detection'
  | 'loitering_detection'
  | 'suspicious_activity'
  | 'group_behavior_analysis'
  | 'exit_monitoring'
  | 'staff_alert_decision'
  | 'evidence_collection_trigger'
  | 'escalation_decision'
  | 'intervention_recommendation';

export interface DecisionTrigger {
  type: 'person_detection' | 'behavior_change' | 'facial_match' | 'time_threshold' | 'location_change' | 'manual_review';
  source: string;
  data: any;
  timestamp: Date;
}

export interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: RiskFactor[];
  riskScore: number; // 0-100
  threatLevel: 'minimal' | 'moderate' | 'significant' | 'severe';
  immediateAction: boolean;
}

export interface RiskFactor {
  factor: string;
  weight: number;
  impact: 'positive' | 'negative' | 'neutral';
  confidence: number;
  description: string;
}

export interface DecisionInputData {
  // Person Data
  personData: {
    trackId: string;
    timeInStore: number;
    behaviorMetrics: any;
    movementPattern: string;
    facialRecognitionData?: any;
  };
  
  // Environmental Data
  environmentalData: {
    timeOfDay: string;
    crowdDensity: number;
    storeActivity: string;
    weatherConditions?: string;
  };
  
  // Historical Data
  historicalData: {
    previousIncidents: number;
    personHistory?: any;
    locationHistory: any[];
  };
  
  // Sensor Data
  sensorData: {
    videoFrames: string[];
    audioData?: any;
    motionData: any;
  };
}

export interface AutonomousAction {
  id: string;
  type: ActionType;
  description: string;
  executed: boolean;
  executedAt?: Date;
  result?: ActionResult;
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export type ActionType = 
  | 'alert_security_staff'
  | 'notify_management'
  | 'capture_evidence'
  | 'track_person'
  | 'escalate_to_supervisor'
  | 'contact_law_enforcement'
  | 'lock_down_area'
  | 'announce_warning'
  | 'record_incident'
  | 'update_person_profile'
  | 'trigger_alarm'
  | 'send_mobile_alert';

export interface ActionResult {
  success: boolean;
  message: string;
  timestamp: Date;
  responseTime: number;
  additionalData?: any;
}

export interface DecisionRecommendation {
  id: string;
  recommendation: string;
  reasoning: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  confidence: number;
  estimatedImpact: string;
  requiredResources: string[];
}

export interface DecisionNode {
  id: string;
  condition: string;
  result: string;
  confidence: number;
  children?: DecisionNode[];
  metadata: {
    rule: string;
    weight: number;
    source: string;
  };
}

export interface DecisionOutcome {
  actualResult: 'true_positive' | 'false_positive' | 'true_negative' | 'false_negative' | 'pending';
  verifiedBy?: string;
  verificationDate?: Date;
  notes?: string;
  impactAssessment?: string;
  lessonsLearned?: string[];
}

export interface HumanOverride {
  overriddenBy: string;
  overrideReason: string;
  overrideTimestamp: Date;
  originalDecision: string;
  newDecision: string;
  justification: string;
}

export interface DecisionFeedback {
  feedbackType: 'accuracy' | 'timing' | 'appropriateness' | 'effectiveness';
  rating: number; // 1-5
  comments: string;
  providedBy: string;
  providedAt: Date;
  improvements: string[];
}

export type DecisionStatus = 
  | 'processing'
  | 'completed'
  | 'executed'
  | 'overridden'
  | 'failed'
  | 'pending_review'
  | 'archived';

export type DecisionPriority = 'low' | 'medium' | 'high' | 'critical';

// Dashboard State Types
export interface AutonomousDecisionState {
  decisions: AutonomousDecision[];
  activeDecisions: AutonomousDecision[];
  selectedDecision?: AutonomousDecision;
  filterOptions: DecisionFilterOptions;
  sortOptions: DecisionSortOptions;
  viewMode: DecisionViewMode;
  realTimeUpdates: boolean;
  showDecisionTree: boolean;
}

export interface DecisionFilterOptions {
  decisionType?: DecisionType[];
  status?: DecisionStatus[];
  priority?: DecisionPriority[];
  riskLevel?: ('low' | 'medium' | 'high' | 'critical')[];
  timeRange?: {
    start: Date;
    end: Date;
  };
  confidenceRange?: {
    min: number;
    max: number;
  };
  modelVersion?: string[];
  cameraIds?: string[];
  zones?: string[];
  hasHumanOverride?: boolean;
  outcomeType?: ('true_positive' | 'false_positive' | 'true_negative' | 'false_negative' | 'pending')[];
}

export interface DecisionSortOptions {
  field: 'timestamp' | 'confidence' | 'riskScore' | 'processingTime' | 'priority';
  direction: 'asc' | 'desc';
}

export type DecisionViewMode = 'list' | 'grid' | 'timeline' | 'tree' | 'analytics';

// Real-time Update Types
export interface DecisionUpdate {
  type: 'decision_created' | 'decision_updated' | 'decision_executed' | 'decision_overridden' | 'feedback_added';
  decision: AutonomousDecision;
  timestamp: Date;
}

export interface DecisionMetrics {
  totalDecisions: number;
  decisionsToday: number;
  averageConfidence: number;
  averageProcessingTime: number;
  
  // Accuracy Metrics
  truePositives: number;
  falsePositives: number;
  trueNegatives: number;
  falseNegatives: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  
  // Performance Metrics
  decisionsPerHour: number;
  averageResponseTime: number;
  systemUptime: number;
  
  // Action Metrics
  actionsExecuted: number;
  successfulActions: number;
  failedActions: number;
  humanOverrides: number;
  
  // Risk Distribution
  lowRiskDecisions: number;
  mediumRiskDecisions: number;
  highRiskDecisions: number;
  criticalRiskDecisions: number;
}

// Component Props Types
export interface AutonomousDecisionDashboardProps {
  onDecisionSelect?: (decision: AutonomousDecision) => void;
  onDecisionOverride?: (decisionId: string, override: HumanOverride) => void;
  onDecisionFeedback?: (decisionId: string, feedback: DecisionFeedback) => void;
}

export interface DecisionCardProps {
  decision: AutonomousDecision;
  onSelect: (decision: AutonomousDecision) => void;
  onOverride: (decisionId: string) => void;
  onFeedback: (decisionId: string) => void;
  compact?: boolean;
}

export interface DecisionDetailsProps {
  decision: AutonomousDecision;
  onClose: () => void;
  onOverride: (decisionId: string, override: HumanOverride) => void;
  onFeedback: (decisionId: string, feedback: DecisionFeedback) => void;
  onUpdateOutcome: (decisionId: string, outcome: DecisionOutcome) => void;
}

export interface DecisionTreeVisualizerProps {
  decisionTree: DecisionNode[];
  selectedNode?: string;
  onNodeSelect: (nodeId: string) => void;
  compact?: boolean;
}

export interface DecisionFiltersProps {
  filters: DecisionFilterOptions;
  onFiltersChange: (filters: DecisionFilterOptions) => void;
  availableCameras: { id: string; name: string }[];
  availableZones: string[];
  availableModels: string[];
}

export interface DecisionMetricsProps {
  metrics: DecisionMetrics;
  loading?: boolean;
}

export interface DecisionAnalyticsProps {
  decisions: AutonomousDecision[];
  timeRange: { start: Date; end: Date };
  onTimeRangeChange: (range: { start: Date; end: Date }) => void;
}

// AI Model Performance Types
export interface ModelPerformance {
  modelId: string;
  modelName: string;
  version: string;
  
  // Performance Metrics
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  
  // Speed Metrics
  averageInferenceTime: number;
  throughput: number; // decisions per second
  
  // Resource Usage
  cpuUsage: number;
  memoryUsage: number;
  gpuUsage?: number;
  
  // Decision Quality
  averageConfidence: number;
  confidenceDistribution: { [key: string]: number };
  
  // Deployment Info
  deployedAt: Date;
  lastUpdated: Date;
  status: 'active' | 'inactive' | 'training' | 'deprecated';
}

// Decision Transparency Types
export interface DecisionTransparency {
  explainability: {
    featureImportance: { [feature: string]: number };
    decisionPath: string[];
    alternativeOutcomes: string[];
  };
  
  auditTrail: {
    dataInputs: string[];
    processingSteps: string[];
    outputGeneration: string[];
    qualityChecks: string[];
  };
  
  compliance: {
    regulatoryRequirements: string[];
    ethicalGuidelines: string[];
    biasChecks: string[];
    fairnessMetrics: { [metric: string]: number };
  };
}