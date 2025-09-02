/**
 * React hook for managing real-time data from the AI Shoplifting Detection system
 * Provides cameras, alerts, detections, and system status with automatic updates
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiService, Camera, CameraStatus, Alert, Detection, DetectionStats } from '../services/apiService';
import { websocketService, WebSocketEventHandlers } from '../services/websocketService';

export interface RealTimeSystemData {
  // Camera data
  cameras: Camera[];
  cameraStatuses: Record<string, CameraStatus>;
  activeCameras: number;
  totalCameras: number;
  
  // Alert data
  alerts: Alert[];
  unacknowledgedAlerts: Alert[];
  todaysAlerts: number;
  
  // Detection data
  recentDetections: Detection[];
  detectionStats: DetectionStats | null;
  
  // System status
  systemHealth: 'healthy' | 'degraded' | 'offline';
  systemStatus: any;
  aiModelStatus: AiModelUiState;
  
  // Mock system data (for development)
  mockSystemRunning: boolean;
  mockCameras: any[];
  mockAlerts: any[];
  mockDetections: any[];
  
  // Connection status
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  lastUpdate: Date | null;
}

export interface RealTimeDataActions {
  // Camera actions
  activateCamera: (cameraId: string) => Promise<void>;
  deactivateCamera: (cameraId: string) => Promise<void>;
  refreshCameras: () => Promise<void>;
  
  // Alert actions
  acknowledgeAlert: (alertId: string) => Promise<void>;
  acknowledgeAlerts: (alertIds: string[]) => Promise<void>;
  refreshAlerts: () => Promise<void>;
  
  // System actions
  startMockSystem: () => Promise<void>;
  stopMockSystem: () => Promise<void>;
  startMockScenario: (scenarioId: string) => Promise<void>;
  
  // Connection actions
  connect: () => Promise<void>;
  disconnect: () => void;
  retry: () => Promise<void>;
}

import { getRuntimeMode, RuntimeMode, AiModelUiState, parseAiModelStatus } from '../config/runtime';

export function useRealTimeData(storeId?: string, options?: { mode?: RuntimeMode }): [RealTimeSystemData, RealTimeDataActions] {
  // Resolve data source mode
  const mode: RuntimeMode = getRuntimeMode(options?.mode);
  // State management
  const [data, setData] = useState<RealTimeSystemData>({
    cameras: [],
    cameraStatuses: {},
    activeCameras: 0,
    totalCameras: 0,
    alerts: [],
    unacknowledgedAlerts: [],
    todaysAlerts: 0,
    recentDetections: [],
    detectionStats: null,
    systemHealth: 'offline',
    systemStatus: null,
    aiModelStatus: 'standby',
    mockSystemRunning: false,
    mockCameras: [],
    mockAlerts: [],
    mockDetections: [],
    isConnected: false,
    isLoading: true,
    error: null,
    lastUpdate: null,
  });

  const [isInitialized, setIsInitialized] = useState(false);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // WebSocket event handlers
  const websocketHandlers: WebSocketEventHandlers = {
    onConnectionEstablished: (connectionData) => {
      console.log('Real-time connection established:', connectionData);
      setData(prev => ({
        ...prev,
        isConnected: true,
        error: null,
        lastUpdate: new Date()
      }));
    },

    onAlert: (alertData) => {
      console.log('Real-time alert received:', alertData);
      setData(prev => {
        if (alertData.type === 'acknowledged') {
          // Update existing alert as acknowledged
          const updatedAlerts = prev.alerts.map(alert => 
            alert.id === alertData.alert_id 
              ? { ...alert, acknowledged: true, acknowledged_by: alertData.acknowledged_by }
              : alert
          );
          return {
            ...prev,
            alerts: updatedAlerts,
            unacknowledgedAlerts: updatedAlerts.filter(a => !a.acknowledged),
            lastUpdate: new Date()
          };
        } else {
          // Add new alert
          const newAlert: Alert = {
            id: alertData.id || `alert_${Date.now()}`,
            store_id: alertData.store_id || storeId || '',
            alert_type: alertData.alert_type || 'detection',
            severity: alertData.severity || 'medium',
            message: alertData.message || 'New security alert',
            timestamp: alertData.timestamp || new Date().toISOString(),
            acknowledged: false,
            detection_id: alertData.detection_id
          };
          
          const updatedAlerts = [newAlert, ...prev.alerts].slice(0, 100); // Keep last 100
          return {
            ...prev,
            alerts: updatedAlerts,
            unacknowledgedAlerts: updatedAlerts.filter(a => !a.acknowledged),
            todaysAlerts: prev.todaysAlerts + 1,
            lastUpdate: new Date()
          };
        }
      });
    },

    onDetection: (detectionData) => {
      console.log('Real-time detection received:', detectionData);
      const newDetection: Detection = {
        id: detectionData.id || `detection_${Date.now()}`,
        camera_id: detectionData.camera_id,
        timestamp: detectionData.timestamp || new Date().toISOString(),
        confidence_score: detectionData.confidence_score || 0.8,
        alert_level: detectionData.alert_level || 'normal',
        bounding_boxes: detectionData.bounding_boxes || [],
        video_segment_url: detectionData.video_segment_url,
        metadata: detectionData.metadata || {}
      };

      setData(prev => ({
        ...prev,
        recentDetections: [newDetection, ...prev.recentDetections].slice(0, 50), // Keep last 50
        lastUpdate: new Date()
      }));
    },

    onCameraStatus: (statusData) => {
      console.log('Real-time camera status received:', statusData);
      setData(prev => ({
        ...prev,
        cameraStatuses: {
          ...prev.cameraStatuses,
          [statusData.camera_id]: statusData
        },
        lastUpdate: new Date()
      }));
    },

    onSystemStatus: (systemData) => {
      console.log('Real-time system status received:', systemData);
      setData(prev => ({
        ...prev,
        systemStatus: systemData,
        systemHealth: systemData.status === 'healthy' ? 'healthy' : 'degraded',
        aiModelStatus: parseAiModelStatus(systemData),
        lastUpdate: new Date()
      }));
    },

    onError: (error) => {
      console.error('WebSocket error:', error);
      setData(prev => ({
        ...prev,
        error,
        isConnected: false
      }));
    },

    onDisconnect: () => {
      console.log('WebSocket disconnected');
      setData(prev => ({
        ...prev,
        isConnected: false
      }));
    }
  };

  // Data fetching functions
  const fetchCameras = useCallback(async () => {
    if (mode === 'mock') {
      try {
        const mockResponse = await apiService.getMockCameras();
        setData(prev => ({
          ...prev,
          mockCameras: mockResponse.cameras,
          activeCameras: mockResponse.online_count,
          totalCameras: mockResponse.total_count,
          lastUpdate: new Date()
        }));
      } catch (mockError) {
        console.error('Failed to fetch mock cameras:', mockError);
        setData(prev => ({ ...prev, error: 'Failed to fetch mock cameras' }));
      }
      return;
    }
    try {
      const response = await apiService.getCameras({ store_id: storeId, limit: 100 });
      const cameraStatuses = await apiService.getAllCamerasHealth();
      const statusMap: Record<string, CameraStatus> = {};
      cameraStatuses.forEach(status => {
        statusMap[status.camera_id] = status;
      });
      setData(prev => ({
        ...prev,
        cameras: response.cameras,
        cameraStatuses: statusMap,
        activeCameras: response.cameras.filter(c => c.is_active).length,
        totalCameras: response.total_count,
        lastUpdate: new Date()
      }));
    } catch (error) {
      console.error('Failed to fetch cameras:', error);
      if (mode === 'auto') {
        try {
          const mockResponse = await apiService.getMockCameras();
          setData(prev => ({
            ...prev,
            mockCameras: mockResponse.cameras,
            activeCameras: mockResponse.online_count,
            totalCameras: mockResponse.total_count,
            lastUpdate: new Date()
          }));
        } catch (mockError) {
          console.error('Failed to fetch mock cameras:', mockError);
          setData(prev => ({ ...prev, error: 'Failed to fetch cameras' }));
        }
      } else {
        setData(prev => ({ ...prev, error: 'Failed to fetch cameras' }));
      }
    }
  }, [storeId, mode]);

  const fetchAlerts = useCallback(async () => {
    if (mode === 'mock') {
      try {
        const mockResponse = await apiService.getMockActiveAlerts();
        const unack = (mockResponse.alerts || []).filter((a: any) => !a.acknowledged);
        setData(prev => ({
          ...prev,
          mockAlerts: mockResponse.alerts,
          unacknowledgedAlerts: unack,
          todaysAlerts: mockResponse.total_count,
          lastUpdate: new Date()
        }));
      } catch (mockError) {
        console.error('Failed to fetch mock alerts:', mockError);
        setData(prev => ({ ...prev, error: 'Failed to fetch mock alerts' }));
      }
      return;
    }
    try {
      const alerts = await apiService.getAlerts({ 
        store_id: storeId, 
        limit: 100 
      });
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todaysAlerts = alerts.filter(alert => 
        new Date(alert.timestamp) >= today
      ).length;

      setData(prev => ({
        ...prev,
        alerts,
        unacknowledgedAlerts: alerts.filter(a => !a.acknowledged),
        todaysAlerts,
        lastUpdate: new Date()
      }));
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
      if (mode === 'auto') {
        try {
          const mockResponse = await apiService.getMockActiveAlerts();
          const unack = (mockResponse.alerts || []).filter((a: any) => !a.acknowledged);
          setData(prev => ({
            ...prev,
            mockAlerts: mockResponse.alerts,
            unacknowledgedAlerts: unack,
            todaysAlerts: mockResponse.total_count,
            lastUpdate: new Date()
          }));
        } catch (mockError) {
          console.error('Failed to fetch mock alerts:', mockError);
          setData(prev => ({ ...prev, error: 'Failed to fetch alerts' }));
        }
      } else {
        setData(prev => ({ ...prev, error: 'Failed to fetch alerts' }));
      }
    }
  }, [storeId, mode]);

  const fetchDetections = useCallback(async () => {
    if (mode === 'mock') {
      try {
        const mockResponse = await apiService.getMockRecentDetections(50);
        setData(prev => ({
          ...prev,
          mockDetections: mockResponse.detections,
          lastUpdate: new Date()
        }));
      } catch (mockError) {
        console.error('Failed to fetch mock detections:', mockError);
        setData(prev => ({ ...prev, error: 'Failed to fetch mock detections' }));
      }
      return;
    }
    try {
      const [detectionsResponse, statsResponse] = await Promise.all([
        apiService.getDetections({ 
          store_id: storeId, 
          limit: 50 
        }),
        apiService.getDetectionStats({ store_id: storeId })
      ]);

      setData(prev => ({
        ...prev,
        recentDetections: detectionsResponse.detections,
        detectionStats: statsResponse,
        lastUpdate: new Date()
      }));
    } catch (error) {
      console.error('Failed to fetch detections:', error);
      if (mode === 'auto') {
        try {
          const mockResponse = await apiService.getMockRecentDetections(50);
          setData(prev => ({
            ...prev,
            mockDetections: mockResponse.detections,
            lastUpdate: new Date()
          }));
        } catch (mockError) {
          console.error('Failed to fetch mock detections:', mockError);
          setData(prev => ({ ...prev, error: 'Failed to fetch detections' }));
        }
      } else {
        setData(prev => ({ ...prev, error: 'Failed to fetch detections' }));
      }
    }
  }, [storeId, mode]);

  const fetchSystemStatus = useCallback(async () => {
    if (mode === 'mock') {
      try {
        const mockStatus = await apiService.getMockSystemStatus();
        setData(prev => ({
          ...prev,
          systemStatus: mockStatus,
          mockSystemRunning: mockStatus.running,
          systemHealth: mockStatus.running ? 'healthy' : 'offline',
          aiModelStatus: parseAiModelStatus(mockStatus),
          lastUpdate: new Date()
        }));
      } catch (mockError) {
        console.error('Failed to fetch mock system status:', mockError);
        setData(prev => ({
          ...prev,
          systemHealth: 'offline',
          error: 'Unable to connect to mock services'
        }));
      }
      return;
    }
    try {
      const status = await apiService.getHealthCheck();
      setData(prev => ({
        ...prev,
        systemStatus: status,
        systemHealth: status.status === 'healthy' ? 'healthy' : 'degraded',
        aiModelStatus: parseAiModelStatus(status),
        lastUpdate: new Date()
      }));
    } catch (error) {
      console.error('Failed to fetch system status:', error);
      if (mode === 'auto') {
        try {
          const mockStatus = await apiService.getMockSystemStatus();
          setData(prev => ({
            ...prev,
            systemStatus: mockStatus,
            mockSystemRunning: mockStatus.running,
            systemHealth: mockStatus.running ? 'healthy' : 'offline',
            aiModelStatus: parseAiModelStatus(mockStatus),
            lastUpdate: new Date()
          }));
        } catch (mockError) {
          console.error('Failed to fetch mock system status:', mockError);
          setData(prev => ({
            ...prev,
            systemHealth: 'offline',
            error: 'Unable to connect to backend services'
          }));
        }
      } else {
        setData(prev => ({
          ...prev,
          systemHealth: 'offline',
          error: 'Unable to connect to backend services'
        }));
      }
    }
  }, [mode]);

  // Initialize data
  const initializeData = useCallback(async () => {
    setData(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await Promise.all([
        fetchCameras(),
        fetchAlerts(),
        fetchDetections(),
        fetchSystemStatus()
      ]);
      
      setData(prev => ({ ...prev, isLoading: false }));
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize data:', error);
      setData(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Failed to load system data' 
      }));
    }
  }, [fetchCameras, fetchAlerts, fetchDetections, fetchSystemStatus]);

  // Actions
  const actions: RealTimeDataActions = {
    activateCamera: async (cameraId: string) => {
      try {
        await apiService.activateCamera(cameraId);
        await fetchCameras(); // Refresh camera data
      } catch (error) {
        console.error('Failed to activate camera:', error);
        throw error;
      }
    },

    deactivateCamera: async (cameraId: string) => {
      try {
        await apiService.deactivateCamera(cameraId);
        await fetchCameras(); // Refresh camera data
      } catch (error) {
        console.error('Failed to deactivate camera:', error);
        throw error;
      }
    },

    refreshCameras: fetchCameras,

    acknowledgeAlert: async (alertId: string) => {
      try {
        if (mode === 'mock') {
          // Update local state to mark as acknowledged in mock mode
          setData(prev => {
            const updatedAlerts = prev.alerts.map(a => a.id === alertId ? { ...a, acknowledged: true } : a);
            return {
              ...prev,
              alerts: updatedAlerts,
              unacknowledgedAlerts: updatedAlerts.filter(a => !a.acknowledged),
              lastUpdate: new Date(),
            };
          });
          websocketService.acknowledgeAlert(alertId);
          return;
        }
        await apiService.acknowledgeAlerts([alertId]);
        // Also send via WebSocket for real-time updates
        websocketService.acknowledgeAlert(alertId);
        await fetchAlerts(); // Refresh alert data
      } catch (error) {
        console.error('Failed to acknowledge alert:', error);
        throw error;
      }
    },

    acknowledgeAlerts: async (alertIds: string[]) => {
      try {
        if (mode === 'mock') {
          setData(prev => {
            const updatedAlerts = prev.alerts.map(a => alertIds.includes(a.id) ? { ...a, acknowledged: true } : a);
            return {
              ...prev,
              alerts: updatedAlerts,
              unacknowledgedAlerts: updatedAlerts.filter(a => !a.acknowledged),
              lastUpdate: new Date(),
            };
          });
          // Broadcast each acknowledgment for UI sync if mock WS listens
          alertIds.forEach(id => websocketService.acknowledgeAlert(id));
          return;
        }
        await apiService.acknowledgeAlerts(alertIds);
        await fetchAlerts(); // Refresh alert data
      } catch (error) {
        console.error('Failed to acknowledge alerts:', error);
        throw error;
      }
    },

    refreshAlerts: fetchAlerts,

    startMockSystem: async () => {
      try {
        await apiService.startMockSystem();
        await fetchSystemStatus(); // Refresh system status
      } catch (error) {
        console.error('Failed to start mock system:', error);
        throw error;
      }
    },

    stopMockSystem: async () => {
      try {
        await apiService.stopMockSystem();
        await fetchSystemStatus(); // Refresh system status
      } catch (error) {
        console.error('Failed to stop mock system:', error);
        throw error;
      }
    },

    startMockScenario: async (scenarioId: string) => {
      try {
        await apiService.startMockScenario(scenarioId);
        // Refresh all data as scenario might affect everything
        await initializeData();
      } catch (error) {
        console.error('Failed to start mock scenario:', error);
        throw error;
      }
    },

    connect: async () => {
      try {
        await websocketService.connect(storeId, websocketHandlers, { mode });
        if (!isInitialized) {
          await initializeData();
        }
      } catch (error) {
        console.error('Failed to connect:', error);
        throw error;
      }
    },

    disconnect: () => {
      websocketService.disconnect();
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    },

    retry: async () => {
      setData(prev => ({ ...prev, error: null, isLoading: true }));
      await initializeData();
      if (!websocketService.isConnected()) {
        await websocketService.connect(storeId, websocketHandlers, { mode });
      }
    }
  };

  // Effects
  useEffect(() => {
    // Initialize connection and data
    actions.connect().catch(console.error);

    // Set up periodic refresh for non-real-time data
    refreshIntervalRef.current = setInterval(() => {
      if (websocketService.isConnected()) {
        // If WebSocket is connected, only refresh less frequently
        fetchSystemStatus();
      } else {
        // If WebSocket is not connected, refresh all data more frequently
        initializeData();
      }
    }, 30000); // 30 seconds

    return () => {
      actions.disconnect();
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [storeId, mode]);

  return [data, actions];
}