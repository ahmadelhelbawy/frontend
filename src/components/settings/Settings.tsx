import React from 'react';
import {
  Box,
  Typography,
  Paper
} from '@mui/material';

const Settings: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      
      <Paper sx={{ p: 3, minHeight: 400 }}>
        <Typography variant="h6" gutterBottom>
          Application Settings
        </Typography>
        <Typography color="textSecondary">
          General application settings and preferences
        </Typography>
      </Paper>
    </Box>
  );
};

export default Settings;