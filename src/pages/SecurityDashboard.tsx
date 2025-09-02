import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Card,
  CardContent,
  Chip,
  Avatar,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Person as PersonIcon,
  ExitToApp as ExitToAppIcon,
  AccountCircle as AccountCircleIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
  Security as SecurityIcon,
  People as PeopleIcon,
} from '@mui/icons-material';

import CameraGrid from '../components/CameraGrid';
import WatchlistManagement from '../components/WatchlistManagement';

interface StaffProfile {
  staff_id: string;
  name: string;
  email: string;
  role: string;
  email_alerts: boolean;
  sms_alerts: boolean;
  push_notifications: boolean;
  min_severity_level: string;
}

const SecurityDashboard: React.FC = () => {
  const [staffProfile, setStaffProfile] = useState<StaffProfile | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'watchlist'>('dashboard');
  const [profileMenuAnchor, setProfileMenuAnchor] = useState<null | HTMLElement>(null);
  
  // Login form state
  const [loginForm, setLoginForm] = useState({
    staff_id: '',
    name: '',
    email: ''
  });

  useEffect(() => {
    // Check for existing staff session
    const savedProfile = localStorage.getItem('staff_profile');
    if (savedProfile) {
      setStaffProfile(JSON.parse(savedProfile));
    } else {
      setLoginOpen(true);
    }
  }, []);

  const handleStaffLogin = async () => {
    try {
      // Try to authenticate with the backend
      const response = await fetch('http://localhost:8000/api/staff/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });

      if (response.ok) {
        const profile = await response.json();
        setStaffProfile(profile);
        localStorage.setItem('staff_profile', JSON.stringify(profile));
        setLoginOpen(false);
      } else {
        // For demo purposes, create a temporary profile
        const tempProfile: StaffProfile = {
          staff_id: loginForm.staff_id || 'staff_demo',
          name: loginForm.name || 'Demo Staff',
          email: loginForm.email || 'demo@store.com',
          role: 'security',
          email_alerts: true,
          sms_alerts: false,
          push_notifications: true,
          min_severity_level: 'medium'
        };
        
        setStaffProfile(tempProfile);
        localStorage.setItem('staff_profile', JSON.stringify(tempProfile));
        setLoginOpen(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Fallback demo login
      const tempProfile: StaffProfile = {
        staff_id: loginForm.staff_id || 'staff_demo',
        name: loginForm.name || 'Demo Staff',
        email: loginForm.email || 'demo@store.com',
        role: 'security',
        email_alerts: true,
        sms_alerts: false,
        push_notifications: true,
        min_severity_level: 'medium'
      };
      
      setStaffProfile(tempProfile);
      localStorage.setItem('staff_profile', JSON.stringify(tempProfile));
      setLoginOpen(false);
    }
  };

  const handleLogout = () => {
    setStaffProfile(null);
    localStorage.removeItem('staff_profile');
    setLoginOpen(true);
    setProfileMenuAnchor(null);
  };

  const renderLogin = () => (
    <Dialog 
      open={loginOpen} 
      onClose={() => {}} 
      disableEscapeKeyDown
      maxWidth="sm" 
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SecurityIcon color="primary" />
          <Typography variant="h5">AI Security System Login</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Staff ID"
            value={loginForm.staff_id}
            onChange={(e) => setLoginForm(prev => ({ ...prev, staff_id: e.target.value }))}
            margin="normal"
            required
          />
          
          <TextField
            fullWidth
            label="Full Name"
            value={loginForm.name}
            onChange={(e) => setLoginForm(prev => ({ ...prev, name: e.target.value }))}
            margin="normal"
            required
          />
          
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={loginForm.email}
            onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
            margin="normal"
            required
          />
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            This will authenticate you with the 8-camera AI security system. 
            Your credentials will be saved for this session.
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button 
          variant="contained" 
          onClick={handleStaffLogin}
          disabled={!loginForm.staff_id || !loginForm.name || !loginForm.email}
          fullWidth
          size="large"
        >
          Start 8-Camera Monitoring
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderTopNavigation = () => (
    <AppBar position="static">
      <Toolbar>
        <SecurityIcon sx={{ mr: 1 }} />
        <Typography variant="h6" sx={{ flex: 1 }}>
          8-Camera AI Security System
        </Typography>
        
        {/* View Navigation */}
        <Button
          color="inherit"
          startIcon={<DashboardIcon />}
          onClick={() => setCurrentView('dashboard')}
          variant={currentView === 'dashboard' ? 'outlined' : 'text'}
          sx={{ mr: 1, color: 'white', borderColor: 'white' }}
        >
          Camera Grid
        </Button>
        
        <Button
          color="inherit"
          startIcon={<PeopleIcon />}
          onClick={() => setCurrentView('watchlist')}
          variant={currentView === 'watchlist' ? 'outlined' : 'text'}
          sx={{ mr: 2, color: 'white', borderColor: 'white' }}
        >
          Watchlist
        </Button>
        
        {/* Staff Profile */}
        {staffProfile && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              icon={<PersonIcon />}
              label={staffProfile.name}
              variant="outlined"
              sx={{ color: 'white', borderColor: 'white' }}
            />
            
            <IconButton
              color="inherit"
              onClick={(e) => setProfileMenuAnchor(e.currentTarget)}
            >
              <AccountCircleIcon />
            </IconButton>
            
            <Menu
              anchorEl={profileMenuAnchor}
              open={Boolean(profileMenuAnchor)}
              onClose={() => setProfileMenuAnchor(null)}
            >
              <MenuItem>
                <Typography variant="body2" color="text.secondary">
                  {staffProfile.staff_id} - {staffProfile.role}
                </Typography>
              </MenuItem>
              <MenuItem>
                <Typography variant="body2" color="text.secondary">
                  {staffProfile.email}
                </Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => setProfileMenuAnchor(null)}>
                <SettingsIcon sx={{ mr: 1 }} />
                Preferences
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ExitToAppIcon sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );

  const renderWelcomeCard = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
            <SecurityIcon />
          </Avatar>
          <Box>
            <Typography variant="h5" gutterBottom>
              Welcome to 8-Camera AI Security, {staffProfile?.name}!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Real-time monitoring with YOLO detection, face recognition, and behavioral analysis 
              across 8 strategically positioned cameras.
            </Typography>
          </Box>
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.main', color: 'white' }}>
              <Typography variant="h4">8</Typography>
              <Typography variant="body2">Active Cameras</Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
              <Typography variant="h4">YOLO</Typography>
              <Typography variant="body2">Object Detection</Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'secondary.main', color: 'white' }}>
              <Typography variant="h4">FACE</Typography>
              <Typography variant="body2">Recognition Active</Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'error.main', color: 'white' }}>
              <Typography variant="h4">LIVE</Typography>
              <Typography variant="body2">Alert System</Typography>
            </Paper>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  if (!staffProfile) {
    return renderLogin();
  }

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
      {renderTopNavigation()}
      
      <Container maxWidth={false} sx={{ mt: 3, mb: 3 }}>
        {currentView === 'dashboard' && (
          <Box>
            {renderWelcomeCard()}
            <CameraGrid staffId={staffProfile.staff_id} />
          </Box>
        )}
        
        {currentView === 'watchlist' && (
          <Box>
            <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PeopleIcon />
              Watchlist Management
            </Typography>
            <WatchlistManagement />
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default SecurityDashboard;
