/**
 * CCTV Configuration Panel Component
 * 
 * Provides comprehensive CCTV camera configuration interface with:
 * - RTSP connection settings
 * - Connection testing and validation
 * - Stream quality monitoring
 * - Camera grouping and location management
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
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
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
  CircularProgress
} from '@mui/material';
import {
  Settings as SettingsIcon,
  PlayArrow as TestIcon,
  Stop as StopIcon,
  Visibility as MonitorIcon,
  VisibilityOff as StopMonitorIcon,
  Group as GroupIcon,
  LocationOn as LocationIcon,
  CheckCircle as ConnectedIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  Download as ExportIcon,
  Upload as ImportIcon
} from '@mui/icons-material';

// Types
interface RTSPConnectionConfig {
  ip_address: string;
  port: number;
  username?: string;
  password?: string;
  stream_path: string;
  protocol: string;
  timeout: number;
  use_tcp: boolean;
}

interface ConnectionTestResult {
  camera_id: string;
  rtsp_url: string;
  status: 'connected' | 'error' | 'testing' | 'disconnected';
  response_time_ms: number;
  error_message?: string;
  stream_info?: {
    resolution: string;
    fps: number;
    codec: string;
  };
  test_timestamp: string;
}

interface QualityMetrics {
  camera_id: string;
  fps: number;
  resolution: string;
  bitrate_kbps: number;
  latency_ms: number;
  packet_loss_percent: number;
  quality_score: 'excellent' | 'good' | 'fair' | 'poor' | 'offline';
  last_updated: string;
}

interface CameraGroup {
  group_id: string;
  name: string;
  description: string;
  camera_ids: string[];
  location: string;
  priority: number;
  created_at: string;
}

interface Camera {
  id: string;
  name: string;
  store_id: string;
  rtsp_url?: string;
  is_active: boolean;
}

const CCTVConfigurationPanel: React.FC = () => {
  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [connectionConfig, setConnectionConfig] = useState<RTSPConnectionConfig>({
    ip_address: '',
    port: 554,
    username: '',
    password: '',
    stream_path: '/stream',
    protocol: 'rtsp',
    timeout: 10,
    use_tcp: true
  });
  
  // Test results and monitoring
  const [connectionTests, setConnectionTests] = useState<Record<string, ConnectionTestResult>>({});
  const [qualityMetrics, setQualityMetrics] = useState<Record<string, QualityMetrics>>({});
  const [testingCameras, setTestingCameras] = useState<Set<string>>(new Set());
  const [monitoringCameras, setMonitoringCameras] = useState<Set<string>>(new Set());
  
  // Camera groups
  const [cameraGroups, setCameraGroups] = useState<CameraGroup[]>([]);
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [newGroup, setNewGroup] = useState<Partial<CameraGroup>>({
    name: '',
    description: '',
    camera_ids: [],
    location: '',
    priority: 1
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Load initial data
  useEffect(() => {
    loadCameras();
    loadCameraGroups();
    loadQualityMetrics();
  }, []);

  const loadCameras = async () => {
    try {
      const response = await fetch('/api/cameras/');
      const data = await response.json();
      setCameras(data.cameras || []);
    } catch (error) {
      setError('Failed to load cameras');
    }
  };

  const loadCameraGroups = async () => {
    try {
      const response = await fetch('/api/cctv-config/groups');
      const data = await response.json();
      setCameraGroups(data);
    } catch (error) {
      console.error('Failed to load camera groups:', error);
    }
  };

  const loadQualityMetrics = async () => {
    try {
      const response = await fetch('/api/cctv-config/cameras/quality/all');
      const data = await response.json();
      setQualityMetrics(data);
    } catch (error) {
      console.error('Failed to load quality metrics:', error);
    }
  };

  // Configuration functions
  const handleConfigureCamera = async () => {
    if (!selectedCamera) {
      setError('Please select a camera');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/cctv-config/cameras/${selectedCamera}/configure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(connectionConfig)
      });

      if (response.ok) {
        setSuccess('Camera configuration saved successfully');
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Configuration failed');
      }
    } catch (error) {
      setError('Failed to configure camera');
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async (cameraId: string) => {
    setTestingCameras(prev => new Set(prev).add(cameraId));
    
    try {
      const response = await fetch(`/api/cctv-config/cameras/${cameraId}/test`, {
        method: 'POST'
      });
      
      const testResult = await response.json();
      setConnectionTests(prev => ({
        ...prev,
        [cameraId]: testResult
      }));
    } catch (error) {
      setConnectionTests(prev => ({
        ...prev,
        [cameraId]: {
          camera_id: cameraId,
          rtsp_url: '',
          status: 'error',
          response_time_ms: 0,
          error_message: 'Test failed',
          test_timestamp: new Date().toISOString()
        }
      }));
    } finally {
      setTestingCameras(prev => {
        const newSet = new Set(prev);
        newSet.delete(cameraId);
        return newSet;
      });
    }
  };

  const handleBulkTest = async () => {
    const cameraIds = cameras.map(c => c.id);
    setLoading(true);
    
    try {
      const response = await fetch('/api/cctv-config/cameras/bulk-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ camera_ids: cameraIds })
      });
      
      const results = await response.json();
      setConnectionTests(results);
      setSuccess('Bulk connection test completed');
    } catch (error) {
      setError('Bulk test failed');
    } finally {
      setLoading(false);
    }
  };

  const handleStartMonitoring = async (cameraId: string) => {
    try {
      const response = await fetch(`/api/cctv-config/cameras/${cameraId}/monitoring/start`, {
        method: 'POST'
      });
      
      if (response.ok) {
        setMonitoringCameras(prev => new Set(prev).add(cameraId));
        setSuccess(`Started monitoring camera ${cameraId}`);
      }
    } catch (error) {
      setError('Failed to start monitoring');
    }
  };

  const handleStopMonitoring = async (cameraId: string) => {
    try {
      const response = await fetch(`/api/cctv-config/cameras/${cameraId}/monitoring/stop`, {
        method: 'POST'
      });
      
      if (response.ok) {
        setMonitoringCameras(prev => {
          const newSet = new Set(prev);
          newSet.delete(cameraId);
          return newSet;
        });
        setSuccess(`Stopped monitoring camera ${cameraId}`);
      }
    } catch (error) {
      setError('Failed to stop monitoring');
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroup.name || !newGroup.location || !newGroup.camera_ids?.length) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const groupData = {
        ...newGroup,
        group_id: `group_${Date.now()}`
      };

      const response = await fetch('/api/cctv-config/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupData)
      });

      if (response.ok) {
        setGroupDialogOpen(false);
        setNewGroup({
          name: '',
          description: '',
          camera_ids: [],
          location: '',
          priority: 1
        });
        loadCameraGroups();
        setSuccess('Camera group created successfully');
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to create group');
      }
    } catch (error) {
      setError('Failed to create camera group');
    }
  };

  // Utility functions
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <ConnectedIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'testing':
        return <CircularProgress size={20} />;
      default:
        return <WarningIcon color="warning" />;
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent':
        return 'success';
      case 'good':
        return 'info';
      case 'fair':
        return 'warning';
      case 'poor':
        return 'error';
      default:
        return 'default';
    }
  };

  // Render functions
  const renderConfigurationTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Camera Selection
            </Typography>
            <FormControl fullWidth margin="normal">
              <InputLabel>Select Camera</InputLabel>
              <Select
                value={selectedCamera}
                onChange={(e) => setSelectedCamera(e.target.value)}
              >
                {cameras.map((camera) => (
                  <MenuItem key={camera.id} value={camera.id}>
                    {camera.name} ({camera.id})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              RTSP Configuration
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  label="IP Address"
                  value={connectionConfig.ip_address}
                  onChange={(e) => setConnectionConfig(prev => ({
                    ...prev,
                    ip_address: e.target.value
                  }))}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Port"
                  type="number"
                  value={connectionConfig.port}
                  onChange={(e) => setConnectionConfig(prev => ({
                    ...prev,
                    port: parseInt(e.target.value)
                  }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Username"
                  value={connectionConfig.username}
                  onChange={(e) => setConnectionConfig(prev => ({
                    ...prev,
                    username: e.target.value
                  }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={connectionConfig.password}
                  onChange={(e) => setConnectionConfig(prev => ({
                    ...prev,
                    password: e.target.value
                  }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Stream Path"
                  value={connectionConfig.stream_path}
                  onChange={(e) => setConnectionConfig(prev => ({
                    ...prev,
                    stream_path: e.target.value
                  }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Protocol</InputLabel>
                  <Select
                    value={connectionConfig.protocol}
                    onChange={(e) => setConnectionConfig(prev => ({
                      ...prev,
                      protocol: e.target.value
                    }))}
                  >
                    <MenuItem value="rtsp">RTSP</MenuItem>
                    <MenuItem value="rtmp">RTMP</MenuItem>
                    <MenuItem value="http">HTTP</MenuItem>
                    <MenuItem value="https">HTTPS</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={connectionConfig.use_tcp}
                      onChange={(e) => setConnectionConfig(prev => ({
                        ...prev,
                        use_tcp: e.target.checked
                      }))}
                    />
                  }
                  label="Use TCP Transport"
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  onClick={handleConfigureCamera}
                  disabled={loading || !selectedCamera}
                  startIcon={<SettingsIcon />}
                >
                  Configure Camera
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderTestingTab = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Connection Testing</Typography>
        <Box>
          <Button
            variant="outlined"
            onClick={handleBulkTest}
            disabled={loading}
            startIcon={<TestIcon />}
            sx={{ mr: 1 }}
          >
            Test All Cameras
          </Button>
          <Button
            variant="outlined"
            onClick={loadQualityMetrics}
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
              <TableCell>Status</TableCell>
              <TableCell>Response Time</TableCell>
              <TableCell>Stream Info</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cameras.map((camera) => {
              const testResult = connectionTests[camera.id];
              const isTesting = testingCameras.has(camera.id);
              const isMonitoring = monitoringCameras.has(camera.id);

              return (
                <TableRow key={camera.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {camera.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {camera.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {isTesting ? (
                        <CircularProgress size={20} />
                      ) : (
                        getStatusIcon(testResult?.status || 'disconnected')
                      )}
                      <Chip
                        label={testResult?.status || 'Not tested'}
                        color={testResult?.status === 'connected' ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    {testResult?.response_time_ms ? 
                      `${testResult.response_time_ms.toFixed(0)}ms` : 
                      '-'
                    }
                  </TableCell>
                  <TableCell>
                    {testResult?.stream_info ? (
                      <Box>
                        <Typography variant="caption" display="block">
                          {testResult.stream_info.resolution}
                        </Typography>
                        <Typography variant="caption" display="block">
                          {testResult.stream_info.fps} FPS
                        </Typography>
                      </Box>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Tooltip title="Test Connection">
                        <IconButton
                          size="small"
                          onClick={() => handleTestConnection(camera.id)}
                          disabled={isTesting}
                        >
                          <TestIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={isMonitoring ? "Stop Monitoring" : "Start Monitoring"}>
                        <IconButton
                          size="small"
                          onClick={() => isMonitoring ? 
                            handleStopMonitoring(camera.id) : 
                            handleStartMonitoring(camera.id)
                          }
                        >
                          {isMonitoring ? <StopMonitorIcon /> : <MonitorIcon />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderQualityTab = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Stream Quality Monitoring
      </Typography>
      
      <Grid container spacing={3}>
        {Object.values(qualityMetrics).map((metrics) => (
          <Grid item xs={12} md={6} lg={4} key={metrics.camera_id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {cameras.find(c => c.id === metrics.camera_id)?.name || metrics.camera_id}
                </Typography>
                
                <Box mb={2}>
                  <Chip
                    label={metrics.quality_score.toUpperCase()}
                    color={getQualityColor(metrics.quality_score) as any}
                    size="small"
                  />
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      FPS
                    </Typography>
                    <Typography variant="h6">
                      {metrics.fps.toFixed(1)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Latency
                    </Typography>
                    <Typography variant="h6">
                      {metrics.latency_ms.toFixed(0)}ms
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Resolution
                    </Typography>
                    <Typography variant="body2">
                      {metrics.resolution}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Bitrate
                    </Typography>
                    <Typography variant="body2">
                      {(metrics.bitrate_kbps / 1000).toFixed(1)} Mbps
                    </Typography>
                  </Grid>
                </Grid>

                <Box mt={2}>
                  <Typography variant="caption" color="textSecondary">
                    Last updated: {new Date(metrics.last_updated).toLocaleTimeString()}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderGroupsTab = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Camera Groups</Typography>
        <Button
          variant="contained"
          onClick={() => setGroupDialogOpen(true)}
          startIcon={<GroupIcon />}
        >
          Create Group
        </Button>
      </Box>

      <Grid container spacing={3}>
        {cameraGroups.map((group) => (
          <Grid item xs={12} md={6} key={group.group_id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                  <Typography variant="h6">
                    {group.name}
                  </Typography>
                  <Chip
                    label={`Priority ${group.priority}`}
                    size="small"
                    color={group.priority <= 2 ? 'error' : group.priority <= 3 ? 'warning' : 'default'}
                  />
                </Box>

                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {group.description}
                </Typography>

                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <LocationIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    {group.location}
                  </Typography>
                </Box>

                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {group.camera_ids.length} cameras
                </Typography>

                <Box display="flex" flexWrap="wrap" gap={0.5}>
                  {group.camera_ids.map((cameraId) => (
                    <Chip
                      key={cameraId}
                      label={cameras.find(c => c.id === cameraId)?.name || cameraId}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Create Group Dialog */}
      <Dialog open={groupDialogOpen} onClose={() => setGroupDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Camera Group</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Group Name"
                value={newGroup.name}
                onChange={(e) => setNewGroup(prev => ({ ...prev, name: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                value={newGroup.location}
                onChange={(e) => setNewGroup(prev => ({ ...prev, location: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={2}
                value={newGroup.description}
                onChange={(e) => setNewGroup(prev => ({ ...prev, description: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={newGroup.priority}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, priority: e.target.value as number }))}
                >
                  <MenuItem value={1}>1 - Highest</MenuItem>
                  <MenuItem value={2}>2 - High</MenuItem>
                  <MenuItem value={3}>3 - Medium</MenuItem>
                  <MenuItem value={4}>4 - Low</MenuItem>
                  <MenuItem value={5}>5 - Lowest</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Select Cameras</InputLabel>
                <Select
                  multiple
                  value={newGroup.camera_ids || []}
                  onChange={(e) => setNewGroup(prev => ({ 
                    ...prev, 
                    camera_ids: e.target.value as string[] 
                  }))}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip 
                          key={value} 
                          label={cameras.find(c => c.id === value)?.name || value}
                          size="small"
                        />
                      ))}
                    </Box>
                  )}
                >
                  {cameras.map((camera) => (
                    <MenuItem key={camera.id} value={camera.id}>
                      {camera.name} ({camera.id})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGroupDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateGroup} variant="contained">
            Create Group
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        CCTV Configuration
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
          <Tab label="Configuration" />
          <Tab label="Connection Testing" />
          <Tab label="Quality Monitoring" />
          <Tab label="Camera Groups" />
        </Tabs>
      </Box>

      {activeTab === 0 && renderConfigurationTab()}
      {activeTab === 1 && renderTestingTab()}
      {activeTab === 2 && renderQualityTab()}
      {activeTab === 3 && renderGroupsTab()}
    </Box>
  );
};

export default CCTVConfigurationPanel;