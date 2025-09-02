import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { getRuntimeMode } from '../config/runtime';

interface Alert {
  id: string;
  type: 'normal' | 'suspicious' | 'shoplifting';
  message: string;
  timestamp: string;
  cameraId: string;
  confidence: number;
  boundingBoxes?: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
}

interface SystemStatus {
  cpuUsage: number;
  memoryUsage: number;
  gpuUsage?: number;
  activeStreams: number;
  lastUpdate: string;
}

interface CognitiveAgentStatus {
  status: 'active' | 'idle' | 'processing' | 'error';
  processingSpeed: number;
  memoryUsage: number;
  confidenceLevel: number;
  activeDecisions: number;
  totalDecisionsToday: number;
  threatLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
}

interface AIDecision {
  id: string;
  timestamp: string;
  eventType: 'vision' | 'audio' | 'multimodal';
  threatLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  decision: string;
  reasoning: string;
  cameraId: string;
  storeId: string;
  actionTaken: string;
}

interface WebSocketContextType {
  socket: Socket | null;
  connected: boolean;
  alerts: Alert[];
  systemStatus: SystemStatus | null;
  cognitiveAgentStatus: CognitiveAgentStatus | null;
  recentDecisions: AIDecision[];
  subscribeToCamera: (cameraId: string) => void;
  unsubscribeFromCamera: (cameraId: string) => void;
  clearAlerts: () => void;
  requestCognitiveStatus: () => void;
  requestRecentDecisions: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [cognitiveAgentStatus, setCognitiveAgentStatus] = useState<CognitiveAgentStatus | null>(null);
  const [recentDecisions, setRecentDecisions] = useState<AIDecision[]>([]);
  const { token, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && token) {
      // Connect to WebSocket server
      const WS_BASE = (process.env.REACT_APP_WS_URL || 'ws://localhost:8000').replace(/\/$/, '');
      const mode = getRuntimeMode();
      const newSocket = io(WS_BASE, {
        auth: {
          token: token,
          mode,
        },
        transports: ['websocket']
      });

      newSocket.on('connect', () => {
        console.log('WebSocket connected');
        setConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('WebSocket disconnected');
        setConnected(false);
      });

      newSocket.on('alert', (alert: Alert) => {
        console.log('New alert received:', alert);
        setAlerts(prev => [alert, ...prev.slice(0, 99)]); // Keep last 100 alerts
      });

      newSocket.on('system_status', (status: SystemStatus) => {
        setSystemStatus(status);
      });

      // Cognitive Agent Events
      newSocket.on('cognitive_agent_status', (status: CognitiveAgentStatus) => {
        setCognitiveAgentStatus(status);
      });

      newSocket.on('ai_decision', (decision: AIDecision) => {
        setRecentDecisions(prev => [decision, ...prev.slice(0, 9)]);
      });

      newSocket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        setConnected(false);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
        setSocket(null);
        setConnected(false);
      };
    }
  }, [isAuthenticated, token]);

  const subscribeToCamera = (cameraId: string) => {
    if (socket && connected) {
      socket.emit('subscribe_camera', { cameraId });
    }
  };

  const unsubscribeFromCamera = (cameraId: string) => {
    if (socket && connected) {
      socket.emit('unsubscribe_camera', { cameraId });
    }
  };

  const clearAlerts = () => {
    setAlerts([]);
  };

  const requestCognitiveStatus = () => {
    if (socket && connected) {
      socket.emit('get_cognitive_agent_status');
    }
  };

  const requestRecentDecisions = () => {
    if (socket && connected) {
      socket.emit('get_recent_decisions');
    }
  };

  const value: WebSocketContextType = {
    socket,
    connected,
    alerts,
    systemStatus,
    cognitiveAgentStatus,
    recentDecisions,
    subscribeToCamera,
    unsubscribeFromCamera,
    clearAlerts,
    requestCognitiveStatus,
    requestRecentDecisions
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};