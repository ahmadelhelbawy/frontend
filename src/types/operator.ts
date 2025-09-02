/**
 * Shared interfaces and types for operator components and context
 * Ensures compatibility across all operator UI components
 */

// Alert Management
export interface Alert {
  id: string;
  storeId: string;
  cameraId?: string;
  cameraName?: string;
  alertType: 'detection' | 'behavioral' | 'system' | 'manual';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  description?: string;
  timestamp: string | Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string | Date;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string | Date;
  priority: number; // 1-10 scale
  escalated: boolean;
  escalatedTo?: string;
  escalatedAt?: string | Date;
  detectionId?: string;
  metadata?: {
    confidenceScore?: number;
    personCount?: number;
    suspiciousBehavior?: string[];
    videoSegmentUrl?: string;
    thumbnailUrl?: string;
    location?: string;
    riskScore?: number;
  };
  tags?: string[];
  assignee?: string;
  status: 'new' | 'acknowledged' | 'investigating' | 'resolved' | 'false_positive';
  responseTimeSla?: number; // minutes
  createdBy?: string;
}

// AI Model Health Monitoring
export interface AIModel {
  id: string;
  name: string;
  version: string;
  type: 'detection' | 'classification' | 'tracking' | 'behavioral';
  architecture: 'YOLO11' | 'CNN+Transformer+LSTM' | 'LSTM' | 'CNN' | 'Transformer' | 'Hybrid';
  status: 'healthy' | 'warning' | 'error' | 'offline' | 'loading';
  accuracy: number;
  latency: number;
  throughput: number;
  memoryUsage: number;
  gpuUtilization?: number;
  device: 'cpu' | 'cuda' | 'mps';
  modelFile?: string;
  lastUpdate: string;
  errorCount: number;
  totalRequests: number;
  successRate: number;
  performance: {
    timestamp: string;
    accuracy: number;
    latency: number;
    throughput: number;
    memoryUsage: number;
    gpuUtilization?: number;
  }[];
  configuration: Record<string, any>;
  endpoints: string[];
  isYOLO11?: boolean; // Helper flag for YOLO11 models
}

export interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical';
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
  activeConnections: number;
  uptime: number;
  lastHealthCheck: string;
  services: {
    name: string;
    status: 'running' | 'stopped' | 'error';
    uptime: number;
    memoryUsage: number;
    cpuUsage: number;
  }[];
}

// Camera Management
export interface Camera {
  id: string;
  name: string;
  location: string;
  storeId: string;
  status: 'online' | 'offline' | 'error' | 'maintenance';
  streamUrl: string;
  thumbnailUrl?: string;
  resolution: string;
  fps: number;
  recording: boolean;
  detectionEnabled: boolean;
  aiEnabled?: boolean;
  aiModelIds: string[];
  settings: {
    brightness: number;
    contrast: number;
    sensitivity: number;
    detectionZones: Array<{
      id: string;
      name: string;
      coordinates: number[];
      enabled: boolean;
    }>;
  };
  lastPing: string | Date;
  lastSeen?: string | Date;
  totalDetections: number;
  todayDetections: number;
  currentDetections?: number | Detection[];
  recentAlerts?: Alert[];
  healthScore?: number;
  metadata?: {
    model?: string;
    firmwareVersion?: string;
    ipAddress?: string;
    networkQuality?: number;
    storageUsedGb?: number;
    storageTotalGb?: number;
    temperatureC?: number;
  };
}

export interface Detection {
  id: string;
  cameraId: string;
  cameraName?: string;
  storeId?: string;
  timestamp: string | Date;
  type?: 'person' | 'suspicious_behavior' | 'object' | 'movement';
  className: string; // Required by MultiCameraGridView
  confidence: number;
  bbox: { x: number; y: number; width: number; height: number };
  trackId?: string;
  imageUrl?: string;
  videoUrl?: string;
  metadata?: {
    personCount?: number;
    suspiciousActivities?: string[];
    objectTypes?: string[];
    riskScore?: number;
    suspiciousActivity?: string;
    personId?: string;
    objectProperties?: Record<string, any>;
  };
  processed?: boolean;
  alertTriggered?: boolean;
  alertId?: string;
}

// Operator Actions
export interface QuickAction {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'emergency' | 'system' | 'communication' | 'workflow';
  actionType: 'api_call' | 'external_link' | 'internal_function';
  parameters: Record<string, any>;
  enabled: boolean;
  requiresConfirmation: boolean;
  permissionsRequired: string[];
  lastUsed?: string | Date;
  usageCount: number;
}

export interface EmergencyContact {
  id: string;
  name: string;
  role: string;
  department: string;
  phone: string;
  email: string;
  priority: 'primary' | 'secondary' | 'escalation';
  available247: boolean;
  currentStatus: 'available' | 'busy' | 'unavailable';
  lastContacted?: string | Date;
}

export interface SystemStatus {
  id: string;
  component: string;
  status: 'operational' | 'degraded' | 'maintenance' | 'outage';
  description: string;
  lastUpdated: string | Date;
  affectedFeatures?: string[];
  estimatedResolution?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface WorkflowTask {
  id: string;
  title: string;
  description: string;
  type: 'investigation' | 'maintenance' | 'report' | 'communication';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo: string;
  createdBy: string;
  createdAt: string | Date;
  dueDate?: string | Date;
  completedAt?: string | Date;
  estimatedDuration: number; // minutes
  actualDuration?: number; // minutes
  relatedAlertId?: string;
  relatedIncidentId?: string;
  checklist?: Array<{
    id: string;
    description: string;
    completed: boolean;
    completedAt?: string | Date;
  }>;
  attachments?: Array<{
    id: string;
    filename: string;
    url: string;
    uploadedAt: string | Date;
  }>;
}

// Advanced Filtering
export interface FilterCriteria {
  id: string;
  name: string;
  field: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean';
  options?: Array<{ value: string; label: string }>;
  operators: Array<'equals' | 'contains' | 'greater_than' | 'less_than' | 'between' | 'in'>;
  description?: string;
}

export interface FilterPreset {
  id: string;
  name: string;
  description?: string;
  userId: string;
  filters: Record<string, any>;
  isPublic: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  usageCount: number;
  category?: string;
}

export interface SearchHistory {
  id: string;
  userId: string;
  query: string;
  filters: Record<string, any>;
  resultCount: number;
  timestamp: string | Date;
  executionTime: number; // milliseconds
}

// Incident Management
export interface Incident {
  id: string;
  title: string;
  description: string;
  type: 'security' | 'technical' | 'operational' | 'safety';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  priority: number; // 1-10
  reporterId: string;
  assigneeId?: string;
  storeId: string;
  location?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  resolvedAt?: string | Date;
  relatedAlertIds: string[];
  relatedDetectionIds: string[];
  timeline: Array<{
    id: string;
    timestamp: string | Date;
    action: string;
    description: string;
    userId: string;
    userName: string;
  }>;
  comments: Array<{
    id: string;
    userId: string;
    userName: string;
    content: string;
    timestamp: string | Date;
    isInternal: boolean;
  }>;
  attachments: Array<{
    id: string;
    filename: string;
    url: string;
    uploadedBy: string;
    uploadedAt: string | Date;
    description?: string;
  }>;
  escalationHistory: Array<{
    id: string;
    fromUser: string;
    toUser: string;
    reason: string;
    timestamp: string | Date;
  }>;
  resolution?: {
    description: string;
    actionsTaken: string[];
    rootCause?: string;
    preventionMeasures?: string[];
    resolvedBy: string;
    resolvedAt: string | Date;
  };
}

// Performance Analytics
export interface PerformanceMetrics {
  operatorId: string;
  operatorName: string;
  dateRange: { start: string | Date; end: string | Date };
  alertsHandled: number;
  avgResponseTime: number; // minutes
  accuracyRate: number; // percentage
  incidentsCreated: number;
  incidentsResolved: number;
  falsePositiveRate: number; // percentage
  efficiencyScore: number; // calculated score
  shiftHours: number;
  breakTime: number; // minutes
  overtimeHours: number;
  performanceTrend: 'improving' | 'stable' | 'declining';
}

export interface TeamMetrics {
  teamId: string;
  teamName: string;
  dateRange: { start: string | Date; end: string | Date };
  totalOperators: number;
  activeOperators: number;
  totalAlerts: number;
  resolvedAlerts: number;
  avgTeamResponseTime: number; // minutes
  teamEfficiency: number; // percentage
  coveragePercentage: number; // shift coverage
  workloadDistribution: Array<{
    operatorId: string;
    operatorName: string;
    workloadPercentage: number;
  }>;
}

export interface SystemPerformance {
  dateRange: { start: string | Date; end: string | Date };
  totalDetections: number;
  truePositives: number;
  falsePositives: number;
  falseNegatives: number;
  systemAccuracy: number; // percentage
  avgDetectionTime: number; // milliseconds
  systemUptime: number; // percentage
  peakLoadTime: string | Date;
  performanceByHour: Array<{
    hour: string;
    detectionCount: number;
    accuracy: number;
    responseTime: number;
  }>;
  cameraPerformance: Array<{
    cameraId: string;
    cameraName: string;
    detectionCount: number;
    accuracy: number;
    uptime: number;
  }>;
}

// Common types
export interface Store {
  id: string;
  name: string;
  location: string;
  timezone: string;
  active: boolean;
}

export interface Operator {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: 'online' | 'offline' | 'break' | 'busy';
  shiftStart?: string | Date;
  shiftEnd?: string | Date;
  permissions: string[];
}

export interface User {
  id: string;
  username?: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  lastLogin?: string | Date;
  profileImageUrl?: string;
  status?: 'active' | 'inactive' | 'suspended';
}
