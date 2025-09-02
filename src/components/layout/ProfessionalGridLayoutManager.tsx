import React, { useState, useCallback } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  useTheme,
  alpha
} from '@mui/material';
import {
  ViewModule as ViewModuleIcon,
  ViewQuilt as ViewQuiltIcon,
  ViewComfy as ViewComfyIcon,
  Fullscreen as FullscreenIcon,
  GridOn as GridOnIcon,
  GridOff as GridOffIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useLayout } from '../../contexts/LayoutContext';
import { GridLayout, PRESET_LAYOUTS } from '../../types/layout';
import DraggableCameraFeed from './DraggableCameraFeed';
import DropZoneGrid from './DropZoneGrid';

interface ProfessionalGridLayoutManagerProps {
  cameras: Array<{
    id: string;
    name: string;
    streamUrl: string;
    isActive: boolean;
    location: string;
  }>;
  onCameraSelect?: (cameraId: string) => void;
  onLayoutChange?: (layout: GridLayout) => void;
}

const ProfessionalGridLayoutManager: React.FC<ProfessionalGridLayoutManagerProps> = ({
  cameras,
  onCameraSelect,
  onLayoutChange
}) => {
  const theme = useTheme();
  const {
    currentLayout,
    availableLayouts,
    setLayout,
    createCustomLayout,
    updateLayout,
    deleteLayout,
    saveLayoutPreset,
    preferences
  } = useLayout();

  const [showGridLines, setShowGridLines] = useState(preferences?.preferences.showGridLines || false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [newLayoutName, setNewLayoutName] = useState('');
  const [customLayoutDialogOpen, setCustomLayoutDialogOpen] = useState(false);
  const [customRows, setCustomRows] = useState(2);
  const [customColumns, setCustomColumns] = useState(2);

  const handleLayoutChange = useCallback(async (layoutId: string) => {
    await setLayout(layoutId);
    const layout = availableLayouts.find(l => l.id === layoutId);
    if (layout && onLayoutChange) {
      onLayoutChange(layout);
    }
  }, [setLayout, availableLayouts, onLayoutChange]);

  const handleSaveCurrentLayout = useCallback(async () => {
    if (currentLayout && newLayoutName.trim()) {
      await saveLayoutPreset(newLayoutName.trim(), currentLayout);
      setNewLayoutName('');
      setSaveDialogOpen(false);
    }
  }, [currentLayout, newLayoutName, saveLayoutPreset]);

  const handleCreateCustomLayout = useCallback(async () => {
    const layoutId = await createCustomLayout({
      name: `Custom ${customRows}x${customColumns}`,
      rows: customRows,
      columns: customColumns,
      cellAspectRatio: 16/9,
      gaps: { horizontal: 8, vertical: 8 }
    });
    await setLayout(layoutId);
    setCustomLayoutDialogOpen(false);
  }, [createCustomLayout, setLayout, customRows, customColumns]);

  const handleDeleteLayout = useCallback(async (layoutId: string) => {
    if (window.confirm('Are you sure you want to delete this layout?')) {
      await deleteLayout(layoutId);
    }
  }, [deleteLayout]);

  const getLayoutIcon = (layoutId: string) => {
    switch (layoutId) {
      case '2x2': return <ViewModuleIcon />;
      case '3x3': return <ViewQuiltIcon />;
      case '4x4': return <ViewComfyIcon />;
      case 'single': return <FullscreenIcon />;
      default: return <GridOnIcon />;
    }
  };

  const getAssignedCameras = () => {
    if (!currentLayout) return [];
    return currentLayout.cameraAssignments.map(assignment => {
      const camera = cameras.find(c => c.id === assignment.cameraId);
      return camera ? { ...camera, position: assignment.position } : null;
    }).filter((camera): camera is NonNullable<typeof camera> => camera !== null);
  };

  const getUnassignedCameras = () => {
    if (!currentLayout) return cameras;
    const assignedIds = new Set(currentLayout.cameraAssignments.map(a => a.cameraId));
    return cameras.filter(camera => !assignedIds.has(camera.id));
  };

  if (!currentLayout) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Typography variant="h6" color="text.secondary">
          Loading layout manager...
        </Typography>
      </Box>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Layout Controls */}
        <Paper 
          elevation={1} 
          sx={{ 
            p: 2, 
            mb: 2, 
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(10px)'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ color: theme.palette.text.primary }}>
              Professional Layout Manager
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={`${currentLayout.rows}×${currentLayout.columns}`}
                size="small"
                color="primary"
                variant="outlined"
              />
              <Chip
                label={`${getAssignedCameras().length}/${cameras.length} cameras`}
                size="small"
                color="secondary"
                variant="outlined"
              />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            {/* Layout Selection */}
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Layout</InputLabel>
              <Select
                value={currentLayout.id}
                label="Layout"
                onChange={(e) => handleLayoutChange(e.target.value)}
              >
                {Object.entries(PRESET_LAYOUTS).map(([id, preset]) => (
                  <MenuItem key={id} value={id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getLayoutIcon(id)}
                      {preset.name}
                    </Box>
                  </MenuItem>
                ))}
                {availableLayouts.filter(l => l.isCustom).map((layout) => (
                  <MenuItem key={layout.id} value={layout.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                      <GridOnIcon />
                      {layout.name}
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteLayout(layout.id);
                        }}
                        sx={{ ml: 'auto' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Layout Controls */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title="Toggle Grid Lines">
                <IconButton
                  onClick={() => setShowGridLines(!showGridLines)}
                  color={showGridLines ? 'primary' : 'default'}
                >
                  {showGridLines ? <GridOnIcon /> : <GridOffIcon />}
                </IconButton>
              </Tooltip>

              <Tooltip title="Save Current Layout">
                <IconButton onClick={() => setSaveDialogOpen(true)}>
                  <SaveIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Create Custom Layout">
                <IconButton onClick={() => setCustomLayoutDialogOpen(true)}>
                  <AddIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Layout Settings">
                <IconButton>
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Paper>

        {/* Main Layout Area */}
        <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
          {/* Camera Grid */}
          <Box sx={{ flexGrow: 1 }}>
            <DropZoneGrid
              layout={currentLayout}
              cameras={getAssignedCameras()}
              showGridLines={showGridLines}
              onCameraSelect={onCameraSelect}
            />
          </Box>

          {/* Unassigned Cameras Panel */}
          {getUnassignedCameras().length > 0 && (
            <Paper 
              elevation={1} 
              sx={{ 
                width: 280, 
                p: 2,
                backgroundColor: alpha(theme.palette.background.paper, 0.9)
              }}
            >
              <Typography variant="subtitle1" sx={{ mb: 2, color: theme.palette.text.primary }}>
                Available Cameras
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {getUnassignedCameras().map((camera) => (
                  <DraggableCameraFeed
                    key={camera.id}
                    camera={camera}
                    isUnassigned
                    onSelect={() => onCameraSelect?.(camera.id)}
                  />
                ))}
              </Box>
            </Paper>
          )}
        </Box>

        {/* Save Layout Dialog */}
        <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
          <DialogTitle>Save Layout Preset</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Layout Name"
              fullWidth
              variant="outlined"
              value={newLayoutName}
              onChange={(e) => setNewLayoutName(e.target.value)}
              placeholder="Enter layout name..."
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSaveCurrentLayout}
              variant="contained"
              disabled={!newLayoutName.trim()}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* Custom Layout Dialog */}
        <Dialog open={customLayoutDialogOpen} onClose={() => setCustomLayoutDialogOpen(false)}>
          <DialogTitle>Create Custom Layout</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <TextField
                label="Rows"
                type="number"
                value={customRows}
                onChange={(e) => setCustomRows(Math.max(1, Math.min(8, parseInt(e.target.value) || 1)))}
                inputProps={{ min: 1, max: 8 }}
              />
              <TextField
                label="Columns"
                type="number"
                value={customColumns}
                onChange={(e) => setCustomColumns(Math.max(1, Math.min(8, parseInt(e.target.value) || 1)))}
                inputProps={{ min: 1, max: 8 }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              This will create a {customRows}×{customColumns} grid layout with {customRows * customColumns} camera positions.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCustomLayoutDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateCustomLayout} variant="contained">
              Create
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DndProvider>
  );
};

export default ProfessionalGridLayoutManager;