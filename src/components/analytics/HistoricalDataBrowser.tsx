import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
// Using regular TextField for date inputs to avoid compatibility issues
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { apiService } from '../../services/apiService';

interface HistoricalAlert {
  id: string;
  timestamp: Date;
  cameraId: string;
  cameraName: string;
  type: 'suspicious_behavior' | 'theft_detected' | 'loitering';
  confidence: number;
  description: string;
  severity: 'low' | 'medium' | 'high';
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  videoUrl?: string;
}

interface FilterState {
  startDate: Date | null;
  endDate: Date | null;
  alertType: string;
  cameraId: string;
  severity: string;
  acknowledged: string;
  searchTerm: string;
}

const HistoricalDataBrowser: React.FC = () => {
  const [alerts, setAlerts] = useState<HistoricalAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedAlert, setSelectedAlert] = useState<HistoricalAlert | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  const [filters, setFilters] = useState<FilterState>({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    endDate: new Date(),
    alertType: 'all',
    cameraId: 'all',
    severity: 'all',
    acknowledged: 'all',
    searchTerm: ''
  });

  const [cameras, setCameras] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    loadCameras();
  }, []);

  useEffect(() => {
    loadHistoricalData();
  }, [page, rowsPerPage, filters]);

  const loadCameras = async () => {
    try {
      const response = await apiService.get('/cameras') as { data: { id: string; name: string }[] };
      setCameras(response.data);
    } catch (error) {
      console.error('Failed to load cameras:', error);
      // Mock cameras for development
      setCameras([
        { id: 'cam-001', name: 'Entrance Main' },
        { id: 'cam-002', name: 'Electronics Section' },
        { id: 'cam-003', name: 'Checkout Area' },
        { id: 'cam-004', name: 'Storage Room' }
      ]);
    }
  };

  const loadHistoricalData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: rowsPerPage.toString(),
        startDate: filters.startDate?.toISOString() || '',
        endDate: filters.endDate?.toISOString() || '',
        alertType: filters.alertType,
        cameraId: filters.cameraId,
        severity: filters.severity,
        acknowledged: filters.acknowledged,
        search: filters.searchTerm
      });

      const response = await apiService.get(`/analytics/historical-alerts?${params}`) as { data: { alerts: HistoricalAlert[]; total: number } };
      setAlerts(response.data.alerts);
      setTotalCount(response.data.total);
    } catch (error) {
      console.error('Failed to load historical data:', error);
      // Mock data for development
      setAlerts(generateMockHistoricalData());
      setTotalCount(50);
    } finally {
      setLoading(false);
    }
  };

  const generateMockHistoricalData = (): HistoricalAlert[] => {
    const alertTypes: HistoricalAlert['type'][] = ['suspicious_behavior', 'theft_detected', 'loitering'];
    const severities: HistoricalAlert['severity'][] = ['low', 'medium', 'high'];
    const data: HistoricalAlert[] = [];

    for (let i = 0; i < rowsPerPage; i++) {
      const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
      const type = alertTypes[Math.floor(Math.random() * alertTypes.length)];
      const severity = severities[Math.floor(Math.random() * severities.length)];
      const acknowledged = Math.random() > 0.3;

      data.push({
        id: `alert-${i + page * rowsPerPage}`,
        timestamp,
        cameraId: `cam-00${Math.floor(Math.random() * 4) + 1}`,
        cameraName: cameras[Math.floor(Math.random() * cameras.length)]?.name || 'Unknown Camera',
        type: type || 'suspicious_behavior',
        confidence: 0.7 + Math.random() * 0.3,
        description: `${(type || 'suspicious_behavior').replace('_', ' ')} detected with ${Math.round((0.7 + Math.random() * 0.3) * 100)}% confidence`,
        severity: severity || 'medium',
        acknowledged,
        acknowledgedBy: acknowledged ? 'security_officer_1' : undefined,
        acknowledgedAt: acknowledged ? new Date(timestamp.getTime() + Math.random() * 60 * 60 * 1000) : undefined,
        videoUrl: `/api/video/alert-${i + page * rowsPerPage}`
      });
    }

    return data;
  };

  const handleFilterChange = (field: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(0); // Reset to first page when filters change
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        startDate: filters.startDate?.toISOString() || '',
        endDate: filters.endDate?.toISOString() || '',
        alertType: filters.alertType,
        cameraId: filters.cameraId,
        severity: filters.severity,
        acknowledged: filters.acknowledged,
        search: filters.searchTerm,
        format: 'csv'
      });

      const response = await fetch(`${process.env.REACT_APP_API_URL}/analytics/export-alerts?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.blob();

      // Create download link
      const blob = data;
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `alerts-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  const getAlertTypeColor = (type: string) => {
    switch (type) {
      case 'theft_detected': return 'error';
      case 'suspicious_behavior': return 'warning';
      case 'loitering': return 'info';
      default: return 'default';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  return (
    <>
    <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Historical Data Browser
          </Typography>

          {/* Filters */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              label="Start Date"
              type="date"
              size="small"
              value={filters.startDate?.toISOString().split('T')[0] || ''}
              onChange={(e) => handleFilterChange('startDate', e.target.value ? new Date(e.target.value) : null)}
              InputLabelProps={{ shrink: true }}
            />
            
            <TextField
              label="End Date"
              type="date"
              size="small"
              value={filters.endDate?.toISOString().split('T')[0] || ''}
              onChange={(e) => handleFilterChange('endDate', e.target.value ? new Date(e.target.value) : null)}
              InputLabelProps={{ shrink: true }}
            />

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Alert Type</InputLabel>
              <Select
                value={filters.alertType}
                label="Alert Type"
                onChange={(e) => handleFilterChange('alertType', e.target.value)}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="suspicious_behavior">Suspicious Behavior</MenuItem>
                <MenuItem value="theft_detected">Theft Detected</MenuItem>
                <MenuItem value="loitering">Loitering</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Camera</InputLabel>
              <Select
                value={filters.cameraId}
                label="Camera"
                onChange={(e) => handleFilterChange('cameraId', e.target.value)}
              >
                <MenuItem value="all">All Cameras</MenuItem>
                {cameras.map(camera => (
                  <MenuItem key={camera.id} value={camera.id}>
                    {camera.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel>Severity</InputLabel>
              <Select
                value={filters.severity}
                label="Severity"
                onChange={(e) => handleFilterChange('severity', e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>

            <TextField
              size="small"
              placeholder="Search..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />

            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
            >
              Export
            </Button>
          </Box>

          {/* Data Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Camera</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Severity</TableCell>
                  <TableCell>Confidence</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : (
                  alerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell>
                        {alert.timestamp.toLocaleString()}
                      </TableCell>
                      <TableCell>{alert.cameraName}</TableCell>
                      <TableCell>
                        <Chip
                          label={alert.type.replace('_', ' ')}
                          color={getAlertTypeColor(alert.type) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={alert.severity}
                          color={getSeverityColor(alert.severity) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {Math.round(alert.confidence * 100)}%
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={alert.acknowledged ? 'Acknowledged' : 'Pending'}
                          color={alert.acknowledged ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedAlert(alert);
                            setDetailsOpen(true);
                          }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </CardContent>
      </Card>

      {/* Alert Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Alert Details</DialogTitle>
        <DialogContent>
          {selectedAlert && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="body1" gutterBottom>
                <strong>ID:</strong> {selectedAlert.id}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Timestamp:</strong> {selectedAlert.timestamp.toLocaleString()}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Camera:</strong> {selectedAlert.cameraName} ({selectedAlert.cameraId})
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Type:</strong> {selectedAlert.type.replace('_', ' ')}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Confidence:</strong> {Math.round(selectedAlert.confidence * 100)}%
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Severity:</strong> {selectedAlert.severity}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Description:</strong> {selectedAlert.description}
              </Typography>
              {selectedAlert.acknowledged && (
                <>
                  <Typography variant="body1" gutterBottom>
                    <strong>Acknowledged by:</strong> {selectedAlert.acknowledgedBy}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Acknowledged at:</strong> {selectedAlert.acknowledgedAt?.toLocaleString()}
                  </Typography>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default HistoricalDataBrowser;