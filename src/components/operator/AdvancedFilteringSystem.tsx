/**
 * AdvancedFilteringSystem - Sophisticated filtering and search capabilities
 * Provides advanced filtering for detections, alerts, and historical data with saved presets
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Tooltip,
  Chip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
  Switch,
  FormControlLabel,
  Autocomplete,
  Checkbox,
  ListItemText,
  Divider,
  Badge,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemButton,
  Alert,
  Snackbar,
  alpha,
  useTheme
} from '@mui/material';
import {
  Search,
  FilterList,
  FilterAlt,
  Save,
  SaveAs,
  Bookmark,
  BookmarkBorder,
  Clear,
  Refresh,
  Settings,
  ExpandMore,
  Close,
  Add,
  Delete,
  Edit,
  Star,
  StarBorder,
  History,
  Schedule,
  Person,
  Videocam,
  Warning,
  Security,
  TrendingUp,
  TrendingDown,
  Timeline,
  DateRange,
  AccessTime,
  LocationOn,
  Category,
  PriorityHigh,
  Visibility,
  VisibilityOff,
  FileUpload as Import,
  FileDownload as Export,
  Share
} from '@mui/icons-material';

export interface FilterCriteria {
  id: string;
  name: string;
  type: 'text' | 'select' | 'multiselect' | 'range' | 'date' | 'datetime' | 'boolean' | 'numeric';
  field: string;
  label: string;
  placeholder?: string;
  options?: Array<{ value: any; label: string; color?: string }>;
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: any;
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
  };
  category: 'basic' | 'advanced' | 'metadata' | 'performance' | 'temporal';
  description?: string;
  icon?: React.ReactNode;
}

export interface FilterPreset {
  id: string;
  name: string;
  description: string;
  filters: Record<string, any>;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  is_favorite: boolean;
  usage_count: number;
  category: 'personal' | 'shared' | 'system';
  tags: string[];
}

export interface SearchHistory {
  id: string;
  query: string;
  filters: Record<string, any>;
  timestamp: string;
  results_count: number;
  execution_time_ms: number;
}

interface AdvancedFilteringSystemProps {
  filterCriteria: FilterCriteria[];
  savedPresets: FilterPreset[];
  searchHistory: SearchHistory[];
  currentFilters: Record<string, any>;
  onFiltersChange: (filters: Record<string, any>) => void;
  onSavePreset: (preset: Omit<FilterPreset, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onDeletePreset: (presetId: string) => Promise<void>;
  onLoadPreset: (preset: FilterPreset) => void;
  onSearch: (query: string, filters: Record<string, any>) => Promise<void>;
  onClearFilters: () => void;
  onExportFilters: (format: 'json' | 'csv') => Promise<void>;
  onImportFilters: (data: any) => Promise<void>;
  placeholder?: string;
  maxHistoryItems?: number;
  enablePresets?: boolean;
  enableHistory?: boolean;
  enableExport?: boolean;
  currentUser?: {
    id: string;
    name: string;
    role: string;
  };
}

const AdvancedFilteringSystem: React.FC<AdvancedFilteringSystemProps> = ({
  filterCriteria,
  savedPresets,
  searchHistory,
  currentFilters,
  onFiltersChange,
  onSavePreset,
  onDeletePreset,
  onLoadPreset,
  onSearch,
  onClearFilters,
  onExportFilters,
  onImportFilters,
  placeholder = "Search...",
  maxHistoryItems = 10,
  enablePresets = true,
  enableHistory = true,
  enableExport = true,
  currentUser
}) => {
  const theme = useTheme();
  
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['basic']);
  const [presetsDialog, setPresetsDialog] = useState(false);
  const [savePresetDialog, setSavePresetDialog] = useState(false);
  const [historyDialog, setHistoryDialog] = useState(false);
  const [settingsDialog, setSettingsDialog] = useState(false);
  const [newPreset, setNewPreset] = useState({
    name: '',
    description: '',
    is_public: false,
    tags: [] as string[]
  });
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<HTMLElement | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  } | null>(null);
  
  // Professional color scheme
  const colors = {
    primary: '#1e3a8a',
    secondary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f8fafc',
    textSecondary: '#cbd5e1'
  };

  // Group filters by category
  const categorizedFilters = useMemo(() => {
    return filterCriteria.reduce((categories, filter) => {
      if (!categories[filter.category]) {
        categories[filter.category] = [];
      }
      if (categories[filter.category]) categories[filter.category].push(filter);
      return categories;
    }, {} as Record<string, FilterCriteria[]>);
  }, [filterCriteria]);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    return Object.keys(currentFilters).filter(key => {
      const value = currentFilters[key];
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'string') return value.trim().length > 0;
      if (typeof value === 'number') return !isNaN(value);
      return value != null;
    }).length;
  }, [currentFilters]);

  // Quick filter presets
  const quickPresets = useMemo(() => {
    return [
      {
        name: 'Last Hour',
        icon: <AccessTime />,
        filters: { 
          timestamp_start: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          timestamp_end: new Date().toISOString()
        }
      },
      {
        name: 'Today',
        icon: <Schedule />,
        filters: { 
          timestamp_start: new Date().toISOString().split('T')[0] + 'T00:00:00.000Z',
          timestamp_end: new Date().toISOString()
        }
      },
      {
        name: 'High Priority',
        icon: <PriorityHigh />,
        filters: { 
          priority: ['high', 'critical'],
          severity: ['high', 'critical']
        }
      },
      {
        name: 'Unacknowledged',
        icon: <Warning />,
        filters: { 
          acknowledged: false,
          status: ['new', 'pending']
        }
      }
    ];
  }, []);

  // Handle search
  const handleSearch = useCallback(async () => {
    try {
      await onSearch(searchQuery, currentFilters);
    } catch (error) {
      setNotification({ message: 'Search failed', severity: 'error' });
    }
  }, [searchQuery, currentFilters, onSearch]);

  // Handle filter change
  const handleFilterChange = (filterId: string, value: any) => {
    const newFilters = { ...currentFilters };
    if (value == null || value === '' || (Array.isArray(value) && value.length === 0)) {
      delete newFilters[filterId];
    } else {
      newFilters[filterId] = value;
    }
    onFiltersChange(newFilters);
  };

  // Handle preset save
  const handleSavePreset = async () => {
    if (!newPreset.name.trim()) {
      setNotification({ message: 'Preset name is required', severity: 'error' });
      return;
    }

    try {
      await onSavePreset({
        name: newPreset.name,
        description: newPreset.description,
        filters: currentFilters,
        created_by: currentUser?.id || '',
        is_public: newPreset.is_public,
        is_favorite: false,
        usage_count: 0,
        category: newPreset.is_public ? 'shared' : 'personal',
        tags: newPreset.tags
      });
      
      setSavePresetDialog(false);
      setNewPreset({ name: '', description: '', is_public: false, tags: [] });
      setNotification({ message: 'Preset saved successfully', severity: 'success' });
    } catch (error) {
      setNotification({ message: 'Failed to save preset', severity: 'error' });
    }
  };

  // Handle quick preset
  const handleQuickPreset = (preset: any) => {
    onFiltersChange({ ...currentFilters, ...preset.filters });
  };

  // Render filter input
  const renderFilterInput = (filter: FilterCriteria) => {
    const value = currentFilters[filter.field] ?? filter.defaultValue;

    switch (filter.type) {
      case 'text':
        return (
          <TextField
            fullWidth
            size="small"
            placeholder={filter.placeholder}
            value={value || ''}
            onChange={(e) => handleFilterChange(filter.field, e.target.value)}
            InputProps={{
              sx: { color: colors.text }
            }}
          />
        );

      case 'select':
        return (
          <FormControl fullWidth size="small">
            <Select
              value={value || ''}
              onChange={(e) => handleFilterChange(filter.field, e.target.value)}
              sx={{ color: colors.text }}
            >
              <MenuItem value="">All</MenuItem>
              {filter.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'multiselect':
        return (
          <FormControl fullWidth size="small">
            <Select
              multiple
              value={value || []}
              onChange={(e) => handleFilterChange(filter.field, e.target.value)}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as string[]).map((val) => (
                    <Chip
                      key={val}
                      label={filter.options?.find(o => o.value === val)?.label || val}
                      size="small"
                      sx={{ height: 20, fontSize: '10px' }}
                    />
                  ))}
                </Box>
              )}
              sx={{ color: colors.text }}
            >
              {filter.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Checkbox checked={(value || []).indexOf(option.value) > -1} />
                  <ListItemText primary={option.label} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'range':
        return (
          <Slider
            value={value || [filter.min || 0, filter.max || 100]}
            onChange={(_, newValue) => handleFilterChange(filter.field, newValue)}
            min={filter.min || 0}
            max={filter.max || 100}
            step={filter.step || 1}
            valueLabelDisplay="auto"
            sx={{ color: colors.secondary }}
          />
        );

      case 'datetime':
        return (
          <TextField
            fullWidth
            size="small"
            type="datetime-local"
            value={value ? new Date(value).toISOString().slice(0, 16) : ''}
            onChange={(e) => handleFilterChange(filter.field, e.target.value ? new Date(e.target.value).toISOString() : null)}
            InputProps={{
              sx: { color: colors.text }
            }}
          />
        );

      case 'boolean':
        return (
          <FormControlLabel
            control={
              <Switch
                checked={value || false}
                onChange={(e) => handleFilterChange(filter.field, e.target.checked)}
              />
            }
            label={filter.label}
            sx={{ color: colors.textSecondary }}
          />
        );

      case 'numeric':
        return (
          <TextField
            fullWidth
            size="small"
            type="number"
            placeholder={filter.placeholder}
            value={value || ''}
            onChange={(e) => handleFilterChange(filter.field, parseFloat(e.target.value) || null)}
            InputProps={{
              sx: { color: colors.text }
            }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        backgroundColor: alpha(colors.surface, 0.95),
        border: `1px solid ${alpha(colors.primary, 0.2)}`
      }}
    >
      {/* Search Bar */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          fullWidth
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          InputProps={{
            startAdornment: <Search sx={{ color: colors.textSecondary, mr: 1 }} />,
            sx: { color: colors.text }
          }}
        />
        
        <Button
          variant="contained"
          onClick={handleSearch}
          sx={{ minWidth: 'auto', px: 3 }}
        >
          Search
        </Button>
        
        <IconButton
          onClick={(e) => setFilterMenuAnchor(e.currentTarget)}
          sx={{ color: colors.textSecondary }}
        >
          <Badge badgeContent={activeFiltersCount} color="primary">
            <FilterList />
          </Badge>
        </IconButton>
      </Box>

      {/* Quick Presets */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        {quickPresets.map((preset, index) => (
          <Chip
            key={index}
            icon={preset.icon}
            label={preset.name}
            onClick={() => handleQuickPreset(preset)}
            size="small"
            variant="outlined"
            sx={{
              color: colors.textSecondary,
              borderColor: colors.textSecondary,
              '&:hover': {
                backgroundColor: alpha(colors.secondary, 0.1),
                borderColor: colors.secondary
              }
            }}
          />
        ))}
        
        {enablePresets && (
          <Chip
            icon={<Bookmark />}
            label="Saved"
            onClick={() => setPresetsDialog(true)}
            size="small"
            variant="outlined"
            sx={{ color: colors.secondary, borderColor: colors.secondary }}
          />
        )}
      </Box>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <Typography variant="caption" sx={{ color: colors.textSecondary }}>
            Active filters:
          </Typography>
          {Object.entries(currentFilters).map(([key, value]) => {
            const filter = filterCriteria.find(f => f.field === key);
            if (!filter || !value) return null;
            
            let displayValue = value;
            if (Array.isArray(value)) {
              displayValue = value.length > 2 ? `${value.length} selected` : value.join(', ');
            } else if (filter.options) {
              const option = filter.options.find(o => o.value === value);
              displayValue = option?.label || value;
            }
            
            return (
              <Chip
                key={key}
                label={`${filter.label}: ${displayValue}`}
                onDelete={() => handleFilterChange(key, null)}
                size="small"
                sx={{
                  backgroundColor: alpha(colors.secondary, 0.1),
                  color: colors.secondary
                }}
              />
            );
          })}
          <Button
            size="small"
            onClick={onClearFilters}
            startIcon={<Clear />}
            sx={{ color: colors.textSecondary }}
          >
            Clear All
          </Button>
        </Box>
      )}

      {/* Filter Menu */}
      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor)}
        onClose={() => setFilterMenuAnchor(null)}
        PaperProps={{
          sx: { width: 400, maxHeight: 600, backgroundColor: colors.surface }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ color: colors.text, mb: 2 }}>
            Advanced Filters
          </Typography>
          
          {Object.entries(categorizedFilters).map(([category, filters]) => (
            <Accordion
              key={category}
              expanded={expandedCategories.includes(category)}
              onChange={() => setExpandedCategories(prev => 
                prev.includes(category) 
                  ? prev.filter(c => c !== category)
                  : [...prev, category]
              )}
              sx={{ mb: 1, backgroundColor: alpha(colors.primary, 0.05) }}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography 
                  variant="subtitle2" 
                  sx={{ color: colors.text, textTransform: 'capitalize' }}
                >
                  {category}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {filters.map((filter) => (
                    <Box key={filter.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        {filter.icon}
                        <Typography 
                          variant="body2" 
                          sx={{ color: colors.text, fontWeight: 600 }}
                        >
                          {filter.label}
                        </Typography>
                        {filter.description && (
                          <Tooltip title={filter.description}>
                            <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                              ?
                            </Typography>
                          </Tooltip>
                        )}
                      </Box>
                      {renderFilterInput(filter)}
                    </Box>
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
          
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Button
              size="small"
              onClick={() => {
                handleSearch();
                setFilterMenuAnchor(null);
              }}
              variant="contained"
              sx={{ flex: 1 }}
            >
              Apply
            </Button>
            <Button
              size="small"
              onClick={onClearFilters}
              sx={{ color: colors.textSecondary }}
            >
              Clear
            </Button>
            {enablePresets && (
              <Button
                size="small"
                onClick={() => {
                  setSavePresetDialog(true);
                  setFilterMenuAnchor(null);
                }}
                startIcon={<Save />}
                sx={{ color: colors.secondary }}
              >
                Save
              </Button>
            )}
          </Box>
        </Box>
      </Menu>

      {/* Presets Dialog */}
      {enablePresets && (
        <Dialog
          open={presetsDialog}
          onClose={() => setPresetsDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6">Saved Filter Presets</Typography>
              <IconButton onClick={() => setPresetsDialog(false)}>
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              {savedPresets.map((preset) => (
                <Grid item xs={12} sm={6} key={preset.id}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: alpha(colors.primary, 0.05) }
                    }}
                    onClick={() => {
                      onLoadPreset(preset);
                      setPresetsDialog(false);
                      setNotification({ message: `Loaded preset: ${preset.name}`, severity: 'success' });
                    }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                        <Typography variant="body1" fontWeight={600}>
                          {preset.name}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Toggle favorite
                            }}
                          >
                            {preset.is_favorite ? <Star color="warning" /> : <StarBorder />}
                          </IconButton>
                          {preset.created_by === currentUser?.id && (
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeletePreset(preset.id);
                              }}
                            >
                              <Delete />
                            </IconButton>
                          )}
                        </Box>
                      </Box>
                      
                      <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                        {preset.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
                        {preset.tags.map((tag) => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            sx={{ fontSize: '10px', height: 16 }}
                          />
                        ))}
                        <Chip
                          label={`${Object.keys(preset.filters).length} filters`}
                          size="small"
                          color="primary"
                          sx={{ fontSize: '10px', height: 16 }}
                        />
                      </Box>
                      
                      <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block', mt: 1 }}>
                        Used {preset.usage_count} times • {new Date(preset.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </DialogContent>
        </Dialog>
      )}

      {/* Save Preset Dialog */}
      <Dialog
        open={savePresetDialog}
        onClose={() => setSavePresetDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Save Filter Preset</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              fullWidth
              label="Preset Name"
              value={newPreset.name}
              onChange={(e) => setNewPreset({ ...newPreset, name: e.target.value })}
              required
            />
            
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={2}
              value={newPreset.description}
              onChange={(e) => setNewPreset({ ...newPreset, description: e.target.value })}
            />
            
            <Autocomplete
              multiple
              freeSolo
              options={[]}
              value={newPreset.tags}
              onChange={(_, value) => setNewPreset({ ...newPreset, tags: value })}
              renderInput={(params) => (
                <TextField {...params} label="Tags" placeholder="Add tags..." />
              )}
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={newPreset.is_public}
                  onChange={(e) => setNewPreset({ ...newPreset, is_public: e.target.checked })}
                />
              }
              label="Share with other operators"
            />
            
            <Alert severity="info">
              This preset will include {activeFiltersCount} active filters.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSavePresetDialog(false)}>Cancel</Button>
          <Button onClick={handleSavePreset} variant="contained">Save Preset</Button>
        </DialogActions>
      </Dialog>

      {/* Search History Dialog */}
      {enableHistory && (
        <Dialog
          open={historyDialog}
          onClose={() => setHistoryDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <History />
              <Typography variant="h6">Search History</Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <List>
              {searchHistory.slice(0, maxHistoryItems).map((item) => (
                <ListItem key={item.id} sx={{ px: 0 }}>
                  <ListItemButton
                    onClick={() => {
                      setSearchQuery(item.query);
                      onFiltersChange(item.filters);
                      setHistoryDialog(false);
                    }}
                  >
                    <ListItemText
                      primary={item.query || 'Empty search'}
                      secondary={
                        <Box>
                          <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                            {new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })} • 
                            {item.results_count} results • 
                            {item.execution_time_ms}ms
                          </Typography>
                          {Object.keys(item.filters).length > 0 && (
                            <Box sx={{ mt: 0.5 }}>
                              {Object.keys(item.filters).slice(0, 3).map((key) => (
                                <Chip
                                  key={key}
                                  label={key}
                                  size="small"
                                  sx={{ mr: 0.5, fontSize: '10px', height: 16 }}
                                />
                              ))}
                              {Object.keys(item.filters).length > 3 && (
                                <Chip
                                  label={`+${Object.keys(item.filters).length - 3} more`}
                                  size="small"
                                  sx={{ fontSize: '10px', height: 16 }}
                                />
                              )}
                            </Box>
                          )}
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setHistoryDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Notification */}
      <Snackbar
        open={!!notification}
        autoHideDuration={4000}
        onClose={() => setNotification(null)}
      >
        <Alert severity={notification?.severity} onClose={() => setNotification(null)}>
          {notification?.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default AdvancedFilteringSystem;
