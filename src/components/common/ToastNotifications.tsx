/**
 * Toast Notification System
 * Provides toast notifications for API errors and system alerts
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  Snackbar,
  Alert,
  AlertTitle,
  IconButton,
  Stack,
  Box
} from '@mui/material';
import {
  Close,
  CheckCircle,
  Error,
  Warning,
  Info,
  Refresh
} from '@mui/icons-material';

export type ToastSeverity = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  severity: ToastSeverity;
  title?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  persistent?: boolean;
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void;
  showError: (message: string, options?: Partial<Toast>) => void;
  showSuccess: (message: string, options?: Partial<Toast>) => void;
  showWarning: (message: string, options?: Partial<Toast>) => void;
  showInfo: (message: string, options?: Partial<Toast>) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new (globalThis.Error)('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
  maxToasts?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ 
  children,
  maxToasts = 5
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const newToast: Toast = {
      id: generateId(),
      duration: 6000, // Default 6 seconds
      ...toast
    };

    setToasts(prevToasts => {
      const updatedToasts = [newToast, ...prevToasts];
      // Limit the number of toasts
      return updatedToasts.slice(0, maxToasts);
    });

    // Auto-remove toast if not persistent
    if (!newToast.persistent && newToast.duration) {
      setTimeout(() => {
        removeToast(newToast.id);
      }, newToast.duration);
    }
  }, [maxToasts]);

  const removeToast = useCallback((id: string) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  const showError = useCallback((message: string, options?: Partial<Toast>) => {
    showToast({
      message,
      severity: 'error',
      duration: 8000, // Errors stay longer
      ...options
    });
  }, [showToast]);

  const showSuccess = useCallback((message: string, options?: Partial<Toast>) => {
    showToast({
      message,
      severity: 'success',
      duration: 4000, // Success messages shorter
      ...options
    });
  }, [showToast]);

  const showWarning = useCallback((message: string, options?: Partial<Toast>) => {
    showToast({
      message,
      severity: 'warning',
      duration: 6000,
      ...options
    });
  }, [showToast]);

  const showInfo = useCallback((message: string, options?: Partial<Toast>) => {
    showToast({
      message,
      severity: 'info',
      duration: 5000,
      ...options
    });
  }, [showToast]);

  const contextValue: ToastContextType = {
    showToast,
    showError,
    showSuccess,
    showWarning,
    showInfo,
    removeToast,
    clearAll
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 1400,
        maxWidth: '400px'
      }}
    >
      <Stack spacing={1}>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={onClose} />
        ))}
      </Stack>
    </Box>
  );
};

interface ToastItemProps {
  toast: Toast;
  onClose: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
  const getIcon = (severity: ToastSeverity) => {
    switch (severity) {
      case 'success':
        return <CheckCircle />;
      case 'error':
        return <Error />;
      case 'warning':
        return <Warning />;
      case 'info':
        return <Info />;
      default:
        return undefined;
    }
  };

  return (
    <Snackbar
      open={true}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      sx={{ position: 'relative' }}
    >
      <Alert
        severity={toast.severity}
        icon={getIcon(toast.severity)}
        action={
          <Stack direction="row" spacing={1} alignItems="center">
            {toast.action && (
              <IconButton
                size="small"
                onClick={toast.action.onClick}
                sx={{ color: 'inherit' }}
              >
                <Refresh />
              </IconButton>
            )}
            <IconButton
              size="small"
              onClick={() => onClose(toast.id)}
              sx={{ color: 'inherit' }}
            >
              <Close />
            </IconButton>
          </Stack>
        }
        sx={{
          width: '100%',
          '& .MuiAlert-message': {
            width: '100%'
          }
        }}
      >
        {toast.title && <AlertTitle>{toast.title}</AlertTitle>}
        {toast.message}
      </Alert>
    </Snackbar>
  );
};

// Predefined error messages for common API failures
export const API_ERROR_MESSAGES = {
  NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection.',
  SERVER_ERROR: 'Internal server error occurred. Please try again later.',
  UNAUTHORIZED: 'Your session has expired. Please log in again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource could not be found.',
  TIMEOUT: 'Request timed out. Please try again.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  RATE_LIMIT: 'Too many requests. Please wait a moment before trying again.',
  SERVICE_UNAVAILABLE: 'This service is temporarily unavailable. Please try again later.'
};

// Helper function to get appropriate error message based on HTTP status or error type
export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') {
    return error;
  }

  if (error?.response?.status) {
    switch (error.response.status) {
      case 401:
        return API_ERROR_MESSAGES.UNAUTHORIZED;
      case 403:
        return API_ERROR_MESSAGES.FORBIDDEN;
      case 404:
        return API_ERROR_MESSAGES.NOT_FOUND;
      case 408:
        return API_ERROR_MESSAGES.TIMEOUT;
      case 422:
        return API_ERROR_MESSAGES.VALIDATION_ERROR;
      case 429:
        return API_ERROR_MESSAGES.RATE_LIMIT;
      case 500:
        return API_ERROR_MESSAGES.SERVER_ERROR;
      case 503:
        return API_ERROR_MESSAGES.SERVICE_UNAVAILABLE;
      default:
        return error.response.data?.message || API_ERROR_MESSAGES.SERVER_ERROR;
    }
  }

  if (error?.message) {
    if (error.message.includes('Network Error') || error.code === 'NETWORK_ERROR') {
      return API_ERROR_MESSAGES.NETWORK_ERROR;
    }
    if (error.message.includes('timeout') || error.code === 'ECONNABORTED') {
      return API_ERROR_MESSAGES.TIMEOUT;
    }
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
};
