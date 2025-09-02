/**
 * Advanced Surveillance Dashboard - Main Entry Point
 * Wraps the MainOperatorDashboard with proper context providers and routing
 * This recreates the exact dashboard from the screenshot with live video feeds
 */

import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Alert, CircularProgress, Typography } from '@mui/material';
import { OperatorProvider } from '../contexts/OperatorContext';
import { LiveDashboardProvider } from '../contexts/LiveDashboardContext';
import MainOperatorDashboard from './operator/MainOperatorDashboard';

// Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Dashboard Error Boundary caught an error:', error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100vh',
          bgcolor: '#0f172a',
          color: 'white',
          p: 3
        }}>
          <Alert severity="error" sx={{ mb: 3, maxWidth: 600 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              🚨 React Component Error
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {this.state.error?.message || 'A component error occurred'}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
              {this.state.error?.stack}
            </Typography>
          </Alert>
        </Box>
      );
    }

    return this.props.children;
  }
}

// Connection status component
const ConnectionStatus: React.FC = () => {
  const [backendStatus, setBackendStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const checkBackendConnection = async () => {
      try {
        const response = await fetch('http://localhost:8001/health');
        if (response.ok) {
          setBackendStatus('connected');
          setRetryCount(0);
        } else {
          throw new Error('Backend not responding');
        }
      } catch (error) {
        console.error('Backend connection failed:', error);
        setBackendStatus('error');
        
        // Auto-retry connection
        if (retryCount < 5) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
            checkBackendConnection();
          }, 2000);
        }
      }
    };

    checkBackendConnection();
    
    // Check connection every 30 seconds
    const interval = setInterval(checkBackendConnection, 30000);
    return () => clearInterval(interval);
  }, [retryCount]);

  if (backendStatus === 'connecting') {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        bgcolor: '#0f172a',
        color: 'white'
      }}>
        <CircularProgress sx={{ mb: 2, color: '#3b82f6' }} />
        <Typography variant="h6" sx={{ mb: 1 }}>
          🛡️ AI Shoplifting Detection System
        </Typography>
        <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
          Connecting to backend... (Attempt {retryCount + 1})
        </Typography>
      </Box>
    );
  }

  if (backendStatus === 'error') {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        bgcolor: '#0f172a',
        color: 'white',
        p: 3
      }}>
        <Alert severity="error" sx={{ mb: 3, maxWidth: 600 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            ⚠️ Backend Connection Failed
          </Typography>
          <Typography variant="body2">
            Cannot connect to the AI detection backend. Please ensure the backend is running:
          </Typography>
          <Box sx={{ 
            mt: 2, 
            p: 2, 
            bgcolor: '#1e293b', 
            borderRadius: 1, 
            fontFamily: 'monospace',
            fontSize: '0.875rem'
          }}>
            cd ai-shoplifting-detection/backend<br/>
            python main_advanced.py
          </Box>
        </Alert>
        <Typography variant="body2" sx={{ color: '#cbd5e1', textAlign: 'center' }}>
          The system will automatically retry the connection.<br/>
          Retried {retryCount} times. Backend should be running on port 8001.
        </Typography>
      </Box>
    );
  }

  return null; // Connected - render main dashboard
};

const AdvancedSurveillanceDashboard: React.FC = () => {
  const [backendConnected, setBackendConnected] = useState(false);
  const [contextError, setContextError] = useState<string | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch('http://localhost:8001/health');
        setBackendConnected(response.ok);
      } catch {
        setBackendConnected(false);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 10000);
    return () => clearInterval(interval);
  }, []);

  // Show connection status if not connected
  if (!backendConnected) {
    return <ConnectionStatus />;
  }

  // Wrap context providers with error boundary
  try {
    return (
      <ErrorBoundary>
        <OperatorProvider>
          <LiveDashboardProvider>
            <Box sx={{ 
              height: '100vh', 
              overflow: 'hidden',
              bgcolor: '#0f172a'
            }}>
              <Routes>
                {/* Main surveillance dashboard - matches screenshot */}
                <Route path="/" element={<MainOperatorDashboard />} />
                <Route path="/monitoring" element={<MainOperatorDashboard />} />
                <Route path="/shoplifting-detection" element={<MainOperatorDashboard />} />
                <Route path="/analytics" element={<MainOperatorDashboard />} />
                <Route path="/operations" element={<MainOperatorDashboard />} />
                
                {/* Redirect all other routes to main dashboard */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Box>
          </LiveDashboardProvider>
        </OperatorProvider>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('Dashboard initialization error:', error);
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        bgcolor: '#0f172a',
        color: 'white',
        p: 3
      }}>
        <Alert severity="error" sx={{ mb: 3, maxWidth: 600 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            🚨 Dashboard Initialization Error
          </Typography>
          <Typography variant="body2">
            {error instanceof Error ? error.message : 'Unknown error occurred'}
          </Typography>
        </Alert>
      </Box>
    );
  }
};

export default AdvancedSurveillanceDashboard;