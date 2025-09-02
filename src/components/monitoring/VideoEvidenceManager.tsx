import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogContent,
  DialogTitle,
  Chip,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Alert,
  LinearProgress,
  Menu,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Videocam as VideocamIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  GetApp as ExportIcon,
  Archive as ArchiveIcon
} from '@mui/icons-material';
// DatePicker imports removed - using TextField for date inputs instead

interface VideoEvidence {
  id: string;
  cameraId: string;
  cameraName: string;
  timestamp: string;
  duration: number; // in seconds
  fileSize: number; // in bytes
  alertLevel: 'low' | 'medium' | 'high' | 'critical';
  detectionType: 'person' | 'behavior' | 'object' | 'suspicious';
  confidence: number;
  thumbnailUrl: string;
  videoUrl: string;
  metadata: {
    detectionCount: number;
    behaviorAnalysis?: string;
    riskScore: number;
    location: string;
  };
  status: 'processing' | 'ready' | 'archived' | 'deleted';
  tags: string[];
}

interface FilterOptions {
  cameraId?: string;
  alertLevel?: string;
  detectionType?: string;
  dateFrom?: Date;
  dateTo?: Date;
  status?: string;
  searchTerm?: string;
}

const VideoEvidenceManager: React.FC = () => {
  const [evidenceList, setEvidenceList] = useState<VideoEvidence[]>([]);
  const [filteredEvidence, setFilteredEvidence] = useState<VideoEvidence[]>([]);
  const [selectedEvidence, setSelectedEvidence] = useState<VideoEvidence | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [cameras, setCameras] = useState<Array<{id: string, name: string}>>([]);
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(null);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    loadCameras();
    loadEvidence();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [evidenceList, filters, page]);

  const loadCameras = async () => {
    try {
      const response = await fetch('/api/cameras/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.ok) {
        const camerasData = await response.json();
        setCameras(camerasData.map((camera: any) => ({
          id: camera.id,
          name: camera.name
        })));
      }
    } catch (err) {
      console.error('Failed to load cameras:', err);
    }
  };

  const loadEvidence = async () => {
    try {
      setIsLoading(true);
      
      // Mock data for demonstration - replace with actual API call
      const mockEvidence: VideoEvidence[] = [
        {
          id: 'evidence_001',
          cameraId: 'camera_001',
          cameraName: 'Main Entrance',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          duration: 45,
          fileSize: 15728640, // 15MB
          alertLevel: 'high',
          detectionType: 'suspicious',
          confidence: 0.87,
          thumbnailUrl: '/api/evidence/evidence_001/thumbnail',
          videoUrl: '/api/evidence/evidence_001/video',
          metadata: {
            detectionCount: 3,
            behaviorAnalysis: 'Loitering behavior detected',
            riskScore: 0.85,
            location: 'Entrance Area'
          },
          status: 'ready',
          tags: ['suspicious', 'loitering']
        },
        {
          id: 'evidence_002',
          cameraId: 'camera_002',
          cameraName: 'Electronics Section',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          duration: 120,
          fileSize: 31457280, // 30MB
          alertLevel: 'critical',
          detectionType: 'behavior',
          confidence: 0.94,
          thumbnailUrl: '/api/evidence/evidence_002/thumbnail',
          videoUrl: '/api/evidence/evidence_002/video',
          metadata: {
            detectionCount: 5,
            behaviorAnalysis: 'Shoplifting behavior detected',
            riskScore: 0.94,
            location: 'Electronics Section'
          },
          status: 'ready',
          tags: ['shoplifting', 'high-risk']
        },
        {
          id: 'evidence_003',
          cameraId: 'camera_001',
          cameraName: 'Main Entrance',
          timestamp: new Date(Date.now() - 10800000).toISOString(),
          duration: 30,
          fileSize: 10485760, // 10MB
          alertLevel: 'medium',
          detectionType: 'person',
          confidence: 0.72,
          thumbnailUrl: '/api/evidence/evidence_003/thumbnail',
          videoUrl: '/api/evidence/evidence_003/video',
          metadata: {
            detectionCount: 2,
            riskScore: 0.65,
            location: 'Entrance Area'
          },
          status: 'processing',
          tags: ['person-detection']
        }
      ];

      setEvidenceList(mockEvidence);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load evidence';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...evidenceList];

    // Apply filters
    if (filters.cameraId) {
      filtered = filtered.filter(evidence => evidence.cameraId === filters.cameraId);
    }
    
    if (filters.alertLevel) {
      filtered = filtered.filter(evidence => evidence.alertLevel === filters.alertLevel);
    }
    
    if (filters.detectionType) {
      filtered = filtered.filter(evidence => evidence.detectionType === filters.detectionType);
    }
    
    if (filters.status) {
      filtered = filtered.filter(evidence => evidence.status === filters.status);
    }
    
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(evidence => 
        evidence.cameraName.toLowerCase().includes(searchLower) ||
        evidence.detectionType.toLowerCase().includes(searchLower) ||
        evidence.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    if (filters.dateFrom) {
      filtered = filtered.filter(evidence => 
        new Date(evidence.timestamp) >= filters.dateFrom!
      );
    }
    
    if (filters.dateTo) {
      filtered = filtered.filter(evidence => 
        new Date(evidence.timestamp) <= filters.dateTo!
      );
    }

    // Pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedEvidence = filtered.slice(startIndex, endIndex);
    
    setFilteredEvidence(paginatedEvidence);
    setTotalPages(Math.ceil(filtered.length / pageSize));
  };

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({});
    setPage(1);
  };

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getAlertColor = (level: string) => {
    switch (level) {
      case 'low': return 'info';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing': return <LinearProgress sx={{ width: 20 }} />;
      case 'ready': return <CheckCircleIcon color="success" />;
      case 'archived': return <ArchiveIcon color="action" />;
      case 'deleted': return <DeleteIcon color="disabled" />;
      default: return <WarningIcon color="warning" />;
    }
  };

  const handlePlayVideo = (evidence: VideoEvidence) => {
    setSelectedEvidence(evidence);
    setIsVideoDialogOpen(true);
  };

  const handleDownload = async (evidenceId: string) => {
    try {
      setDownloadProgress(prev => new Map(prev.set(evidenceId, 0)));
      
      // Simulate download progress
      const interval = setInterval(() => {
        setDownloadProgress(prev => {
          const current = prev.get(evidenceId) || 0;
          if (current >= 100) {
            clearInterval(interval);
            const newMap = new Map(prev);
            newMap.delete(evidenceId);
            return newMap;
          }
          return new Map(prev.set(evidenceId, current + 10));
        });
      }, 200);
      
      // Actual download logic would go here
      console.log('Downloading evidence:', evidenceId);
      
    } catch (err) {
      console.error('Download failed:', err);
      setDownloadProgress(prev => {
        const newMap = new Map(prev);
        newMap.delete(evidenceId);
        return newMap;
      });
    }
  };

  const handleActionMenuOpen = (event: React.MouseEvent<HTMLElement>, evidenceId: string) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedEvidenceId(evidenceId);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedEvidenceId(null);
  };

  const handleDelete = async (evidenceId: string) => {
    try {
      // API call to delete evidence
      console.log('Deleting evidence:', evidenceId);
      
      // Update local state
      setEvidenceList(prev => prev.filter(evidence => evidence.id !== evidenceId));
      handleActionMenuClose();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleArchive = async (evidenceId: string) => {
    try {
      // API call to archive evidence
      console.log('Archiving evidence:', evidenceId);
      
      // Update local state
      setEvidenceList(prev => prev.map(evidence => 
        evidence.id === evidenceId 
          ? { ...evidence, status: 'archived' as const }
          : evidence
      ));
      handleActionMenuClose();
    } catch (err) {
      console.error('Archive failed:', err);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Typography>Loading video evidence...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
      <Box>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <VideocamIcon />
          Video Evidence Manager
        </Typography>

        {/* Filters */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <TextField
                label="Search"
                size="small"
                value={filters.searchTerm || ''}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
                }}
                sx={{ minWidth: 200 }}
              />
              
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Camera</InputLabel>
                <Select
                  value={filters.cameraId || ''}
                  label="Camera"
                  onChange={(e) => handleFilterChange('cameraId', e.target.value)}
                >
                  <MenuItem value="">All Cameras</MenuItem>
                  {cameras.map(camera => (
                    <MenuItem key={camera.id} value={camera.id}>
                      {camera.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Alert Level</InputLabel>
                <Select
                  value={filters.alertLevel || ''}
                  label="Alert Level"
                  onChange={(e) => handleFilterChange('alertLevel', e.target.value)}
                >
                  <MenuItem value="">All Levels</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={filters.detectionType || ''}
                  label="Type"
                  onChange={(e) => handleFilterChange('detectionType', e.target.value)}
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="person">Person</MenuItem>
                  <MenuItem value="behavior">Behavior</MenuItem>
                  <MenuItem value="object">Object</MenuItem>
                  <MenuItem value="suspicious">Suspicious</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                label="From Date"
                type="date"
                size="small"
                value={filters.dateFrom ? filters.dateFrom.toISOString().split('T')[0] : ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value ? new Date(e.target.value) : null)}
                InputLabelProps={{ shrink: true }}
              />
              
              <TextField
                label="To Date"
                type="date"
                size="small"
                value={filters.dateTo ? filters.dateTo.toISOString().split('T')[0] : ''}
                onChange={(e) => handleFilterChange('dateTo', e.target.value ? new Date(e.target.value) : null)}
                InputLabelProps={{ shrink: true }}
              />
              
              <Button
                variant="outlined"
                onClick={clearFilters}
                startIcon={<FilterIcon />}
              >
                Clear Filters
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Evidence Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Thumbnail</TableCell>
                <TableCell>Camera</TableCell>
                <TableCell>Timestamp</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Alert Level</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Confidence</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEvidence.map((evidence) => (
                <TableRow key={evidence.id} hover>
                  <TableCell>
                    <Box
                      sx={{
                        width: 60,
                        height: 40,
                        bgcolor: 'grey.200',
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                      onClick={() => handlePlayVideo(evidence)}
                    >
                      <PlayIcon />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {evidence.cameraName}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {evidence.metadata.location}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(evidence.timestamp).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {new Date(evidence.timestamp).toLocaleTimeString()}
                    </Typography>
                  </TableCell>
                  <TableCell>{formatDuration(evidence.duration)}</TableCell>
                  <TableCell>
                    <Chip
                      label={evidence.alertLevel}
                      size="small"
                      color={getAlertColor(evidence.alertLevel) as any}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={evidence.detectionType}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{Math.round(evidence.confidence * 100)}%</TableCell>
                  <TableCell>{formatFileSize(evidence.fileSize)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getStatusIcon(evidence.status)}
                      <Typography variant="caption">
                        {evidence.status}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Tooltip title="Play Video">
                        <IconButton
                          size="small"
                          onClick={() => handlePlayVideo(evidence)}
                        >
                          <PlayIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Download">
                        <IconButton
                          size="small"
                          onClick={() => handleDownload(evidence.id)}
                          disabled={downloadProgress.has(evidence.id)}
                        >
                          {downloadProgress.has(evidence.id) ? (
                            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                              <LinearProgress
                                variant="determinate"
                                value={downloadProgress.get(evidence.id) || 0}
                                sx={{ width: 20, height: 20, borderRadius: '50%' }}
                              />
                            </Box>
                          ) : (
                            <DownloadIcon />
                          )}
                        </IconButton>
                      </Tooltip>
                      
                      <IconButton
                        size="small"
                        onClick={(e) => handleActionMenuOpen(e, evidence.id)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, newPage) => setPage(newPage)}
            color="primary"
          />
        </Box>

        {/* Video Player Dialog */}
        <Dialog
          open={isVideoDialogOpen}
          onClose={() => setIsVideoDialogOpen(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                {selectedEvidence?.cameraName} - {selectedEvidence?.detectionType}
              </Typography>
              <Chip
                label={selectedEvidence?.alertLevel}
                color={getAlertColor(selectedEvidence?.alertLevel || '') as any}
              />
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedEvidence && (
              <Box>
                <video
                  controls
                  style={{ width: '100%', maxHeight: '60vh' }}
                  poster={selectedEvidence.thumbnailUrl}
                >
                  <source src={selectedEvidence.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                
                <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Evidence Details</Typography>
                    <Typography variant="body2">
                      <strong>Timestamp:</strong> {new Date(selectedEvidence.timestamp).toLocaleString()}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Duration:</strong> {formatDuration(selectedEvidence.duration)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Confidence:</strong> {Math.round(selectedEvidence.confidence * 100)}%
                    </Typography>
                    <Typography variant="body2">
                      <strong>File Size:</strong> {formatFileSize(selectedEvidence.fileSize)}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Analysis Results</Typography>
                    <Typography variant="body2">
                      <strong>Risk Score:</strong> {Math.round(selectedEvidence.metadata.riskScore * 100)}%
                    </Typography>
                    <Typography variant="body2">
                      <strong>Detections:</strong> {selectedEvidence.metadata.detectionCount}
                    </Typography>
                    {selectedEvidence.metadata.behaviorAnalysis && (
                      <Typography variant="body2">
                        <strong>Analysis:</strong> {selectedEvidence.metadata.behaviorAnalysis}
                      </Typography>
                    )}
                    <Box sx={{ mt: 1 }}>
                      {selectedEvidence.tags.map(tag => (
                        <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                      ))}
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}
          </DialogContent>
        </Dialog>

        {/* Action Menu */}
        <Menu
          anchorEl={actionMenuAnchor}
          open={Boolean(actionMenuAnchor)}
          onClose={handleActionMenuClose}
        >
          <MenuItem onClick={() => selectedEvidenceId && handlePlayVideo(evidenceList.find(e => e.id === selectedEvidenceId)!)}>
            <ListItemIcon><ViewIcon /></ListItemIcon>
            <ListItemText>View</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => selectedEvidenceId && handleDownload(selectedEvidenceId)}>
            <ListItemIcon><ExportIcon /></ListItemIcon>
            <ListItemText>Download</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => selectedEvidenceId && handleArchive(selectedEvidenceId)}>
            <ListItemIcon><ArchiveIcon /></ListItemIcon>
            <ListItemText>Archive</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => selectedEvidenceId && handleDelete(selectedEvidenceId)}>
            <ListItemIcon><DeleteIcon /></ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        </Menu>
      </Box>
  );
};

export default VideoEvidenceManager;