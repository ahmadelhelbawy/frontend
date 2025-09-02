/**
 * EnhancedLayoutShell - Main layout with micro-interactions and responsive design
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  useTheme,
  useMediaQuery,
  Fab,
  IconButton,
  Tooltip,
  Badge,
  Paper
} from '@mui/material';
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform
} from 'framer-motion';
import {
  ExpandLess as ExpandLessIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Help as HelpIcon
} from '@mui/icons-material';

import {
  AnimatedCard,
  AnimatedButton,
  FloatingAction,
  GlowEffect,
  PulsingDot,
  fadeInUp,
  slideInLeft,
  slideInRight,
  bounceIn
} from '../animations/MicroInteractions';
import { useScrollAnimation, useMouseTracking } from '../animations/AnimationHooks';

interface EnhancedLayoutShellProps {
  children: React.ReactNode;
  navigation?: React.ReactNode;
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  showScrollToTop?: boolean;
  showPerformanceIndicator?: boolean;
  enableParallax?: boolean;
}

export const EnhancedLayoutShell: React.FC<EnhancedLayoutShellProps> = ({
  children,
  navigation,
  header,
  sidebar,
  showScrollToTop = true,
  showPerformanceIndicator = true,
  enableParallax = true
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [notifications, setNotifications] = useState(3);
  
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.95]);
  const parallaxY = useTransform(scrollY, [0, 1000], [0, -100]);
  
  const { ref: headerRef, controls: headerControls } = useScrollAnimation(0.1);
  const { ref: mouseRef, mousePosition } = useMouseTracking();

  // Scroll to top functionality
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Performance indicator (mock)
  const [performanceMetrics, setPerformanceMetrics] = useState({
    fps: 60,
    latency: 45,
    load: 23
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setPerformanceMetrics({
        fps: Math.floor(Math.random() * 10) + 55,
        latency: Math.floor(Math.random() * 20) + 35,
        load: Math.floor(Math.random() * 30) + 15
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      ref={mouseRef}
      sx={{
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Animated Background Gradient */}
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(135deg, 
            ${theme.palette.primary.main}10 0%, 
            ${theme.palette.secondary.main}05 100%)`,
          zIndex: -1
        }}
        animate={{
          background: [
            `linear-gradient(135deg, ${theme.palette.primary.main}10 0%, ${theme.palette.secondary.main}05 100%)`,
            `linear-gradient(135deg, ${theme.palette.secondary.main}05 0%, ${theme.palette.primary.main}10 100%)`,
            `linear-gradient(135deg, ${theme.palette.primary.main}10 0%, ${theme.palette.secondary.main}05 100%)`
          ]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Parallax Mouse Effect */}
      {enableParallax && (
        <motion.div
          style={{
            position: 'fixed',
            top: '20%',
            right: '10%',
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${theme.palette.primary.main}15 0%, transparent 70%)`,
            pointerEvents: 'none',
            zIndex: 0,
            x: mousePosition.x,
            y: mousePosition.y
          }}
          transition={{ type: "spring", stiffness: 150, damping: 30 }}
        />
      )}

      {/* Animated Header */}
      <motion.div
        ref={headerRef}
        style={{ opacity: headerOpacity }}
        initial="initial"
        animate={headerControls}
        variants={slideInLeft}
      >
        <Paper
          elevation={0}
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 1200,
            borderRadius: 0,
            borderBottom: `1px solid ${theme.palette.divider}`,
            backdropFilter: 'blur(10px)',
            backgroundColor: `${theme.palette.background.paper}90`
          }}
        >
          {header}
        </Paper>
      </motion.div>

      {/* Navigation with slide-in animation */}
      <AnimatePresence>
        {navigation && (
          <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={slideInLeft}
          >
            {navigation}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Layout Container */}
      <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
        {/* Animated Sidebar */}
        <AnimatePresence>
          {sidebar && !isMobile && (
            <motion.div
              initial="initial"
              animate="animate"
              exit="exit"
              variants={slideInLeft}
              style={{ flexShrink: 0 }}
            >
              <Paper
                elevation={0}
                sx={{
                  width: 280,
                  height: '100%',
                  borderRadius: 0,
                  borderRight: `1px solid ${theme.palette.divider}`,
                  backgroundColor: theme.palette.background.paper
                }}
              >
                {sidebar}
              </Paper>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Parallax Content */}
          <motion.div
            style={enableParallax ? { y: parallaxY } : {}}
          >
            <Container
              maxWidth="xl"
              sx={{
                py: 3,
                px: isMobile ? 2 : 3,
                position: 'relative'
              }}
            >
              <AnimatedCard
                variant="fadeInUp"
                delay={0.2}
                hoverEffect={false}
              >
                {children}
              </AnimatedCard>
            </Container>
          </motion.div>
        </Box>
      </Box>

      {/* Floating Action Buttons */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1300,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
      >
        {/* Performance Indicator */}
        {showPerformanceIndicator && (
          <FloatingAction intensity="gentle">
            <AnimatedButton variant="glow">
              <Paper
                elevation={4}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.primary.main}40`,
                  minWidth: 120
                }}
              >
                <Box sx={{ textAlign: 'center', fontSize: '0.75rem' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <span>FPS</span>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <PulsingDot size={4} color={theme.palette.success.main} />
                      <span>{performanceMetrics.fps}</span>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <span>Latency</span>
                    <span>{performanceMetrics.latency}ms</span>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Load</span>
                    <span>{performanceMetrics.load}%</span>
                  </Box>
                </Box>
              </Paper>
            </AnimatedButton>
          </FloatingAction>
        )}

        {/* Settings Button */}
        <FloatingAction intensity="medium">
          <GlowEffect color={theme.palette.secondary.main}>
            <Tooltip title="Settings" placement="left">
              <Fab
                color="secondary"
                size="medium"
                component={motion.div}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <SettingsIcon />
              </Fab>
            </Tooltip>
          </GlowEffect>
        </FloatingAction>

        {/* Notifications Button */}
        <FloatingAction intensity="medium">
          <Tooltip title="Notifications" placement="left">
            <Badge badgeContent={notifications} color="error">
              <Fab
                color="primary"
                size="medium"
                component={motion.div}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setNotifications(0)}
              >
                <NotificationsIcon />
              </Fab>
            </Badge>
          </Tooltip>
        </FloatingAction>

        {/* Fullscreen Toggle */}
        <FloatingAction intensity="gentle">
          <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"} placement="left">
            <IconButton
              onClick={toggleFullscreen}
              component={motion.div}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              sx={{
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover
                }
              }}
            >
              {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
          </Tooltip>
        </FloatingAction>

        {/* Help Button */}
        <FloatingAction intensity="gentle">
          <Tooltip title="Help & Documentation" placement="left">
            <IconButton
              component={motion.div}
              whileHover={{ scale: 1.1, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
              sx={{
                backgroundColor: theme.palette.info.main,
                color: theme.palette.info.contrastText,
                '&:hover': {
                  backgroundColor: theme.palette.info.dark
                }
              }}
            >
              <HelpIcon />
            </IconButton>
          </Tooltip>
        </FloatingAction>

        {/* Scroll to Top Button */}
        <AnimatePresence>
          {showScrollToTop && showScrollTop && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <FloatingAction intensity="strong">
                <Tooltip title="Scroll to Top" placement="left">
                  <Fab
                    color="primary"
                    size="small"
                    onClick={scrollToTop}
                    component={motion.div}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.8 }}
                  >
                    <ExpandLessIcon />
                  </Fab>
                </Tooltip>
              </FloatingAction>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>

      {/* Loading Overlay for Transitions */}
      <AnimatePresence>
        {false && ( // This would be controlled by a loading state
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2000
            }}
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  border: `4px solid ${theme.palette.primary.main}`,
                  borderTop: `4px solid transparent`,
                  borderRadius: '50%'
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation */}
      <AnimatePresence>
        {isMobile && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 1200
            }}
          >
            <Paper
              elevation={8}
              sx={{
                borderRadius: '20px 20px 0 0',
                backgroundColor: theme.palette.background.paper,
                borderTop: `1px solid ${theme.palette.divider}`,
                p: 2
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-around',
                  alignItems: 'center'
                }}
              >
                {/* Mobile navigation items would go here */}
                <AnimatedButton variant="scale">
                  <IconButton>
                    <Badge badgeContent={notifications} color="error">
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                </AnimatedButton>
                
                <AnimatedButton variant="lift">
                  <IconButton>
                    <SettingsIcon />
                  </IconButton>
                </AnimatedButton>
                
                <AnimatedButton variant="glow">
                  <IconButton onClick={toggleFullscreen}>
                    {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                  </IconButton>
                </AnimatedButton>
              </Box>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Transition Effects */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          zIndex: 1201
        }}
      >
        <motion.div
          style={{
            height: '100%',
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            originX: 0
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </Box>

      {/* Ambient Particles for Premium Feel */}
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'fixed',
            width: 2,
            height: 2,
            borderRadius: '50%',
            backgroundColor: theme.palette.primary.main,
            pointerEvents: 'none',
            zIndex: 0
          }}
          animate={{
            x: [0, Math.random() * window.innerWidth],
            y: [0, Math.random() * window.innerHeight],
            opacity: [0, 0.3, 0]
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "linear"
          }}
        />
      ))}
    </Box>
  );
};

// Higher-order component for adding page-level animations
interface AnimatedPageProps {
  children: React.ReactNode;
  animation?: 'fadeInUp' | 'slideInLeft' | 'slideInRight' | 'bounceIn';
  delay?: number;
}

export const AnimatedPage: React.FC<AnimatedPageProps> = ({
  children,
  animation = 'fadeInUp',
  delay = 0
}) => {
  const variants = {
    fadeInUp,
    slideInLeft,
    slideInRight,
    bounceIn: {
      initial: { opacity: 0, scale: 0.3 },
      animate: { 
        opacity: 1, 
        scale: 1,
        transition: { type: "spring", stiffness: 400, damping: 17 }
      },
      exit: { opacity: 0, scale: 0.3 }
    }
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants[animation]}
      transition={{ delay }}
      style={{ width: '100%' }}
    >
      {children}
    </motion.div>
  );
};

// Component for animated section dividers
interface AnimatedDividerProps {
  variant?: 'gradient' | 'dots' | 'wave';
  color?: string;
  height?: number;
}

export const AnimatedDivider: React.FC<AnimatedDividerProps> = ({
  variant = 'gradient',
  color,
  height = 2
}) => {
  const theme = useTheme();
  const primaryColor = color || theme.palette.primary.main;

  if (variant === 'gradient') {
    return (
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{
          height,
          background: `linear-gradient(90deg, transparent, ${primaryColor}, transparent)`,
          margin: '24px 0',
          originX: 0.5
        }}
      />
    );
  }

  if (variant === 'dots') {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: 1,
          my: 3
        }}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: i * 0.1,
              type: "spring",
              stiffness: 400,
              damping: 17
            }}
            style={{
              width: height * 2,
              height: height * 2,
              borderRadius: '50%',
              backgroundColor: primaryColor
            }}
          />
        ))}
      </Box>
    );
  }

  // Wave variant
  return (
    <Box sx={{ my: 3, height: height * 10, position: 'relative', overflow: 'hidden' }}>
      <motion.div
        animate={{
          x: [-100, 100]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 200,
          height,
          background: primaryColor,
          borderRadius: height / 2,
          transform: 'translate(-50%, -50%)'
        }}
      />
    </Box>
  );
};

export default EnhancedLayoutShell;
