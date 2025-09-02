/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree and displays a fallback UI
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  Alert,
  AlertTitle,
  Divider
} from '@mui/material';
import {
  ErrorOutline,
  Refresh,
  BugReport
} from '@mui/icons-material';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Call the optional error callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public override render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            p: 3
          }}
        >
          <Paper 
            elevation={3}
            sx={{ 
              p: 4, 
              maxWidth: 600,
              textAlign: 'center',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca'
            }}
          >
            <Stack spacing={3} alignItems="center">
              <ErrorOutline 
                sx={{ 
                  fontSize: 64, 
                  color: '#dc2626' 
                }} 
              />
              
              <Box>
                <Typography variant="h5" fontWeight="bold" color="#dc2626" gutterBottom>
                  Something went wrong
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  An unexpected error occurred in the application. Please try refreshing the page or contact support if the issue persists.
                </Typography>
              </Box>

              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<Refresh />}
                  onClick={this.handleRetry}
                  color="primary"
                >
                  Try Again
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={this.handleReload}
                  color="secondary"
                >
                  Reload Page
                </Button>
              </Stack>

              {/* Development mode error details */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <>
                  <Divider sx={{ width: '100%' }} />
                  <Alert severity="error" sx={{ width: '100%', textAlign: 'left' }}>
                    <AlertTitle>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <BugReport />
                        <span>Development Error Details</span>
                      </Stack>
                    </AlertTitle>
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        Error Message:
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontFamily: 'monospace',
                          backgroundColor: '#fee2e2',
                          p: 1,
                          borderRadius: 1,
                          mt: 0.5,
                          mb: 1
                        }}
                      >
                        {this.state.error.message}
                      </Typography>
                      
                      {this.state.errorInfo && (
                        <>
                          <Typography variant="subtitle2" fontWeight="bold">
                            Component Stack:
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontFamily: 'monospace',
                              backgroundColor: '#fee2e2',
                              p: 1,
                              borderRadius: 1,
                              mt: 0.5,
                              fontSize: '0.75rem',
                              whiteSpace: 'pre-wrap'
                            }}
                          >
                            {this.state.errorInfo.componentStack}
                          </Typography>
                        </>
                      )}
                    </Box>
                  </Alert>
                </>
              )}
            </Stack>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
