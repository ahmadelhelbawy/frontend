import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert,
  Badge,
  Tooltip,
  Fab,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Warning as WarningIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  PhotoCamera as PhotoCameraIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

interface WatchlistEntry {
  watchlist_id: string;
  person_name: string;
  watchlist_type: 'offender' | 'vip' | 'employee' | 'banned';
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  offense_count: number;
  last_offense_date?: string;
  total_loss_amount: number;
  face_image_base64?: string;
  physical_description?: string;
  notes?: string;
  created_at: string;
  active: boolean;
}

interface FaceMatch {
  face_id: string;
  person_name: string;
  confidence: number;
  watchlist_id?: string;
  watchlist_type?: string;
  risk_level?: string;
  offense_count: number;
}

const WatchlistManagement: React.FC = () => {
  const [watchlist, setWatchlist] = useState<WatchlistEntry[]>([]);
  const [filteredWatchlist, setFilteredWatchlist] = useState<WatchlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterRisk, setFilterRisk] = useState<string>('all');

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<WatchlistEntry | null>(null);
  const [faceSearchDialogOpen, setFaceSearchDialogOpen] = useState(false);

  // Form states
  const [newEntry, setNewEntry] = useState({
    person_name: '',
    watchlist_type: 'offender' as const,
    risk_level: 'medium' as const,
    physical_description: '',
    notes: '',
  });

  const [faceSearchResults, setFaceSearchResults] = useState<FaceMatch[]>([]);
  const [searchingFaces, setSearchingFaces] = useState(false);

  const watchlistTypes = [
    { value: 'offender', label: 'Offender', color: '#dc3545', icon: '🚨' },
    { value: 'banned', label: 'Banned Person', color: '#fd7e14', icon: '🚫' },
    { value: 'vip', label: 'VIP Customer', color: '#28a745', icon: '⭐' },
    { value: 'employee', label: 'Employee', color: '#007bff', icon: '👤' },
  ];

  const riskLevels = [
    { value: 'low', label: 'Low Risk', color: '#28a745' },
    { value: 'medium', label: 'Medium Risk', color: '#ffc107' },
    { value: 'high', label: 'High Risk', color: '#fd7e14' },
    { value: 'critical', label: 'Critical Risk', color: '#dc3545' },
  ];

  useEffect(() => {
    loadWatchlist();
  }, []);

  useEffect(() => {
    filterWatchlist();
  }, [watchlist, searchTerm, filterType, filterRisk]);

  const loadWatchlist = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/faces/watchlist');
      const data = await response.json();
      
      if (data.success) {
        setWatchlist(data.watchlist);
      } else {
        console.error('Failed to load watchlist:', data.message);
      }
    } catch (error) {
      console.error('Error loading watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterWatchlist = () => {
    let filtered = watchlist;

    // Text search
    if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.person_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.physical_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(entry => entry.watchlist_type === filterType);
    }

    // Risk filter
    if (filterRisk !== 'all') {
      filtered = filtered.filter(entry => entry.risk_level === filterRisk);
    }

    setFilteredWatchlist(filtered);
  };

  const handleAddToWatchlist = async () => {
    try {
      // First, need to add face (this would be done through face upload)
      // For now, we'll assume face_id is provided or we're creating a placeholder

      const response = await fetch('/api/faces/add-to-watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newEntry,
          face_id: 'placeholder_face_id', // In reality, this would come from face upload
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAddDialogOpen(false);
        setNewEntry({
          person_name: '',
          watchlist_type: 'offender',
          risk_level: 'medium',
          physical_description: '',
          notes: '',
        });
        await loadWatchlist();
      } else {
        console.error('Failed to add to watchlist:', data.message);
      }
    } catch (error) {
      console.error('Error adding to watchlist:', error);
    }
  };

  const handleRemoveFromWatchlist = async (watchlistId: string) => {
    try {
      const response = await fetch(`/api/faces/watchlist/${watchlistId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ removed_by: 'current_user' }),
      });

      const data = await response.json();

      if (data.success) {
        await loadWatchlist();
      } else {
        console.error('Failed to remove from watchlist:', data.message);
      }
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  };

  const handleFaceSearch = async (imageFile: File) => {
    try {
      setSearchingFaces(true);
      const formData = new FormData();
      formData.append('face_image', imageFile);

      const response = await fetch('/api/faces/search-by-image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setFaceSearchResults(data.matches);
      } else {
        console.error('Face search failed:', data.message);
      }
    } catch (error) {
      console.error('Face search error:', error);
    } finally {
      setSearchingFaces(false);
    }
  };

  const getTypeInfo = (type: string) => {
    return watchlistTypes.find(t => t.value === type) || watchlistTypes[0];
  };

  const getRiskInfo = (risk: string) => {
    return riskLevels.find(r => r.value === risk) || riskLevels[1];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderWatchlistCard = (entry: WatchlistEntry) => {
    const typeInfo = getTypeInfo(entry.watchlist_type);
    const riskInfo = getRiskInfo(entry.risk_level);

    return (
      <Card key={entry.watchlist_id} sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Avatar
                src={entry.face_image_base64 ? `data:image/jpeg;base64,${entry.face_image_base64}` : undefined}
                sx={{ width: 60, height: 60 }}
              >
                {!entry.face_image_base64 && <PersonIcon />}
              </Avatar>
            </Grid>
            
            <Grid item xs>
              <Typography variant="h6" component="div">
                {entry.person_name}
                <Chip
                  label={typeInfo.label}
                  size="small"
                  sx={{ ml: 1, backgroundColor: typeInfo.color + '20', color: typeInfo.color }}
                />
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {entry.physical_description || 'No description available'}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={riskInfo.label}
                  size="small"
                  sx={{ backgroundColor: riskInfo.color + '20', color: riskInfo.color }}
                />
                
                {entry.offense_count > 0 && (
                  <Badge badgeContent={entry.offense_count} color="error">
                    <Chip
                      label="Repeat Offender"
                      size="small"
                      color="error"
                      icon={<WarningIcon />}
                    />
                  </Badge>
                )}
                
                {entry.total_loss_amount > 0 && (
                  <Chip
                    label={`Loss: $${entry.total_loss_amount.toFixed(2)}`}
                    size="small"
                    color="warning"
                  />
                )}
              </Box>
            </Grid>
            
            <Grid item>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Tooltip title="Edit Entry">
                  <IconButton
                    onClick={() => {
                      setSelectedEntry(entry);
                      setEditDialogOpen(true);
                    }}
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Remove from Watchlist">
                  <IconButton
                    onClick={() => {
                      if (window.confirm(`Remove ${entry.person_name} from watchlist?`)) {
                        handleRemoveFromWatchlist(entry.watchlist_id);
                      }
                    }}
                    size="small"
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>
          
          {entry.notes && (
            <Typography variant="body2" sx={{ mt: 2, p: 1, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
              <strong>Notes:</strong> {entry.notes}
            </Typography>
          )}
          
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Added: {formatDate(entry.created_at)}
            {entry.last_offense_date && ` | Last Offense: ${formatDate(entry.last_offense_date)}`}
          </Typography>
        </CardContent>
      </Card>
    );
  };

  const renderAddDialog = () => (
    <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SecurityIcon />
          Add to Watchlist
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Person Name"
            value={newEntry.person_name}
            onChange={(e) => setNewEntry(prev => ({ ...prev, person_name: e.target.value }))}
            fullWidth
            required
          />
          
          <FormControl fullWidth>
            <InputLabel>Watchlist Type</InputLabel>
            <Select
              value={newEntry.watchlist_type}
              onChange={(e) => setNewEntry(prev => ({ ...prev, watchlist_type: e.target.value as any }))}
            >
              {watchlistTypes.map(type => (
                <MenuItem key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth>
            <InputLabel>Risk Level</InputLabel>
            <Select
              value={newEntry.risk_level}
              onChange={(e) => setNewEntry(prev => ({ ...prev, risk_level: e.target.value as any }))}
            >
              {riskLevels.map(risk => (
                <MenuItem key={risk.value} value={risk.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: risk.color,
                      }}
                    />
                    {risk.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            label="Physical Description"
            value={newEntry.physical_description}
            onChange={(e) => setNewEntry(prev => ({ ...prev, physical_description: e.target.value }))}
            multiline
            rows={2}
            fullWidth
          />
          
          <TextField
            label="Notes"
            value={newEntry.notes}
            onChange={(e) => setNewEntry(prev => ({ ...prev, notes: e.target.value }))}
            multiline
            rows={3}
            fullWidth
          />
          
          <Alert severity="info">
            <Typography variant="body2">
              To add a face photo, use the face search feature or upload from the camera interface.
            </Typography>
          </Alert>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
        <Button
          onClick={handleAddToWatchlist}
          variant="contained"
          disabled={!newEntry.person_name.trim()}
        >
          Add to Watchlist
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderFaceSearchDialog = () => (
    <Dialog open={faceSearchDialogOpen} onClose={() => setFaceSearchDialogOpen(false)} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SearchIcon />
          Face Search
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleFaceSearch(file);
              }
            }}
            style={{ marginBottom: 16 }}
          />
        </Box>
        
        {searchingFaces && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        )}
        
        {faceSearchResults.length > 0 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>Search Results</Typography>
            <Grid container spacing={2}>
              {faceSearchResults.map((match, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar>
                          <PersonIcon />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1">{match.person_name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Confidence: {(match.confidence * 100).toFixed(1)}%
                          </Typography>
                          {match.watchlist_type && (
                            <Chip
                              label={match.watchlist_type}
                              size="small"
                              color={match.offense_count > 0 ? 'error' : 'default'}
                            />
                          )}
                        </Box>
                        {match.offense_count > 0 && (
                          <Badge badgeContent={match.offense_count} color="error">
                            <WarningIcon />
                          </Badge>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setFaceSearchDialogOpen(false)}>Close</Button>
      </DialogActions>
    </Dialog>
  );

  const renderStatistics = () => {
    const stats = {
      total: watchlist.length,
      offenders: watchlist.filter(e => e.watchlist_type === 'offender').length,
      highRisk: watchlist.filter(e => e.risk_level === 'high' || e.risk_level === 'critical').length,
      repeatOffenders: watchlist.filter(e => e.offense_count > 1).length,
      totalLoss: watchlist.reduce((sum, e) => sum + (e.total_loss_amount || 0), 0),
    };

    return (
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">{stats.total}</Typography>
              <Typography variant="body2">Total Entries</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error">{stats.offenders}</Typography>
              <Typography variant="body2">Offenders</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning">{stats.highRisk}</Typography>
              <Typography variant="body2">High Risk</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error">{stats.repeatOffenders}</Typography>
              <Typography variant="body2">Repeat Offenders</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error">${stats.totalLoss.toFixed(0)}</Typography>
              <Typography variant="body2">Total Loss</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          <SecurityIcon sx={{ mr: 1, verticalAlign: 'bottom' }} />
          Watchlist Management
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<SearchIcon />}
            onClick={() => setFaceSearchDialogOpen(true)}
          >
            Face Search
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadWatchlist}
          >
            Refresh
          </Button>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddDialogOpen(true)}
          >
            Add Entry
          </Button>
        </Box>
      </Box>

      {renderStatistics()}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              label="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, description, or notes..."
              fullWidth
              size="small"
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          
          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <MenuItem value="all">All Types</MenuItem>
                {watchlistTypes.map(type => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Risk Level</InputLabel>
              <Select
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value)}
              >
                <MenuItem value="all">All Levels</MenuItem>
                {riskLevels.map(risk => (
                  <MenuItem key={risk.value} value={risk.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: risk.color,
                        }}
                      />
                      {risk.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="body2" color="text.secondary">
              Showing {filteredWatchlist.length} of {watchlist.length} entries
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Watchlist Entries */}
      <Box>
        {filteredWatchlist.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <PersonIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              {searchTerm || filterType !== 'all' || filterRisk !== 'all' 
                ? 'No entries match your search criteria'
                : 'No watchlist entries found'
              }
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAddDialogOpen(true)}
              sx={{ mt: 2 }}
            >
              Add First Entry
            </Button>
          </Paper>
        ) : (
          filteredWatchlist.map(renderWatchlistCard)
        )}
      </Box>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setAddDialogOpen(true)}
      >
        <AddIcon />
      </Fab>

      {/* Dialogs */}
      {renderAddDialog()}
      {renderFaceSearchDialog()}
    </Box>
  );
};

export default WatchlistManagement;
