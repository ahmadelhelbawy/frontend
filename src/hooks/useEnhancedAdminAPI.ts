/**
 * Enhanced Admin API Hooks
 * Includes toast notifications, retry logic, and better error handling
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import axios, { AxiosError } from 'axios';

const API_BASE_URL = 'http://localhost:8000';

interface UseApiOptions {
  showErrorToasts?: boolean;
  showSuccessToasts?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
  silentErrors?: boolean;
}

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  isRetrying: boolean;
  lastFetch: Date | null;
}

interface ApiActions {
  refresh: () => Promise<void>;
  clearError: () => void;
}

// Custom hook for API calls with enhanced error handling
export const useEnhancedAPI = <T>(
  apiCall: () => Promise<any>,
  dependencies: any[] = [],
  options: UseApiOptions = {}
): ApiState<T> & ApiActions => {
  const {
    showErrorToasts = true,
    showSuccessToasts = false,
    retryAttempts = 3,
    retryDelay = 1000,
    silentErrors = false
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  const retryCount = useRef(0);
  const abortController = useRef<AbortController | null>(null);

  // Use toast context if available
  const toast = (() => {
    try {
      // Dynamic import to avoid errors if toast context is not available
      const { useToast } = require('../components/common/ToastNotifications');
      return useToast();
    } catch {
      return null;
    }
  })();

  const getErrorMessage = (error: any): string => {
    if (typeof error === 'string') return error;
    
    if (error?.response?.status) {
      switch (error.response.status) {
        case 401: return 'Authentication required. Please log in again.';
        case 403: return 'Access denied. You don\'t have permission for this action.';
        case 404: return 'Resource not found.';
        case 408: return 'Request timed out. Please try again.';
        case 429: return 'Too many requests. Please wait a moment.';
        case 500: return 'Internal server error. Please try again later.';
        case 503: return 'Service temporarily unavailable.';
        default: return error.response.data?.message || 'An error occurred.';
      }
    }

    if (error?.message) {
      if (error.message.includes('Network Error')) return 'Network connection error. Please check your internet connection.';
      if (error.message.includes('timeout')) return 'Request timed out. Please try again.';
      return error.message;
    }

    return 'An unexpected error occurred.';
  };

  const executeWithRetry = useCallback(async (attempt = 0): Promise<void> => {
    try {
      // Cancel previous request if still pending
      if (abortController.current) {
        abortController.current.abort();
      }
      
      abortController.current = new AbortController();
      
      if (attempt > 0) {
        setIsRetrying(true);
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
      } else {
        setLoading(true);
      }

      const response = await apiCall();
      
      if (response?.data?.success !== false) {
        const resultData = response?.data?.data || response?.data || response;
        setData(resultData);
        setError(null);
        setLastFetch(new Date());
        retryCount.current = 0;

        if (showSuccessToasts && toast && attempt > 0) {
          toast.showSuccess('Data refreshed successfully');
        }
      } else {
        throw new Error(response.data.message || 'API returned unsuccessful response');
      }
    } catch (err: any) {
      // Don't retry if request was cancelled
      if (err.name === 'CanceledError' || err.name === 'AbortError') {
        return;
      }

      const errorMessage = getErrorMessage(err);
      
      if (attempt < retryAttempts && !err.response?.status?.toString().startsWith('4')) {
        retryCount.current = attempt + 1;
        await executeWithRetry(attempt + 1);
        return;
      }

      // Final failure
      setError(errorMessage);
      setData(null);
      retryCount.current = 0;

      if (showErrorToasts && toast && !silentErrors) {
        toast.showError(errorMessage, {
          title: 'Error Loading Data',
          action: retryAttempts > 0 ? {
            label: 'Retry',
            onClick: refresh
          } : undefined
        });
      }

      console.error('API Error:', err);
    } finally {
      setLoading(false);
      setIsRetrying(false);
      abortController.current = null;
    }
  }, [apiCall, retryAttempts, retryDelay, showErrorToasts, showSuccessToasts, toast, silentErrors]);

  const refresh = useCallback(async () => {
    await executeWithRetry(0);
  }, [executeWithRetry]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    executeWithRetry(0);

    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, dependencies);

  return {
    data,
    loading,
    error,
    isRetrying,
    lastFetch,
    refresh,
    clearError
  };
};

// Enhanced System Stats Hook
export const useEnhancedSystemStats = (refreshInterval: number = 30000, options?: UseApiOptions) => {
  const apiCall = useCallback(
    () => axios.get(`${API_BASE_URL}/api/admin/system/stats`),
    []
  );

  const result = useEnhancedAPI(apiCall, [], { 
    showErrorToasts: true,
    retryAttempts: 3,
    ...options 
  });

  // Auto-refresh interval
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(() => {
        if (!result.loading && !result.isRetrying) {
          result.refresh();
        }
      }, refreshInterval);
      
      return () => clearInterval(interval);
    }
  }, [refreshInterval, result.loading, result.isRetrying, result.refresh]);

  return {
    stats: result.data,
    loading: result.loading,
    error: result.error,
    isRetrying: result.isRetrying,
    lastFetch: result.lastFetch,
    refresh: result.refresh,
    clearError: result.clearError
  };
};

// Enhanced Service Status Hook
export const useEnhancedServiceStatus = (refreshInterval: number = 30000, options?: UseApiOptions) => {
  const apiCall = useCallback(
    () => axios.get(`${API_BASE_URL}/api/admin/system/services`),
    []
  );

  const result = useEnhancedAPI(apiCall, [], { 
    showErrorToasts: true,
    retryAttempts: 2,
    ...options 
  });

  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(() => {
        if (!result.loading && !result.isRetrying) {
          result.refresh();
        }
      }, refreshInterval);
      
      return () => clearInterval(interval);
    }
  }, [refreshInterval, result.loading, result.isRetrying, result.refresh]);

  return {
    services: result.data || [],
    loading: result.loading,
    error: result.error,
    isRetrying: result.isRetrying,
    lastFetch: result.lastFetch,
    refresh: result.refresh,
    clearError: result.clearError
  };
};

// Enhanced Performance Metrics Hook
export const useEnhancedPerformanceMetrics = (hours: number = 6, options?: UseApiOptions) => {
  const apiCall = useCallback(
    () => axios.get(`${API_BASE_URL}/api/admin/system/performance?hours=${hours}`),
    [hours]
  );

  const result = useEnhancedAPI(apiCall, [hours], { 
    showErrorToasts: true,
    retryAttempts: 2,
    ...options 
  });

  return {
    metrics: result.data || [],
    loading: result.loading,
    error: result.error,
    isRetrying: result.isRetrying,
    lastFetch: result.lastFetch,
    refresh: result.refresh,
    clearError: result.clearError
  };
};

// Enhanced Users Hook with CRUD operations
export const useEnhancedUsers = (options?: UseApiOptions) => {
  const apiCall = useCallback(
    () => axios.get(`${API_BASE_URL}/api/admin/users`),
    []
  );

  const result = useEnhancedAPI(apiCall, [], { 
    showErrorToasts: true,
    retryAttempts: 2,
    ...options 
  });

  const toast = (() => {
    try {
      const { useToast } = require('../components/common/ToastNotifications');
      return useToast();
    } catch {
      return null;
    }
  })();

  const createUser = useCallback(async (userData: any) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/admin/users`, userData);
      if (response.data.success) {
        await result.refresh();
        if (toast) {
          toast.showSuccess('User created successfully');
        }
        return { success: true, data: response.data.data };
      } else {
        throw new Error(response.data.message || 'Failed to create user');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Error creating user';
      if (toast) {
        toast.showError(errorMessage, { title: 'Create User Failed' });
      }
      return { success: false, error: errorMessage };
    }
  }, [result.refresh, toast]);

  const updateUser = useCallback(async (userId: string, userData: any) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/admin/users/${userId}`, userData);
      if (response.data.success) {
        await result.refresh();
        if (toast) {
          toast.showSuccess('User updated successfully');
        }
        return { success: true, data: response.data.data };
      } else {
        throw new Error(response.data.message || 'Failed to update user');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Error updating user';
      if (toast) {
        toast.showError(errorMessage, { title: 'Update User Failed' });
      }
      return { success: false, error: errorMessage };
    }
  }, [result.refresh, toast]);

  const deleteUser = useCallback(async (userId: string) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/admin/users/${userId}`);
      if (response.data.success) {
        await result.refresh();
        if (toast) {
          toast.showSuccess('User deleted successfully');
        }
        return { success: true, message: response.data.message };
      } else {
        throw new Error(response.data.message || 'Failed to delete user');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Error deleting user';
      if (toast) {
        toast.showError(errorMessage, { title: 'Delete User Failed' });
      }
      return { success: false, error: errorMessage };
    }
  }, [result.refresh, toast]);

  return {
    users: result.data || [],
    loading: result.loading,
    error: result.error,
    isRetrying: result.isRetrying,
    lastFetch: result.lastFetch,
    refresh: result.refresh,
    clearError: result.clearError,
    createUser,
    updateUser,
    deleteUser
  };
};

// Enhanced Cameras Hook
export const useEnhancedCameras = (options?: UseApiOptions) => {
  const apiCall = useCallback(
    () => axios.get(`${API_BASE_URL}/api/admin/cameras`),
    []
  );

  const result = useEnhancedAPI(apiCall, [], { 
    showErrorToasts: true,
    retryAttempts: 2,
    ...options 
  });

  const toast = (() => {
    try {
      const { useToast } = require('../components/common/ToastNotifications');
      return useToast();
    } catch {
      return null;
    }
  })();

  const toggleDetection = useCallback(async (cameraId: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/admin/cameras/${cameraId}/toggle-detection`);
      if (response.data.success) {
        await result.refresh();
        if (toast) {
          toast.showSuccess(response.data.message || 'Detection toggled successfully');
        }
        return { success: true, message: response.data.message };
      } else {
        throw new Error(response.data.message || 'Failed to toggle detection');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Error toggling detection';
      if (toast) {
        toast.showError(errorMessage, { title: 'Toggle Detection Failed' });
      }
      return { success: false, error: errorMessage };
    }
  }, [result.refresh, toast]);

  const toggleRecording = useCallback(async (cameraId: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/admin/cameras/${cameraId}/toggle-recording`);
      if (response.data.success) {
        await result.refresh();
        if (toast) {
          toast.showSuccess(response.data.message || 'Recording toggled successfully');
        }
        return { success: true, message: response.data.message };
      } else {
        throw new Error(response.data.message || 'Failed to toggle recording');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Error toggling recording';
      if (toast) {
        toast.showError(errorMessage, { title: 'Toggle Recording Failed' });
      }
      return { success: false, error: errorMessage };
    }
  }, [result.refresh, toast]);

  return {
    cameras: result.data || [],
    loading: result.loading,
    error: result.error,
    isRetrying: result.isRetrying,
    lastFetch: result.lastFetch,
    refresh: result.refresh,
    clearError: result.clearError,
    toggleDetection,
    toggleRecording
  };
};

// Enhanced AI Performance Hook
export const useEnhancedAIPerformance = (refreshInterval: number = 60000, options?: UseApiOptions) => {
  const apiCall = useCallback(
    () => axios.get(`${API_BASE_URL}/api/admin/ai/performance`),
    []
  );

  const result = useEnhancedAPI(apiCall, [], { 
    showErrorToasts: true,
    retryAttempts: 2,
    silentErrors: false,
    ...options 
  });

  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(() => {
        if (!result.loading && !result.isRetrying) {
          result.refresh();
        }
      }, refreshInterval);
      
      return () => clearInterval(interval);
    }
  }, [refreshInterval, result.loading, result.isRetrying, result.refresh]);

  return {
    performance: result.data,
    loading: result.loading,
    error: result.error,
    isRetrying: result.isRetrying,
    lastFetch: result.lastFetch,
    refresh: result.refresh,
    clearError: result.clearError
  };
};
