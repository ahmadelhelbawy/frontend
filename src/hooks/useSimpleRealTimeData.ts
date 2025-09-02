/**
 * Simplified React hook for managing real-time data
 * Focuses on basic functionality without complex TypeScript types
 */

import { useState, useEffect, useCallback } from 'react';
import { simpleApiService, MockCamera, MockAlert, MockSystemStatus } from '../services/simpleApiService';

export interface SimpleRealTimeData {
  // Camera data
  mockCameras: MockCamera[];
  activeCameras: number;
  totalCameras: number;
  
  // Alert data
  mockAlerts: MockAlert[];
  todaysAlerts: number;
  
  // System status
  systemHealth: 'healthy' | 'degraded' | 'offline';
  mockSystemRunning: boolean;
  
  // Connection status
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  lastUpdate: Date | null;
}

export interface SimpleRealTimeActions {
  activateCamera: (cameraId: string) => Promise<void>;
  deactivateCamera: (cameraId: string) => Promise<void>;
  startMockSystem: () => Promise<void>;
  refreshData: () => Promise<void>;
  retry: () => Promise<void>;
}

export function useSimpleRealTimeData(): [SimpleRealTimeData, SimpleRealTimeActions] {
  const [data, setData] = useState<SimpleRealTimeData>({
    mockCameras: [],
    activeCameras: 0,
    totalCameras: 0,
    mockAlerts: [],
    todaysAlerts: 0,
    systemHealth: 'offline',
    mockSystemRunning: false,
    isConnected: false,
    isLoading: true,
    error: null,
    lastUpdate: null,
  });

  // Fetch system status
  const fetchSystemStatus = useCallback(async () => {
    try {
      const [healthStatus, mockStatus] = await Promise.all([
        simpleApiService.getHealthCheck(),
        simpleApiService.getMockSystemStatus()
      ]);

      setData(prev => ({
        ...prev,
        systemHealth: healthStatus.status === 'healthy' ? 'healthy' : 'degraded',
        mockSystemRunning: mockStatus.status === 'healthy',
        isConnected: true,
        error: null,
        lastUpdate: new Date()
      }));
    } catch (error) {
      console.error('Failed to fetch system status:', error);
      setData(prev => ({
        ...prev,
        systemHealth: 'offline',
        mockSystemRunning: false,
        isConnected: false,
        error: 'Unable to connect to backend services'
      }));
    }
  }, []);

  // Fetch cameras
  const fetchCameras = useCallback(async () => {
    try {
      const response = await simpleApiService.getMockCameras();
      setData(prev => ({
        ...prev,
        mockCameras: response.cameras,
        activeCameras: response.cameras.filter((c: any) => c.status === 'online').length,
        totalCameras: response.cameras.length,
        lastUpdate: new Date()
      }));
    } catch (error) {
      console.error('Failed to fetch cameras:', error);
    }
  }, []);

  // Fetch alerts
  const fetchAlerts = useCallback(async () => {
    try {
      const response = await simpleApiService.getMockActiveAlerts();
      setData(prev => ({
        ...prev,
        mockAlerts: response.alerts,
        todaysAlerts: response.alerts.length,
        lastUpdate: new Date()
      }));
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    }
  }, []);

  // Initialize data
  const initializeData = useCallback(async () => {
    setData(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await Promise.all([
        fetchSystemStatus(),
        fetchCameras(),
        fetchAlerts()
      ]);
      
      setData(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      console.error('Failed to initialize data:', error);
      setData(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Failed to load system data' 
      }));
    }
  }, [fetchSystemStatus, fetchCameras, fetchAlerts]);

  // Actions
  const actions: SimpleRealTimeActions = {
    activateCamera: async (cameraId: string) => {
      try {
        await simpleApiService.activateCamera(cameraId);
        // Update camera status locally
        setData(prev => ({
          ...prev,
          mockCameras: prev.mockCameras.map(camera => 
            camera.id === cameraId 
              ? { ...camera, status: 'online' as const, is_active: true }
              : camera
          ),
          activeCameras: prev.activeCameras + 1,
          lastUpdate: new Date()
        }));
      } catch (error) {
        console.error('Failed to activate camera:', error);
        throw error;
      }
    },

    deactivateCamera: async (cameraId: string) => {
      try {
        await simpleApiService.deactivateCamera(cameraId);
        // Update camera status locally
        setData(prev => ({
          ...prev,
          mockCameras: prev.mockCameras.map(camera => 
            camera.id === cameraId 
              ? { ...camera, status: 'offline' as const, is_active: false }
              : camera
          ),
          activeCameras: Math.max(0, prev.activeCameras - 1),
          lastUpdate: new Date()
        }));
      } catch (error) {
        console.error('Failed to deactivate camera:', error);
        throw error;
      }
    },

    startMockSystem: async () => {
      try {
        await simpleApiService.startMockSystem();
        // Wait a moment then refresh data
        setTimeout(() => {
          initializeData();
        }, 2000);
      } catch (error) {
        console.error('Failed to start mock system:', error);
        throw error;
      }
    },

    refreshData: initializeData,

    retry: async () => {
      setData(prev => ({ ...prev, error: null, isLoading: true }));
      await initializeData();
    }
  };

  // Initialize on mount
  useEffect(() => {
    initializeData();
    
    // Set up periodic refresh
    const interval = setInterval(() => {
      fetchSystemStatus();
      fetchCameras();
      fetchAlerts();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [initializeData, fetchSystemStatus, fetchCameras, fetchAlerts]);

  return [data, actions];
}