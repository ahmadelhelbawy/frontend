/**
 * WebSocket Service for real-time updates from the AI Shoplifting Detection backend
 * Handles real-time alerts, detections, camera status, and system updates
 */

const WS_BASE_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8000';

export type WebSocketMode = 'auto' | 'mock' | 'live';
export interface WebSocketConnectOptions {
  mode?: WebSocketMode;
  // Optional explicit path override if the caller needs a custom WS route
  path?: string;
}

const DEFAULT_WS_MODE: WebSocketMode = (process.env.REACT_APP_FORCE_MOCKS === 'true') ? 'mock' : 'auto';

export interface WebSocketMessage {
  type: string;
  data?: any;
  message?: string;
  timestamp: string;
  user_id?: string;
  store_id?: string;
}

export interface WebSocketEventHandlers {
  onAlert?: (alert: any) => void;
  onDetection?: (detection: any) => void;
  onCameraStatus?: (status: any) => void;
  onSystemStatus?: (status: any) => void;
  onConnectionEstablished?: (data: any) => void;
  onError?: (error: string) => void;
  onDisconnect?: () => void;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private handlers: WebSocketEventHandlers = {};
  private isConnecting = false;
  private token: string | null = null;
  private storeId: string | null = null;
  private mode: WebSocketMode = DEFAULT_WS_MODE;
  private lastPathUsed: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
  }

  setStoreId(storeId: string) {
    this.storeId = storeId;
  }

  connect(storeId?: string, handlers?: WebSocketEventHandlers, options?: WebSocketConnectOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
        resolve();
        return;
      }

      this.isConnecting = true;
      if (storeId) this.storeId = storeId;
      if (handlers) this.handlers = { ...this.handlers, ...handlers };
      if (options?.mode) this.mode = options.mode;
      // Env override to force mock
      if (process.env.REACT_APP_FORCE_MOCKS === 'true') this.mode = 'mock';

      // Determine base and primary path
      const base = (WS_BASE_URL || 'ws://localhost:8000').replace(/\/$/, '');
      const primaryPath = options?.path || (this.mode === 'mock' ? '/ws/mock-events' : '/ws/alerts');
      let attemptedFallback = false;

      const openWithPath = (path: string) => {
        try {
          const wsUrl = new URL(`${base}${path}`);
          if (this.token) {
            wsUrl.searchParams.append('token', this.token);
          }
          if (this.storeId) {
            wsUrl.searchParams.append('store_id', this.storeId);
          }

          const currentWs = new WebSocket(wsUrl.toString());
          this.ws = currentWs;

          currentWs.onopen = () => {
            console.log('WebSocket connected');
            this.isConnecting = false;
            this.reconnectAttempts = 0;
            this.lastPathUsed = path;
            resolve();
          };

          currentWs.onmessage = (event) => {
            try {
              const message: WebSocketMessage = JSON.parse(event.data);
              this.handleMessage(message);
            } catch (error) {
              console.error('Failed to parse WebSocket message:', error);
            }
          };

          currentWs.onclose = (event) => {
            if (this.ws !== currentWs) return; // ignore stale sockets
            console.log('WebSocket disconnected:', event.code, event.reason);
            this.isConnecting = false;
            this.ws = null;
            
            if (this.handlers.onDisconnect) {
              this.handlers.onDisconnect();
            }

            // Attempt to reconnect if not a normal closure
            if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
              this.scheduleReconnect();
            }
          };

          currentWs.onerror = (error) => {
            if (this.ws !== currentWs) return; // ignore stale sockets
            console.error('WebSocket error:', error);
            this.isConnecting = false;
            
            if (this.handlers.onError) {
              this.handlers.onError('WebSocket connection error');
            }

            // Auto mode: if primary was live alerts path, try mock events once
            const isLivePath = path.includes('/ws/alerts');
            if (this.mode === 'auto' && isLivePath && !attemptedFallback) {
              attemptedFallback = true;
              console.log('Falling back to mock WebSocket path /ws/mock-events');
              openWithPath('/ws/mock-events');
              return;
            }
            
            reject(new Error('WebSocket connection failed'));
          };

        } catch (error) {
          this.isConnecting = false;
          reject(error as any);
        }
      };

      openWithPath(primaryPath);
    });
  }

  private handleMessage(message: WebSocketMessage) {
    console.log('WebSocket message received:', message.type, message);

    switch (message.type) {
      case 'connection_established':
        if (this.handlers.onConnectionEstablished) {
          this.handlers.onConnectionEstablished(message.data);
        }
        break;

      case 'alert':
        if (this.handlers.onAlert) {
          this.handlers.onAlert(message.data);
        }
        break;

      case 'detection':
        if (this.handlers.onDetection) {
          this.handlers.onDetection(message.data);
        }
        break;

      case 'camera_status':
        if (this.handlers.onCameraStatus) {
          this.handlers.onCameraStatus(message.data);
        }
        break;

      case 'system_status':
        if (this.handlers.onSystemStatus) {
          this.handlers.onSystemStatus(message.data);
        }
        break;

      case 'alert_acknowledged_broadcast':
        // Handle alert acknowledgment from other users
        if (this.handlers.onAlert) {
          this.handlers.onAlert({
            type: 'acknowledged',
            alert_id: message.data?.alert_id,
            acknowledged_by: message.data?.acknowledged_by
          });
        }
        break;

      case 'ping_request':
        // Respond to ping with pong
        this.sendMessage({ type: 'ping' });
        break;

      case 'pong':
        // Handle pong response
        console.log('Received pong from server');
        break;

      case 'error':
        console.error('WebSocket server error:', message.message);
        if (this.handlers.onError) {
          this.handlers.onError(message.message || 'Unknown server error');
        }
        break;

      default:
        console.log('Unknown WebSocket message type:', message.type);
    }
  }

  private scheduleReconnect() {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Scheduling WebSocket reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);
    
    setTimeout(() => {
      if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
        // Prefer the last working path if known to avoid flapping between endpoints
        this.connect(undefined, undefined, { mode: this.mode, path: this.lastPathUsed || undefined });
      }
    }, delay);
  }

  sendMessage(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        ...message,
        timestamp: new Date().toISOString()
      }));
    } else {
      console.warn('WebSocket not connected, cannot send message:', message);
    }
  }

  // Specific message methods
  acknowledgeAlert(alertId: string) {
    this.sendMessage({
      type: 'acknowledge_alert',
      alert_id: alertId
    });
  }

  subscribeToStore(storeId: string) {
    this.storeId = storeId;
    this.sendMessage({
      type: 'subscribe_store',
      store_id: storeId
    });
  }

  getStatus() {
    this.sendMessage({
      type: 'get_status'
    });
  }

  ping() {
    this.sendMessage({
      type: 'ping'
    });
  }

  updateHandlers(handlers: Partial<WebSocketEventHandlers>) {
    this.handlers = { ...this.handlers, ...handlers };
  }

  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent reconnection
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  getConnectionState(): string {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
        return 'closing';
      case WebSocket.CLOSED:
        return 'closed';
      default:
        return 'unknown';
    }
  }
}

export const websocketService = new WebSocketService();
export default websocketService;