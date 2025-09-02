import React from 'react';
import { Box, Chip, Tooltip } from '@mui/material';
import { 
  CloudDone as LiveIcon,
  DeveloperMode as MockIcon,
  AutoMode as AutoIcon
} from '@mui/icons-material';
import { getRuntimeMode } from '../../config/runtime';

interface RuntimeModeIndicatorProps {
  size?: 'small' | 'medium' | 'large';
  showDashboardType?: boolean;
  variant?: 'chip' | 'badge' | 'full';
}

const RuntimeModeIndicator: React.FC<RuntimeModeIndicatorProps> = ({
  size = 'small',
  showDashboardType = false,
  variant = 'badge'
}) => {
  const runtimeMode = getRuntimeMode();
  const dashboardType = process.env.REACT_APP_DASHBOARD_TYPE || 'operator';

  const getModeConfig = (mode: string) => {
    switch (mode) {
      case 'live':
        return {
          color: '#4caf50',
          label: 'Live',
          icon: <LiveIcon />,
          description: 'Connected to live production system'
        };
      case 'mock':
        return {
          color: '#ff9800',
          label: 'Mock',
          icon: <MockIcon />,
          description: 'Using mock data for development/testing'
        };
      case 'auto':
      default:
        return {
          color: '#2196f3',
          label: 'Auto',
          icon: <AutoIcon />,
          description: 'Automatically detecting best connection mode'
        };
    }
  };

  const getDashboardConfig = (type: string) => {
    switch (type) {
      case 'operator':
        return { label: 'Operator', color: '#1976d2' };
      case 'admin':
        return { label: 'Admin', color: '#7b1fa2' };
      case 'developer':
        return { label: 'Developer', color: '#388e3c' };
      case 'management':
        return { label: 'Management', color: '#f57c00' };
      default:
        return { label: 'Unknown', color: '#616161' };
    }
  };

  const modeConfig = getModeConfig(runtimeMode);
  const dashboardConfig = getDashboardConfig(dashboardType);
  
  const tooltipText = `${modeConfig.description} | Dashboard: ${dashboardConfig.label}`;

  if (variant === 'badge') {
    return (
      <Tooltip title={tooltipText}>
        <Box
          sx={{
            position: 'fixed',
            top: 8,
            right: 8,
            zIndex: 9999,
            display: 'flex',
            gap: 0.5,
            flexDirection: 'column',
            alignItems: 'flex-end'
          }}
        >
          <Chip
            icon={modeConfig.icon}
            label={modeConfig.label}
            size="small"
            sx={{
              backgroundColor: `${modeConfig.color}20`,
              color: modeConfig.color,
              border: `1px solid ${modeConfig.color}40`,
              fontSize: '0.75rem',
              height: 24,
              '& .MuiChip-icon': {
                color: modeConfig.color,
                fontSize: 14
              }
            }}
          />
          {showDashboardType && (
            <Chip
              label={dashboardConfig.label}
              size="small"
              sx={{
                backgroundColor: `${dashboardConfig.color}20`,
                color: dashboardConfig.color,
                border: `1px solid ${dashboardConfig.color}40`,
                fontSize: '0.75rem',
                height: 20
              }}
            />
          )}
        </Box>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={tooltipText}>
      <Chip
        icon={modeConfig.icon}
        label={modeConfig.label}
        size={size === 'large' ? 'medium' : 'small'}
        sx={{
          backgroundColor: `${modeConfig.color}20`,
          color: modeConfig.color,
          border: `1px solid ${modeConfig.color}40`,
          '& .MuiChip-icon': {
            color: modeConfig.color
          }
        }}
      />
    </Tooltip>
  );
};

export default RuntimeModeIndicator;