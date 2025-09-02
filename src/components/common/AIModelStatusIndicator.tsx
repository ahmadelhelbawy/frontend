import React from 'react';
import { Box, Chip, Tooltip, CircularProgress } from '@mui/material';
import { 
  CheckCircle as ActiveIcon,
  Pause as StandbyIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useAIModelStatus } from '../../hooks/useAIModelStatus';
import { AiModelUiState } from '../../config/runtime';

interface AIModelStatusIndicatorProps {
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  variant?: 'chip' | 'icon' | 'full';
}

const AIModelStatusIndicator: React.FC<AIModelStatusIndicatorProps> = ({
  size = 'medium',
  showLabel = true,
  variant = 'chip'
}) => {
  const { aiModelStatus, loading, error, lastUpdate } = useAIModelStatus();

  const getStatusConfig = (status: AiModelUiState) => {
    switch (status) {
      case 'active':
        return {
          color: '#4caf50',
          label: 'AI Brain Active',
          icon: <ActiveIcon />,
          description: 'YOLO11 eye + CNN+Transformer+LSTM brain are processing and analyzing behavior'
        };
      case 'standby':
        return {
          color: '#ff9800',
          label: 'AI Standby',
          icon: <StandbyIcon />,
          description: 'AI models are loaded but not actively processing'
        };
      case 'error':
        return {
          color: '#f44336',
          label: 'AI Error',
          icon: <ErrorIcon />,
          description: 'AI models are experiencing issues'
        };
      default:
        return {
          color: '#9e9e9e',
          label: 'AI Unknown',
          icon: <StandbyIcon />,
          description: 'AI model status is unknown'
        };
    }
  };

  const config = getStatusConfig(aiModelStatus);
  const tooltipText = error 
    ? `Error: ${error}` 
    : `${config.description}${lastUpdate ? ` (Updated: ${lastUpdate.toLocaleTimeString()})` : ''}`;

  if (loading) {
    return (
      <Box display="flex" alignItems="center" gap={1}>
        <CircularProgress size={16} />
        {showLabel && <span>Loading AI Status...</span>}
      </Box>
    );
  }

  if (variant === 'icon') {
    return (
      <Tooltip title={tooltipText}>
        <Box 
          sx={{ 
            color: config.color,
            display: 'flex',
            alignItems: 'center',
            fontSize: size === 'small' ? 16 : size === 'large' ? 24 : 20
          }}
        >
          {config.icon}
        </Box>
      </Tooltip>
    );
  }

  if (variant === 'chip') {
    return (
      <Tooltip title={tooltipText}>
        <Chip
          icon={config.icon}
          label={showLabel ? config.label : ''}
          size={size === 'large' ? 'medium' : 'small'}
          sx={{
            backgroundColor: `${config.color}20`,
            color: config.color,
            border: `1px solid ${config.color}40`,
            '& .MuiChip-icon': {
              color: config.color
            }
          }}
        />
      </Tooltip>
    );
  }

  // Full variant
  return (
    <Tooltip title={tooltipText}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          padding: '4px 8px',
          borderRadius: 1,
          backgroundColor: `${config.color}10`,
          border: `1px solid ${config.color}30`
        }}
      >
        <Box sx={{ color: config.color, display: 'flex', alignItems: 'center' }}>
          {config.icon}
        </Box>
        {showLabel && (
          <Box sx={{ color: config.color, fontSize: '0.875rem', fontWeight: 500 }}>
            {config.label}
          </Box>
        )}
      </Box>
    </Tooltip>
  );
};

export default AIModelStatusIndicator;