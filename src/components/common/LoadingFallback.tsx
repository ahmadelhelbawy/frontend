/**
 * LoadingFallback - Displays loading state for initial app load
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Stack,
  LinearProgress,
  Fade,
  Button,
  Alert
} from '@mui/material';
import {
  Security as SecurityIcon,
  WifiOff as OfflineIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

interface LoadingFallbackProps {
  timeout?: number; // timeout in ms after which to show error options
  onTimeout?: () => void;
  message?: string;
}

const LoadingFallback: React.FC<LoadingFallbackProps> = ({
  timeout = 10000, // 10 seconds default
  onTimeout,
  message = "Loading AI Shoplifting Detection System..."
}) => {
  const [progress, setProgress] = useState(0);
  const [showTimeout, setShowTimeout] = useState(false);
  const [isOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          return 100;
        }
        const newProgress = prevProgress + (100 / (timeout / 1000));
        return Math.min(newProgress, 100);
      });
    }, 1000);

    const timeoutTimer = setTimeout(() => {
      setShowTimeout(true);
      if (onTimeout) {
        onTimeout();
      }
    }, timeout);

    return () => {
      clearInterval(timer);
      clearTimeout(timeoutTimer);
    };
  }, [timeout, onTimeout]);

  const handleContinueOffline = () => {
    // Reload the page to retry with fallback data
    window.location.reload();
  };

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: `
          radial-gradient(circle at 20% 20%, rgba(30, 58, 138, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(30, 64, 175, 0.2) 0%, transparent 50%),
          linear-gradient(135deg, #0f172a 0%, #0c1426 100%)
        `,
        color: 'white'
      }}
    >
      <Paper
        sx={{
          p: 6,
          backgroundColor: 'rgba(30, 41, 59, 0.9)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(71, 85, 105, 0.3)',
          borderRadius: 3,
          textAlign: 'center',
          minWidth: 400
        }}
      >
        <Stack spacing={4} alignItems="center">
          <SecurityIcon sx={{ fontSize: 64, color: '#3b82f6' }} />
          
          <Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              AI Shoplifting Detection
            </Typography>
            <Typography variant="body1" color="rgba(255, 255, 255, 0.7)">
              {message}
            </Typography>
          </Box>

          {!showTimeout && (
            <>
              <CircularProgress size={60} sx={{ color: '#3b82f6' }} />
              
              <Box sx={{ width: '100%', mt: 2 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={progress}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#3b82f6',
                      borderRadius: 4
                    }
                  }}
                />
                <Typography variant="body2" color="rgba(255, 255, 255, 0.5)" sx={{ mt: 1 }}>
                  {Math.round(progress)}% - Initializing system...
                </Typography>
              </Box>
            </>
          )}

          <Fade in={showTimeout}>
            <Box sx={{ width: '100%' }}>
              {isOffline && (
                <Alert 
                  severity="warning" 
                  sx={{ mb: 3 }}
                  icon={<OfflineIcon />}
                >
                  <Typography variant="body2">
                    You appear to be offline. The system will run with limited functionality.
                  </Typography>
                </Alert>
              )}

              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  The backend service is taking longer than expected to respond. 
                  You can continue with offline mode or retry the connection.
                </Typography>
              </Alert>

              <Stack direction="row" spacing={2} justifyContent="center">
                <Button
                  variant="contained"
                  onClick={handleContinueOffline}
                  sx={{ 
                    backgroundColor: '#3b82f6',
                    '&:hover': { backgroundColor: '#2563eb' }
                  }}
                >
                  Continue Offline
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={handleRetry}
                  sx={{ 
                    borderColor: '#3b82f6',
                    color: '#3b82f6',
                    '&:hover': { 
                      borderColor: '#2563eb',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)'
                    }
                  }}
                >
                  Retry Connection
                </Button>
              </Stack>

              <Typography variant="body2" color="rgba(255, 255, 255, 0.4)" sx={{ mt: 2 }}>
                System Status: Frontend Active • Backend Connecting...
              </Typography>
            </Box>
          </Fade>
        </Stack>
      </Paper>
    </Box>
  );
};

export default LoadingFallback;
