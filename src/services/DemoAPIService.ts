/**
 * Demo API Service - Provides demo data for development
 */

class DemoAPIService {
  private static instance: DemoAPIService;

  static getInstance(): DemoAPIService {
    if (!DemoAPIService.instance) {
      DemoAPIService.instance = new DemoAPIService();
    }
    return DemoAPIService.instance;
  }

  async getDemoData() {
    return {
      cameras: [
        { id: '1', name: 'Camera 1', status: 'online', location: 'Entrance' },
        { id: '2', name: 'Camera 2', status: 'online', location: 'Aisle 1' }
      ],
      detections: [],
      alerts: []
    };
  }

  async getSystemStatus() {
    return {
      status: 'healthy',
      uptime: 3600,
      activeCameras: 2
    };
  }

  async getAlerts(params?: any) {
    return {
      success: true,
      data: {
        items: [
          {
            id: '1',
            type: 'security',
            message: 'Demo alert',
            severity: 'medium',
            timestamp: new Date()
          }
        ]
      }
    };
  }

  async getCameras(storeId?: string) {
    return {
      success: true,
      data: [
        { id: '1', name: 'Demo Camera 1', status: 'online', location: 'Entrance' },
        { id: '2', name: 'Demo Camera 2', status: 'online', location: 'Aisle 1' }
      ]
    };
  }

  async getAIModels() {
    return {
      success: true,
      data: [
        { id: '1', name: 'Object Detection', status: 'running', accuracy: 95.2 }
      ]
    };
  }

  async getSystemHealth() {
    return {
      success: true,
      data: {
        status: 'healthy',
        uptime: 3600,
        components: {
          cameras: 'healthy',
          ai: 'healthy',
          database: 'healthy'
        }
      }
    };
  }

  async getQuickActions(userId: string) {
    return {
      success: true,
      data: [
        { id: '1', name: 'Emergency Alert', type: 'emergency' }
      ]
    };
  }

  async getEmergencyContacts() {
    return {
      success: true,
      data: [
        { id: '1', name: 'Security Team', phone: '555-0123', email: 'security@demo.com' }
      ]
    };
  }
}

export default DemoAPIService;