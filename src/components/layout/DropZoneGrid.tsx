import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  useTheme,
  alpha
} from '@mui/material';
import { useDrop } from 'react-dnd';
import { GridLayout, GridPosition, DragItem } from '../../types/layout';
import { useLayout } from '../../contexts/LayoutContext';
import DraggableCameraFeed from './DraggableCameraFeed';

interface Camera {
  id: string;
  name: string;
  streamUrl: string;
  isActive: boolean;
  location: string;
  position?: GridPosition;
}

interface DropZoneGridProps {
  layout: GridLayout;
  cameras: Camera[];
  showGridLines: boolean;
  onCameraSelect?: (cameraId: string) => void;
}

interface DropZoneCellProps {
  row: number;
  column: number;
  camera?: Camera;
  showGridLines: boolean;
  onCameraSelect?: (cameraId: string) => void;
  onCameraDrop: (cameraId: string, position: GridPosition) => void;
  onCameraRemove: (cameraId: string) => void;
}

const DropZoneCell: React.FC<DropZoneCellProps> = ({
  row,
  column,
  camera,
  showGridLines,
  onCameraSelect,
  onCameraDrop,
  onCameraRemove
}) => {
  const theme = useTheme();

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'camera',
    drop: (item: DragItem) => {
      const targetPosition: GridPosition = { row, column };
      onCameraDrop(item.cameraId, targetPosition);
      return { targetPosition, dropEffect: 'move' };
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const isActive = isOver && canDrop;

  return (
    <Box
      ref={drop}
      sx={{
        position: 'relative',
        height: '100%',
        minHeight: 120,
        border: showGridLines 
          ? `1px dashed ${alpha(theme.palette.divider, 0.5)}`
          : 'none',
        borderRadius: 1,
        backgroundColor: isActive
          ? alpha(theme.palette.primary.main, 0.1)
          : camera
          ? 'transparent'
          : alpha(theme.palette.background.default, 0.3),
        transition: theme.transitions.create(['background-color', 'border-color'], {
          duration: theme.transitions.duration.short,
        }),
        '&:hover': camera ? {} : {
          backgroundColor: alpha(theme.palette.primary.main, 0.05),
        }
      }}
    >
      {camera ? (
        <DraggableCameraFeed
          camera={camera}
          position={{ row, column }}
          onSelect={() => onCameraSelect?.(camera.id)}
          onRemove={() => onCameraRemove(camera.id)}
        />
      ) : (
        <Box
          sx={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 1,
            opacity: isActive ? 1 : 0.5,
            transition: theme.transitions.create('opacity'),
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.text.disabled,
              textAlign: 'center',
              fontSize: '0.7rem'
            }}
          >
            {isActive ? 'Drop camera here' : `${row + 1},${column + 1}`}
          </Typography>
          
          {isActive && (
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: alpha(theme.palette.primary.main, 0.2),
                border: `2px dashed ${theme.palette.primary.main}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'pulse 1s ease-in-out infinite'
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.primary.main,
                  fontWeight: 'bold',
                  fontSize: '0.6rem'
                }}
              >
                DROP
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* Grid position indicator */}
      {showGridLines && (
        <Box
          sx={{
            position: 'absolute',
            top: 2,
            left: 2,
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
            borderRadius: 0.5,
            px: 0.5,
            py: 0.25,
            zIndex: 1
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontSize: '0.6rem',
              color: theme.palette.text.secondary,
              fontFamily: 'monospace'
            }}
          >
            {row + 1},{column + 1}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

const DropZoneGrid: React.FC<DropZoneGridProps> = ({
  layout,
  cameras,
  showGridLines,
  onCameraSelect
}) => {
  const theme = useTheme();
  const { assignCamera, removeCamera, moveCamera } = useLayout();

  const handleCameraDrop = (cameraId: string, position: GridPosition) => {
    // Check if there's already a camera at this position
    const existingCamera = cameras.find(
      c => c.position?.row === position.row && c.position?.column === position.column
    );

    if (existingCamera && existingCamera.id !== cameraId) {
      // Swap cameras if there's already one at the target position
      const draggedCamera = cameras.find(c => c.id === cameraId);
      if (draggedCamera?.position) {
        assignCamera(existingCamera.id, draggedCamera.position);
      } else {
        removeCamera(existingCamera.id);
      }
    }

    assignCamera(cameraId, position);
  };

  const handleCameraRemove = (cameraId: string) => {
    removeCamera(cameraId);
  };

  const getCameraAtPosition = (row: number, column: number): Camera | undefined => {
    return cameras.find(
      camera => camera.position?.row === row && camera.position?.column === column
    );
  };

  const renderGrid = () => {
    const cells = [];
    
    for (let row = 0; row < layout.rows; row++) {
      for (let column = 0; column < layout.columns; column++) {
        const camera = getCameraAtPosition(row, column);
        
        cells.push(
          <Grid
            item
            xs={12 / layout.columns}
            key={`${row}-${column}`}
            sx={{
              height: `${100 / layout.rows}%`,
              minHeight: 120,
              p: layout.gaps.horizontal / 16 // Convert px to rem
            }}
          >
            <DropZoneCell
              row={row}
              column={column}
              camera={camera}
              showGridLines={showGridLines}
              onCameraSelect={onCameraSelect}
              onCameraDrop={handleCameraDrop}
              onCameraRemove={handleCameraRemove}
            />
          </Grid>
        );
      }
    }
    
    return cells;
  };

  return (
    <Paper
      elevation={1}
      sx={{
        height: '100%',
        backgroundColor: alpha(theme.palette.background.default, 0.5),
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Grid Header */}
      <Box
        sx={{
          p: 1,
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Typography variant="subtitle2" sx={{ color: theme.palette.text.primary }}>
          {layout.name} - {layout.rows}×{layout.columns} Grid
        </Typography>
        
        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
          {cameras.length}/{layout.rows * layout.columns} positions filled
        </Typography>
      </Box>

      {/* Grid Container */}
      <Box
        sx={{
          height: 'calc(100% - 48px)', // Subtract header height
          p: layout.gaps.vertical / 16, // Convert px to rem
          backgroundColor: showGridLines 
            ? alpha(theme.palette.background.default, 0.1)
            : 'transparent'
        }}
      >
        <Grid
          container
          sx={{
            height: '100%',
            margin: 0,
            width: '100%',
            '& .MuiGrid-item': {
              paddingLeft: 0,
              paddingTop: 0
            }
          }}
          spacing={0}
        >
          {renderGrid()}
        </Grid>
      </Box>

      {/* Grid Overlay for Visual Feedback */}
      {showGridLines && (
        <Box
          sx={{
            position: 'absolute',
            top: 48, // Header height
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            background: `
              repeating-linear-gradient(
                0deg,
                transparent,
                transparent ${100 / layout.rows - 1}%,
                ${alpha(theme.palette.divider, 0.3)} ${100 / layout.rows - 1}%,
                ${alpha(theme.palette.divider, 0.3)} ${100 / layout.rows}%
              ),
              repeating-linear-gradient(
                90deg,
                transparent,
                transparent ${100 / layout.columns - 1}%,
                ${alpha(theme.palette.divider, 0.3)} ${100 / layout.columns - 1}%,
                ${alpha(theme.palette.divider, 0.3)} ${100 / layout.columns}%
              )
            `
          }}
        />
      )}
    </Paper>
  );
};

export default DropZoneGrid;