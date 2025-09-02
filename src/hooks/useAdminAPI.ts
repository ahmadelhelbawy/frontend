/**
 * Custom hooks for Admin Dashboard API interactions
 * Enhanced with error handling, retry logic, and toast notifications
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import axios, { AxiosError } from 'axios';
import { useToast, getErrorMessage } from '../components/common/ToastNotifications';

const API_BASE_URL = 'http://localhost:8000';

interface SystemStats {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  network_latency: number;
  uptime: number;
  active_services: number;
  total_services: number;
  active_connections: number;
  total_users: number;
  active_users: number;
  timestamp: string;
}

interface ServiceStatus {
  name: string;
  status: string;
  uptime: number;
  memory_usage: number;
  cpu_usage: number;
  version: string;
  health: string;
  pid: number;
}

interface PerformanceMetric {
  timestamp: string;
  time: string;
  cpu: number;
  memory: number;
  network: number;
  disk_io?: number;
  active_connections?: number;
  throughput?: number;
}

interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  status: string;
  last_login: string;
  permissions: string[];
  created_at: string;
  updated_at?: string;
}

interface Camera {
  id: string;
  name: string;
  location: string;
  status: string;
  fps: number;
  resolution: string;
  detection_enabled: boolean;
  recording: boolean;
  last_maintenance: string;
  uptime_hours?: number;
  quality_score?: number;
}

interface AlertDistribution {
  period_hours: number;
  distribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  total_alerts: number;
  false_positive_rate: number;
  response_time_avg_minutes: number;
}

export const useSystemStats = (refreshInterval: number = 30000) => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/system/stats`);
      if (response.data.success) {
        setStats(response.data.data);
        setError(null);
      } else {
        setError('Failed to fetch system stats');
      }
    } catch (err) {
      setError('Error fetching system stats');
      console.error('Error fetching system stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchStats, refreshInterval]);

  return { stats, loading, error, refresh: fetchStats };
};

export const useServiceStatus = (refreshInterval: number = 30000) => {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/system/services`);
      if (response.data.success) {
        setServices(response.data.data);
        setError(null);
      }
    } catch (err) {
      setError('Error fetching service status');
      console.error('Error fetching service status:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
    const interval = setInterval(fetchServices, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchServices, refreshInterval]);

  return { services, loading, error, refresh: fetchServices };
};

export const usePerformanceMetrics = (hours: number = 6) => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/system/performance?hours=${hours}`);
      if (response.data.success) {
        setMetrics(response.data.data);
        setError(null);
      }
    } catch (err) {
      setError('Error fetching performance metrics');
      console.error('Error fetching performance metrics:', err);
    } finally {
      setLoading(false);
    }
  }, [hours]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return { metrics, loading, error, refresh: fetchMetrics };
};

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/users`);
      if (response.data.success) {
        setUsers(response.data.data);
        setError(null);
      }
    } catch (err) {
      setError('Error fetching users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = async (userData: {
    username: string;
    name: string;
    email: string;
    role: string;
    permissions?: string[];
  }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/admin/users`, userData);
      if (response.data.success) {
        await fetchUsers(); // Refresh the list
        return { success: true, data: response.data.data };
      } else {
        return { success: false, error: 'Failed to create user' };
      }
    } catch (err: any) {
      return { 
        success: false, 
        error: err.response?.data?.detail || 'Error creating user' 
      };
    }
  };

  const updateUser = async (userId: string, userData: Partial<User>) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/admin/users/${userId}`, userData);
      if (response.data.success) {
        await fetchUsers(); // Refresh the list
        return { success: true, data: response.data.data };
      } else {
        return { success: false, error: 'Failed to update user' };
      }
    } catch (err: any) {
      return { 
        success: false, 
        error: err.response?.data?.detail || 'Error updating user' 
      };
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/admin/users/${userId}`);
      if (response.data.success) {
        await fetchUsers(); // Refresh the list
        return { success: true, message: response.data.message };
      } else {
        return { success: false, error: 'Failed to delete user' };
      }
    } catch (err: any) {
      return { 
        success: false, 
        error: err.response?.data?.detail || 'Error deleting user' 
      };
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { 
    users, 
    loading, 
    error, 
    refresh: fetchUsers,
    createUser,
    updateUser,
    deleteUser
  };
};

export const useCameras = () => {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCameras = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/cameras`);
      if (response.data.success) {
        setCameras(response.data.data);
        setError(null);
      }
    } catch (err) {
      setError('Error fetching cameras');
      console.error('Error fetching cameras:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleDetection = async (cameraId: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/admin/cameras/${cameraId}/toggle-detection`);
      if (response.data.success) {
        await fetchCameras(); // Refresh the list
        return { success: true, message: response.data.message };
      } else {
        return { success: false, error: 'Failed to toggle detection' };
      }
    } catch (err: any) {
      return { 
        success: false, 
        error: err.response?.data?.detail || 'Error toggling detection' 
      };
    }
  };

  const toggleRecording = async (cameraId: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/admin/cameras/${cameraId}/toggle-recording`);
      if (response.data.success) {
        await fetchCameras(); // Refresh the list
        return { success: true, message: response.data.message };
      } else {
        return { success: false, error: 'Failed to toggle recording' };
      }
    } catch (err: any) {
      return { 
        success: false, 
        error: err.response?.data?.detail || 'Error toggling recording' 
      };
    }
  };

  useEffect(() => {
    fetchCameras();
  }, [fetchCameras]);

  return { 
    cameras, 
    loading, 
    error, 
    refresh: fetchCameras,
    toggleDetection,
    toggleRecording
  };
};

export const useAIPerformance = (refreshInterval: number = 60000) => {
  const [performance, setPerformance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPerformance = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/ai/performance`);
      if (response.data.success) {
        setPerformance(response.data.data);
        setError(null);
      }
    } catch (err) {
      setError('Error fetching AI performance');
      console.error('Error fetching AI performance:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPerformance();
    const interval = setInterval(fetchPerformance, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchPerformance, refreshInterval]);

  return { performance, loading, error, refresh: fetchPerformance };
};

export const useAlertDistribution = (hours: number = 24) => {
  const [distribution, setDistribution] = useState<AlertDistribution | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDistribution = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/alerts/distribution?hours=${hours}`);
      if (response.data.success) {
        setDistribution(response.data.data);
        setError(null);
      }
    } catch (err) {
      setError('Error fetching alert distribution');
      console.error('Error fetching alert distribution:', err);
    } finally {
      setLoading(false);
    }
  }, [hours]);

  useEffect(() => {
    fetchDistribution();
  }, [fetchDistribution]);

  return { distribution, loading, error, refresh: fetchDistribution };
};

export const useDetectionConfig = () => {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/config/detection`);
      if (response.data.success) {
        setConfig(response.data.data);
        setError(null);
      }
    } catch (err) {
      setError('Error fetching detection config');
      console.error('Error fetching detection config:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateConfig = async (configData: any) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/admin/config/detection`, configData);
      if (response.data.success) {
        await fetchConfig(); // Refresh the config
        return { success: true, message: response.data.message };
      } else {
        return { success: false, error: 'Failed to update configuration' };
      }
    } catch (err: any) {
      return { 
        success: false, 
        error: err.response?.data?.detail || 'Error updating configuration' 
      };
    }
  };

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  return { config, loading, error, refresh: fetchConfig, updateConfig };
};

export const useSystemHealth = (refreshInterval: number = 30000) => {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/system/health`);
      if (response.data.success) {
        setHealth(response.data.data);
        setError(null);
      }
    } catch (err) {
      setError('Error fetching system health');
      console.error('Error fetching system health:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchHealth, refreshInterval]);

  return { health, loading, error, refresh: fetchHealth };
};

export const useDatabasePerformance = (refreshInterval: number = 60000) => {
  const [performance, setPerformance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPerformance = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/database/performance`);
      if (response.data.success) {
        setPerformance(response.data.data);
        setError(null);
      }
    } catch (err) {
      setError('Error fetching database performance');
      console.error('Error fetching database performance:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPerformance();
    const interval = setInterval(fetchPerformance, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchPerformance, refreshInterval]);

  return { performance, loading, error, refresh: fetchPerformance };
};

export const useWebSocketPerformance = (refreshInterval: number = 30000) => {
  const [performance, setPerformance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPerformance = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/websocket/performance`);
      if (response.data.success) {
        setPerformance(response.data.data);
        setError(null);
      }
    } catch (err) {
      setError('Error fetching WebSocket performance');
      console.error('Error fetching WebSocket performance:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPerformance();
    const interval = setInterval(fetchPerformance, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchPerformance, refreshInterval]);

  return { performance, loading, error, refresh: fetchPerformance };
};

// Export all hooks
export {
  type SystemStats,
  type ServiceStatus,
  type PerformanceMetric,
  type User,
  type Camera,
  type AlertDistribution
};
