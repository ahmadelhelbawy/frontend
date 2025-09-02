import React from 'react';
import { Box, Paper, Typography } from '@mui/material';

interface ModernCameraFeedProps {
  camera: any;
  detections?: any[];
  streamUrl?: string;
  isSelected?: boolean;
  onSelect?: () => void;
}

const ModernCameraFeed: React.FC<ModernCameraFeedProps> = ({
  camera,
  detections = [],
  streamUrl,
  isSelected = false,
  onSelect
}) => {
  return (
    <Paper
      elevation={isSelected ? 8 : 2}
      onClick={onSelect}
      sx={{
        height: '100%',
        minHeight: 250,
        background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(26,31,46,0.8) 100%)',
        border: `2px solid ${isSelected ? '#00a8ff' : '#333'}`,
        borderRadius: 3,
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Box sx={{ textAlign: 'center', color: '#ffffff' }}>
        <Typography variant="h6">{camera?.name || 'Camera Feed'}</Typography>
        <Typography variant="body2" sx={{ opacity: 0.7 }}>
          {camera?.location || 'Loading...'}
        </Typography>
      </Box>
    </Paper>
  );
};

export default ModernCameraFeed;