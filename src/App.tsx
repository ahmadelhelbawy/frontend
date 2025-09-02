import React, { Suspense } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { OperatorProvider } from './contexts/OperatorContext';
import { LiveDashboardProvider } from './contexts/LiveDashboardContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingFallback from './components/common/LoadingFallback';
import OptimizedSecurityDashboard from './components/dashboard/OptimizedSecurityDashboard';
import SecurityDashboard from './pages/SecurityDashboard';

const professionalSecurityTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1e3a8a',      // Deep blue
      light: '#3b82f6',     // Bright blue
      dark: '#1e40af'       // Medium blue
    },
    secondary: {
      main: '#334155',      // Blue-gray
      light: '#475569',     // Light blue-gray
      dark: '#1e293b'       // Dark blue-gray
    },
    success: {
      main: '#10b981',      // Professional green
      light: '#34d399',
      dark: '#059669'
    },
    warning: {
      main: '#f59e0b',      // Professional amber
      light: '#fbbf24',
      dark: '#d97706'
    },
    error: {
      main: '#ef4444',      // Professional red
      light: '#f87171',
      dark: '#dc2626'
    },
    info: {
      main: '#3b82f6',      // Blue
      light: '#60a5fa',
      dark: '#2563eb'
    },
    background: {
      default: '#0f172a',   // Very dark blue-gray
      paper: '#1e293b'      // Dark blue-gray
    },
    text: {
      primary: '#f8fafc',   // Off-white
      secondary: '#cbd5e1'  // Light gray
    },
    divider: '#475569'      // Border gray
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
  shape: { borderRadius: 8 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: `
            radial-gradient(circle at 20% 20%, rgba(30, 58, 138, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(30, 64, 175, 0.2) 0%, transparent 50%),
            linear-gradient(135deg, #0f172a 0%, #0c1426 100%)
          `
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(30, 41, 59, 0.8)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(71, 85, 105, 0.3)'
        }
      }
    }
  }
});

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={professionalSecurityTheme}>
        <CssBaseline />
        <Suspense fallback={<LoadingFallback />}>
          <OperatorProvider>
            <LiveDashboardProvider>
              <Router>
                <Routes>
                  <Route path="/8camera" element={<SecurityDashboard />} />
                  <Route path="/*" element={<OptimizedSecurityDashboard />} />
                </Routes>
              </Router>
            </LiveDashboardProvider>
          </OperatorProvider>
        </Suspense>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;