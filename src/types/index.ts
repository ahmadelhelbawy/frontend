/**
 * Centralized Types Export
 * Single source of truth for all application types
 */

// Core application types
export type ID = string;

// Re-export from existing type files - ensure proper imports
import type {
  Alert,
  AIModel,
  SystemHealth,
  Camera,
  Detection,
  QuickAction,
  EmergencyContact,
  SystemStatus,
  WorkflowTask,
  FilterCriteria,
  FilterPreset,
  SearchHistory,
  Incident,
  PerformanceMetrics,
  TeamMetrics,
  SystemPerformance,
  Store,
  Operator,
  User
} from './operator';

export type {
  Alert,
  AIModel,
  SystemHealth,
  Camera,
  Detection,
  QuickAction,
  EmergencyContact,
  SystemStatus,
  WorkflowTask,
  FilterCriteria,
  FilterPreset,
  SearchHistory,
  Incident,
  PerformanceMetrics,
  TeamMetrics,
  SystemPerformance,
  Store,
  Operator,
  User
};

export type {
  APIResponse,
  PaginatedAPIResponse,
  HTTPResponse,
  AuthResponse,
  APIError,
  WSMessage,
  RequestConfig,
  CameraResponse,
  AlertResponse,
  DetectionResponse,
  SystemHealthResponse,
  AIModelResponse
} from './api';

// Context-specific types for state management
export interface OperatorState {
  // Core data
  cameras: Camera[];
  alerts: Alert[];
  detections: Detection[];
  incidents: Incident[];
  aiModels: AIModel[];
  systemHealth?: SystemHealth;
  
  // Current selections
  selectedCameraId?: ID;
  currentUser?: User;
  
  // Loading states
  loading: boolean;
  alertsLoading: boolean;
  camerasLoading: boolean;
  
  // Error states
  error?: string;
  alertsError?: string;
  
  // Connection status
  isConnected: boolean;
  lastUpdated?: string;
  
  // Operator-specific data
  operators: Operator[];
  quickActions: QuickAction[];
  emergencyContacts: EmergencyContact[];
  systemStatus: SystemStatus[];
  workflowTasks: WorkflowTask[];
  
  // Filtering and search
  filterCriteria: FilterCriteria[];
  filterPresets: FilterPreset[];
  searchHistory: SearchHistory[];
  currentFilters: Record<string, any>;
  
  // Analytics
  operatorMetrics: PerformanceMetrics[];
  teamMetrics: TeamMetrics[];
  systemPerformance: SystemPerformance[];
  
  // Date range for analytics
  dateRange: {
    start: string;
    end: string;
  };
}

export interface OperatorActions {
  // Data setters
  setCameras: (cameras: Camera[]) => void;
  setAlerts: (alerts: Alert[]) => void;
  setDetections: (detections: Detection[]) => void;
  setIncidents: (incidents: Incident[]) => void;
  setAIModels: (models: AIModel[]) => void;
  setSystemHealth: (health: SystemHealth) => void;
  
  // Selections
  selectCamera: (cameraId?: ID) => void;
  setCurrentUser: (user?: User) => void;
  
  // Loading states
  setLoading: (loading: boolean) => void;
  setAlertsLoading: (loading: boolean) => void;
  setCamerasLoading: (loading: boolean) => void;
  
  // Error handling
  setError: (error?: string) => void;
  setAlertsError: (error?: string) => void;
  
  // Connection
  setConnected: (connected: boolean) => void;
  updateLastUpdated: () => void;
  
  // Alert management
  acknowledgeAlert: (alertId: ID) => void;
  resolveAlert: (alertId: ID, resolution?: string) => void;
  escalateAlert: (alertId: ID, escalatedTo?: string, reason?: string) => void;
  bulkAlertAction: (alertIds: ID[], action: string, data?: any) => void;
  
  // Data loading methods
  loadAlerts: () => void;
  loadCameras: () => void;
  loadAIModels: () => void;
  loadIncidents: () => void;
  loadOperatorActions: () => void;
  loadFilteringData: () => void;
  loadAnalyticsData: () => void;
  
  // Camera operations
  updateCamera: (camera: Camera) => void;
  updateCameraSettings: (cameraId: ID, settings: any) => void;
  restartCamera: (cameraId: ID) => void;
  toggleCameraRecording: (cameraId: ID) => void;
  
  // AI Model operations
  updateAIModel: (model: AIModel) => void;
  restartAIModel: (modelId: ID) => void;
  updateAIModelConfig: (modelId: ID, config: any) => void;
}

export interface OperatorContextType extends OperatorState {
  actions: OperatorActions;
}

// Component prop types
export interface AdvancedCameraPanelsProps {
  cameras: Camera[];
  selectedCameraId?: string;
  onSelectCamera?: (id?: string) => void;
  className?: string;
}

// Utility types for type guards
export type NonNullable<T> = T extends null | undefined ? never : T;
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & globalThis.Required<Pick<T, K>>;
