/**
 * Dashboard - Base dashboard component
 * Essential foundation component for the surveillance system
 */

import React from 'react';
import { Box, Typography, Container } from '@mui/material';

interface DashboardProps {
  title?: string;
  children?: React.ReactNode;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  title = "AI Surveillance Dashboard", 
  children 
}) => {
  return (
    <Container maxWidth={false} sx={{ height: '100vh', bgcolor: '#0f172a' }}>
      <Box sx={{ p: 3, height: '100%' }}>
        <Typography 
          variant="h4" 
          sx={{ 
            color: 'white', 
            mb: 3, 
            fontWeight: 700,
            textAlign: 'center'
          }}
        >
          {title}
        </Typography>
        
        <Box sx={{ height: 'calc(100% - 80px)' }}>
          {children}
        </Box>
      </Box>
    </Container>
  );
};

export default Dashboard;