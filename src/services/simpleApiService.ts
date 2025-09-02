/**
 * Simple API Service - Mock data for development
 */

export interface MockCamera {
  id: string;
  name: string;
  status: 'online' | 'offline';
  location: string;
}

export interface MockAlert {
  id: string;
  type: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
}

export interface MockSystemStatus {
  status: 'healthy' | 'warning' | 'error';
  uptime: number;
  activeCameras: number;
}

class SimpleApiService {
  async getCameras(): Promise<MockCamera[]> {
    return [
      { id: '1', name: 'Camera 1', status: 'online', location: 'Entrance' },
      { id: '2', name: 'Camera 2', status: 'online', location: 'Aisle 1' },
      { id: '3', name: 'Camera 3', status: 'offline', location: 'Checkout' },
      { id: '4', name: 'Camera 4', status: 'online', location: 'Storage' }
    ];
  }

  async getAlerts(): Promise<MockAlert[]> {
    return [
      {
        id: '1',
        type: 'security',
        message: 'Suspicious activity detected',
        severity: 'high',
        timestamp: new Date()
      }
    ];
  }

  async getSystemStatus(): Promise<MockSystemStatus> {
    return {
      status: 'healthy',
      uptime: 3600,
      activeCameras: 3
    };
  }

  // Additional methods needed by hooks
  async getHealthCheck() {
    return { status: 'healthy', timestamp: new Date() };
  }

  async getMockSystemStatus() {
    return this.getSystemStatus();
  }

  async getMockCameras() {
    return { cameras: await this.getCameras() };
  }

  async getMockActiveAlerts() {
    return { alerts: await this.getAlerts() };
  }

  async activateCamera(cameraId: string) {
    console.log(`Activating camera ${cameraId}`);
  }

  async deactivateCamera(cameraId: string) {
    console.log(`Deactivating camera ${cameraId}`);
  }

  async startMockSystem() {
    console.log('Starting mock system');
  }
}

export const simpleApiService = new SimpleApiService();
export default simpleApiService;