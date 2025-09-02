/**
 * AdaptiveGridLayout - Responsive grid system for security dashboard
 * Automatically adjusts layout for desktop, tablet, and mobile devices
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  alpha,
  styled,
  Collapse,
  Fade,
  Zoom,
  Grow,
  Slide
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Close as CloseIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';

// Styled components with enhanced animations
const GridContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  minHeight: '100vh',
  padding: theme.spacing(3),
  background: `radial-gradient(ellipse at top, ${alpha(theme.palette.background.default, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.6)} 100%)`,
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23${theme.palette.primary.main.replace('#', '')}' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    pointerEvents: 'none',
    zIndex: 0
  }
}));

const GridItem = styled(Paper)(({ theme }) => ({
  position: 'relative',
  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.98)} 100%)`,
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.1)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 8px 30px ${alpha(theme.palette.common.black, 0.15)}`,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
  },
  '&.fullscreen': {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    borderRadius: 0,
    margin: 0
  }
}));

const GridItemHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
  borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  minHeight: 64,
  '& .MuiTypography-root': {
    fontWeight: 600,
    letterSpacing: '0.5px'
  }
}));

const GridItemContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  minHeight: 200,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative'
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.text.secondary,
  background: alpha(theme.palette.primary.main, 0.1),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    background: alpha(theme.palette.primary.main, 0.2),
    transform: 'scale(1.1) rotate(5deg)',
    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
  }
}));

const PriorityBadge = styled(Box)(({ theme, priority }: { theme: any; priority: number }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  width: 16,
  height: 16,
  borderRadius: '50%',
  background: priority >= 5 ? theme.palette.error.main :
              priority >= 3 ? theme.palette.warning.main :
              theme.palette.success.main,
  border: `2px solid ${theme.palette.background.paper}`,
  boxShadow: `0 2px 8px ${alpha(priority >= 5 ? theme.palette.error.main :
                              priority >= 3 ? theme.palette.warning.main :
                              theme.palette.success.main, 0.6)}`,
  zIndex: 1
}));

const EmptyState = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(4),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  '& .MuiTypography-root': {
    marginBottom: theme.spacing(1)
  }
}));

interface GridItemData {
  id: string;
  title: string;
  component: React.ComponentType<any>;
  props?: any;
  size: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  minHeight?: number;
  collapsible?: boolean;
  fullscreenable?: boolean;
  priority?: number;
  visible?: boolean;
}

interface AdaptiveGridLayoutProps {
  children?: React.ReactNode;
  items?: GridItemData[];
  spacing?: number;
  onItemClick?: (itemId: string) => void;
  onItemFullscreen?: (itemId: string) => void;
  onItemCollapse?: (itemId: string, collapsed: boolean) => void;
  onItemVisibility?: (itemId: string, visible: boolean) => void;
}

const AdaptiveGridLayout: React.FC<AdaptiveGridLayoutProps> = ({
  children,
  items = [],
  spacing = 3,
  onItemClick,
  onItemFullscreen,
  onItemCollapse,
  onItemVisibility
}) => {
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.up('md'));
  
  const [collapsedItems, setCollapsedItems] = useState<Set<string>>(new Set());
  const [fullscreenItem, setFullscreenItem] = useState<string | null>(null);
  const [hiddenItems, setHiddenItems] = useState<Set<string>>(new Set());
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Default grid items if none provided
  const defaultItems = useMemo(() => [
    {
      id: 'live-monitoring',
      title: 'Live System Monitoring',
      component: () => (
        <EmptyState>
          <Typography variant="h6" color="primary">
            System Monitoring
          </Typography>
          <Typography variant="body2">
            Real-time system health and performance metrics
          </Typography>
        </EmptyState>
      ),
      size: { xs: 12, sm: 12, md: 8, lg: 8, xl: 8 },
      minHeight: 400,
      collapsible: true,
      fullscreenable: true,
      priority: 5,
      visible: true
    },
    {
      id: 'camera-panels',
      title: 'Camera Monitoring',
      component: () => (
        <EmptyState>
          <Typography variant="h6" color="primary">
            Camera Feeds
          </Typography>
          <Typography variant="body2">
            Live camera monitoring and AI detection
          </Typography>
        </EmptyState>
      ),
      size: { xs: 12, sm: 12, md: 4, lg: 4, xl: 4 },
      minHeight: 400,
      collapsible: true,
      fullscreenable: true,
      priority: 4,
      visible: true
    }
  ], []);

  const gridItems = items.length > 0 ? items : defaultItems;

  const handleItemClick = useCallback((itemId: string) => {
    onItemClick?.(itemId);
  }, [onItemClick]);

  const handleItemFullscreen = useCallback((itemId: string) => {
    if (fullscreenItem === itemId) {
      setFullscreenItem(null);
      onItemFullscreen?.(itemId);
    } else {
      setFullscreenItem(itemId);
      onItemFullscreen?.(itemId);
    }
  }, [fullscreenItem, onItemFullscreen]);

  const handleItemCollapse = useCallback((itemId: string) => {
    const newCollapsed = new Set(collapsedItems);
    if (newCollapsed.has(itemId)) {
      newCollapsed.delete(itemId);
    } else {
      newCollapsed.add(itemId);
    }
    setCollapsedItems(newCollapsed);
    onItemCollapse?.(itemId, newCollapsed.has(itemId));
  }, [collapsedItems, onItemCollapse]);

  const handleItemVisibility = useCallback((itemId: string) => {
    const newHidden = new Set(hiddenItems);
    if (newHidden.has(itemId)) {
      newHidden.delete(itemId);
    } else {
      newHidden.add(itemId);
    }
    setHiddenItems(newHidden);
    onItemVisibility?.(itemId, !newHidden.has(itemId));
  }, [hiddenItems, onItemVisibility]);

  const handleItemHover = useCallback((itemId: string, isHovering: boolean) => {
    setHoveredItem(isHovering ? itemId : null);
  }, []);

  const visibleItems = gridItems.filter(item => !hiddenItems.has(item.id));

  if (fullscreenItem) {
    const fullscreenItemData = gridItems.find(item => item.id === fullscreenItem);
    if (!fullscreenItemData) return null;

    const Component = fullscreenItemData.component;
    
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          background: theme.palette.background.default,
          padding: theme.spacing(2)
        }}
      >
        <GridItem className="fullscreen">
          <GridItemHeader>
            <Typography variant="h6">{fullscreenItemData.title}</Typography>
            <Box display="flex" gap={1}>
              <ActionButton onClick={() => handleItemFullscreen(fullscreenItem)}>
                <FullscreenExitIcon />
              </ActionButton>
            </Box>
          </GridItemHeader>
          <GridItemContent>
                                       <Component {...(fullscreenItemData.props || {})} />
          </GridItemContent>
        </GridItem>
      </Box>
    );
  }

  return (
    <GridContainer>
      <LayoutGroup>
        <Grid container spacing={spacing}>
          <AnimatePresence>
            {visibleItems.map((item, index) => {
              const Component = item.component;
              const isCollapsed = collapsedItems.has(item.id);
              const isHovered = hoveredItem === item.id;

              return (
                <Grid
                  item
                  key={item.id}
                  xs={item.size.xs}
                  sm={item.size.sm}
                  md={item.size.md}
                  lg={item.size.lg}
                  xl={item.size.xl}
                >
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -20 }}
                    transition={{ 
                      duration: 0.4, 
                      delay: index * 0.1,
                      type: 'spring',
                      stiffness: 200,
                      damping: 20
                    }}
                    whileHover={{ 
                      scale: 1.02,
                      transition: { duration: 0.2 }
                    }}
                    onHoverStart={() => handleItemHover(item.id, true)}
                    onHoverEnd={() => handleItemHover(item.id, false)}
                  >
                    <GridItem
                      sx={{
                        minHeight: item.minHeight || 200,
                        cursor: onItemClick ? 'pointer' : 'default'
                      }}
                      onClick={() => onItemClick && handleItemClick(item.id)}
                    >
                      {/* Priority Badge */}
                      {item.priority && (
                        <PriorityBadge priority={item.priority} theme={theme} />
                      )}

                      {/* Header */}
                      <GridItemHeader>
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <Typography variant="h6">
                            {item.title}
                          </Typography>
                        </motion.div>

                        <Box display="flex" gap={1}>
                          <AnimatePresence>
                            {item.visible !== false && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Tooltip title="Toggle Visibility">
                                  <ActionButton
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleItemVisibility(item.id);
                                    }}
                                  >
                                    <VisibilityIcon />
                                  </ActionButton>
                                </Tooltip>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {item.collapsible && (
                            <Tooltip title={isCollapsed ? "Expand" : "Collapse"}>
                              <ActionButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleItemCollapse(item.id);
                                }}
                              >
                                {isCollapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
                              </ActionButton>
                            </Tooltip>
                          )}

                          {item.fullscreenable && (
                            <Tooltip title="Fullscreen">
                              <ActionButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleItemFullscreen(item.id);
                                }}
                              >
                                <FullscreenIcon />
                              </ActionButton>
                            </Tooltip>
                          )}
                        </Box>
                      </GridItemHeader>

                      {/* Content */}
                      <Collapse in={!isCollapsed} timeout="auto">
                        <GridItemContent>
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            style={{ width: '100%', height: '100%' }}
                          >
                                                         <Component {...(item.props || {})} />
                          </motion.div>
                        </GridItemContent>
                      </Collapse>
                    </GridItem>
                  </motion.div>
                </Grid>
              );
            })}
          </AnimatePresence>
        </Grid>
      </LayoutGroup>

      {/* Render children if provided */}
      {children && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {children}
        </motion.div>
      )}
    </GridContainer>
  );
};

export default AdaptiveGridLayout;
