import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  useTheme
} from '@mui/material';
import { LayoutProvider } from '../../contexts/LayoutContext';
import ProfessionalGridLayoutManager from '../layout/ProfessionalGridLayoutManager';
import MultiMonitorManager from '../layout/MultiMonitorManager';
import { GridLayout } from '../../types/layout';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`layout-tabpanel-${index}`}
      aria-labelledby={`layout-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const LayoutManagerDemo: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);

  // Mock camera data for demonstration
  const mockCameras = [
    {
      id: 'cam-001',
      name: 'Entrance Main',
      streamUrl: '/api/stream/cam-001',
      isActive: true,
      location: 'Front Entrance'
    },
    {
      id: 'cam-002',
      name: 'Electronics Section',
      streamUrl: '/api/stream/cam-002',
      isActive: true,
      location: 'Electronics'
    },
    {
      id: 'cam-003',
      name: 'Checkout Area',
      streamUrl: '/api/stream/cam-003',
      isActive: true,
      location: 'Checkout'
    },
    {
      id: 'cam-004',
      name: 'Storage Room',
      streamUrl: '/api/stream/cam-004',
      isActive: false,
      location: 'Storage'
    },
    {
      id: 'cam-005',
      name: 'Parking Lot',
      streamUrl: '/api/stream/cam-005',
      isActive: true,
      location: 'Exterior'
    },
    {
      id: 'cam-006',
      name: 'Back Exit',
      streamUrl: '/api/stream/cam-006',
      isActive: true,
      location: 'Back Exit'
    },
    {
      id: 'cam-007',
      name: 'Clothing Section',
      streamUrl: '/api/stream/cam-007',
      isActive: true,
      location: 'Clothing'
    },
    {
      id: 'cam-008',
      name: 'Food Court',
      streamUrl: '/api/stream/cam-008',
      isActive: true,
      location: 'Food Court'
    }
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCameraSelect = (cameraId: string) => {
    console.log('Camera selected:', cameraId);
  };

  const handleLayoutChange = (layout: GridLayout) => {
    console.log('Layout changed:', layout);
  };

  return (
    <LayoutProvider>
      <Container maxWidth={false} sx={{ py: 3, height: '100vh' }}>
        <Paper elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="h4" gutterBottom>
              Professional Layout Management System
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Advanced multi-screen surveillance UI with drag-and-drop camera positioning,
              professional grid layouts, and multi-monitor support.
            </Typography>
          </Box>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="layout manager tabs">
              <Tab label="Grid Layout Manager" />
              <Tab label="Multi-Monitor Setup" />
            </Tabs>
          </Box>

          {/* Tab Panels */}
          <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ height: 'calc(100vh - 200px)' }}>
                <ProfessionalGridLayoutManager
                  cameras={mockCameras}
                  onCameraSelect={handleCameraSelect}
                  onLayoutChange={handleLayoutChange}
                />
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <MultiMonitorManager
                onDisplayConfigChange={(config) => {
                  console.log('Display config changed:', config);
                }}
              />
            </TabPanel>
          </Box>
        </Paper>
      </Container>
    </LayoutProvider>
  );
};

export default LayoutManagerDemo;