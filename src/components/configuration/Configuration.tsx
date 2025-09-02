import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import CameraConfiguration from './CameraConfiguration';
import AlertSettings from './AlertSettings';
import NotificationSettings from './NotificationSettings';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`config-tabpanel-${index}`}
    aria-labelledby={`config-tab-${index}`}
  >
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

const Configuration: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Configuration Management
      </Typography>
      
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="configuration tabs">
            <Tab label="Camera Configuration" id="config-tab-0" />
            <Tab label="Alert Settings" id="config-tab-1" />
            <Tab label="Notifications" id="config-tab-2" />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <CameraConfiguration />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <AlertSettings />
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <NotificationSettings />
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default Configuration;