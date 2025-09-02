/**
 * Camera Feed Manager Component
 * 
 * Provides interface for seamless switching between mock and real camera feeds
 * with automatic fallback capabilities and feed quality monitoring.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  LinearProgress,
  CircularProgress,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  SwapHoriz as SwitchIcon,
  PlayArrow as StartIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  CheckCircle as ConnectedIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Videocam as CameraIcon,
  VideoLibrary as MockIcon,
  Cloud as CloudIcon,
  ExpandMore as ExpandMoreIcon,
  Speed as QualityIcon,
  AutoMode as AutoIcon
} from '@mui/icons-material';

// Types
interface FeedSource {
  source_id: string;
  source_type: string;
  priority: number;
  is_available: boolean;
  error_count: number;
}

interface CameraFeedStatus {
  camera_id: string;
  camera_name: string;
  active_source?: FeedSource;
  available_sources: FeedSource[];
  auto_fallback: boolean;
  is_monitoring: boolean;
}

interface FeedSwitchResult {
  camera_id: string;
  success: boolean;
  old_source_type?: string;
  new_source_type?: string;
  switch_time_ms: number;
  error_message?: string;
}

interface QualityValidation {
  camera_id: string;
  quality_valid: boolean;
  quality_score?: number;
  quality_threshold?: number;
  metrics?: {
    fps: number;
    latency_ms: number;
    packet_loss_percent: number;
    quality_rating: string;
  };
  error?: string;
}

interface SourceType {
  value: string;
  name: string;
  description: string;
}

const CameraFeedManager: React.FC = () => {
  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [feedStatus, setFeedStatus] = useState<Record<string, CameraFeedStatus>>({});
  const [sourceTypes, setSourceTypes] = useState<SourceType[]>([]);
  const [qualityValidations, setQualityValidations] = useState<Record<string, QualityValidation>>({});
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [switchingCameras, setSwitchingCameras] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  
  // Bulk operations
  const [bulkSwitchDialog, setBulkSwitchDialog] = useState(false);
  const [selectedCameras, setSelectedCameras] = useState<string[]>([]);
  const [bulkTargetType, setBulkTargetType] = useState<string>('');
  
  // Global mode
  const [globalMode, setGlobalMode] = useState<string>('development');

  // Load initial data
  useEffect(() => {
    loadFeedStatus();
    loadSourceTypes();
  }, []);

  const loadFeedStatus = async () => {
    try {
      const response = await fetch('/api/camera-feeds/status/all');
      const data = await response.json();
      setFeedStatus(data);
    } catch (error) {
      setError('Failed to load feed status');
    }
  };

  const loadSourceTypes = async () => {
    try {
      const response = await fetch('/api/camera-feeds/source-types');
      const data = await response.json();
      setSourceTypes(data.source_types);
    } catch (error) {
      console.error('Failed to load source types:', error);
    }
  };

  const handleSwitchFeed = async (cameraId: string, targetType: string) => {
    setSwitchingCameras(prev => new Set(prev).add(cameraId));
    
    try {
      const response = await fetch(`/api/camera-feeds/cameras/${cameraId}/switch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_source_type: targetType })
      });
      
      const result: FeedSwitchResult = await response.json();
      
      if (result.success) {
        setSuccess(`Successfully switched ${cameraId} to ${targetType}`);
        loadFeedStatus(); // Refresh status
      } else {
        setError(`Failed to switch ${cameraId}: ${result.error_message}`);
      }
    } catch (error) {
      setError(`Switch failed for ${cameraId}`);
    } finally {
      setSwitchingCameras(prev => {
        const newSet = new Set(prev);
        newSet.delete(cameraId);
        return newSet;
      });
    }
  };

  const handleBulkSwitch = async () => {
    if (!selectedCameras.length || !bulkTargetType) {
      setError('Please select cameras and target type');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/camera-feeds/bulk-switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          camera_ids: selectedCameras,
          target_source_type: bulkTargetType
        })
      });
      
      const results = await response.json();
      
      const successCount = Object.values(results).filter((r: any) => r.success).length;
      const totalCount = Object.keys(results).length;
      
      setSuccess(`Bulk switch completed: ${successCount}/${totalCount} successful`);
      setBulkSwitchDialog(false);
      setSelectedCameras([]);
      setBulkTargetType('');
      loadFeedStatus();
    } catch (error) {
      setError('Bulk switch failed');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAutoFallback = async (cameraId: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/camera-feeds/cameras/${cameraId}/auto-fallback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      });
      
      if (response.ok) {
        setSuccess(`Auto-fallback ${enabled ? 'enabled' : 'disabled'} for ${cameraId}`);
        loadFeedStatus();
      } else {
        setError('Failed to toggle auto-fallback');
      }
    } catch (error) {
      setError('Auto-fallback toggle failed');
    }
  };

  const handleValidateQuality = async (cameraId: string) => {
    try {
      const response = await fetch(`/api/camera-feeds/cameras/${cameraId}/validate-quality`);
      const validation: QualityValidation = await response.json();
      
      setQualityValidations(prev => ({
        ...prev,
        [cameraId]: validation
      }));
    } catch (error) {
      setError(`Quality validation failed for ${cameraId}`);
    }
  };

  const handleSetGlobalMode = async (mode: string) => {
    try {
      const response = await fetch('/api/camera-feeds/global-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode })
      });
      
      if (response.ok) {
        setGlobalMode(mode);
        setSuccess(`Global mode set to ${mode}`);
      } else {
        setError('Failed to set global mode');
      }
    } catch (error) {
      setError('Global mode change failed');
    }
  };

  // Utility functions
  const getSourceTypeIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'rtsp_real':
        return <CameraIcon />;
      case 'mock_video':
      case 'mock_synthetic':
        return <MockIcon />;
      case 'rtsp_mock':
        return <CloudIcon />;
      default:
        return <ErrorIcon />;
    }
  };

  const getSourceTypeColor = (sourceType: string) => {
    switch (sourceType) {
      case 'rtsp_real':
        return 'success';
      case 'mock_video':
      case 'mock_synthetic':
        return 'info';
      case 'rtsp_mock':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getQualityColor = (score?: number) => {
    if (!score) return 'default';
    if (score >= 0.8) return 'success';
    if (score >= 0.6) return 'warning';
    return 'error';
  };

  // Render functions
  const renderFeedManagementTab = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Camera Feed Management</Typography>
        <Box>
          <FormControl sx={{ mr: 2, minWidth: 150 }}>
            <InputLabel>Global Mode</InputLabel>
            <Select
              value={globalMode}
              onChange={(e) => handleSetGlobalMode(e.target.value)}
              size="small"
            >
              <MenuItem value="development">Development</MenuItem>
              <MenuItem value="production">Production</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            onClick={() => setBulkSwitchDialog(true)}
            startIcon={<SwitchIcon />}
            sx={{ mr: 1 }}
          >
            Bulk Switch
          </Button>
          <Button
            variant="outlined"
            onClick={loadFeedStatus}
            startIcon={<RefreshIcon />}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Camera</TableCell>
              <TableCell>Active Source</TableCell>
              <TableCell>Available Sources</TableCell>
              <TableCell>Auto Fallback</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.values(feedStatus).map((status) => {
              const isSwitching = switchingCameras.has(status.camera_id);

              return (
                <TableRow key={status.camera_id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {status.camera_name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {status.camera_id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {status.active_source ? (
                      <Box display="flex" alignItems="center" gap={1}>
                        {getSourceTypeIcon(status.active_source.source_type)}
                        <Chip
                          label={status.active_source.source_type}
                          color={getSourceTypeColor(status.active_source.source_type) as any}
                          size="small"
                        />
                        {status.active_source.error_count > 0 && (
                          <Chip
                            label={`${status.active_source.error_count} errors`}
                            color="error"
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    ) : (
                      <Chip label="No active source" color="default" size="small" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                      {status.available_sources.map((source) => (
                        <Tooltip
                          key={source.source_id}
                          title={`Priority: ${source.priority}, Errors: ${source.error_count}`}
                        >
                          <Chip
                            label={source.source_type}
                            size="small"
                            variant="outlined"
                            color={source.is_available ? 'default' : 'error'}
                            onClick={() => handleSwitchFeed(status.camera_id, source.source_type)}
                            disabled={isSwitching || !source.is_available}
                          />
                        </Tooltip>
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={status.auto_fallback}
                          onChange={(e) => handleToggleAutoFallback(
                            status.camera_id, 
                            e.target.checked
                          )}
                          size="small"
                        />
                      }
                      label=""
                    />
                    {status.is_monitoring && (
                      <Chip label="Monitoring" color="info" size="small" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      {isSwitching ? (
                        <CircularProgress size={20} />
                      ) : (
                        <>
                          <Tooltip title="Validate Quality">
                            <IconButton
                              size="small"
                              onClick={() => handleValidateQuality(status.camera_id)}
                            >
                              <QualityIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Configure">
                            <IconButton size="small">
                              <SettingsIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Bulk Switch Dialog */}
      <Dialog open={bulkSwitchDialog} onClose={() => setBulkSwitchDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Bulk Feed Switch</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Select Cameras</InputLabel>
                <Select
                  multiple
                  value={selectedCameras}
                  onChange={(e) => setSelectedCameras(e.target.value as string[])}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip 
                          key={value} 
                          label={feedStatus[value]?.camera_name || value}
                          size="small"
                        />
                      ))}
                    </Box>
                  )}
                >
                  {Object.values(feedStatus).map((status) => (
                    <MenuItem key={status.camera_id} value={status.camera_id}>
                      {status.camera_name} ({status.camera_id})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Target Source Type</InputLabel>
                <Select
                  value={bulkTargetType}
                  onChange={(e) => setBulkTargetType(e.target.value)}
                >
                  {sourceTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.name} - {type.description}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkSwitchDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleBulkSwitch} 
            variant="contained"
            disabled={loading || !selectedCameras.length || !bulkTargetType}
          >
            Switch Feeds
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  const renderQualityTab = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Feed Quality Validation
      </Typography>
      
      <Grid container spacing={3}>
        {Object.values(feedStatus).map((status) => {
          const validation = qualityValidations[status.camera_id];

          return (
            <Grid item xs={12} md={6} lg={4} key={status.camera_id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                    <Typography variant="h6">
                      {status.camera_name}
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => handleValidateQuality(status.camera_id)}
                      startIcon={<QualityIcon />}
                    >
                      Validate
                    </Button>
                  </Box>

                  {validation ? (
                    <Box>
                      <Box mb={2}>
                        <Chip
                          label={validation.quality_valid ? 'VALID' : 'INVALID'}
                          color={validation.quality_valid ? 'success' : 'error'}
                          size="small"
                        />
                        {validation.quality_score && (
                          <Chip
                            label={`Score: ${(validation.quality_score * 100).toFixed(0)}%`}
                            color={getQualityColor(validation.quality_score) as any}
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>

                      {validation.metrics && (
                        <Grid container spacing={1}>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="textSecondary">
                              FPS
                            </Typography>
                            <Typography variant="body2">
                              {validation.metrics.fps.toFixed(1)}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="textSecondary">
                              Latency
                            </Typography>
                            <Typography variant="body2">
                              {validation.metrics.latency_ms.toFixed(0)}ms
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="textSecondary">
                              Packet Loss
                            </Typography>
                            <Typography variant="body2">
                              {validation.metrics.packet_loss_percent.toFixed(1)}%
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="textSecondary">
                              Rating
                            </Typography>
                            <Typography variant="body2">
                              {validation.metrics.quality_rating.toUpperCase()}
                            </Typography>
                          </Grid>
                        </Grid>
                      )}

                      {validation.error && (
                        <Alert severity="error" sx={{ mt: 1 }}>
                          {validation.error}
                        </Alert>
                      )}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      Click Validate to check quality
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );

  const renderSourceTypesTab = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Available Source Types
      </Typography>
      
      <Grid container spacing={2}>
        {sourceTypes.map((type) => (
          <Grid item xs={12} sm={6} md={4} key={type.value}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  {getSourceTypeIcon(type.value)}
                  <Typography variant="h6">
                    {type.name}
                  </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {type.description}
                </Typography>
                <Chip
                  label={type.value}
                  color={getSourceTypeColor(type.value) as any}
                  size="small"
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Camera Feed Manager
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="Feed Management" />
          <Tab label="Quality Validation" />
          <Tab label="Source Types" />
        </Tabs>
      </Box>

      {activeTab === 0 && renderFeedManagementTab()}
      {activeTab === 1 && renderQualityTab()}
      {activeTab === 2 && renderSourceTypesTab()}
    </Box>
  );
};

export default CameraFeedManager;