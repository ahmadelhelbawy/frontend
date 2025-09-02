/**
 * YOLO11 WebSocket Service
 * Handles real-time updates for YOLO11 model status, performance metrics, and alerts
 */

import { WSMessage } from '../types/api';
import { AIModel } from '../types/operator';

export interface YOLO11ModelStatus {
  model_id: string;
  name: string;
  version: string;
  architecture: 'YOLO11';
  status: 'healthy' | 'warning' | 'error' | 'offline' | 'loading';
  device: 'cuda' | 'cpu' | 'mps';
  metrics: {
    inference_time_ms: number;
    throughput_fps: number;
    accuracy_percent: number;
    gpu_utilization_percent: number;
    memory_usage_mb: number;
    error_rate_percent: number;
    queue_depth: number;
  };
  last_updated: string;
}

export interface BehavioralModelStatus {
  model_id: string;
  name: string;
  version: string;
  architecture: 'CNN+Transformer+LSTM';
  status: 'healthy' | 'warning' | 'error' | 'offline' | 'loading';
  device: 'cuda' | 'cpu' | 'mps';
  metrics: {
    inference_time_ms: number;
    accuracy_percent: number;
    memory_usage_mb: number;
    predictions_per_second: number;
    pattern_confidence: number;
    cnn_feature_extraction_ms: number;
    transformer_attention_ms: number;
    lstm_sequence_processing_ms: number;
    behavioral_analysis_accuracy: number;
  };
  last_updated: string;
}

export interface YOLO11DetectionUpdate {
  detection_id: string;
  camera_id: string;
  timestamp: string;
  model_version: string;
  confidence: number;
  bounding_boxes: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    class_name: string;
    confidence: number;
  }>;
  processing_time_ms: number;
  gpu_utilization: number;
}

export type YOLO11WebSocketMessage = 
  | WSMessage<YOLO11ModelStatus>
  | WSMessage<BehavioralModelStatus>
  | WSMessage<YOLO11DetectionUpdate>
  | WSMessage<{ model_id: string; error: string; timestamp: string }>;

export class YOLO11WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private messageHandlers: Map<string, (data: any) => void> = new Map();
  private isConnecting = false;

  constructor(private wsUrl: string) {}

  // Connect to WebSocket
  connect(): Promise<void> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    if (this.isConnecting) {
      return Promise.reject(new Error('Already connecting'));
    }

    this.isConnecting = true;

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.wsUrl);

        this.ws.onopen = () => {
          console.log('YOLO11 WebSocket connected');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.reconnectDelay = 1000;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: YOLO11WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('YOLO11 WebSocket disconnected:', event.code, event.reason);
          this.isConnecting = false;
          
          if (event.code !== 1000) { // Not a normal closure
            this.handleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('YOLO11 WebSocket error:', error);
          this.isConnecting = false;
          reject(error);
        };

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  // Handle incoming messages
  private handleMessage(message: YOLO11WebSocketMessage) {
    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      handler(message.payload);
    }

    // Log model status updates
    if (message.type === 'yolo11_model_status' || message.type === 'behavioral_model_status') {
      console.log(`Model status update:`, message.payload);
    }

    // Log detection updates
    if (message.type === 'yolo11_detection') {
      console.log(`YOLO11 detection:`, message.payload);
    }

    // Handle errors
    if (message.type === 'model_error') {
      console.error(`Model error:`, message.payload);
    }
  }

  // Register message handler
  onMessage(type: string, handler: (data: any) => void) {
    this.messageHandlers.set(type, handler);
  }

  // Remove message handler
  removeHandler(type: string) {
    this.messageHandlers.delete(type);
  }

  // Handle reconnection
  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect().catch(() => {
        this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000); // Max 30 seconds
      });
    }, this.reconnectDelay);
  }

  // Send message
  send(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  // Disconnect
  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'Normal closure');
      this.ws = null;
    }
    this.messageHandlers.clear();
  }

  // Get connection status
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  // Request model status
  requestModelStatus(modelId?: string) {
    this.send({
      type: 'request_model_status',
      payload: { model_id: modelId }
    });
  }

  // Request GPU metrics
  requestGPUMetrics() {
    this.send({
      type: 'request_gpu_metrics',
      payload: {}
    });
  }

  // Convert to AIModel interface
  static convertToAIModel(yolo11Status: YOLO11ModelStatus): AIModel {
    return {
      id: yolo11Status.model_id,
      name: yolo11Status.name,
      version: yolo11Status.version,
      type: 'detection',
      architecture: yolo11Status.architecture,
      status: yolo11Status.status === 'healthy' ? 'healthy' : 
              yolo11Status.status === 'warning' ? 'warning' :
              yolo11Status.status === 'error' ? 'error' : 'offline',
      accuracy: yolo11Status.metrics.accuracy_percent,
      latency: yolo11Status.metrics.inference_time_ms,
      throughput: yolo11Status.metrics.throughput_fps,
      memoryUsage: yolo11Status.metrics.memory_usage_mb,
      gpuUtilization: yolo11Status.metrics.gpu_utilization_percent,
      device: yolo11Status.device,
      lastUpdate: yolo11Status.last_updated,
      errorCount: Math.round(yolo11Status.metrics.error_rate_percent * 10), // Approximation
      totalRequests: 0, // Not provided
      successRate: 100 - yolo11Status.metrics.error_rate_percent,
      performance: [], // Would be populated from history
      configuration: {},
      endpoints: [],
      isYOLO11: true
    };
  }

  // Convert behavioral model to AIModel interface  
  static convertBehavioralToAIModel(behavioralStatus: BehavioralModelStatus): AIModel {
    return {
      id: behavioralStatus.model_id,
      name: behavioralStatus.name,
      version: behavioralStatus.version,
      type: 'behavioral',
      architecture: behavioralStatus.architecture,
      status: behavioralStatus.status === 'healthy' ? 'healthy' : 
              behavioralStatus.status === 'warning' ? 'warning' :
              behavioralStatus.status === 'error' ? 'error' : 'offline',
      accuracy: behavioralStatus.metrics.accuracy_percent,
      latency: behavioralStatus.metrics.inference_time_ms,
      throughput: behavioralStatus.metrics.predictions_per_second,
      memoryUsage: behavioralStatus.metrics.memory_usage_mb,
      device: behavioralStatus.device,
      lastUpdate: behavioralStatus.last_updated,
      errorCount: 0, // Not provided
      totalRequests: 0, // Not provided
      successRate: behavioralStatus.metrics.pattern_confidence,
      performance: [], // Would be populated from history
      configuration: {},
      endpoints: [],
      isYOLO11: false
    };
  }
}

// Singleton instance
export const yolo11WebSocketService = new YOLO11WebSocketService(
  `${process.env.REACT_APP_WS_URL || 'ws://localhost:8000'}/ws/yolo11`
);
