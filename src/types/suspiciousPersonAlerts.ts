// Suspicious Person Alert Types

import { Person, RiskLevel, Evidence, Location } from './personTracking';

export interface SuspiciousPersonAlert {
  id: string;
  alertType: SuspiciousAlertType;
  person: Person;
  
  // Alert Details
  title: string;
  description: string;
  severity: AlertSeverity;
  confidence: number;
  
  // Timing
  triggeredAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  
  // Location Context
  location: Location;
  cameraSnapshot?: string;
  
  // Facial Recognition
  facialRecognitionMatch?: FacialRecognitionMatch;
  
  // Evidence
  evidence: Evidence[];
  autoCollectedEvidence: Evidence[];
  
  // Response
  status: AlertStatus;
  assignedTo?: string;
  responseActions: ResponseAction[];
  
  // AI Analysis
  aiAnalysis: AIAnalysisResult;
  behaviorTriggers: BehaviorTrigger[];
  
  // Escalation
  escalationLevel: EscalationLevel;
  escalationHistory: EscalationEvent[];
}

export type SuspiciousAlertType = 
  | 'known_shoplifter_detected'
  | 'suspicious_behavior'
  | 'concealment_detected'
  | 'loitering_alert'
  | 'evasive_movement'
  | 'staff_avoidance'
  | 'camera_avoidance'
  | 'group_coordination'
  | 'exit_without_payment'
  | 'high_risk_behavior'
  | 'facial_recognition_match'
  | 'banned_person_detected';

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export type AlertStatus = 
  | 'active'
  | 'acknowledged'
  | 'investigating'
  | 'resolved'
  | 'false_positive'
  | 'escalated';

export interface FacialRecognitionMatch {
  matchId: string;
  personId: string;
  confidence: number;
  matchType: 'known_shoplifter' | 'banned_person' | 'person_of_interest' | 'vip';
  lastSeen?: Date;
  encounterHistory: EncounterRecord[];
  notes?: string;
}

export interface EncounterRecord {
  id: string;
  date: Date;
  location: string;
  outcome: 'theft_confirmed' | 'false_alarm' | 'no_action' | 'banned' | 'warning_given';
  notes?: string;
  evidence?: Evidence[];
}

export interface ResponseAction {
  id: string;
  type: ResponseActionType;
  description: string;
  performedBy?: string;
  performedAt: Date;
  result?: string;
  evidence?: Evidence[];
}

export type ResponseActionType = 
  | 'security_notified'
  | 'staff_alerted'
  | 'evidence_collected'
  | 'person_approached'
  | 'police_called'
  | 'person_detained'
  | 'person_escorted'
  | 'incident_logged'
  | 'false_positive_marked';

export interface AIAnalysisResult {
  overallThreatLevel: RiskLevel;
  behaviorScore: number;
  facialRecognitionScore?: number;
  movementAnalysis: MovementAnalysis;
  contextualFactors: ContextualFactor[];
  recommendations: AIRecommendation[];
}

export interface MovementAnalysis {
  pattern: 'normal' | 'suspicious' | 'evasive' | 'purposeful' | 'erratic';
  speed: number;
  directionChanges: number;
  dwellAreas: string[];
  avoidancePatterns: string[];
}

export interface ContextualFactor {
  factor: string;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number;
  description: string;
}

export interface AIRecommendation {
  action: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reasoning: string;
  confidence: number;
}

export interface BehaviorTrigger {
  id: string;
  type: string;
  description: string;
  confidence: number;
  timestamp: Date;
  location: Location;
  evidence?: Evidence[];
}

export type EscalationLevel = 'none' | 'supervisor' | 'security_manager' | 'law_enforcement';

export interface EscalationEvent {
  id: string;
  level: EscalationLevel;
  triggeredAt: Date;
  triggeredBy: string;
  reason: string;
  notifiedPersons: string[];
  response?: string;
}

// Dashboard State Types
export interface SuspiciousPersonAlertState {
  alerts: SuspiciousPersonAlert[];
  activeAlerts: SuspiciousPersonAlert[];
  selectedAlert?: SuspiciousPersonAlert;
  filterOptions: AlertFilterOptions;
  sortOptions: AlertSortOptions;
  viewMode: AlertViewMode;
  autoRefresh: boolean;
  soundAlerts: boolean;
}

export interface AlertFilterOptions {
  severity?: AlertSeverity[];
  status?: AlertStatus[];
  alertType?: SuspiciousAlertType[];
  timeRange?: {
    start: Date;
    end: Date;
  };
  assignedTo?: string[];
  escalationLevel?: EscalationLevel[];
  cameraIds?: string[];
  zones?: string[];
  facialRecognitionOnly?: boolean;
  knownShopliftersOnly?: boolean;
}

export interface AlertSortOptions {
  field: 'triggeredAt' | 'severity' | 'confidence' | 'escalationLevel' | 'status';
  direction: 'asc' | 'desc';
}

export type AlertViewMode = 'list' | 'grid' | 'timeline' | 'map';

// Real-time Update Types
export interface AlertUpdate {
  type: 'alert_created' | 'alert_updated' | 'alert_acknowledged' | 'alert_resolved' | 'alert_escalated';
  alert: SuspiciousPersonAlert;
  timestamp: Date;
}

export interface AlertMetrics {
  totalActiveAlerts: number;
  criticalAlerts: number;
  highSeverityAlerts: number;
  acknowledgedAlerts: number;
  resolvedAlertsToday: number;
  falsePositiveRate: number;
  averageResponseTime: number; // in minutes
  knownShoplifterDetections: number;
  facialRecognitionMatches: number;
  escalatedAlerts: number;
}

// Component Props Types
export interface SuspiciousPersonAlertDashboardProps {
  onAlertSelect?: (alert: SuspiciousPersonAlert) => void;
  onAlertAcknowledge?: (alertId: string) => void;
  onAlertResolve?: (alertId: string, resolution: string) => void;
  onAlertEscalate?: (alertId: string, level: EscalationLevel) => void;
}

export interface AlertCardProps {
  alert: SuspiciousPersonAlert;
  onSelect: (alert: SuspiciousPersonAlert) => void;
  onAcknowledge: (alertId: string) => void;
  onResolve: (alertId: string) => void;
  onEscalate: (alertId: string, level: EscalationLevel) => void;
  compact?: boolean;
}

export interface AlertDetailsProps {
  alert: SuspiciousPersonAlert;
  onClose: () => void;
  onAcknowledge: (alertId: string) => void;
  onResolve: (alertId: string, resolution: string) => void;
  onEscalate: (alertId: string, level: EscalationLevel) => void;
  onAddEvidence: (alertId: string, evidence: Evidence) => void;
  onAddResponseAction: (alertId: string, action: ResponseAction) => void;
}

export interface AlertFiltersProps {
  filters: AlertFilterOptions;
  onFiltersChange: (filters: AlertFilterOptions) => void;
  availableCameras: { id: string; name: string }[];
  availableZones: string[];
  availableAssignees: { id: string; name: string }[];
}

export interface AlertMetricsProps {
  metrics: AlertMetrics;
  loading?: boolean;
}

export interface FacialRecognitionAlertProps {
  alert: SuspiciousPersonAlert;
  match: FacialRecognitionMatch;
  onViewHistory: (personId: string) => void;
  onUpdateNotes: (personId: string, notes: string) => void;
}

// Alert Sound Configuration
export interface AlertSoundConfig {
  enabled: boolean;
  volume: number;
  sounds: {
    critical: string;
    high: string;
    medium: string;
    low: string;
  };
  repeatInterval?: number; // seconds
  maxRepeats?: number;
}