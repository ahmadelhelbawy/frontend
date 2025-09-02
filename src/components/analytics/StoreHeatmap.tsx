import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Switch,
  FormControlLabel,
  CircularProgress,
  Tooltip
} from '@mui/material';
import { apiService } from '../../services/apiService';

interface HeatmapData {
  x: number;
  y: number;
  intensity: number;
  alertType: 'suspicious_behavior' | 'theft_detected' | 'loitering';
  count: number;
}

interface StoreLayout {
  width: number;
  height: number;
  zones: {
    id: string;
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    type: 'entrance' | 'checkout' | 'aisle' | 'storage' | 'electronics';
  }[];
}

type TimeRange = '24h' | '7d' | '30d';
type AlertFilter = 'all' | 'suspicious_behavior' | 'theft_detected' | 'loitering';

const StoreHeatmap: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [storeLayout, setStoreLayout] = useState<StoreLayout | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [alertFilter, setAlertFilter] = useState<AlertFilter>('all');
  const [intensity, setIntensity] = useState(50);
  const [showZones, setShowZones] = useState(true);

  useEffect(() => {
    loadHeatmapData();
    loadStoreLayout();
  }, [timeRange, alertFilter]);

  useEffect(() => {
    if (heatmapData.length > 0 && storeLayout) {
      drawHeatmap();
    }
  }, [heatmapData, storeLayout, intensity, showZones]);

  const loadHeatmapData = async () => {
    setLoading(true);
    try {
      const response = await apiService.get(`/analytics/heatmap?range=${timeRange}&filter=${alertFilter}`) as { data: HeatmapData[] };
      setHeatmapData(response.data);
    } catch (error) {
      console.error('Failed to load heatmap data:', error);
      // Mock data for development
      setHeatmapData(generateMockHeatmapData());
    } finally {
      setLoading(false);
    }
  };

  const loadStoreLayout = async () => {
    try {
      const response = await apiService.get('/analytics/store-layout') as { data: StoreLayout };
      setStoreLayout(response.data);
    } catch (error) {
      console.error('Failed to load store layout:', error);
      // Mock layout for development
      setStoreLayout(generateMockLayout());
    }
  };

  const generateMockHeatmapData = (): HeatmapData[] => {
    const data: HeatmapData[] = [];
    const alertTypes: AlertFilter[] = ['suspicious_behavior', 'theft_detected', 'loitering'];
    
    for (let i = 0; i < 100; i++) {
      data.push({
        x: Math.random() * 800,
        y: Math.random() * 600,
        intensity: Math.random(),
        alertType: alertTypes[Math.floor(Math.random() * alertTypes.length)] as any,
        count: Math.floor(Math.random() * 10) + 1
      });
    }
    
    return data;
  };

  const generateMockLayout = (): StoreLayout => ({
    width: 800,
    height: 600,
    zones: [
      { id: '1', name: 'Main Entrance', x: 50, y: 50, width: 100, height: 80, type: 'entrance' },
      { id: '2', name: 'Electronics', x: 200, y: 100, width: 150, height: 120, type: 'electronics' },
      { id: '3', name: 'Checkout 1', x: 500, y: 450, width: 80, height: 60, type: 'checkout' },
      { id: '4', name: 'Checkout 2', x: 600, y: 450, width: 80, height: 60, type: 'checkout' },
      { id: '5', name: 'Aisle 1', x: 100, y: 250, width: 200, height: 40, type: 'aisle' },
      { id: '6', name: 'Aisle 2', x: 100, y: 320, width: 200, height: 40, type: 'aisle' },
      { id: '7', name: 'Storage', x: 650, y: 100, width: 100, height: 150, type: 'storage' }
    ]
  });

  const drawHeatmap = () => {
    const canvas = canvasRef.current;
    if (!canvas || !storeLayout) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = storeLayout.width;
    canvas.height = storeLayout.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw store zones if enabled
    if (showZones) {
      storeLayout.zones.forEach(zone => {
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 1;
        ctx.strokeRect(zone.x, zone.y, zone.width, zone.height);
        
        // Zone labels
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.fillText(zone.name, zone.x + 5, zone.y + 15);
      });
    }

    // Filter data based on alert filter
    const filteredData = alertFilter === 'all' 
      ? heatmapData 
      : heatmapData.filter(point => point.alertType === alertFilter);

    // Draw heatmap points
    filteredData.forEach(point => {
      const radius = Math.max(20, point.count * 5);
      const alpha = (point.intensity * intensity / 100) * 0.6;
      
      // Create radial gradient
      const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, radius);
      
      // Color based on alert type
      let color = '#ff9800'; // suspicious_behavior
      if (point.alertType === 'theft_detected') color = '#f44336';
      if (point.alertType === 'loitering') color = '#2196f3';
      
      gradient.addColorStop(0, `${color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`);
      gradient.addColorStop(1, `${color}00`);
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
      ctx.fill();
    });
  };

  const getAlertTypeColor = (type: string) => {
    switch (type) {
      case 'theft_detected': return '#f44336';
      case 'suspicious_behavior': return '#ff9800';
      case 'loitering': return '#2196f3';
      default: return '#666';
    }
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            Store Layout Heatmap
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={timeRange}
                label="Time Range"
                onChange={(e) => setTimeRange(e.target.value as TimeRange)}
              >
                <MenuItem value="24h">Last 24 Hours</MenuItem>
                <MenuItem value="7d">Last 7 Days</MenuItem>
                <MenuItem value="30d">Last 30 Days</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Alert Type</InputLabel>
              <Select
                value={alertFilter}
                label="Alert Type"
                onChange={(e) => setAlertFilter(e.target.value as AlertFilter)}
              >
                <MenuItem value="all">All Alerts</MenuItem>
                <MenuItem value="suspicious_behavior">Suspicious Behavior</MenuItem>
                <MenuItem value="theft_detected">Theft Detected</MenuItem>
                <MenuItem value="loitering">Loitering</MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={showZones}
                  onChange={(e) => setShowZones(e.target.checked)}
                  size="small"
                />
              }
              label="Show Zones"
            />
          </Box>
        </Box>

        {/* Intensity Control */}
        <Box sx={{ mb: 3, px: 2 }}>
          <Typography gutterBottom>
            Heatmap Intensity
          </Typography>
          <Slider
            value={intensity}
            onChange={(_, newValue) => setIntensity(newValue as number)}
            min={10}
            max={100}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${value}%`}
          />
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ position: 'relative', border: '1px solid #ddd', borderRadius: 1 }}>
            <canvas
              ref={canvasRef}
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '500px',
                display: 'block'
              }}
            />
            
            {/* Legend */}
            <Box sx={{ position: 'absolute', top: 10, right: 10, bgcolor: 'rgba(255,255,255,0.9)', p: 1, borderRadius: 1 }}>
              <Typography variant="caption" display="block" gutterBottom>
                Alert Types:
              </Typography>
              {['theft_detected', 'suspicious_behavior', 'loitering'].map(type => (
                <Box key={type} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      bgcolor: getAlertTypeColor(type),
                      borderRadius: '50%',
                      mr: 1
                    }}
                  />
                  <Typography variant="caption">
                    {type.replace('_', ' ')}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default StoreHeatmap;