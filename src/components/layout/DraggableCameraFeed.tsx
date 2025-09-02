import React from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Chip,
  useTheme,
  alpha
} from '@mui/material';
import {
  DragIndicator as DragIcon,
  Videocam as VideocamIcon,
  VideocamOff as VideocamOffIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useDrag } from 'react-dnd';
import { GridPosition } from '../../types/layout';

interface Camera {
  id: string;
  name: string;
  streamUrl: string;
  isActive: boolean;
  location: string;
}

interface DraggableCameraFeedProps {
  camera: Camera;
  position?: GridPosition;
  isUnassigned?: boolean;
  onSelect?: () => void;
  onRemove?: () => void;
  showControls?: boolean;
}

const DraggableCameraFeed: React.FC<DraggableCameraFeedProps> = ({
  camera,
  position,
  isUnassigned = false,
  onSelect,
  onRemove,
  showControls = true
}) => {
  const theme = useTheme();

  const [{ isDragging }, drag] = useDrag({
    type: 'camera',
    item: {
      type: 'camera',
      cameraId: camera.id,
      sourcePosition: position
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove?.();
  };

  return (
    <Paper
      ref={drag}
      elevation={isDragging ? 8 : 2}
      sx={{
        position: 'relative',
        height: isUnassigned ? 80 : '100%',
        minHeight: isUnassigned ? 80 : 120,
        backgroundColor: camera.isActive 
          ? alpha(theme.palette.background.paper, 0.9)
          : alpha(theme.palette.background.paper, 0.5),
        border: `2px solid ${camera.isActive ? theme.palette.primary.main : theme.palette.grey[600]}`,
        borderRadius: theme.shape.borderRadius,
        cursor: isDragging ? 'grabbing' : 'grab',
        opacity: isDragging ? 0.5 : 1,
        transition: theme.transitions.create(['opacity', 'transform', 'box-shadow'], {
          duration: theme.transitions.duration.short,
        }),
        transform: isDragging ? 'scale(1.05)' : 'scale(1)',
        '&:hover': {
          transform: isDragging ? 'scale(1.05)' : 'scale(1.02)',
          boxShadow: theme.shadows[4],
        },
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
      onClick={handleClick}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 1,
          backgroundColor: alpha(theme.palette.background.default, 0.8),
          borderBottom: `1px solid ${theme.palette.divider}`,
          minHeight: 40
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
          <DragIcon 
            sx={{ 
              color: theme.palette.text.secondary,
              fontSize: 16,
              cursor: 'grab'
            }} 
          />
          <Typography 
            variant="caption" 
            sx={{ 
              fontWeight: 'medium',
              color: theme.palette.text.primary,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {camera.name}
          </Typography>
        </Box>

        {showControls && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {camera.isActive ? (
              <VideocamIcon sx={{ color: theme.palette.success.main, fontSize: 16 }} />
            ) : (
              <VideocamOffIcon sx={{ color: theme.palette.error.main, fontSize: 16 }} />
            )}
            
            {!isUnassigned && onRemove && (
              <IconButton
                size="small"
                onClick={handleRemove}
                sx={{ 
                  p: 0.25,
                  color: theme.palette.text.secondary,
                  '&:hover': {
                    color: theme.palette.error.main,
                    backgroundColor: alpha(theme.palette.error.main, 0.1)
                  }
                }}
              >
                <CloseIcon sx={{ fontSize: 14 }} />
              </IconButton>
            )}
          </Box>
        )}
      </Box>

      {/* Content Area */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 1,
          backgroundColor: camera.isActive 
            ? alpha(theme.palette.background.default, 0.3)
            : alpha(theme.palette.background.default, 0.1),
          position: 'relative'
        }}
      >
        {/* Video Stream Placeholder */}
        <Box
          sx={{
            width: '100%',
            height: '100%',
            backgroundColor: alpha(theme.palette.common.black, 0.8),
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {camera.isActive ? (
            <>
              {/* Simulated video feed */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `linear-gradient(45deg, 
                    ${alpha(theme.palette.primary.main, 0.1)} 25%, 
                    transparent 25%, 
                    transparent 75%, 
                    ${alpha(theme.palette.primary.main, 0.1)} 75%
                  )`,
                  backgroundSize: '20px 20px',
                  animation: 'pulse 2s ease-in-out infinite alternate'
                }}
              />
              <Typography variant="caption" sx={{ color: theme.palette.common.white, zIndex: 1 }}>
                LIVE
              </Typography>
            </>
          ) : (
            <Typography variant="caption" sx={{ color: theme.palette.text.disabled }}>
              OFFLINE
            </Typography>
          )}
        </Box>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 0.5,
          backgroundColor: alpha(theme.palette.background.default, 0.6),
          borderTop: `1px solid ${theme.palette.divider}`,
          minHeight: 28
        }}
      >
        <Typography 
          variant="caption" 
          sx={{ 
            color: theme.palette.text.secondary,
            fontSize: '0.7rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1
          }}
        >
          {camera.location}
        </Typography>

        {position && (
          <Chip
            label={`${position.row + 1},${position.column + 1}`}
            size="small"
            sx={{
              height: 16,
              fontSize: '0.6rem',
              backgroundColor: alpha(theme.palette.primary.main, 0.2),
              color: theme.palette.primary.main,
              '& .MuiChip-label': {
                px: 0.5
              }
            }}
          />
        )}
      </Box>

      {/* Drag Overlay */}
      {isDragging && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: alpha(theme.palette.primary.main, 0.2),
            border: `2px dashed ${theme.palette.primary.main}`,
            borderRadius: theme.shape.borderRadius,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <Typography variant="body2" sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
            Dragging...
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default DraggableCameraFeed;