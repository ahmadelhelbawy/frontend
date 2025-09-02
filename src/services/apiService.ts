/**
 * API Service for connecting to the AI Shoplifting Detection backend
 * Provides methods for cameras, detections, alerts, and system status
 */

import { getRuntimeMode } from '../config/runtime';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export interface Camera {
  id: string;
  store_id: string;
  name: string;
  rtsp_url: string;
  detection_zones: any[];
  sensitivity_level: number;
  is_active: boolean;
  created_at: string;
}

export interface CameraStatus {
  camera_id: string;
  is_active: boolean;
  is_connected: boolean;
  last_detection?: string;
  stream_health: 'healthy' | 'degraded' | 'offline';
}

export interface Detection {
  id: string;
  camera_id: string;
  timestamp: string;
  confidence_score: number;
  alert_level: 'normal' | 'suspicious' | 'shoplifting';
  bounding_boxes: any[];
  video_segment_url?: string;
  metadata: any;
}

export interface Alert {
  id: string;
  detection_id?: string;
  store_id: string;
  alert_type: string;
  severity: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: string;
}

export interface SystemStatus {
  status: string;
  timestamp: string;
  services: {
    api: string;
    database: string;
    redis: string;
    minio: string;
  };
}

export interface DetectionStats {
  total_detections: number;
  detections_by_level: Record<string, number>;
  detections_by_camera: Record<string, number>;
  hourly_distribution: Array<{ hour: number; count: number }>;
  average_confidence: number;
}

class ApiService {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = API_BASE_URL;
    // Try to get token from localStorage
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as any).Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Standard HTTP methods
  async get<T>(endpoint: string, options: RequestInit = {}): Promise<{ data: T }> {
    const result = await this.request<T>(endpoint, { method: 'GET', ...options });
    return { data: result };
  }

  async post<T>(endpoint: string, data?: any, options: RequestInit = {}): Promise<{ data: T }> {
    const result = await this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
    return { data: result };
  }

  async put<T>(endpoint: string, data?: any, options: RequestInit = {}): Promise<{ data: T }> {
    const result = await this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
    return { data: result };
  }

  async delete<T>(endpoint: string, options: RequestInit = {}): Promise<{ data: T }> {
    const result = await this.request<T>(endpoint, { method: 'DELETE', ...options });
    return { data: result };
  }

  // Authentication
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // System Health
  async getHealthCheck(): Promise<SystemStatus> {
    return this.request<SystemStatus>('/health');
  }

  // Cameras
  async getCameras(params?: {
    store_id?: string;
    is_active?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ cameras: Camera[]; total_count: number }> {
    const searchParams = new URLSearchParams();
    if (params?.store_id) searchParams.append('store_id', params.store_id);
    if (params?.is_active !== undefined) searchParams.append('is_active', params.is_active.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());

    const query = searchParams.toString();
    return this.request<{ cameras: Camera[]; total_count: number }>(
      `/api/cameras${query ? `?${query}` : ''}`
    );
  }

  async getCamera(cameraId: string): Promise<Camera> {
    return this.request<Camera>(`/cameras/${cameraId}`);
  }

  async getCameraStatus(cameraId: string): Promise<CameraStatus> {
    return this.request<CameraStatus>(`/cameras/${cameraId}/status`);
  }

  async getAllCamerasHealth(): Promise<CameraStatus[]> {
    return this.request<CameraStatus[]>('/cameras/health/check');
  }

  async activateCamera(cameraId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/cameras/${cameraId}/activate`, {
      method: 'POST',
    });
  }

  async deactivateCamera(cameraId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/cameras/${cameraId}/deactivate`, {
      method: 'POST',
    });
  }

  // Detections
  async getDetections(params?: {
    store_id?: string;
    camera_id?: string;
    alert_level?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ detections: Detection[]; total_count: number }> {
    const searchParams = new URLSearchParams();
    if (params?.store_id) searchParams.append('store_id', params.store_id);
    if (params?.camera_id) searchParams.append('camera_id', params.camera_id);
    if (params?.alert_level) searchParams.append('alert_level', params.alert_level);
    if (params?.start_date) searchParams.append('start_date', params.start_date);
    if (params?.end_date) searchParams.append('end_date', params.end_date);
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());

    const query = searchParams.toString();
    return this.request<{ detections: Detection[]; total_count: number }>(
      `/detections${query ? `?${query}` : ''}`
    );
  }

  async getDetectionStats(params?: {
    store_id?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<DetectionStats> {
    const searchParams = new URLSearchParams();
    if (params?.store_id) searchParams.append('store_id', params.store_id);
    if (params?.start_date) searchParams.append('start_date', params.start_date);
    if (params?.end_date) searchParams.append('end_date', params.end_date);

    const query = searchParams.toString();
    return this.request<DetectionStats>(
      `/detections/stats/summary${query ? `?${query}` : ''}`
    );
  }

  // Alerts
  async getAlerts(params?: {
    store_id?: string;
    alert_type?: string;
    severity?: string;
    acknowledged?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<Alert[]> {
    const searchParams = new URLSearchParams();
    if (params?.store_id) searchParams.append('store_id', params.store_id);
    if (params?.alert_type) searchParams.append('alert_type', params.alert_type);
    if (params?.severity) searchParams.append('severity', params.severity);
    if (params?.acknowledged !== undefined) searchParams.append('acknowledged', params.acknowledged.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());

    const query = searchParams.toString();
    return this.request<Alert[]>(`/detections/alerts/${query ? `?${query}` : ''}`);
  }

  async acknowledgeAlerts(alertIds: string[]): Promise<{ message: string; acknowledged_count: number }> {
    const mode = getRuntimeMode();
    const endpoint = mode === 'mock' 
      ? '/api/mock/alerts/acknowledge'  // Mock endpoint
      : '/detections/alerts/acknowledge'; // Production endpoint
      
    return this.request<{ message: string; acknowledged_count: number }>(endpoint, {
      method: 'POST',
      body: JSON.stringify({ alert_ids: alertIds }),
    });
  }

  // Mock Services (for development)
  async getMockSystemStatus(): Promise<any> {
    return this.request<any>('/api/mock/system/status');
  }

  async startMockSystem(mode: string = 'development'): Promise<{ status: string; message: string }> {
    return this.request<{ status: string; message: string }>('/api/mock/system/start', {
      method: 'POST',
      body: JSON.stringify({ action: 'start', mode }),
    });
  }

  async stopMockSystem(): Promise<{ status: string; message: string }> {
    return this.request<{ status: string; message: string }>('/api/mock/system/stop', {
      method: 'POST',
    });
  }

  async getMockCameras(): Promise<{ cameras: any[]; total_count: number; online_count: number }> {
    return this.request<{ cameras: any[]; total_count: number; online_count: number }>('/api/mock/cameras');
  }

  async getMockRecentDetections(limit: number = 10): Promise<{ detections: any[]; total_active_tracks: number }> {
    return this.request<{ detections: any[]; total_active_tracks: number }>(`/api/mock/detections/recent?limit=${limit}`);
  }

  async getMockActiveAlerts(): Promise<{ alerts: any[]; total_count: number }> {
    return this.request<{ alerts: any[]; total_count: number }>('/api/mock/autonomous/alerts');
  }

  async getMockPerformanceMetrics(): Promise<{ metrics: any }> {
    return this.request<{ metrics: any }>('/api/mock/autonomous/metrics');
  }

  async startMockScenario(scenarioId: string): Promise<{ status: string; message: string }> {
    return this.request<{ status: string; message: string }>('/api/mock/scenarios/start', {
      method: 'POST',
      body: JSON.stringify({ scenario_id: scenarioId }),
    });
  }

  async getMockScenarios(): Promise<any[]> {
    return this.request<any[]>('/api/mock/scenarios');
  }
}

export const apiService = new ApiService();
export default apiService;