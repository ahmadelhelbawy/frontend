import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const BehavioralTrendsChart: React.FC = () => {
  return (
    <Paper sx={{ p: 2, height: 300 }}>
      <Typography variant="h6" gutterBottom>
        Behavioral Trends
      </Typography>
      <Box sx={{ 
        height: 250, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: 'text.secondary'
      }}>
        Chart Component Loading...
      </Box>
    </Paper>
  );
};

export default BehavioralTrendsChart;