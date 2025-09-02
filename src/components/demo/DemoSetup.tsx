import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Chip,
  useTheme,
  alpha
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Security as SecurityIcon,
  Psychology as AIIcon,
  Videocam as CameraIcon
} from '@mui/icons-material';

interface DemoSetupProps {
  onStartDemo: (demoType: string) => void;
}

const DemoSetup: React.FC<DemoSetupProps> = ({ onStartDemo }) => {
  const theme = useTheme();

  const demoOptions = [
    {
      id: 'nasa-mission-control',
      title: 'NASA Mission Control Dashboard',
      description: 'Professional security operator interface with simplified controls',
      features: [
        'Large camera wall (80% of screen)',
        'Simple Green/Yellow/Red indicators',
        'Airport departure board style alerts',
        'Basic person tracking display',
        'Full-screen critical alerts'
      ],
      audience: 'Security Operators (Non-Technical)',
      color: '#00a8ff'
    },
    {
      id: 'modern-security',
      title: 'Modern Security Dashboard',
      description: 'Advanced interface showcasing AI capabilities',
      features: [
        'AI insights sidebar',
        'Customer behavior analytics',
        'Real-time person tracking',
        'Modern glassmorphism design',
        'Professional control room aesthetics'
      ],
      audience: 'Security Professionals',
      color: '#00ff9d'
    }
  ];

  return (
    <Box
      sx={{
        height: '100vh',
        background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1f2e 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4
      }}
    >
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(45deg, #00a8ff, #00ff9d)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            mb: 3,
            boxShadow: '0 0 30px rgba(0,168,255,0.5)'
          }}
        >
          <SecurityIcon sx={{ color: '#ffffff', fontSize: 40 }} />
        </Box>
        
        <Typography
          variant="h2"
          sx={{
            color: '#ffffff',
            fontWeight: 700,
            letterSpacing: '2px',
            mb: 2,
            textShadow: '0 0 20px rgba(0,168,255,0.5)'
          }}
        >
          AI SECURITY SYSTEM DEMO
        </Typography>
        
        <Typography
          variant="h6"
          sx={{
            color: alpha('#ffffff', 0.8),
            fontFamily: 'monospace',
            letterSpacing: '3px',
            mb: 1
          }}
        >
          YOLO11 • CNN+TRANSFORMER+LSTM • MULTIMODAL AI
        </Typography>
        
        <Chip
          label="READY FOR BACKEND CONNECTION"
          sx={{
            backgroundColor: alpha('#00ff9d', 0.2),
            color: '#00ff9d',
            border: `1px solid #00ff9d`,
            fontWeight: 700,
            letterSpacing: '1px'
          }}
        />
      </Box>

      {/* Demo Options */}
      <Grid container spacing={4} maxWidth={1200}>
        {demoOptions.map((demo) => (
          <Grid item xs={12} md={6} key={demo.id}>
            <Paper
              elevation={0}
              sx={{
                height: 400,
                background: `linear-gradient(135deg, ${alpha(demo.color, 0.1)} 0%, ${alpha(demo.color, 0.05)} 100%)`,
                border: `2px solid ${alpha(demo.color, 0.3)}`,
                borderRadius: 3,
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                '&:hover': {
                  border: `2px solid ${demo.color}`,
                  boxShadow: `0 0 30px ${alpha(demo.color, 0.3)}`,
                  transform: 'translateY(-5px)'
                }
              }}
            >
              {/* Demo Header */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h4"
                  sx={{
                    color: demo.color,
                    fontWeight: 700,
                    mb: 1,
                    textShadow: `0 0 10px ${alpha(demo.color, 0.5)}`
                  }}
                >
                  {demo.title}
                </Typography>
                
                <Typography
                  variant="body1"
                  sx={{
                    color: alpha('#ffffff', 0.9),
                    mb: 2
                  }}
                >
                  {demo.description}
                </Typography>
                
                <Chip
                  label={demo.audience}
                  size="small"
                  sx={{
                    backgroundColor: alpha(demo.color, 0.2),
                    color: demo.color,
                    border: `1px solid ${demo.color}`,
                    fontWeight: 600
                  }}
                />
              </Box>

              {/* Features List */}
              <Box sx={{ flex: 1, mb: 3 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: '#ffffff',
                    fontWeight: 600,
                    mb: 2
                  }}
                >
                  Key Features:
                </Typography>
                
                {demo.features.map((feature, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 1
                    }}
                  >
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        backgroundColor: demo.color,
                        boxShadow: `0 0 8px ${alpha(demo.color, 0.5)}`
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        color: alpha('#ffffff', 0.8),
                        fontSize: '0.9rem'
                      }}
                    >
                      {feature}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Launch Button */}
              <Button
                variant="contained"
                size="large"
                startIcon={<PlayIcon />}
                onClick={() => onStartDemo(demo.id)}
                sx={{
                  backgroundColor: demo.color,
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  letterSpacing: '1px',
                  boxShadow: `0 0 20px ${alpha(demo.color, 0.5)}`,
                  '&:hover': {
                    backgroundColor: demo.color,
                    boxShadow: `0 0 30px ${alpha(demo.color, 0.8)}`,
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                Launch Demo
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Footer Info */}
      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Typography
          variant="body2"
          sx={{
            color: alpha('#ffffff', 0.6),
            mb: 2
          }}
        >
          These demos showcase the UI components ready for connection to your trained AI models
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AIIcon sx={{ color: '#00a8ff', fontSize: 20 }} />
            <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.7) }}>
              AI Models Ready
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CameraIcon sx={{ color: '#00ff9d', fontSize: 20 }} />
            <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.7) }}>
              CCTV Integration Ready
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DemoSetup;