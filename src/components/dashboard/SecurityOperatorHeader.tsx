import React from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Badge,
  useTheme,
  alpha,
  Avatar
} from '@mui/material';
import {
  Security as SecurityIcon,
  Circle as StatusIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Fullscreen as FullscreenIcon,
  ExitToApp as ExitIcon
} from '@mui/icons-material';

interface SecurityOperatorHeaderProps {
  operatorId: string;
  shift: 'day' | 'night' | 'swing';
  systemStatus: any;
  connected: boolean;
}

const SecurityOperatorHeader: React.FC<SecurityOperatorHeaderProps> = ({
  operatorId,
  shift,
  systemStatus,
  connected
}) => {
  const theme = useTheme();

  const getShiftColor = (shift: string) => {
    switch (shift) {
      case 'day': return theme.palette.info.main;
      case 'night': return theme.palette.secondary.main;
      case 'swing': return theme.palette.warning.main;
      default: return theme.palette.primary.main;
    }
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <Box
      sx={{
        height: 64,
        backgroundColor: alpha(theme.palette.background.paper, 0.98),
        borderBottom: `2px solid ${theme.palette.divider}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 3,
        backdropFilter: 'blur(10px)'
      }}
    >
      {/* Left Section - System Identity */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <SecurityIcon 
          sx={{ 
            fontSize: 32, 
            color: theme.palette.primary.main,
            filter: 'drop-shadow(0 0 4px rgba(0, 168, 255, 0.3))'
          }} 
        />
        <Box>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700,
              color: theme.palette.text.primary,
              letterSpacing: '0.5px'
            }}
          >
            SECURITY COMMAND CENTER
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: theme.palette.text.secondary,
              fontFamily: 'monospace',
              letterSpacing: '1px'
            }}
          >
            AI SURVEILLANCE SYSTEM v2.1
          </Typography>
        </Box>
      </Box>      {/*
 Center Section - System Status */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        {/* Connection Status */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <StatusIcon 
            sx={{ 
              fontSize: 12, 
              color: connected ? theme.palette.success.main : theme.palette.error.main,
              filter: connected 
                ? 'drop-shadow(0 0 4px rgba(76, 175, 80, 0.5))' 
                : 'drop-shadow(0 0 4px rgba(244, 67, 54, 0.5))'
            }} 
          />
          <Typography 
            variant="caption" 
            sx={{ 
              color: connected ? theme.palette.success.main : theme.palette.error.main,
              fontWeight: 600,
              fontFamily: 'monospace'
            }}
          >
            {connected ? 'SYSTEM ONLINE' : 'SYSTEM OFFLINE'}
          </Typography>
        </Box>

        {/* System Performance */}
        {systemStatus && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              label={`CPU: ${systemStatus.cpuUsage?.toFixed(1)}%`}
              size="small"
              sx={{
                backgroundColor: alpha(theme.palette.info.main, 0.2),
                color: theme.palette.info.main,
                fontFamily: 'monospace',
                fontSize: '0.7rem'
              }}
            />
            <Chip
              label={`RAM: ${systemStatus.memoryUsage?.toFixed(1)}%`}
              size="small"
              sx={{
                backgroundColor: alpha(theme.palette.warning.main, 0.2),
                color: theme.palette.warning.main,
                fontFamily: 'monospace',
                fontSize: '0.7rem'
              }}
            />
            <Chip
              label={`STREAMS: ${systemStatus.activeStreams || 0}`}
              size="small"
              sx={{
                backgroundColor: alpha(theme.palette.success.main, 0.2),
                color: theme.palette.success.main,
                fontFamily: 'monospace',
                fontSize: '0.7rem'
              }}
            />
          </Box>
        )}

        {/* Current Time */}
        <Typography 
          variant="h6" 
          sx={{ 
            fontFamily: 'monospace',
            color: theme.palette.primary.main,
            fontWeight: 700,
            letterSpacing: '2px',
            textShadow: `0 0 8px ${alpha(theme.palette.primary.main, 0.5)}`
          }}
        >
          {getCurrentTime()}
        </Typography>
      </Box>

      {/* Right Section - Operator Controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Shift Indicator */}
        <Chip
          label={`${shift.toUpperCase()} SHIFT`}
          sx={{
            backgroundColor: alpha(getShiftColor(shift), 0.2),
            color: getShiftColor(shift),
            fontWeight: 700,
            letterSpacing: '1px',
            border: `1px solid ${getShiftColor(shift)}`
          }}
        />

        {/* Operator Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar 
            sx={{ 
              width: 32, 
              height: 32, 
              backgroundColor: theme.palette.primary.main,
              fontSize: '0.9rem',
              fontWeight: 700
            }}
          >
            {operatorId.charAt(0).toUpperCase()}
          </Avatar>
          <Typography 
            variant="caption" 
            sx={{ 
              color: theme.palette.text.secondary,
              fontFamily: 'monospace',
              letterSpacing: '0.5px'
            }}
          >
            OP-{operatorId}
          </Typography>
        </Box>

        {/* Control Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton size="small" sx={{ color: theme.palette.text.secondary }}>
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          
          <IconButton size="small" sx={{ color: theme.palette.text.secondary }}>
            <FullscreenIcon />
          </IconButton>
          
          <IconButton size="small" sx={{ color: theme.palette.text.secondary }}>
            <SettingsIcon />
          </IconButton>
          
          <IconButton size="small" sx={{ color: theme.palette.error.main }}>
            <ExitIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default SecurityOperatorHeader;