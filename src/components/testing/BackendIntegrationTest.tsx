import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Typography
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';

const BackendIntegrationTest = () => {
  const [testResults, setTestResults] = useState({
    healthCheck: { status: 'pending', data: null },
    gpuHealth: { status: 'pending', data: null },
    cameras: { status: 'pending', data: null },
    detections: { status: 'pending', data: null },
    alerts: { status: 'pending', data: null },
    dashboard: { status: 'pending', data: null },
    websocket: { status: 'pending', data: null }
  });
  const [isTesting, setIsTesting] = useState(false);

  const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8001';

  const runIntegrationTests = async () => {
    setIsTesting(true);
    const results = { ...testResults };

    try {
      // Test 1: Health check
      try {
        const healthResponse = await fetch(`${BASE_URL}/health`);
        const healthData = await healthResponse.json();
        results.healthCheck = {
          status: healthData.status === 'healthy' ? 'success' : 'error',
          data: healthData
        };
      } catch (error) {
        results.healthCheck = { status: 'error', data: error instanceof Error ? error.message : String(error) };
      }

      // Test 2: GPU health check
      try {
        const gpuResponse = await fetch(`${BASE_URL}/api/v1/health/gpu`);
        const gpuData = await gpuResponse.json();
        results.gpuHealth = {
          status: gpuData.status === 'healthy' ? 'success' : 'warning',
          data: gpuData
        };
      } catch (error) {
        results.gpuHealth = { status: 'error', data: error instanceof Error ? error.message : String(error) };
      }

      // Test 3: Cameras
      try {
        const camerasResponse = await fetch(`${BASE_URL}/api/v1/cameras`);
        const camerasData = await camerasResponse.json();
        results.cameras = {
          status: camerasResponse.ok ? 'success' : 'error',
          data: camerasData
        };
      } catch (error) {
        results.cameras = { status: 'error', data: error instanceof Error ? error.message : String(error) };
      }

      // Test 4: Detections
      try {
        const detectionsResponse = await fetch(`${BASE_URL}/api/v1/detections?limit=5`);
        const detectionsData = await detectionsResponse.json();
        results.detections = {
          status: detectionsResponse.ok ? 'success' : 'error',
          data: detectionsData
        };
      } catch (error) {
        results.detections = { status: 'error', data: error instanceof Error ? error.message : String(error) };
      }

      // Test 5: Alerts
      try {
        const alertsResponse = await fetch(`${BASE_URL}/api/v1/detections/alerts`);
        const alertsData = await alertsResponse.json();
        results.alerts = {
          status: alertsResponse.ok ? 'success' : 'error',
          data: alertsData
        };
      } catch (error) {
        results.alerts = { status: 'error', data: error instanceof Error ? error.message : String(error) };
      }

      // Test 6: Dashboard summary
      try {
        const dashboardResponse = await fetch(`${BASE_URL}/api/v1/dashboard/summary`);
        const dashboardData = await dashboardResponse.json();
        results.dashboard = {
          status: dashboardResponse.ok ? 'success' : 'error',
          data: dashboardData
        };
      } catch (error) {
        results.dashboard = { status: 'error', data: error instanceof Error ? error.message : String(error) };
      }

      // Test 7: WebSocket connection
      try {
        const protocol = BASE_URL.startsWith('https') ? 'wss:' : 'ws:';
        const host = new URL(BASE_URL).host;
        const wsUrl = `${protocol}//${host}/api/v1/dashboard/ws/live`;
        
        const ws = new WebSocket(wsUrl);
        
        const wsPromise = new Promise((resolve) => {
          ws.onopen = () => {
            ws.close();
            resolve({ status: 'success', data: 'Connected successfully' });
          };
          
          ws.onerror = (error) => {
            resolve({ status: 'error', data: 'Connection failed' });
          };
          
          setTimeout(() => {
            if (ws.readyState === WebSocket.CONNECTING) {
              ws.close();
              resolve({ status: 'error', data: 'Connection timeout' });
            }
          }, 5000);
        });
        
        results.websocket = await wsPromise as { status: string; data: any; };
      } catch (error) {
        results.websocket = { status: 'error', data: error instanceof Error ? error.message : String(error) };
      }

      setTestResults(results);
    } finally {
      setIsTesting(false);
    }
  };

  const getChipProps = (status: string) => {
    switch (status) {
      case 'success':
        return { icon: <CheckCircleIcon />, label: 'Success', color: 'success' };
      case 'warning':
        return { icon: <WarningIcon />, label: 'Warning', color: 'warning' };
      case 'error':
        return { icon: <ErrorIcon />, label: 'Error', color: 'error' };
      case 'pending':
        return { icon: <InfoIcon />, label: 'Pending', color: 'default' };
      default:
        return { icon: <InfoIcon />, label: 'Unknown', color: 'default' };
    }
  };

  const formatData = (data: any) => {
    if (!data) return 'No data';
    if (typeof data === 'string') return data;
    if (typeof data === 'object') {
      return JSON.stringify(data, null, 2);
    }
    return String(data);
  };

  useEffect(() => {
    // Run tests automatically when component mounts
    runIntegrationTests();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Backend Integration Test
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Testing connection to AI Shoplifting Detection backend services
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Button
          variant="contained"
          onClick={runIntegrationTests}
          disabled={isTesting}
          startIcon={isTesting ? <CircularProgress size={20} /> : null}
        >
          {isTesting ? 'Running Tests...' : 'Run Integration Tests'}
        </Button>
      </Box>

      <Grid container spacing={3}>
        {Object.entries(testResults).map(([testName, result]) => (
          <Grid item xs={12} md={6} key={testName}>
            <Card>
              <CardHeader
                title={testName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                action={
                  <Chip
                    {...getChipProps(result.status)}
                    size="small"
                    variant="outlined"
                  />
                }
              />
              <Divider />
              <CardContent>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Status: {result.status}
                </Typography>
                {result.data && (
                  <Box sx={{ maxHeight: 200, overflow: 'auto', p: 1, bgcolor: 'grey.900', borderRadius: 1 }}>
                    <Typography variant="caption" component="pre" sx={{ color: 'grey.300' }}>
                      {formatData(result.data)}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.900', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          Backend Connection Information
        </Typography>
        <Typography variant="body2">
          API Base URL: {BASE_URL}
        </Typography>
        <Typography variant="body2">
          WebSocket URL: {BASE_URL.replace('http', 'ws').replace('https', 'wss')}/api/v1/dashboard/ws/live
        </Typography>
      </Box>
    </Container>
  );
};

export default BackendIntegrationTest;