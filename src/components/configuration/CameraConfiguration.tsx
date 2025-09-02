import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Slider,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { apiService } from '../../services/apiService';

interface Camera {
  id: string;
  name: string;
  streamUrl: string;
  isActive: boolean;
  location: string;
  detectionZones: DetectionZone[];
  settings: CameraSettings;
}

interface DetectionZone {
  id: string;
  name: string;
  type: 'entrance' | 'checkout' | 'aisle' | 'restricted';
  coordinates: { x: number; y: number; width: number; height: number };
  sensitivity: number;
  enabled: boolean;
}

interface CameraSettings {
  resolution: string;
  frameRate: number;
  nightVision: boolean;
  motionDetection: boolean;
  recordingEnabled: boolean;
  alertThreshold: number;
}

const CameraConfiguration: React.FC = () => {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [editingZone, setEditingZone] = useState<DetectionZone | null>(null);
  const [zoneDialogOpen, setZoneDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    loadCameras();
  }, []);

  useEffect(() => {
    if (selectedCamera) {
      drawCameraView();
    }
  }, [selectedCamera]);

  const loadCameras = async () => {
    setLoading(true);
    try {
      const response = await apiService.get('/cameras/configuration') as { data: Camera[] };
      setCameras(response.data);
      if (response.data.length > 0) {
        if (response.data && response.data[0]) {
          setSelectedCamera(response.data[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load cameras:', error);
      // Mock data for development
      setCameras(generateMockCameras());
      const mockCameras = generateMockCameras();
      if (mockCameras && mockCameras[0]) {
        setSelectedCamera(mockCameras[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  const generateMockCameras = (): Camera[] => [
    {
      id: 'cam-001',
      name: 'Entrance Main',
      streamUrl: '/api/stream/cam-001',
      isActive: true,
      location: 'Front Entrance',
      detectionZones: [
        {
          id: 'zone-1',
          name: 'Entry Zone',
          type: 'entrance',
          coordinates: { x: 50, y: 50, width: 200, height: 150 },
          sensitivity: 75,
          enabled: true
        }
      ],
      settings: {
        resolution: '1920x1080',
        frameRate: 30,
        nightVision: true,
        motionDetection: true,
        recordingEnabled: true,
        alertThreshold: 70
      }
    },
    {
      id: 'cam-002',
      name: 'Electronics Section',
      streamUrl: '/api/stream/cam-002',
      isActive: true,
      location: 'Electronics',
      detectionZones: [
        {
          id: 'zone-2',
          name: 'High Value Area',
          type: 'restricted',
          coordinates: { x: 100, y: 80, width: 300, height: 200 },
          sensitivity: 90,
          enabled: true
        }
      ],
      settings: {
        resolution: '1920x1080',
        frameRate: 25,
        nightVision: false,
        motionDetection: true,
        recordingEnabled: true,
        alertThreshold: 80
      }
    }
  ];

  const drawCameraView = () => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedCamera) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 640;
    canvas.height = 480;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background (simulated camera view)
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#ddd';
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Draw detection zones
    selectedCamera.detectionZones.forEach(zone => {
      const { x, y, width, height } = zone.coordinates;
      
      // Zone background
      ctx.fillStyle = zone.enabled 
        ? `${getZoneColor(zone.type)}20` 
        : '#cccccc20';
      ctx.fillRect(x, y, width, height);
      
      // Zone border
      ctx.strokeStyle = zone.enabled 
        ? getZoneColor(zone.type) 
        : '#cccccc';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
      
      // Zone label
      ctx.fillStyle = zone.enabled 
        ? getZoneColor(zone.type) 
        : '#666';
      ctx.font = '14px Arial';
      ctx.fillText(zone.name, x + 5, y + 20);
      
      // Sensitivity indicator
      ctx.font = '12px Arial';
      ctx.fillText(`${zone.sensitivity}%`, x + 5, y + height - 5);
    });
  };

  const getZoneColor = (type: string) => {
    switch (type) {
      case 'entrance': return '#2196f3';
      case 'checkout': return '#4caf50';
      case 'aisle': return '#ff9800';
      case 'restricted': return '#f44336';
      default: return '#666';
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setDrawStart({ x, y });
  };

  const handleCanvasMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !drawStart) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const width = Math.abs(x - drawStart.x);
    const height = Math.abs(y - drawStart.y);

    if (width > 20 && height > 20) {
      const newZone: DetectionZone = {
        id: `zone-${Date.now()}`,
        name: `Zone ${selectedCamera?.detectionZones.length || 0 + 1}`,
        type: 'aisle',
        coordinates: {
          x: Math.min(drawStart.x, x),
          y: Math.min(drawStart.y, y),
          width,
          height
        },
        sensitivity: 75,
        enabled: true
      };

      setEditingZone(newZone);
      setZoneDialogOpen(true);
    }

    setIsDrawing(false);
    setDrawStart(null);
  };

  const handleSaveZone = () => {
    if (!editingZone || !selectedCamera) return;

    const updatedCamera = {
      ...selectedCamera,
      detectionZones: editingZone.id.startsWith('zone-new') 
        ? [...selectedCamera.detectionZones, editingZone]
        : selectedCamera.detectionZones.map(zone => 
            zone.id === editingZone.id ? editingZone : zone
          )
    };

    setSelectedCamera(updatedCamera);
    setCameras(prev => prev.map(cam => 
      cam.id === updatedCamera.id ? updatedCamera : cam
    ));

    setZoneDialogOpen(false);
    setEditingZone(null);
    drawCameraView();
  };

  const handleDeleteZone = (zoneId: string) => {
    if (!selectedCamera) return;

    const updatedCamera = {
      ...selectedCamera,
      detectionZones: selectedCamera.detectionZones.filter(zone => zone.id !== zoneId)
    };

    setSelectedCamera(updatedCamera);
    setCameras(prev => prev.map(cam => 
      cam.id === updatedCamera.id ? updatedCamera : cam
    ));
    drawCameraView();
  };

  const handleSaveConfiguration = async () => {
    if (!selectedCamera) return;

    setLoading(true);
    try {
      await apiService.put(`/cameras/${selectedCamera.id}/configuration`, selectedCamera);
      setSaveMessage('Configuration saved successfully!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Failed to save configuration:', error);
      setSaveMessage('Failed to save configuration');
      setTimeout(() => setSaveMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (field: keyof CameraSettings, value: any) => {
    if (!selectedCamera) return;

    const updatedCamera = {
      ...selectedCamera,
      settings: {
        ...selectedCamera.settings,
        [field]: value
      }
    };

    setSelectedCamera(updatedCamera);
    setCameras(prev => prev.map(cam => 
      cam.id === updatedCamera.id ? updatedCamera : cam
    ));
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Camera Configuration
      </Typography>

      {saveMessage && (
        <Alert severity={saveMessage.includes('success') ? 'success' : 'error'} sx={{ mb: 2 }}>
          {saveMessage}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Camera Selection */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Select Camera
              </Typography>
              <FormControl fullWidth size="small">
                <InputLabel>Camera</InputLabel>
                <Select
                  value={selectedCamera?.id || ''}
                  label="Camera"
                  onChange={(e) => {
                    const camera = cameras.find(c => c.id === e.target.value);
                    setSelectedCamera(camera || null);
                  }}
                >
                  {cameras.map(camera => (
                    <MenuItem key={camera.id} value={camera.id}>
                      {camera.name} - {camera.location}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selectedCamera && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Camera Settings
                  </Typography>
                  
                  <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                    <InputLabel>Resolution</InputLabel>
                    <Select
                      value={selectedCamera.settings.resolution}
                      label="Resolution"
                      onChange={(e) => handleSettingChange('resolution', e.target.value)}
                    >
                      <MenuItem value="1920x1080">1920x1080 (Full HD)</MenuItem>
                      <MenuItem value="1280x720">1280x720 (HD)</MenuItem>
                      <MenuItem value="640x480">640x480 (SD)</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    size="small"
                    label="Frame Rate (FPS)"
                    type="number"
                    value={selectedCamera.settings.frameRate}
                    onChange={(e) => handleSettingChange('frameRate', parseInt(e.target.value))}
                    sx={{ mb: 2 }}
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={selectedCamera.settings.nightVision}
                        onChange={(e) => handleSettingChange('nightVision', e.target.checked)}
                      />
                    }
                    label="Night Vision"
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={selectedCamera.settings.motionDetection}
                        onChange={(e) => handleSettingChange('motionDetection', e.target.checked)}
                      />
                    }
                    label="Motion Detection"
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={selectedCamera.settings.recordingEnabled}
                        onChange={(e) => handleSettingChange('recordingEnabled', e.target.checked)}
                      />
                    }
                    label="Recording Enabled"
                  />

                  <Typography gutterBottom sx={{ mt: 2 }}>
                    Alert Threshold: {selectedCamera.settings.alertThreshold}%
                  </Typography>
                  <Slider
                    value={selectedCamera.settings.alertThreshold}
                    onChange={(_, value) => handleSettingChange('alertThreshold', value)}
                    min={0}
                    max={100}
                    valueLabelDisplay="auto"
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Detection Zones */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1">
                  Detection Zones
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveConfiguration}
                  disabled={loading}
                >
                  Save Configuration
                </Button>
              </Box>

              {selectedCamera && (
                <>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Click and drag on the camera view to create new detection zones
                  </Typography>
                  
                  <Box sx={{ position: 'relative', mb: 2 }}>
                    <canvas
                      ref={canvasRef}
                      style={{
                        border: '1px solid #ddd',
                        cursor: 'crosshair',
                        width: '100%',
                        maxWidth: '640px',
                        height: 'auto'
                      }}
                      onMouseDown={handleCanvasMouseDown}
                      onMouseUp={handleCanvasMouseUp}
                    />
                  </Box>

                  <Typography variant="subtitle2" gutterBottom>
                    Configured Zones
                  </Typography>
                  
                  {selectedCamera.detectionZones.map(zone => (
                    <Box key={zone.id} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Chip
                        label={zone.name}
                        color={zone.enabled ? 'primary' : 'default'}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        label={zone.type}
                        variant="outlined"
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="body2" sx={{ mr: 1 }}>
                        {zone.sensitivity}%
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setEditingZone(zone);
                          setZoneDialogOpen(true);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteZone(zone.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Zone Edit Dialog */}
      <Dialog open={zoneDialogOpen} onClose={() => setZoneDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingZone?.id.startsWith('zone-new') ? 'Create Detection Zone' : 'Edit Detection Zone'}
        </DialogTitle>
        <DialogContent>
          {editingZone && (
            <Box sx={{ pt: 1 }}>
              <TextField
                fullWidth
                label="Zone Name"
                value={editingZone.name}
                onChange={(e) => setEditingZone({ ...editingZone, name: e.target.value })}
                sx={{ mb: 2 }}
              />
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Zone Type</InputLabel>
                <Select
                  value={editingZone.type}
                  label="Zone Type"
                  onChange={(e) => setEditingZone({ ...editingZone, type: e.target.value as any })}
                >
                  <MenuItem value="entrance">Entrance</MenuItem>
                  <MenuItem value="checkout">Checkout</MenuItem>
                  <MenuItem value="aisle">Aisle</MenuItem>
                  <MenuItem value="restricted">Restricted Area</MenuItem>
                </Select>
              </FormControl>

              <Typography gutterBottom>
                Sensitivity: {editingZone.sensitivity}%
              </Typography>
              <Slider
                value={editingZone.sensitivity}
                onChange={(_, value) => setEditingZone({ ...editingZone, sensitivity: value as number })}
                min={0}
                max={100}
                valueLabelDisplay="auto"
                sx={{ mb: 2 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={editingZone.enabled}
                    onChange={(e) => setEditingZone({ ...editingZone, enabled: e.target.checked })}
                  />
                }
                label="Zone Enabled"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setZoneDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveZone} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CameraConfiguration;