/**
 * API Response Type Definitions
 * Fixes TypeScript errors related to response.data property usage
 */

// Standard API Response wrapper that all services should use
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
  requestId?: string;
}

// Paginated API Response
export interface PaginatedAPIResponse<T> extends Omit<APIResponse<any>, 'data'> {
  data: {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// HTTP Response wrapper that mimics Axios response structure
export interface HTTPResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config?: any;
}

// Authentication responses
export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    tenantId: string;
  };
  refreshToken?: string;
  expiresIn?: number;
}

// Error response structure
export interface APIError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

// WebSocket message structure
export interface WSMessage<T = any> {
  type: string;
  payload: T;
  timestamp: string;
  source: string;
  id?: string;
}

// Generic request options
export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  params?: Record<string, any>;
  timeout?: number;
  retries?: number;
}

// Service response types for common entities
export interface CameraResponse {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'error';
  stream_url?: string;
  location?: string;
  last_seen?: string;
}

export interface AlertResponse {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  camera_id: string;
  timestamp: string;
  status: 'active' | 'acknowledged' | 'resolved';
  metadata?: any;
}

export interface DetectionResponse {
  id: string;
  camera_id: string;
  timestamp: string;
  confidence: number;
  bounding_boxes: any[];
  alert_level: string;
  processing_time: number;
}

export interface SystemHealthResponse {
  overall_status: 'healthy' | 'warning' | 'critical';
  services: {
    name: string;
    status: 'up' | 'down' | 'degraded';
    last_check: string;
    response_time?: number;
  }[];
  resources: {
    cpu_usage: number;
    memory_usage: number;
    disk_usage: number;
    gpu_usage?: number;
  };
}

export interface AIModelResponse {
  id: string;
  name: string;
  type: 'detection' | 'behavioral' | 'classification' | 'tracking';
  status: 'loaded' | 'loading' | 'error' | 'unloaded';
  version: string;
  model_file: string;
  architecture: 'YOLO11' | 'CNN+Transformer+LSTM' | 'LSTM' | 'CNN' | 'Transformer';
  performance: {
    accuracy?: number;
    inference_time?: number;
    throughput?: number;
    gpu_utilization?: number;
  };
  last_updated: string;
  device: 'cpu' | 'cuda' | 'mps';
  memory_usage?: number;
  error_count?: number;
  success_rate?: number;
}

// Utility type to convert native Response to HTTPResponse
export type ResponseWrapper<T> = Promise<HTTPResponse<APIResponse<T>>>;

// Type guard to check if response has data property
export function hasDataProperty<T>(response: any): response is { data: T } {
  return response && typeof response === 'object' && 'data' in response;
}

// Helper function to normalize API responses
export function normalizeResponse<T>(response: any): APIResponse<T> {
  if (hasDataProperty<APIResponse<T>>(response)) {
    return response.data as APIResponse<T>;
  }
  
  // If it's a direct response, wrap it
  if (response && typeof response === 'object') {
    return {
      success: true,
      data: response as T,
      timestamp: new Date().toISOString(),
      requestId: Math.random().toString(36).substr(2, 9)
    };
  }
  
  return {
    success: false,
    error: 'Invalid response format',
    timestamp: new Date().toISOString(),
    requestId: Math.random().toString(36).substr(2, 9)
  };
}

// Response interceptor utility
export class ResponseInterceptor {
  static transform<T>(response: Response): Promise<HTTPResponse<APIResponse<T>>> {
    return response.json().then(data => ({
      data: data,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      config: {}
    }));
  }
  
  static async handleError(response: Response): Promise<never> {
    const errorData = await response.json().catch(() => ({}));
    
    const apiError: APIError = {
      code: response.status.toString(),
      message: errorData.message || response.statusText || 'Request failed',
      details: errorData,
      timestamp: new Date().toISOString()
    };
    
    throw apiError;
  }
}
