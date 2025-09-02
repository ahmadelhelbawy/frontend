/**
 * Error State Components
 * Provides inline error displays and empty states for graceful error handling
 */

import React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  Alert,
  Card,
  CardContent,
  IconButton
} from '@mui/material';
import {
  ErrorOutline,
  Refresh,
  CloudOff,
  WifiOff,
  Warning,
  SearchOff,
  Inventory2,
  SignalWifiConnectedNoInternet4,
  DataUsage as DataUsageOff
} from '@mui/icons-material';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  variant?: 'inline' | 'card' | 'minimal';
  severity?: 'error' | 'warning' | 'info';
  icon?: React.ReactNode;
  showRetry?: boolean;
}

// Generic Error State Component
export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Error',
  message = 'Something went wrong',
  onRetry,
  retryLabel = 'Try Again',
  variant = 'inline',
  severity = 'error',
  icon,
  showRetry = true
}) => {
  const getIcon = () => {
    if (icon) return icon;
    switch (severity) {
      case 'warning':
        return <Warning sx={{ fontSize: 48, color: '#f59e0b' }} />;
      case 'info':
        return <ErrorOutline sx={{ fontSize: 48, color: '#3b82f6' }} />;
      default:
        return <ErrorOutline sx={{ fontSize: 48, color: '#ef4444' }} />;
    }
  };

  const getSeverityColor = () => {
    switch (severity) {
      case 'warning':
        return '#fef3c7';
      case 'info':
        return '#dbeafe';
      default:
        return '#fee2e2';
    }
  };

  if (variant === 'minimal') {
    return (
      <Stack direction="row" spacing={1} alignItems="center" sx={{ py: 2 }}>
        <ErrorOutline sx={{ fontSize: 20, color: 'error.main' }} />
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
        {showRetry && onRetry && (
          <IconButton size="small" onClick={onRetry}>
            <Refresh />
          </IconButton>
        )}
      </Stack>
    );
  }

  if (variant === 'card') {
    return (
      <Card sx={{ backgroundColor: getSeverityColor(), border: `1px solid ${getSeverityColor()}` }}>
        <CardContent>
          <Stack spacing={2} alignItems="center" textAlign="center">
            {getIcon()}
            <Box>
              <Typography variant="h6" fontWeight="bold" color="text.primary">
                {title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {message}
              </Typography>
            </Box>
            {showRetry && onRetry && (
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={onRetry}
                color={severity === 'error' ? 'error' : 'primary'}
              >
                {retryLabel}
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>
    );
  }

  // Default inline variant
  return (
    <Alert
      severity={severity}
      icon={getIcon()}
      action={
        showRetry && onRetry ? (
          <Button
            color="inherit"
            size="small"
            onClick={onRetry}
            startIcon={<Refresh />}
          >
            {retryLabel}
          </Button>
        ) : undefined
      }
    >
      <Typography variant="subtitle2" fontWeight="bold">
        {title}
      </Typography>
      {message}
    </Alert>
  );
};

// Network Connection Error
export const NetworkError: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <ErrorState
    title="Connection Error"
    message="Unable to connect to the server. Please check your internet connection and try again."
    onRetry={onRetry}
    icon={<WifiOff sx={{ fontSize: 48, color: '#ef4444' }} />}
    variant="card"
  />
);

// Service Unavailable Error
export const ServiceUnavailableError: React.FC<{ onRetry?: () => void; serviceName?: string }> = ({ 
  onRetry, 
  serviceName = 'service' 
}) => (
  <ErrorState
    title="Service Unavailable"
    message={`The ${serviceName} is temporarily unavailable. We're working to restore it as quickly as possible.`}
    onRetry={onRetry}
    icon={<CloudOff sx={{ fontSize: 48, color: '#f59e0b' }} />}
    severity="warning"
    variant="card"
  />
);

// Data Loading Error (for tables/charts)
export const DataLoadingError: React.FC<{ onRetry?: () => void; dataType?: string }> = ({ 
  onRetry, 
  dataType = 'data' 
}) => (
  <ErrorState
    title="Failed to Load Data"
    message={`Unable to load ${dataType}. This might be due to a temporary connection issue.`}
    onRetry={onRetry}
    icon={<DataUsageOff sx={{ fontSize: 48, color: '#ef4444' }} />}
    variant="inline"
  />
);

// Empty State (when no data is available)
export const EmptyState: React.FC<{
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}> = ({
  title = 'No Data Available',
  message = 'There is no data to display at the moment.',
  icon,
  action
}) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '200px',
      p: 4,
      textAlign: 'center'
    }}
  >
    {icon || <Inventory2 sx={{ fontSize: 64, color: '#9ca3af', mb: 2 }} />}
    <Typography variant="h6" color="text.secondary" gutterBottom>
      {title}
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: '400px' }}>
      {message}
    </Typography>
    {action && (
      <Button variant="outlined" onClick={action.onClick}>
        {action.label}
      </Button>
    )}
  </Box>
);

// Search No Results
export const NoSearchResults: React.FC<{
  searchTerm?: string;
  onClearSearch?: () => void;
}> = ({ searchTerm, onClearSearch }) => (
  <EmptyState
    title="No Results Found"
    message={
      searchTerm 
        ? `No results found for "${searchTerm}". Try adjusting your search terms.`
        : 'No results match your current filters.'
    }
    icon={<SearchOff sx={{ fontSize: 64, color: '#9ca3af', mb: 2 }} />}
    action={
      onClearSearch 
        ? { label: 'Clear Search', onClick: onClearSearch }
        : undefined
    }
  />
);

// Offline State
export const OfflineState: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <ErrorState
    title="You're Offline"
    message="You appear to be offline. Some features may not be available until your connection is restored."
    onRetry={onRetry}
    retryLabel="Check Connection"
    icon={<SignalWifiConnectedNoInternet4 sx={{ fontSize: 48, color: '#f59e0b' }} />}
    severity="warning"
    variant="card"
  />
);

// Permission Denied Error
export const PermissionDeniedError: React.FC<{ action?: string }> = ({ 
  action = 'perform this action' 
}) => (
  <ErrorState
    title="Permission Denied"
    message={`You don't have the necessary permissions to ${action}. Please contact your administrator.`}
    severity="warning"
    showRetry={false}
    variant="card"
  />
);

// Component-specific error wrappers
export const TableError: React.FC<{ error: string; onRetry?: () => void }> = ({ 
  error, 
  onRetry 
}) => (
  <Box sx={{ p: 3 }}>
    <DataLoadingError onRetry={onRetry} />
  </Box>
);

export const ChartError: React.FC<{ error: string; onRetry?: () => void }> = ({ 
  error, 
  onRetry 
}) => (
  <Box 
    sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      minHeight: '200px'
    }}
  >
    <ErrorState
      title="Chart Error"
      message="Failed to load chart data"
      onRetry={onRetry}
      variant="minimal"
    />
  </Box>
);

export const StatsCardError: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <ErrorState
        message="Failed to load"
        onRetry={onRetry}
        variant="minimal"
        showRetry={false}
      />
    </CardContent>
  </Card>
);
