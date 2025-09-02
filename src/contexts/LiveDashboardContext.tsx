/**
 * Live Dashboard Context
 * Manages real-time dashboard state with database integration
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import { 
  databaseAPI, 
  liveCameraAPI, 
  CameraStatus, 
  Detection, 
  Alert, 
  PerformanceSummary, 
  DashboardSummary,
  BehaviorAnalytics,
  SystemLog
} from '../services/databaseApiService';
import { 
  createLiveDashboardWebSocket, 
  LiveDashboardWebSocketService 
} from '../services/liveDashboardWebSocket';

// State Types
export interface LiveDashboardState {
  // Connection Status
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;

  // Dashboard Data
  dashboardSummary: DashboardSummary | null;
  cameraStatus: CameraStatus[];
  recentDetections: Detection[];
  activeAlerts: Alert[];
  performanceSummary: PerformanceSummary | null;
  recentBehaviors: BehaviorAnalytics[];
  systemLogs: SystemLog[];

  // Live Camera Data
  liveCameraStats: any;
  webrtcStreams: { [cameraId: string]: string }; // streamId by cameraId

  // Filters and Settings
  filters: {
    timeRange: number; // hours
    cameraIds: string[];
    alertLevels: string[];
    detectionClasses: string[];
  };

  // UI State
  selectedCamera: string | null;
  selectedAlert: string | null;
  autoRefresh: boolean;
  refreshInterval: number;
}

// Action Types
type LiveDashboardAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'SET_DASHBOARD_SUMMARY'; payload: DashboardSummary }
  | { type: 'SET_CAMERA_STATUS'; payload: CameraStatus[] }
  | { type: 'SET_RECENT_DETECTIONS'; payload: Detection[] }
  | { type: 'SET_ACTIVE_ALERTS'; payload: Alert[] }
  | { type: 'SET_PERFORMANCE_SUMMARY'; payload: PerformanceSummary }
  | { type: 'SET_RECENT_BEHAVIORS'; payload: BehaviorAnalytics[] }
  | { type: 'SET_SYSTEM_LOGS'; payload: SystemLog[] }
  | { type: 'SET_LIVE_CAMERA_STATS'; payload: any }
  | { type: 'ADD_WEBRTC_STREAM'; payload: { cameraId: string; streamId: string } }
  | { type: 'REMOVE_WEBRTC_STREAM'; payload: string }
  | { type: 'UPDATE_FILTERS'; payload: Partial<LiveDashboardState['filters']> }
  | { type: 'SET_SELECTED_CAMERA'; payload: string | null }
  | { type: 'SET_SELECTED_ALERT'; payload: string | null }
  | { type: 'SET_AUTO_REFRESH'; payload: boolean }
  | { type: 'SET_REFRESH_INTERVAL'; payload: number }
  | { type: 'ADD_NEW_DETECTION'; payload: Detection }
  | { type: 'ADD_NEW_ALERT'; payload: Alert }
  | { type: 'UPDATE_CAMERA_STATUS'; payload: CameraStatus }
  | { type: 'ACKNOWLEDGE_ALERT'; payload: string }
  | { type: 'SET_LAST_UPDATED'; payload: string };

// Initial State
const initialState: LiveDashboardState = {
  isConnected: false,
  isLoading: false,
  error: null,
  lastUpdated: null,
  dashboardSummary: null,
  cameraStatus: [
    {
      id: '1',
      name: 'Entrance Camera',
      status: 'online' as const,
      url: 'rtsp://demo-camera-1',
      location: 'Main Entrance',
      lastSeen: new Date(),
      fps: 30,
      resolution: '1920x1080'
    },
    {
      id: '2', 
      name: 'Aisle 1 Camera',
      status: 'online' as const,
      url: 'rtsp://demo-camera-2',
      location: 'Aisle 1',
      lastSeen: new Date(),
      fps: 25,
      resolution: '1920x1080'
    },
    {
      id: '3',
      name: 'Checkout Camera',
      status: 'offline' as const,
      url: 'rtsp://demo-camera-3',
      location: 'Checkout Area',
      lastSeen: new Date(Date.now() - 300000), // 5 minutes ago
      fps: 0,
      resolution: '1920x1080'
    },
    {
      id: '4',
      name: 'Storage Camera',
      status: 'online' as const,
      url: 'rtsp://demo-camera-4',
      location: 'Storage Room',
      lastSeen: new Date(),
      fps: 20,
      resolution: '1280x720'
    }
  ],
  recentDetections: [],
  activeAlerts: [],
  performanceSummary: null,
  recentBehaviors: [],
  systemLogs: [],
  liveCameraStats: null,
  webrtcStreams: {},
  filters: {
    timeRange: 24,
    cameraIds: [],
    alertLevels: ['suspicious', 'critical'],
    detectionClasses: []
  },
  selectedCamera: null,
  selectedAlert: null,
  autoRefresh: true,
  refreshInterval: 5000
};

// Reducer
function liveDashboardReducer(state: LiveDashboardState, action: LiveDashboardAction): LiveDashboardState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'SET_CONNECTED':
      return { ...state, isConnected: action.payload };
    
    case 'SET_DASHBOARD_SUMMARY':
      return {
        ...state,
        dashboardSummary: action.payload,
        cameraStatus: action.payload.cameraStatus || state.cameraStatus,
        activeAlerts: Array.isArray(action.payload.activeAlerts) ? action.payload.activeAlerts : state.activeAlerts,
        performanceSummary: action.payload.performanceSummary || state.performanceSummary,
        recentBehaviors: action.payload.recentBehaviors || state.recentBehaviors,
        lastUpdated: new Date().toISOString(),
        isLoading: false,
        error: null
      };
    
    case 'SET_CAMERA_STATUS':
      return { ...state, cameraStatus: action.payload };
    
    case 'SET_RECENT_DETECTIONS':
      return { ...state, recentDetections: action.payload };
    
    case 'SET_ACTIVE_ALERTS':
      return { ...state, activeAlerts: action.payload };
    
    case 'SET_PERFORMANCE_SUMMARY':
      return { ...state, performanceSummary: action.payload };
    
    case 'SET_RECENT_BEHAVIORS':
      return { ...state, recentBehaviors: action.payload };
    
    case 'SET_SYSTEM_LOGS':
      return { ...state, systemLogs: action.payload };
    
    case 'SET_LIVE_CAMERA_STATS':
      return { ...state, liveCameraStats: action.payload };
    
    case 'ADD_WEBRTC_STREAM':
      return {
        ...state,
        webrtcStreams: {
          ...state.webrtcStreams,
          [action.payload.cameraId]: action.payload.streamId
        }
      };
    
    case 'REMOVE_WEBRTC_STREAM':
      const { [action.payload]: removed, ...remainingStreams } = state.webrtcStreams;
      return { ...state, webrtcStreams: remainingStreams };
    
    case 'UPDATE_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload }
      };
    
    case 'SET_SELECTED_CAMERA':
      return { ...state, selectedCamera: action.payload };
    
    case 'SET_SELECTED_ALERT':
      return { ...state, selectedAlert: action.payload };
    
    case 'SET_AUTO_REFRESH':
      return { ...state, autoRefresh: action.payload };
    
    case 'SET_REFRESH_INTERVAL':
      return { ...state, refreshInterval: action.payload };
    
    case 'ADD_NEW_DETECTION':
      return {
        ...state,
        recentDetections: [action.payload, ...state.recentDetections.slice(0, 99)]
      };
    
    case 'ADD_NEW_ALERT':
      return {
        ...state,
        activeAlerts: [action.payload, ...state.activeAlerts]
      };
    
    case 'UPDATE_CAMERA_STATUS':
      return {
        ...state,
        cameraStatus: state.cameraStatus.map(camera =>
          camera.id === action.payload.id ? action.payload : camera
        )
      };
    
    case 'ACKNOWLEDGE_ALERT':
      return {
        ...state,
        activeAlerts: state.activeAlerts.map(alert =>
          alert.id === action.payload
            ? { ...alert, status: 'acknowledged' as const }
            : alert
        )
      };
    
    case 'SET_LAST_UPDATED':
      return { ...state, lastUpdated: action.payload };
    
    default:
      return state;
  }
}

// Context
interface LiveDashboardContextType {
  state: LiveDashboardState;
  
  // Data Loading
  loadDashboardSummary: () => Promise<void>;
  loadCameraStatus: () => Promise<void>;
  loadRecentDetections: (filters?: any) => Promise<void>;
  loadActiveAlerts: () => Promise<void>;
  loadPerformanceSummary: () => Promise<void>;
  loadRecentBehaviors: (filters?: any) => Promise<void>;
  loadSystemLogs: (filters?: any) => Promise<void>;
  
  // Camera Management
  addCamera: (config: any) => Promise<boolean>;
  removeCamera: (cameraId: string) => Promise<boolean>;
  startCamera: (cameraId: string, quality?: string) => Promise<boolean>;
  stopCamera: (cameraId: string) => Promise<boolean>;
  updateDetectionConfig: (cameraId: string, config: any) => Promise<boolean>;
  
  // WebRTC Streaming
  createWebRTCStream: (cameraId: string, quality?: string) => Promise<string | null>;
  destroyWebRTCStream: (streamId: string) => Promise<boolean>;
  
  // Alert Management
  acknowledgeAlert: (alertId: string, acknowledgedBy: string) => Promise<boolean>;
  
  // Filters and Settings
  updateFilters: (filters: Partial<LiveDashboardState['filters']>) => void;
  setSelectedCamera: (cameraId: string | null) => void;
  setSelectedAlert: (alertId: string | null) => void;
  setAutoRefresh: (enabled: boolean) => void;
  setRefreshInterval: (interval: number) => void;
  
  // WebSocket Management
  connectWebSocket: () => Promise<void>;
  disconnectWebSocket: () => void;
  
  // Demo Functions
  addDemoCameras: () => Promise<boolean>;
}

const LiveDashboardContext = createContext<LiveDashboardContextType | undefined>(undefined);

// Provider Component
export function LiveDashboardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(liveDashboardReducer, initialState);
  const [webSocketService, setWebSocketService] = React.useState<LiveDashboardWebSocketService | null>(null);
  const [refreshTimer, setRefreshTimer] = React.useState<NodeJS.Timeout | null>(null);

  // WebSocket Management
  const connectWebSocket = useCallback(async () => {
    try {
      if (webSocketService) {
        webSocketService.disconnect();
      }

      const ws = createLiveDashboardWebSocket();
      setWebSocketService(ws);

      // Set up event listeners
      ws.on('connected', () => {
        dispatch({ type: 'SET_CONNECTED', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });
        
        // Subscribe to all data types
        ws.subscribeToDataTypes([
          'camera_status',
          'detections',
          'alerts',
          'performance',
          'behaviors',
          'system_health'
        ]);
        
        // Request initial data
        ws.requestDashboardSummary();
      });

      ws.on('disconnected', () => {
        dispatch({ type: 'SET_CONNECTED', payload: false });
      });

      ws.on('error', (error) => {
        dispatch({ type: 'SET_ERROR', payload: error.message || 'WebSocket error' });
      });

      ws.on('dashboardSummary', (summary: DashboardSummary) => {
        dispatch({ type: 'SET_DASHBOARD_SUMMARY', payload: summary });
      });

      ws.on('cameraStatusUpdate', (cameras: CameraStatus[]) => {
        dispatch({ type: 'SET_CAMERA_STATUS', payload: cameras });
      });

      ws.on('recentDetections', (detections: Detection[]) => {
        dispatch({ type: 'SET_RECENT_DETECTIONS', payload: detections });
      });

      ws.on('activeAlerts', (alerts: Alert[]) => {
        dispatch({ type: 'SET_ACTIVE_ALERTS', payload: alerts });
      });

      ws.on('performanceUpdate', (performance: PerformanceSummary) => {
        dispatch({ type: 'SET_PERFORMANCE_SUMMARY', payload: performance });
      });

      ws.on('newDetection', (detection: Detection) => {
        dispatch({ type: 'ADD_NEW_DETECTION', payload: detection });
      });

      ws.on('newAlert', (alert: Alert) => {
        dispatch({ type: 'ADD_NEW_ALERT', payload: alert });
      });

      await ws.connect();
    } catch (error) {
      console.error('❌ Failed to connect WebSocket:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to connect to live data stream' });
    }
  }, [webSocketService]);

  const disconnectWebSocket = useCallback(() => {
    if (webSocketService) {
      webSocketService.disconnect();
      setWebSocketService(null);
    }
    dispatch({ type: 'SET_CONNECTED', payload: false });
  }, [webSocketService]);

  // Data Loading Functions
  const loadDashboardSummary = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const summary = await databaseAPI.getDashboardSummary();
      dispatch({ type: 'SET_DASHBOARD_SUMMARY', payload: summary });
    } catch (error) {
      console.error('❌ Failed to load dashboard summary:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load dashboard summary' });
    }
  }, []);

  const loadCameraStatus = useCallback(async () => {
    try {
      const response = await databaseAPI.getCameraStatusLive();
      dispatch({ type: 'SET_CAMERA_STATUS', payload: response.data });
    } catch (error) {
      console.error('❌ Failed to load camera status:', error);
    }
  }, []);

  const loadRecentDetections = useCallback(async (filters?: any) => {
    try {
      const response = await databaseAPI.getRecentDetections({
        ...filters,
        hours: state.filters.timeRange
      });
      dispatch({ type: 'SET_RECENT_DETECTIONS', payload: response.data });
    } catch (error) {
      console.error('❌ Failed to load recent detections:', error);
    }
  }, [state.filters.timeRange]);

  const loadActiveAlerts = useCallback(async () => {
    try {
      const response = await databaseAPI.getActiveAlerts(50);
      dispatch({ type: 'SET_ACTIVE_ALERTS', payload: response.data });
    } catch (error) {
      console.error('❌ Failed to load active alerts:', error);
    }
  }, []);

  const loadPerformanceSummary = useCallback(async () => {
    try {
      const response = await databaseAPI.getPerformanceSummary();
      dispatch({ type: 'SET_PERFORMANCE_SUMMARY', payload: response });
    } catch (error) {
      console.error('❌ Failed to load performance summary:', error);
    }
  }, []);

  const loadRecentBehaviors = useCallback(async (filters?: any) => {
    try {
      const response = await databaseAPI.getRecentBehaviors({
        ...filters,
        hours: state.filters.timeRange
      });
      dispatch({ type: 'SET_RECENT_BEHAVIORS', payload: response.data });
    } catch (error) {
      console.error('❌ Failed to load recent behaviors:', error);
    }
  }, [state.filters.timeRange]);

  const loadSystemLogs = useCallback(async (filters?: any) => {
    try {
      const response = await databaseAPI.getRecentLogs({
        ...filters,
        hours: state.filters.timeRange
      });
      dispatch({ type: 'SET_SYSTEM_LOGS', payload: response.data });
    } catch (error) {
      console.error('❌ Failed to load system logs:', error);
    }
  }, [state.filters.timeRange]);

  // Camera Management
  const addCamera = useCallback(async (config: any): Promise<boolean> => {
    try {
      const response = await liveCameraAPI.addCamera(config);
      if (response.success) {
        await loadCameraStatus();
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Failed to add camera:', error);
      return false;
    }
  }, [loadCameraStatus]);

  const removeCamera = useCallback(async (cameraId: string): Promise<boolean> => {
    try {
      const response = await liveCameraAPI.removeCamera(cameraId);
      if (response.success) {
        await loadCameraStatus();
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Failed to remove camera:', error);
      return false;
    }
  }, [loadCameraStatus]);

  const startCamera = useCallback(async (cameraId: string, quality = 'medium'): Promise<boolean> => {
    try {
      const response = await liveCameraAPI.startCamera(cameraId, quality as any);
      if (response.success) {
        await loadCameraStatus();
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Failed to start camera:', error);
      return false;
    }
  }, [loadCameraStatus]);

  const stopCamera = useCallback(async (cameraId: string): Promise<boolean> => {
    try {
      const response = await liveCameraAPI.stopCamera(cameraId);
      if (response.success) {
        await loadCameraStatus();
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Failed to stop camera:', error);
      return false;
    }
  }, [loadCameraStatus]);

  const updateDetectionConfig = useCallback(async (cameraId: string, config: any): Promise<boolean> => {
    try {
      const response = await liveCameraAPI.updateDetectionConfig(cameraId, config);
      return response.success;
    } catch (error) {
      console.error('❌ Failed to update detection config:', error);
      return false;
    }
  }, []);

  // WebRTC Streaming
  const createWebRTCStream = useCallback(async (cameraId: string, quality = 'medium'): Promise<string | null> => {
    try {
      const response = await liveCameraAPI.createWebRTCStream(cameraId, quality as any);
      if (response.success) {
        dispatch({ 
          type: 'ADD_WEBRTC_STREAM', 
          payload: { cameraId, streamId: response.data?.streamId || '' }
        });
        return response.data?.streamId || '';
      }
      return null;
    } catch (error) {
      console.error('❌ Failed to create WebRTC stream:', error);
      return null;
    }
  }, []);

  const destroyWebRTCStream = useCallback(async (streamId: string): Promise<boolean> => {
    try {
      const response = await liveCameraAPI.destroyWebRTCStream(streamId);
      if (response.success) {
        dispatch({ type: 'REMOVE_WEBRTC_STREAM', payload: streamId });
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Failed to destroy WebRTC stream:', error);
      return false;
    }
  }, []);

  // Alert Management
  const acknowledgeAlert = useCallback(async (alertId: string, acknowledgedBy: string): Promise<boolean> => {
    try {
      const response = await databaseAPI.acknowledgeAlert(alertId);
      if (response) {
        dispatch({ type: 'ACKNOWLEDGE_ALERT', payload: alertId });
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Failed to acknowledge alert:', error);
      return false;
    }
  }, []);

  // Demo Functions
  const addDemoCameras = useCallback(async (): Promise<boolean> => {
    try {
      const response = await liveCameraAPI.addDemoCameras();
      if (response.success) {
        await loadCameraStatus();
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Failed to add demo cameras:', error);
      return false;
    }
  }, [loadCameraStatus]);

  // Filter and Settings Management
  const updateFilters = useCallback((filters: Partial<LiveDashboardState['filters']>) => {
    dispatch({ type: 'UPDATE_FILTERS', payload: filters });
  }, []);

  const setSelectedCamera = useCallback((cameraId: string | null) => {
    dispatch({ type: 'SET_SELECTED_CAMERA', payload: cameraId });
  }, []);

  const setSelectedAlert = useCallback((alertId: string | null) => {
    dispatch({ type: 'SET_SELECTED_ALERT', payload: alertId });
  }, []);

  const setAutoRefresh = useCallback((enabled: boolean) => {
    dispatch({ type: 'SET_AUTO_REFRESH', payload: enabled });
  }, []);

  const setRefreshInterval = useCallback((interval: number) => {
    dispatch({ type: 'SET_REFRESH_INTERVAL', payload: interval });
  }, []);

  // Auto-refresh Effect
  useEffect(() => {
    if (state.autoRefresh && !state.isConnected) {
      const timer = setInterval(() => {
        loadDashboardSummary();
      }, state.refreshInterval);
      
      setRefreshTimer(timer);
      
      return () => {
        if (timer) clearInterval(timer);
      };
    } else if (refreshTimer) {
      clearInterval(refreshTimer);
      setRefreshTimer(null);
    }
  }, [state.autoRefresh, state.refreshInterval, state.isConnected, loadDashboardSummary, refreshTimer]);

  // Initial Load Effect
  useEffect(() => {
    loadDashboardSummary();
    connectWebSocket();
    
    return () => {
      disconnectWebSocket();
      if (refreshTimer) {
        clearInterval(refreshTimer);
      }
    };
  }, []);

  const contextValue: LiveDashboardContextType = {
    state,
    loadDashboardSummary,
    loadCameraStatus,
    loadRecentDetections,
    loadActiveAlerts,
    loadPerformanceSummary,
    loadRecentBehaviors,
    loadSystemLogs,
    addCamera,
    removeCamera,
    startCamera,
    stopCamera,
    updateDetectionConfig,
    createWebRTCStream,
    destroyWebRTCStream,
    acknowledgeAlert,
    updateFilters,
    setSelectedCamera,
    setSelectedAlert,
    setAutoRefresh,
    setRefreshInterval,
    connectWebSocket,
    disconnectWebSocket,
    addDemoCameras
  };

  return (
    <LiveDashboardContext.Provider value={contextValue}>
      {children}
    </LiveDashboardContext.Provider>
  );
}

// Hook
export function useLiveDashboard() {
  const context = useContext(LiveDashboardContext);
  if (context === undefined) {
    throw new Error('useLiveDashboard must be used within a LiveDashboardProvider');
  }
  return context;
}

export default LiveDashboardContext;