/**
 * Database API Service - Essential database operations
 * Provides core database connectivity for the surveillance system
 */

export interface CameraStatus {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'error';
  url: string;
  location: string;
  lastSeen: Date | string;
  fps: number;
  resolution: string;
  // Additional properties for compatibility with backend
  store_id?: string;
  is_active?: boolean;
  created_at?: string;
}

export interface Detection {
  id: string;
  cameraId: string;
  timestamp: Date | string;
  type: 'person' | 'shoplifting' | 'suspicious';
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  metadata?: any;
  // Additional properties for compatibility
  class?: string;
  alert_level?: string;
  camera_name?: string;
  location?: string;
  camera_id?: string;
}

export interface Alert {
  id: string;
  type: 'security' | 'system' | 'warning';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date | string;
  cameraId?: string;
  acknowledged: boolean;
  resolvedAt?: Date | string;
  // Additional properties for compatibility
  status?: string;
  title?: string;
  camera_name?: string;
  location?: string;
  created_at?: Date | string;
  store_id?: string;
  alert_type?: string;
  resolved?: boolean;
  escalated?: boolean;
}

export interface PerformanceSummary {
  totalDetections: number;
  averageConfidence: number;
  systemUptime: number;
  activeCameras: number;
  totalCameras: number;
  averageFPS: number;
  // Additional properties for compatibility with backend
  active_cameras?: number;
  avg_fps?: number;
  avg_latency?: number;
  avg_gpu_utilization?: number;
  avg_availability?: number;
}

export interface DashboardSummary {
  activeCameras: number;
  totalDetections: number;
  activeAlerts: number;
  systemStatus: 'healthy' | 'warning' | 'error';
  uptime: number;
  // Additional properties for compatibility
  cameraStatus?: CameraStatus[];
  performanceSummary?: PerformanceSummary;
  recentBehaviors?: BehaviorAnalytics[];
  detection_stats?: {
    class_distribution: Array<{ name: string; count: number; }>;
  };
  // Backend compatible properties
  camera_status?: CameraStatus[];
  active_alerts?: Alert[];
  performance_summary?: PerformanceSummary;
  recent_behaviors?: any[];
  timestamp?: string;
}

export interface BehaviorAnalytics {
  suspiciousActivities: number;
  normalBehavior: number;
  alertsGenerated: number;
  falsePositives: number;
}

export interface SystemLog {
  id: string;
  timestamp: Date | string;
  level: 'info' | 'warning' | 'error';
  message: string;
  component: string;
}

class DatabaseApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8001';
  }

  // Health check
  async getHealthCheck(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch health check:', error);
      return { status: 'error' };
    }
  }

  // Camera operations
  async getCameras(): Promise<CameraStatus[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/cameras`);
      const data = await response.json();
      return data.cameras || data;
    } catch (error) {
      console.error('Failed to fetch cameras:', error);
      return [];
    }
  }

  async getCameraStatus(cameraId: string): Promise<CameraStatus | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/cameras/${cameraId}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch camera status:', error);
      return null;
    }
  }

  // Detection operations
  async getDetections(limit = 100): Promise<Detection[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/detections?limit=${limit}`);
      const data = await response.json();
      return data.detections || data;
    } catch (error) {
      console.error('Failed to fetch detections:', error);
      return [];
    }
  }

  async getDetectionsByCamera(cameraId: string): Promise<Detection[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/detections?camera_id=${cameraId}`);
      const data = await response.json();
      return data.detections || data;
    } catch (error) {
      console.error('Failed to fetch camera detections:', error);
      return [];
    }
  }

  // Alert operations
  async getAlerts(): Promise<Alert[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/detections/alerts`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
      return [];
    }
  }

  async acknowledgeAlert(alertId: string, userId?: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/detections/alerts/${alertId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          acknowledged: true,
          acknowledged_by: userId || 'frontend_user',
          acknowledged_at: new Date().toISOString()
        })
      });
      return { success: response.ok, data: await response.json() };
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
      return { success: false, error: error };
    }
  }

  // Dashboard data
  async getDashboardSummary(): Promise<DashboardSummary> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/dashboard/summary`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch dashboard summary:', error);
      return {
        activeCameras: 0,
        totalDetections: 0,
        activeAlerts: 0,
        systemStatus: 'error',
        uptime: 0
      };
    }
  }

  async getPerformanceSummary(): Promise<PerformanceSummary> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/dashboard/analytics/performance`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch performance summary:', error);
      return {
        totalDetections: 0,
        averageConfidence: 0,
        systemUptime: 0,
        activeCameras: 0,
        totalCameras: 0,
        averageFPS: 0
      };
    }
  }

  // Analytics
  async getBehaviorAnalytics(): Promise<BehaviorAnalytics> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/analytics/behavior`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch behavior analytics:', error);
      return {
        suspiciousActivities: 0,
        normalBehavior: 0,
        alertsGenerated: 0,
        falsePositives: 0
      };
    }
  }

  // System logs
  async getSystemLogs(limit = 50): Promise<SystemLog[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/system/logs?limit=${limit}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch system logs:', error);
      return [];
    }
  }

  // Camera management methods for LiveDashboardContext compatibility
  async getCameraStatusLive() {
    const data = await this.getCameras();
    return { success: true, data: data };
  }

  async getRecentDetections(filters?: any) {
    const data = await this.getDetections(50);
    return { success: true, data: data };
  }

  async getActiveAlerts(limit?: number) {
    const data = await this.getAlerts();
    return { success: true, data: data };
  }

  async getRecentBehaviors(filters?: any) {
    const data = await this.getBehaviorAnalytics();
    return { success: true, data: [data] };
  }

  async getRecentLogs(filters?: any) {
    const data = await this.getSystemLogs(20);
    return { success: true, data: data };
  }

  async addCamera(config: any) {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/cameras`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config)
      });
      return { success: response.ok, data: await response.json() };
    } catch (error) {
      console.error('Failed to add camera:', error);
      return { success: false, error: error };
    }
  }

  async removeCamera(cameraId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/cameras/${cameraId}`, {
        method: 'DELETE'
      });
      return { success: response.ok };
    } catch (error) {
      console.error('Failed to remove camera:', error);
      return { success: false, error: error };
    }
  }

  async startCamera(cameraId: string, quality?: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/cameras/${cameraId}/activate`, {
        method: 'POST'
      });
      return { success: response.ok };
    } catch (error) {
      console.error('Failed to start camera:', error);
      return { success: false, error: error };
    }
  }

  async stopCamera(cameraId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/cameras/${cameraId}/deactivate`, {
        method: 'POST'
      });
      return { success: response.ok };
    } catch (error) {
      console.error('Failed to stop camera:', error);
      return { success: false, error: error };
    }
  }

  async updateDetectionConfig(cameraId: string, config: any) {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/cameras/${cameraId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config)
      });
      return { success: response.ok, data: await response.json() };
    } catch (error) {
      console.error('Failed to update detection config:', error);
      return { success: false, error: error };
    }
  }

  async createWebRTCStream(cameraId: string, quality?: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/cameras/live/webrtc/stream/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          camera_id: cameraId,
          quality: quality || 'medium'
        })
      });
      const data = await response.json();
      return { success: response.ok, data: { streamId: data.stream_id || `stream_${cameraId}` } };
    } catch (error) {
      console.error('Failed to create WebRTC stream:', error);
      return { success: false, error: error };
    }
  }

  async destroyWebRTCStream(streamId: string) {
    try {
      // For now, we'll just simulate success
      return { success: true };
    } catch (error) {
      console.error('Failed to destroy WebRTC stream:', error);
      return { success: false, error: error };
    }
  }

  async addDemoCameras() {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/cameras/live/test/add-demo-cameras`, {
        method: 'POST'
      });
      const data = await response.json();
      return { success: response.ok, data: data };
    } catch (error) {
      console.error('Failed to add demo cameras:', error);
      return { success: false, error: error };
    }
  }
}

export const databaseApiService = new DatabaseApiService();
export const databaseAPI = databaseApiService;
export const liveCameraAPI = databaseApiService;
export default databaseApiService;