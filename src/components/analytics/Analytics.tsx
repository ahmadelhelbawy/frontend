import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import BehavioralTrendsChart from './BehavioralTrendsChart';
import StoreHeatmap from './StoreHeatmap';
import HistoricalDataBrowser from './HistoricalDataBrowser';
import BusinessIntelligenceDashboard from './BusinessIntelligenceDashboard';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`analytics-tabpanel-${index}`}
    aria-labelledby={`analytics-tab-${index}`}
  >
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

const Analytics: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Analytics & Reporting
      </Typography>
      
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="analytics tabs">
            <Tab label="Business Intelligence" id="analytics-tab-0" />
            <Tab label="Behavioral Trends" id="analytics-tab-1" />
            <Tab label="Store Heatmap" id="analytics-tab-2" />
            <Tab label="Historical Data" id="analytics-tab-3" />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <BusinessIntelligenceDashboard />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <BehavioralTrendsChart />
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <StoreHeatmap />
        </TabPanel>
        
        <TabPanel value={tabValue} index={3}>
          <HistoricalDataBrowser />
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default Analytics;