/**
 * Live Dashboard WebSocket Service
 * Real-time data streaming for operator dashboard with database integration
 */

import { EventEmitter } from 'events';
import { CameraStatus, Detection, Alert, PerformanceSummary, DashboardSummary } from './databaseApiService';

export interface LiveDataMessage {
  type: string;
  data?: any;
  timestamp: string;
}

export interface WebSocketConfig {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
}

class LiveDashboardWebSocketService extends EventEmitter {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private isConnecting = false;
  private isConnected = false;
  private subscriptions: Set<string> = new Set();

  constructor(config: WebSocketConfig) {
    super();
    this.config = {
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
      ...config
    };
  }

  // Connection Management
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnected || this.isConnecting) {
        resolve();
        return;
      }

      this.isConnecting = true;
      console.log('🔌 Connecting to live dashboard WebSocket:', this.config.url);

      try {
        this.ws = new WebSocket(this.config.url);

        this.ws.onopen = () => {
          console.log('✅ Live dashboard WebSocket connected');
          this.isConnected = true;
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.emit('connected');
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: LiveDataMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('❌ Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('🔌 Live dashboard WebSocket disconnected:', event.code, event.reason);
          this.isConnected = false;
          this.isConnecting = false;
          this.stopHeartbeat();
          this.emit('disconnected', { code: event.code, reason: event.reason });
          
          if (!event.wasClean && this.reconnectAttempts < (this.config.maxReconnectAttempts || 10)) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('❌ Live dashboard WebSocket error:', error);
          this.emit('error', error);
          this.isConnecting = false;
          reject(error);
        };

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.stopHeartbeat();

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }

    this.isConnected = false;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
  }

  // Message Handling
  private handleMessage(message: LiveDataMessage): void {
    console.log('📨 Received live data message:', message.type);

    switch (message.type) {
      case 'dashboard_summary':
        this.emit('dashboardSummary', message.data as DashboardSummary);
        break;

      case 'camera_status_update':
        this.emit('cameraStatusUpdate', message.data as CameraStatus[]);
        break;

      case 'recent_detections':
        this.emit('recentDetections', message.data as Detection[]);
        break;

      case 'active_alerts':
        this.emit('activeAlerts', message.data as Alert[]);
        break;

      case 'performance_update':
        this.emit('performanceUpdate', message.data as PerformanceSummary);
        break;

      case 'new_detection':
        this.emit('newDetection', message.data as Detection);
        break;

      case 'new_alert':
        this.emit('newAlert', message.data as Alert);
        break;

      case 'camera_online':
        this.emit('cameraOnline', message.data);
        break;

      case 'camera_offline':
        this.emit('cameraOffline', message.data);
        break;

      case 'system_health_update':
        this.emit('systemHealthUpdate', message.data);
        break;

      case 'pong':
        // Heartbeat response
        break;

      case 'subscription_confirmed':
        console.log('✅ Subscription confirmed:', message.data);
        break;

      case 'heartbeat':
        // Server heartbeat
        break;

      default:
        console.log('📨 Unknown message type:', message.type, message.data);
        this.emit('message', message);
    }
  }

  // Message Sending
  private sendMessage(message: any): void {
    if (this.ws && this.isConnected) {
      try {
        this.ws.send(JSON.stringify(message));
      } catch (error) {
        console.error('❌ Failed to send WebSocket message:', error);
      }
    } else {
      console.warn('⚠️ WebSocket not connected, cannot send message');
    }
  }

  // Public API Methods
  requestDashboardSummary(): void {
    this.sendMessage({ type: 'get_summary' });
  }

  requestRecentDetections(filters?: { camera_id?: string; limit?: number; hours?: number }): void {
    this.sendMessage({ 
      type: 'get_detections',
      filters: filters || {}
    });
  }

  requestActiveAlerts(): void {
    this.sendMessage({ type: 'get_alerts' });
  }

  subscribeToDataTypes(dataTypes: string[]): void {
    this.sendMessage({
      type: 'subscribe',
      data_types: dataTypes
    });
    dataTypes.forEach(type => this.subscriptions.add(type));
  }

  unsubscribeFromDataTypes(dataTypes: string[]): void {
    dataTypes.forEach(type => this.subscriptions.delete(type));
    // Note: Backend doesn't currently support unsubscribe, but we track it
  }

  // Heartbeat Management
  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      this.sendMessage({ type: 'ping' });
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // Reconnection Logic
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.config.reconnectInterval! * Math.pow(2, this.reconnectAttempts - 1), 30000);
    
    console.log(`🔄 Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);
    
    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(error => {
        console.error('❌ Reconnect failed:', error);
      });
    }, delay);
  }

  // Status Methods
  isWebSocketConnected(): boolean {
    return this.isConnected;
  }

  getConnectionStatus(): {
    connected: boolean;
    connecting: boolean;
    reconnectAttempts: number;
    subscriptions: string[];
  } {
    return {
      connected: this.isConnected,
      connecting: this.isConnecting,
      reconnectAttempts: this.reconnectAttempts,
      subscriptions: Array.from(this.subscriptions)
    };
  }
}

// Camera WebSocket Service for individual camera streams
class CameraWebSocketService extends EventEmitter {
  private ws: WebSocket | null = null;
  private cameraId: string;
  private isConnected = false;

  constructor(cameraId: string) {
    super();
    this.cameraId = cameraId;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Use the correct backend URL from environment variables
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8001';
      const protocol = baseUrl.startsWith('https') ? 'wss:' : 'ws:';
      const host = new URL(baseUrl).host;
      const wsUrl = `${protocol}//${host}/api/v1/cameras/live/ws/${this.cameraId}`;
      
      console.log(`🎥 Connecting to camera WebSocket: ${this.cameraId}`);
      
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log(`✅ Camera WebSocket connected: ${this.cameraId}`);
        this.isConnected = true;
        this.emit('connected');
        resolve();
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.emit('message', message);
          
          if (message.type === 'camera_status') {
            this.emit('cameraStatus', message.data);
          }
        } catch (error) {
          console.error('❌ Failed to parse camera WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log(`🔌 Camera WebSocket disconnected: ${this.cameraId}`);
        this.isConnected = false;
        this.emit('disconnected');
      };

      this.ws.onerror = (error) => {
        console.error(`❌ Camera WebSocket error: ${this.cameraId}`, error);
        this.emit('error', error);
        reject(error);
      };
    });
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }

  sendPing(): void {
    if (this.ws && this.isConnected) {
      this.ws.send(JSON.stringify({ type: 'ping' }));
    }
  }
}

// Service Factory
export function createLiveDashboardWebSocket(): LiveDashboardWebSocketService {
  // Use the correct backend URL from environment variables
  const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8001';
  const protocol = baseUrl.startsWith('https') ? 'wss:' : 'ws:';
  const host = new URL(baseUrl).host;
  const wsUrl = `${protocol}//${host}/api/v1/dashboard/ws/live`;
  
  return new LiveDashboardWebSocketService({ url: wsUrl });
}

export function createCameraWebSocket(cameraId: string): CameraWebSocketService {
  return new CameraWebSocketService(cameraId);
}

export { LiveDashboardWebSocketService, CameraWebSocketService };