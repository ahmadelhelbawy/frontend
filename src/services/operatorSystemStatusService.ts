/**
 * Operator System Status Service
 */

export interface SystemStatusData {
  status: 'healthy' | 'warning' | 'error';
  uptime: number;
  activeCameras: number;
  totalCameras: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
}

export interface SystemHealthSummary {
  overall: 'healthy' | 'warning' | 'error';
  components: {
    cameras: 'healthy' | 'warning' | 'error';
    ai: 'healthy' | 'warning' | 'error';
    database: 'healthy' | 'warning' | 'error';
    network: 'healthy' | 'warning' | 'error';
  };
}

class OperatorSystemStatusService {
  async getSystemStatus(): Promise<SystemStatusData> {
    return {
      status: 'healthy',
      uptime: 3600,
      activeCameras: 4,
      totalCameras: 8,
      cpuUsage: 45,
      memoryUsage: 60,
      diskUsage: 30
    };
  }

  async getSystemHealthSummary(): Promise<SystemHealthSummary> {
    return {
      overall: 'healthy',
      components: {
        cameras: 'healthy',
        ai: 'healthy',
        database: 'healthy',
        network: 'healthy'
      }
    };
  }

  subscribeToStatusUpdates(callback: (status: SystemStatusData) => void): () => void {
    // Mock subscription
    const interval = setInterval(() => {
      this.getSystemStatus().then(callback);
    }, 5000);

    return () => clearInterval(interval);
  }

  async getQuickStatus() {
    return {
      status: 'healthy',
      activeCameras: 4,
      alerts: 0
    };
  }
}

export const operatorSystemStatusService = new OperatorSystemStatusService();
export default operatorSystemStatusService;