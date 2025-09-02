import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Switch,
  FormControlLabel,
  Grid,
  useTheme,
  alpha,
  Divider
} from '@mui/material';
import {
  Monitor as MonitorIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useLayout } from '../../contexts/LayoutContext';
import { DisplayInfo, MultiDisplayConfig } from '../../types/layout';

interface MultiMonitorManagerProps {
  onDisplayConfigChange?: (config: MultiDisplayConfig | null) => void;
}

const MultiMonitorManager: React.FC<MultiMonitorManagerProps> = ({
  onDisplayConfigChange
}) => {
  const theme = useTheme();
  const { multiDisplayConfig, enableMultiMonitor, disableMultiMonitor } = useLayout();
  
  const [displays, setDisplays] = useState<DisplayInfo[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [selectedDisplays, setSelectedDisplays] = useState<string[]>([]);
  const [isElectronAvailable, setIsElectronAvailable] = useState(false);

  // Check if running in Electron environment
  useEffect(() => {
    const checkElectron = () => {
      const isElectron = window.electron !== undefined;
      setIsElectronAvailable(isElectron);
      
      if (isElectron) {
        detectDisplays();
      }
    };

    checkElectron();
  }, []);

  const detectDisplays = useCallback(async () => {
    if (!window.electron) {
      console.warn('Multi-monitor support requires Electron environment');
      return;
    }

    setIsDetecting(true);
    
    try {
      // Use Electron's screen API to get display information
      const electronDisplays = await window.electron.screen.getAllDisplays();
      
      const displayInfo: DisplayInfo[] = electronDisplays.map((display: any, index: number) => ({
        id: `display-${display.id || index}`,
        name: `Display ${index + 1}${display.label ? ` (${display.label})` : ''}`,
        width: display.bounds.width,
        height: display.bounds.height,
        scaleFactor: display.scaleFactor || 1,
        isPrimary: display.primary || index === 0,
        bounds: {
          x: display.bounds.x,
          y: display.bounds.y,
          width: display.bounds.width,
          height: display.bounds.height
        }
      }));

      setDisplays(displayInfo);
      
      // Auto-select primary display
      const primaryDisplay = displayInfo.find(d => d.isPrimary);
      if (primaryDisplay) {
        setSelectedDisplays([primaryDisplay.id]);
      }
      
    } catch (error) {
      console.error('Failed to detect displays:', error);
      // Fallback to mock displays for development
      const mockDisplays: DisplayInfo[] = [
        {
          id: 'display-0',
          name: 'Primary Display',
          width: 1920,
          height: 1080,
          scaleFactor: 1,
          isPrimary: true,
          bounds: { x: 0, y: 0, width: 1920, height: 1080 }
        },
        {
          id: 'display-1',
          name: 'Secondary Display',
          width: 1920,
          height: 1080,
          scaleFactor: 1,
          isPrimary: false,
          bounds: { x: 1920, y: 0, width: 1920, height: 1080 }
        }
      ];
      setDisplays(mockDisplays);
      if (mockDisplays[0]) setSelectedDisplays([mockDisplays[0].id]);
    } finally {
      setIsDetecting(false);
    }
  }, []);

  const handleEnableMultiMonitor = useCallback(async () => {
    if (selectedDisplays.length === 0) return;
    
    const selectedDisplayInfo = displays.filter(d => selectedDisplays.includes(d.id));
    await enableMultiMonitor(selectedDisplayInfo);
    
    onDisplayConfigChange?.(multiDisplayConfig);
    setConfigDialogOpen(false);
  }, [selectedDisplays, displays, enableMultiMonitor, multiDisplayConfig, onDisplayConfigChange]);

  const handleDisableMultiMonitor = useCallback(async () => {
    disableMultiMonitor();
    onDisplayConfigChange?.(null);
  }, [disableMultiMonitor, onDisplayConfigChange]);

  const handleDisplayToggle = (displayId: string) => {
    setSelectedDisplays(prev => 
      prev.includes(displayId)
        ? prev.filter(id => id !== displayId)
        : [...prev, displayId]
    );
  };

  const getDisplayStatusColor = (display: DisplayInfo) => {
    if (multiDisplayConfig?.displays.some(d => d.id === display.id)) {
      return theme.palette.success.main;
    }
    return theme.palette.text.secondary;
  };

  const getDisplayStatusIcon = (display: DisplayInfo) => {
    if (multiDisplayConfig?.displays.some(d => d.id === display.id)) {
      return <CheckCircleIcon sx={{ color: theme.palette.success.main }} />;
    }
    return <MonitorIcon sx={{ color: theme.palette.text.secondary }} />;
  };

  return (
    <Box>
      <Paper 
        elevation={1} 
        sx={{ 
          p: 2,
          backgroundColor: alpha(theme.palette.background.paper, 0.9)
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Multi-Monitor Display</Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={multiDisplayConfig?.enabled ? 'Enabled' : 'Disabled'}
              color={multiDisplayConfig?.enabled ? 'success' : 'default'}
              size="small"
            />
            
            <IconButton onClick={detectDisplays} disabled={isDetecting}>
              <RefreshIcon />
            </IconButton>
            
            <IconButton onClick={() => setConfigDialogOpen(true)}>
              <SettingsIcon />
            </IconButton>
          </Box>
        </Box>

        {!isElectronAvailable && (
          <Box sx={{ mb: 2 }}>
            <Chip
              icon={<InfoIcon />}
              label="Multi-monitor support requires Electron desktop app"
              color="info"
              variant="outlined"
              size="small"
            />
          </Box>
        )}

        {/* Display Status */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Detected Displays ({displays.length})
          </Typography>
          
          <Grid container spacing={1}>
            {displays.map((display) => (
              <Grid item xs={12} sm={6} md={4} key={display.id}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    backgroundColor: alpha(
                      getDisplayStatusColor(display),
                      0.1
                    ),
                    border: `1px solid ${getDisplayStatusColor(display)}`
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    {getDisplayStatusIcon(display)}
                    <Typography variant="subtitle2" sx={{ flex: 1 }}>
                      {display.name}
                    </Typography>
                    {display.isPrimary && (
                      <Chip label="Primary" size="small" color="primary" />
                    )}
                  </Box>
                  
                  <Typography variant="caption" color="text.secondary">
                    {display.width} × {display.height}
                    {display.scaleFactor !== 1 && ` (${display.scaleFactor}x)`}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Multi-Monitor Controls */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Switch
                checked={multiDisplayConfig?.enabled || false}
                onChange={(e) => {
                  if (e.target.checked) {
                    setConfigDialogOpen(true);
                  } else {
                    handleDisableMultiMonitor();
                  }
                }}
                disabled={displays.length < 2}
              />
            }
            label="Enable Multi-Monitor Layout"
          />
          
          {multiDisplayConfig?.enabled && (
            <Typography variant="caption" color="text.secondary">
              Using {multiDisplayConfig.displays.length} display(s)
            </Typography>
          )}
        </Box>
      </Paper>

      {/* Configuration Dialog */}
      <Dialog
        open={configDialogOpen}
        onClose={() => setConfigDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Configure Multi-Monitor Layout</DialogTitle>
        
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select which displays to use for the surveillance layout. The layout will span across selected displays.
          </Typography>

          <List>
            {displays.map((display) => (
              <ListItem key={display.id} divider>
                <ListItemIcon>
                  <MonitorIcon />
                </ListItemIcon>
                
                <ListItemText
                  primary={display.name}
                  secondary={
                    <Box>
                      <Typography variant="caption" component="div">
                        Resolution: {display.width} × {display.height}
                      </Typography>
                      <Typography variant="caption" component="div">
                        Position: ({display.bounds.x}, {display.bounds.y})
                      </Typography>
                      {display.scaleFactor !== 1 && (
                        <Typography variant="caption" component="div">
                          Scale: {display.scaleFactor}x
                        </Typography>
                      )}
                    </Box>
                  }
                />
                
                <ListItemSecondaryAction>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {display.isPrimary && (
                      <Chip label="Primary" size="small" color="primary" />
                    )}
                    <Switch
                      checked={selectedDisplays.includes(display.id)}
                      onChange={() => handleDisplayToggle(display.id)}
                    />
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>

          {selectedDisplays.length > 1 && (
            <Box sx={{ mt: 2, p: 2, backgroundColor: alpha(theme.palette.info.main, 0.1), borderRadius: 1 }}>
              <Typography variant="subtitle2" color="info.main" sx={{ mb: 1 }}>
                Multi-Display Configuration
              </Typography>
              <Typography variant="body2" color="text.secondary">
                The camera grid will span across {selectedDisplays.length} selected display(s). 
                You can adjust the layout distribution after enabling multi-monitor mode.
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setConfigDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleEnableMultiMonitor}
            variant="contained"
            disabled={selectedDisplays.length === 0}
          >
            Apply Configuration
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MultiMonitorManager;