/**
 * SmartNavigationSystem - AI-Powered Adaptive Navigation
 * Features: Intelligent suggestions, keyboard shortcuts, user behavior tracking
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHotkeys } from 'react-hotkeys-hook';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Chip,
  Badge,
  Tooltip,
  TextField,
  InputAdornment,
  Divider,
  Typography,
  IconButton,
  alpha,
  useTheme
} from '@mui/material';
import {
  Search as SearchIcon,
  Star as StarIcon,
  History as HistoryIcon,
  Dashboard as DashboardIcon,
  Videocam as VideocamIcon,
  Warning as WarningIcon,
  Keyboard as KeyboardIcon,
  TrendingUp as TrendingUpIcon,
  Lightbulb as LightbulbIcon
} from '@mui/icons-material';

interface AdvancedNavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  component: React.ComponentType;
  badge?: number | string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  permissions: string[];
  shortcuts: string[];
  subItems?: AdvancedNavigationItem[];
  contextActions?: ContextAction[];
  quickAccess?: boolean;
  customizable?: boolean;
  frequency?: number;
  lastAccessed?: Date;
}

interface ContextAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
}

interface NavigationSuggestion {
  item: AdvancedNavigationItem;
  reason: string;
  confidence: number;
  type: 'frequent' | 'contextual' | 'predictive' | 'trending';
}

const SmartNavigationSystem: React.FC = () => {
  const theme = useTheme();
  const [activeSection, setActiveSection] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [userPreferences, setUserPreferences] = useState({});
  const [frequentlyUsed, setFrequentlyUsed] = useState<AdvancedNavigationItem[]>([]);
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);

  // AI-powered navigation suggestions
  const navigationSuggestions = useAINavigationSuggestions();
  
  // Keyboard shortcuts
  useHotkeys('ctrl+1', () => navigateTo('overview'), { preventDefault: true });
  useHotkeys('ctrl+2', () => navigateTo('cameras'), { preventDefault: true });
  useHotkeys('ctrl+3', () => navigateTo('alerts'), { preventDefault: true });
  useHotkeys('ctrl+4', () => navigateTo('analytics'), { preventDefault: true });
  useHotkeys('ctrl+/', () => setSearchTerm(''), { preventDefault: true });

  // State
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

  // Placeholder components
  const DashboardOverview = () => <div>Dashboard Overview</div>;
  const LiveCameraMatrix = () => <div>Live Camera Matrix</div>;
  const AlertManagement = () => <div>Alert Management</div>;

  // Navigation items with enhanced metadata
  const navigationItems: AdvancedNavigationItem[] = useMemo(() => [
    {
      id: 'overview',
      label: 'Dashboard Overview',
      icon: <DashboardIcon />,
      component: DashboardOverview,
      priority: 'high',
      permissions: ['read'],
      shortcuts: ['Ctrl+1'],
      quickAccess: true,
      frequency: getItemFrequency('overview')
    },
    {
      id: 'cameras',
      label: 'Live Cameras',
      icon: <VideocamIcon />,
      component: LiveCameraMatrix,
      badge: getOfflineCamerasCount(),
      priority: 'critical',
      permissions: ['cameras:read'],
      shortcuts: ['Ctrl+2'],
      quickAccess: true,
      frequency: getItemFrequency('cameras')
    },
    {
      id: 'alerts',
      label: 'Alert Management',
      icon: <WarningIcon />,
      component: AlertManagement,
      badge: getActiveAlertsCount(),
      priority: 'critical',
      permissions: ['alerts:read'],
      shortcuts: ['Ctrl+3'],
      quickAccess: true,
      frequency: getItemFrequency('alerts')
    },
    // ... more navigation items
  ], []);

  // Filter items based on search
  const filteredItems = useMemo(() => {
    if (!searchTerm) return navigationItems;
    
    return navigationItems.filter(item =>
      item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.shortcuts.some(shortcut => 
        shortcut.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [navigationItems, searchTerm]);

  const navigateTo = (itemId: string) => {
    setActiveSection(itemId);
    updateNavigationHistory(itemId);
    updateItemFrequency(itemId);
  };

  const updateNavigationHistory = (itemId: string) => {
    setNavigationHistory(prev => [itemId, ...prev.filter(id => id !== itemId)].slice(0, 10));
  };

  const updateItemFrequency = (itemId: string) => {
    // Update frequency tracking for AI suggestions
    const item = navigationItems.find(item => item.id === itemId);
    if (item) {
      item.frequency = (item.frequency || 0) + 1;
      item.lastAccessed = new Date();
    }
  };

  return (
    <motion.div
      className="smart-navigation-system"
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={{
        width: 280,
        height: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.95)} 0%, ${alpha(theme.palette.primary.main, 0.9)} 100%)`,
        backdropFilter: 'blur(20px)',
        borderRight: `1px solid ${alpha(theme.palette.primary.light, 0.2)}`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Search Bar */}
      <Box sx={{ p: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search navigation..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />
              </InputAdornment>
            ),
            sx: {
              backgroundColor: alpha(theme.palette.common.white, 0.1),
              color: 'white',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: alpha(theme.palette.common.white, 0.2)
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: alpha(theme.palette.common.white, 0.3)
              }
            }
          }}
        />
      </Box>

      {/* AI Suggestions Panel */}
      {showSuggestions && navigationSuggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          style={{ padding: '0 16px' }}
        >
          <Box sx={{ 
            backgroundColor: alpha(theme.palette.info.main, 0.2),
            borderRadius: 2,
            p: 1.5,
            mb: 1
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LightbulbIcon sx={{ color: theme.palette.info.light, fontSize: 16, mr: 1 }} />
              <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
                AI Suggestions
              </Typography>
            </Box>
            {navigationSuggestions.slice(0, 3).map((suggestion) => (
              <motion.div
                key={suggestion.item.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 0.5,
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.common.white, 0.1)
                    }
                  }}
                  onClick={() => navigateTo(suggestion.item.id)}
                >
                  <Box sx={{ mr: 1, opacity: 0.8 }}>
                    {suggestion.item.icon}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" sx={{ color: 'white', display: 'block' }}>
                      {suggestion.item.label}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem' }}>
                      {suggestion.reason}
                    </Typography>
                  </Box>
                  <Chip
                    size="small"
                    label={`${Math.round(suggestion.confidence * 100)}%`}
                    sx={{
                      height: 16,
                      fontSize: '0.6rem',
                      backgroundColor: alpha(theme.palette.success.main, 0.3),
                      color: 'white'
                    }}
                  />
                </Box>
              </motion.div>
            ))}
          </Box>
        </motion.div>
      )}

      {/* Main Navigation Items */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List sx={{ p: 1 }}>
          <AnimatePresence>
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                <NavigationItem
                  item={item}
                  isActive={activeSection === item.id}
                  onClick={() => navigateTo(item.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </List>
      </Box>

      {/* Quick Access Panel */}
      <QuickAccessPanel 
        items={frequentlyUsed}
        onItemClick={navigateTo}
      />

      {/* Keyboard Shortcuts Help */}
      <Box sx={{ p: 2, borderTop: `1px solid ${alpha(theme.palette.common.white, 0.1)}` }}>
        <Tooltip title="Keyboard Shortcuts">
          <IconButton
            size="small"
            sx={{ color: 'rgba(255,255,255,0.7)' }}
            onClick={() => setShowShortcutsHelp(true)}
          >
            <KeyboardIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </motion.div>
  );
};

// Navigation Item Component
const NavigationItem: React.FC<{
  item: AdvancedNavigationItem;
  isActive: boolean;
  onClick: () => void;
}> = ({ item, isActive, onClick }) => {
  const theme = useTheme();

  return (
    <ListItem disablePadding sx={{ mb: 0.5 }}>
      <ListItemButton
        onClick={onClick}
        sx={{
          borderRadius: 2,
          backgroundColor: isActive 
            ? alpha(theme.palette.common.white, 0.15)
            : 'transparent',
          color: 'white',
          '&:hover': {
            backgroundColor: alpha(theme.palette.common.white, 0.1)
          },
          transition: 'all 0.2s ease-in-out'
        }}
      >
        <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
          {item.icon}
        </ListItemIcon>
        <ListItemText 
          primary={item.label}
          primaryTypographyProps={{
            fontSize: '0.9rem',
            fontWeight: isActive ? 600 : 400
          }}
        />
        {item.badge && (
          <Badge
            badgeContent={item.badge}
            color={item.priority === 'critical' ? 'error' : 'warning'}
            sx={{ mr: 1 }}
          />
        )}
        {item.shortcuts.length > 0 && (
          <Chip
            size="small"
            label={item.shortcuts[0]}
            sx={{
              height: 20,
              fontSize: '0.6rem',
              backgroundColor: alpha(theme.palette.common.white, 0.1),
              color: 'rgba(255,255,255,0.7)'
            }}
          />
        )}
      </ListItemButton>
    </ListItem>
  );
};

// Quick Access Panel Component
const QuickAccessPanel: React.FC<{
  items: AdvancedNavigationItem[];
  onItemClick: (itemId: string) => void;
}> = ({ items, onItemClick }) => {
  const theme = useTheme();

  if (items.length === 0) return null;

  return (
    <Box sx={{ 
      p: 2, 
      borderTop: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
      backgroundColor: alpha(theme.palette.common.black, 0.2)
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <StarIcon sx={{ color: theme.palette.warning.light, fontSize: 16, mr: 1 }} />
        <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
          Quick Access
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {items.slice(0, 4).map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Tooltip title={item.label}>
              <IconButton
                size="small"
                onClick={() => onItemClick(item.id)}
                sx={{
                  backgroundColor: alpha(theme.palette.common.white, 0.1),
                  color: 'white',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.common.white, 0.2)
                  }
                }}
              >
                {item.icon}
              </IconButton>
            </Tooltip>
          </motion.div>
        ))}
      </Box>
    </Box>
  );
};

// Custom hooks for AI functionality
const useAINavigationSuggestions = (): NavigationSuggestion[] => {
  const [suggestions, setSuggestions] = useState<NavigationSuggestion[]>([]);

  useEffect(() => {
    // AI logic to generate navigation suggestions
    // This would integrate with your AI backend
    const generateSuggestions = async () => {
      // Mock AI suggestions - replace with actual AI service
      const mockSuggestions: NavigationSuggestion[] = [
        {
          item: { id: 'alerts', label: 'Alert Management' } as AdvancedNavigationItem,
          reason: 'High alert activity detected',
          confidence: 0.92,
          type: 'contextual'
        }
      ];
      setSuggestions(mockSuggestions);
    };

    generateSuggestions();
  }, []);

  return suggestions;
};

// Helper functions
const getItemFrequency = (itemId: string): number => {
  // Get frequency from local storage or analytics service
  return parseInt(localStorage.getItem(`nav_frequency_${itemId}`) || '0');
};

const getOfflineCamerasCount = (): number => {
  // Get from camera service
  return 0;
};

const getActiveAlertsCount = (): number => {
  // Get from alert service
  return 0;
};

export default SmartNavigationSystem;