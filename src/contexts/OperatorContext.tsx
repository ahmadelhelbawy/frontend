/**
 * OperatorContext - Complete state management for operator dashboard
 * Provides all required state and actions for the operator interface
 */

import React, { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import { unifiedAPI } from '../services/UnifiedAPIService';

// Import shared interfaces from centralized types
import type {
  OperatorState,
  OperatorContextType,
  ID,
  Camera,
  Alert,
  Detection,
  AIModel,
  SystemHealth,
  Incident,
  Operator,
  User,
  QuickAction,
  EmergencyContact,
  SystemStatus,
  WorkflowTask,
  FilterCriteria,
  FilterPreset,
  SearchHistory,
  PerformanceMetrics,
  TeamMetrics,
  SystemPerformance
} from '../types';
import { toAppError } from '../utils/errors';

// Complete action types
type OperatorAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ALERTS_LOADING'; payload: boolean }
  | { type: 'SET_CAMERAS_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload?: string }
  | { type: 'SET_ALERTS_ERROR'; payload?: string }
  | { type: 'SET_ALERTS'; payload: Alert[] }
  | { type: 'SET_CAMERAS'; payload: Camera[] }
  | { type: 'SET_DETECTIONS'; payload: Detection[] }
  | { type: 'SET_INCIDENTS'; payload: Incident[] }
  | { type: 'SET_AI_MODELS'; payload: AIModel[] }
  | { type: 'SET_SYSTEM_HEALTH'; payload: SystemHealth }
  | { type: 'SET_OPERATORS'; payload: Operator[] }
  | { type: 'SET_QUICK_ACTIONS'; payload: QuickAction[] }
  | { type: 'SET_EMERGENCY_CONTACTS'; payload: EmergencyContact[] }
  | { type: 'SET_SYSTEM_STATUS'; payload: SystemStatus[] }
  | { type: 'SET_WORKFLOW_TASKS'; payload: WorkflowTask[] }
  | { type: 'SET_FILTER_CRITERIA'; payload: FilterCriteria[] }
  | { type: 'SET_FILTER_PRESETS'; payload: FilterPreset[] }
  | { type: 'SET_SEARCH_HISTORY'; payload: SearchHistory[] }
  | { type: 'SET_CURRENT_FILTERS'; payload: Record<string, any> }
  | { type: 'SET_OPERATOR_METRICS'; payload: PerformanceMetrics[] }
  | { type: 'SET_TEAM_METRICS'; payload: TeamMetrics[] }
  | { type: 'SET_SYSTEM_PERFORMANCE'; payload: SystemPerformance[] }
  | { type: 'SET_DATE_RANGE'; payload: { start: string; end: string } }
  | { type: 'UPDATE_ALERT'; payload: Alert }
  | { type: 'UPDATE_CAMERA'; payload: Camera }
  | { type: 'UPDATE_AI_MODEL'; payload: AIModel }
  | { type: 'SELECT_CAMERA'; payload?: ID }
  | { type: 'SET_CURRENT_USER'; payload?: User }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'UPDATE_LAST_UPDATED' }
  | { type: 'ACKNOWLEDGE_ALERT'; payload: ID }
  | { type: 'RESOLVE_ALERT'; payload: ID };

// Initial state with all required properties
const initialState: OperatorState = {
  // Core data
  cameras: [],
  alerts: [],
  detections: [],
  incidents: [],
  aiModels: [],
  systemHealth: undefined,
  
  // Current selections
  selectedCameraId: undefined,
  currentUser: undefined,
  
  // Loading states
  loading: false,
  alertsLoading: false,
  camerasLoading: false,
  
  // Error states
  error: undefined,
  alertsError: undefined,
  
  // Connection status
  isConnected: false,
  lastUpdated: undefined,
  
  // Operator-specific data
  operators: [],
  quickActions: [],
  emergencyContacts: [],
  systemStatus: [],
  workflowTasks: [],
  
  // Filtering and search
  filterCriteria: [],
  filterPresets: [],
  searchHistory: [],
  currentFilters: {},
  
  // Analytics
  operatorMetrics: [],
  teamMetrics: [],
  systemPerformance: [],
  
  // Date range for analytics
  dateRange: {
    start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    end: new Date().toISOString()
  }
};

// Reducer function
function operatorReducer(state: OperatorState, action: OperatorAction): OperatorState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ALERTS_LOADING':
      return { ...state, alertsLoading: action.payload };
    case 'SET_CAMERAS_LOADING':
      return { ...state, camerasLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_ALERTS_ERROR':
      return { ...state, alertsError: action.payload };
    case 'SET_ALERTS':
      return { ...state, alerts: action.payload };
    case 'SET_CAMERAS':
      return { ...state, cameras: action.payload };
    case 'SET_DETECTIONS':
      return { ...state, detections: action.payload };
    case 'SET_INCIDENTS':
      return { ...state, incidents: action.payload };
    case 'SET_AI_MODELS':
      return { ...state, aiModels: action.payload };
    case 'SET_SYSTEM_HEALTH':
      return { ...state, systemHealth: action.payload };
    case 'SET_OPERATORS':
      return { ...state, operators: action.payload };
    case 'SET_QUICK_ACTIONS':
      return { ...state, quickActions: action.payload };
    case 'SET_EMERGENCY_CONTACTS':
      return { ...state, emergencyContacts: action.payload };
    case 'SET_SYSTEM_STATUS':
      return { ...state, systemStatus: action.payload };
    case 'SET_WORKFLOW_TASKS':
      return { ...state, workflowTasks: action.payload };
    case 'SET_FILTER_CRITERIA':
      return { ...state, filterCriteria: action.payload };
    case 'SET_FILTER_PRESETS':
      return { ...state, filterPresets: action.payload };
    case 'SET_SEARCH_HISTORY':
      return { ...state, searchHistory: action.payload };
    case 'SET_CURRENT_FILTERS':
      return { ...state, currentFilters: action.payload };
    case 'SET_OPERATOR_METRICS':
      return { ...state, operatorMetrics: action.payload };
    case 'SET_TEAM_METRICS':
      return { ...state, teamMetrics: action.payload };
    case 'SET_SYSTEM_PERFORMANCE':
      return { ...state, systemPerformance: action.payload };
    case 'SET_DATE_RANGE':
      return { ...state, dateRange: action.payload };
    case 'SELECT_CAMERA':
      return { ...state, selectedCameraId: action.payload };
    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };
    case 'SET_CONNECTED':
      return { ...state, isConnected: action.payload };
    case 'UPDATE_LAST_UPDATED':
      return { ...state, lastUpdated: new Date().toISOString() };
    case 'UPDATE_ALERT':
      return {
        ...state,
        alerts: state.alerts.map(alert => 
          alert.id === action.payload.id ? action.payload : alert
        )
      };
    case 'ACKNOWLEDGE_ALERT':
      return {
        ...state,
        alerts: state.alerts.map(alert => 
          alert.id === action.payload ? { ...alert, acknowledged: true } : alert
        )
      };
    case 'RESOLVE_ALERT':
      return {
        ...state,
        alerts: state.alerts.map(alert => 
          alert.id === action.payload ? { ...alert, resolved: true, status: 'resolved' } : alert
        )
      };
    case 'UPDATE_CAMERA':
      return {
        ...state,
        cameras: state.cameras.map(camera => 
          camera.id === action.payload.id ? action.payload : camera
        )
      };
    case 'UPDATE_AI_MODEL':
      return {
        ...state,
        aiModels: state.aiModels.map(model => 
          model.id === action.payload.id ? action.payload : model
        )
      };
    default:
      return state;
  }
}

// Create context
const OperatorContext = createContext<OperatorContextType | undefined>(undefined);

// Provider component
export const OperatorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(operatorReducer, initialState);

  // Create actions object matching expected interface
  const actions = useMemo(() => ({
    // Data setters
    setCameras: (cameras: Camera[]) => dispatch({ type: 'SET_CAMERAS', payload: cameras }),
    setAlerts: (alerts: Alert[]) => dispatch({ type: 'SET_ALERTS', payload: alerts }),
    setDetections: (detections: Detection[]) => dispatch({ type: 'SET_DETECTIONS', payload: detections }),
    setIncidents: (incidents: Incident[]) => dispatch({ type: 'SET_INCIDENTS', payload: incidents }),
    setAIModels: (models: AIModel[]) => dispatch({ type: 'SET_AI_MODELS', payload: models }),
    setSystemHealth: (health: SystemHealth) => dispatch({ type: 'SET_SYSTEM_HEALTH', payload: health }),
    
    // Selections
    selectCamera: (cameraId?: ID) => dispatch({ type: 'SELECT_CAMERA', payload: cameraId }),
    setCurrentUser: (user?: User) => dispatch({ type: 'SET_CURRENT_USER', payload: user }),
    
    // Loading states
    setLoading: (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading }),
    setAlertsLoading: (loading: boolean) => dispatch({ type: 'SET_ALERTS_LOADING', payload: loading }),
    setCamerasLoading: (loading: boolean) => dispatch({ type: 'SET_CAMERAS_LOADING', payload: loading }),
    
    // Error handling
    setError: (error?: string) => dispatch({ type: 'SET_ERROR', payload: error }),
    setAlertsError: (error?: string) => dispatch({ type: 'SET_ALERTS_ERROR', payload: error }),
    
    // Connection
    setConnected: (connected: boolean) => dispatch({ type: 'SET_CONNECTED', payload: connected }),
    updateLastUpdated: () => dispatch({ type: 'UPDATE_LAST_UPDATED' }),
    
    // Alert management
    acknowledgeAlert: (alertId: ID) => dispatch({ type: 'ACKNOWLEDGE_ALERT', payload: alertId }),
    resolveAlert: (alertId: ID, resolution?: string) => dispatch({ type: 'RESOLVE_ALERT', payload: alertId }),
    escalateAlert: async (alertId: ID, escalatedTo?: string, reason?: string) => {
      try {
        // Mock escalation for now
        dispatch({ type: 'UPDATE_ALERT', payload: {
          ...state.alerts.find(a => a.id === alertId)!,
          escalated: true,
          escalatedTo,
          escalatedAt: new Date().toISOString()
        }});
      } catch (error: unknown) {
        const err = toAppError(error);
        dispatch({ type: 'SET_ERROR', payload: err.message });
      }
    },
    bulkAlertAction: async (alertIds: ID[], action: string, data?: any) => {
      try {
        // Mock bulk action for now
        for (const alertId of alertIds) {
          if (action === 'acknowledge') {
            dispatch({ type: 'ACKNOWLEDGE_ALERT', payload: alertId });
          } else if (action === 'resolve') {
            dispatch({ type: 'RESOLVE_ALERT', payload: alertId });
          }
        }
      } catch (error: unknown) {
        const err = toAppError(error);
        dispatch({ type: 'SET_ERROR', payload: err.message });
      }
    },
    
    // Data loading methods
    loadAlerts: async () => {
      try {
        dispatch({ type: 'SET_ALERTS_LOADING', payload: true });
        const response = await unifiedAPI.getAlerts();
        if (response.success && response.data) {
          dispatch({ type: 'SET_ALERTS', payload: response.data });
        }
      } catch (error: unknown) {
        const err = toAppError(error);
        dispatch({ type: 'SET_ALERTS_ERROR', payload: err.message });
      } finally {
        dispatch({ type: 'SET_ALERTS_LOADING', payload: false });
      }
    },
    loadCameras: async () => {
      try {
        dispatch({ type: 'SET_CAMERAS_LOADING', payload: true });
        const response = await unifiedAPI.getCameras();
        if (response.success && response.data) {
          dispatch({ type: 'SET_CAMERAS', payload: response.data });
        }
      } catch (error: unknown) {
        const err = toAppError(error);
        dispatch({ type: 'SET_ERROR', payload: err.message });
      } finally {
        dispatch({ type: 'SET_CAMERAS_LOADING', payload: false });
      }
    },
    loadAIModels: async () => {
      try {
        const response = await unifiedAPI.getAIModels();
        if (response.success && response.data) {
          dispatch({ type: 'SET_AI_MODELS', payload: response.data });
        }
      } catch (error: unknown) {
        const err = toAppError(error);
        dispatch({ type: 'SET_ERROR', payload: err.message });
      }
    },
    loadIncidents: async () => {
      try {
        // Mock implementation for now
        dispatch({ type: 'SET_INCIDENTS', payload: [] });
      } catch (error: unknown) {
        const err = toAppError(error);
        dispatch({ type: 'SET_ERROR', payload: err.message });
      }
    },
    loadOperatorActions: async () => {
      try {
        // Mock implementation for now
        dispatch({ type: 'SET_QUICK_ACTIONS', payload: [] });
      } catch (error: unknown) {
        const err = toAppError(error);
        dispatch({ type: 'SET_ERROR', payload: err.message });
      }
    },
    loadFilteringData: async () => {
      try {
        // Mock implementation for now
        dispatch({ type: 'SET_FILTER_CRITERIA', payload: [] });
      } catch (error: unknown) {
        const err = toAppError(error);
        dispatch({ type: 'SET_ERROR', payload: err.message });
      }
    },
    loadAnalyticsData: async () => {
      try {
        // Mock implementation for now
        dispatch({ type: 'SET_OPERATOR_METRICS', payload: [] });
      } catch (error: unknown) {
        const err = toAppError(error);
        dispatch({ type: 'SET_ERROR', payload: err.message });
      }
    },
    
    // Camera operations
    updateCamera: (camera: Camera) => dispatch({ type: 'UPDATE_CAMERA', payload: camera }),
    updateCameraSettings: async (cameraId: ID, settings: any) => {
      try {
        const response = await unifiedAPI.updateCameraSettings(cameraId, settings);
        if (response.success && response.data) {
          dispatch({ type: 'UPDATE_CAMERA', payload: response.data });
        }
      } catch (error: unknown) {
        const err = toAppError(error);
        dispatch({ type: 'SET_ERROR', payload: err.message });
      }
    },
    restartCamera: async (cameraId: ID) => {
      try {
        const response = await unifiedAPI.restartCamera(cameraId);
        if (response.success && response.data) {
          dispatch({ type: 'UPDATE_CAMERA', payload: response.data });
        }
      } catch (error: unknown) {
        const err = toAppError(error);
        dispatch({ type: 'SET_ERROR', payload: err.message });
      }
    },
    toggleCameraRecording: async (cameraId: ID) => {
      try {
        const response = await unifiedAPI.toggleCameraRecording(cameraId);
        if (response.success && response.data) {
          dispatch({ type: 'UPDATE_CAMERA', payload: response.data });
        }
      } catch (error: unknown) {
        const err = toAppError(error);
        dispatch({ type: 'SET_ERROR', payload: err.message });
      }
    },
    
    // AI Model operations
    updateAIModel: (model: AIModel) => dispatch({ type: 'UPDATE_AI_MODEL', payload: model }),
    restartAIModel: async (modelId: ID) => {
      try {
        const response = await unifiedAPI.restartAIModel(modelId);
        if (response.success && response.data) {
          dispatch({ type: 'UPDATE_AI_MODEL', payload: response.data });
        }
      } catch (error: unknown) {
        const err = toAppError(error);
        dispatch({ type: 'SET_ERROR', payload: err.message });
      }
    },
    updateAIModelConfig: async (modelId: ID, config: any) => {
      try {
        const response = await unifiedAPI.updateAIModel(modelId, config);
        if (response.success && response.data) {
          dispatch({ type: 'UPDATE_AI_MODEL', payload: response.data });
        }
      } catch (error: unknown) {
        const err = toAppError(error);
        dispatch({ type: 'SET_ERROR', payload: err.message });
      }
    }
  }), []);

  // Initialize data on mount
  useEffect(() => {
    const loadInitialData = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        // Load mock cameras for demo
        const mockCameras: Camera[] = [
          {
            id: '1',
            name: 'Camera 1',
            location: 'Entrance',
            storeId: 'store1',
            status: 'online',
            streamUrl: 'rtsp://demo-1',
            resolution: '1920x1080',
            fps: 30,
            recording: true,
            detectionEnabled: true,
            aiEnabled: true,
            aiModelIds: ['1'],
            settings: {
              brightness: 50,
              contrast: 50,
              sensitivity: 75,
              detectionZones: []
            },
            lastPing: new Date().toISOString(),
            lastSeen: new Date().toISOString(),
            totalDetections: 100,
            todayDetections: 5,
            currentDetections: [],
            recentAlerts: [],
            healthScore: 85
          }
        ];
        
        dispatch({ type: 'SET_CAMERAS', payload: mockCameras });
        dispatch({ type: 'SET_CONNECTED', payload: true });
        
        // Set demo user
        const demoUser: User = {
          id: 'user1',
          name: 'Demo Operator',
          email: 'demo@example.com',
          role: 'operator',
          permissions: ['view_cameras', 'acknowledge_alerts']
        };
        dispatch({ type: 'SET_CURRENT_USER', payload: demoUser });
        
      } catch (error: unknown) {
        const err = toAppError(error);
        dispatch({ type: 'SET_ERROR', payload: err.message });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
        dispatch({ type: 'UPDATE_LAST_UPDATED' });
      }
    };

    loadInitialData();
  }, []);

  // Create the context value that matches expected interface
  const contextValue: OperatorContextType = useMemo(() => ({
    // Spread all state properties directly
    ...state,
    // Actions object
    actions
  }), [state, actions]);

  return (
    <OperatorContext.Provider value={contextValue}>
      {children}
    </OperatorContext.Provider>
  );
};

// Hook to use the context - matches expected usage pattern
export const useOperatorContext = (): OperatorContextType => {
  const context = useContext(OperatorContext);
  if (context === undefined) {
    throw new Error('useOperatorContext must be used within an OperatorProvider');
  }
  return context;
};

export default OperatorContext;
