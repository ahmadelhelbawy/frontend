/**
 * SimpleEnhancedApp - Simple app with core micro-interactions
 */

import React, { Suspense } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container, Box, Typography } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { OperatorProvider } from './contexts/OperatorContext';
import { LiveDashboardProvider } from './contexts/LiveDashboardContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingFallback from './components/common/LoadingFallback';

// Import core animation components
import {
  AnimatedCard,
  AnimatedButton,
  StaggeredList,
  PulsingDot,
  GlowEffect,
  CountUp,
  TypewriterText,
  SparkleEffect,
  ProgressRing
} from './components/animations/MicroInteractions';

const professionalSecurityTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1e3a8a',
      light: '#3b82f6',
      dark: '#1e40af'
    },
    secondary: {
      main: '#334155',
      light: '#475569',
      dark: '#1e293b'
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669'
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706'
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626'
    },
    info: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb'
    },
    background: {
      default: '#0f172a',
      paper: '#1e293b'
    },
    text: {
      primary: '#f8fafc',
      secondary: '#cbd5e1'
    },
    divider: '#475569'
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700, letterSpacing: '-0.025em' },
    h2: { fontWeight: 700, letterSpacing: '-0.025em' },
    h3: { fontWeight: 600, letterSpacing: '-0.025em' },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 }
  },
  shape: { borderRadius: 8 }
});

const SimpleDashboard: React.FC = () => {
  const theme = professionalSecurityTheme;

  const stats = [
    { label: 'Active Cameras', value: 12, color: theme.palette.success.main },
    { label: 'Total Incidents', value: 247, color: theme.palette.error.main },
    { label: 'System Health', value: 98, color: theme.palette.primary.main, suffix: '%' },
    { label: 'AI Models', value: 3, color: theme.palette.info.main }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <AnimatedCard variant="fadeInUp" delay={0.1}>
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <SparkleEffect>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2
              }}
            >
              <TypewriterText text="AI Security Dashboard" speed={80} />
            </Typography>
          </SparkleEffect>
          <Typography variant="h6" color="text.secondary">
            Enhanced with Micro-Interactions
          </Typography>
        </Box>
      </AnimatedCard>

      {/* Stats Grid */}
      <StaggeredList staggerDelay={0.1}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 3,
            mb: 6
          }}
        >
          {stats.map((stat, index) => (
            <AnimatedCard key={stat.label} variant="bounceIn" delay={index * 0.1} hoverEffect={true}>
              <GlowEffect color={stat.color} trigger="hover">
                <Box
                  sx={{
                    p: 3,
                    background: `linear-gradient(135deg, ${stat.color}15, ${stat.color}05)`,
                    border: `1px solid ${stat.color}30`,
                    borderRadius: 3,
                    textAlign: 'center',
                    position: 'relative'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                    <PulsingDot color={stat.color} intensity="medium" />
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: stat.color, mb: 1 }}>
                    <CountUp from={0} to={stat.value} duration={1.5} suffix={stat.suffix || ''} />
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Box>
              </GlowEffect>
            </AnimatedCard>
          ))}
        </Box>
      </StaggeredList>

      {/* Performance Rings */}
      <AnimatedCard variant="fadeInScale" delay={0.5}>
        <Box
          sx={{
            p: 4,
            background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`
          }}
        >
          <Typography variant="h4" sx={{ mb: 4, fontWeight: 600, textAlign: 'center' }}>
            System Performance
          </Typography>
          
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 4,
              textAlign: 'center'
            }}
          >
            <Box>
              <ProgressRing
                progress={85}
                size={120}
                color={theme.palette.primary.main}
              />
              <Typography variant="h6" sx={{ mt: 2, fontWeight: 600 }}>
                CPU Usage
              </Typography>
              <Typography variant="body2" color="text.secondary">
                85% Average
              </Typography>
            </Box>
            
            <Box>
              <ProgressRing
                progress={67}
                size={120}
                color={theme.palette.success.main}
              />
              <Typography variant="h6" sx={{ mt: 2, fontWeight: 600 }}>
                Memory Usage
              </Typography>
              <Typography variant="body2" color="text.secondary">
                67% Average
              </Typography>
            </Box>
            
            <Box>
              <ProgressRing
                progress={92}
                size={120}
                color={theme.palette.warning.main}
              />
              <Typography variant="h6" sx={{ mt: 2, fontWeight: 600 }}>
                Network I/O
              </Typography>
              <Typography variant="body2" color="text.secondary">
                92% Peak
              </Typography>
            </Box>
          </Box>
        </Box>
      </AnimatedCard>

      {/* Success Message */}
      <AnimatedCard variant="slideInRight" delay={0.8}>
        <Box
          sx={{
            mt: 6,
            p: 3,
            textAlign: 'center',
            background: `linear-gradient(135deg, ${theme.palette.success.main}20, ${theme.palette.success.main}10)`,
            border: `1px solid ${theme.palette.success.main}40`,
            borderRadius: 3
          }}
        >
          <Typography variant="h5" sx={{ color: theme.palette.success.main, fontWeight: 600, mb: 1 }}>
            ✨ Micro-Interactions Successfully Integrated!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your dashboard now features smooth animations, hover effects, and professional polish.
          </Typography>
        </Box>
      </AnimatedCard>
    </Container>
  );
};

const SimpleEnhancedApp: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={professionalSecurityTheme}>
        <CssBaseline />
        <Box
          sx={{
            minHeight: '100vh',
            background: `
              radial-gradient(circle at 20% 20%, rgba(30, 58, 138, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(30, 64, 175, 0.2) 0%, transparent 50%),
              linear-gradient(135deg, #0f172a 0%, #0c1426 100%)
            `
          }}
        >
          <Suspense fallback={<LoadingFallback />}>
            <OperatorProvider>
              <LiveDashboardProvider>
                <Router>
                  <Routes>
                    <Route path="/*" element={<SimpleDashboard />} />
                  </Routes>
                </Router>
              </LiveDashboardProvider>
            </OperatorProvider>
          </Suspense>
        </Box>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default SimpleEnhancedApp;
