import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Slider,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Divider,
  Alert,
  Chip
} from '@mui/material';
import {
  Save as SaveIcon,
  RestoreFromTrash as ResetIcon
} from '@mui/icons-material';
import { apiService } from '../../services/apiService';

interface AlertThresholds {
  suspicious_behavior: {
    enabled: boolean;
    confidence_threshold: number;
    duration_threshold: number; // seconds
    cooldown_period: number; // seconds
  };
  theft_detected: {
    enabled: boolean;
    confidence_threshold: number;
    duration_threshold: number;
    cooldown_period: number;
  };
  loitering: {
    enabled: boolean;
    confidence_threshold: number;
    duration_threshold: number; // seconds before triggering
    cooldown_period: number;
  };
}

interface SensitivitySettings {
  global_sensitivity: number;
  time_based_adjustment: {
    enabled: boolean;
    day_sensitivity: number;
    night_sensitivity: number;
    transition_hours: {
      morning: number;
      evening: number;
    };
  };
  zone_based_adjustment: {
    enabled: boolean;
    high_risk_multiplier: number;
    low_risk_multiplier: number;
  };
}

interface AlertSettings {
  thresholds: AlertThresholds;
  sensitivity: SensitivitySettings;
  general: {
    max_alerts_per_minute: number;
    alert_aggregation_window: number; // seconds
    auto_acknowledge_timeout: number; // minutes
    enable_predictive_alerts: boolean;
  };
}

const AlertSettings: React.FC = () => {
  const [settings, setSettings] = useState<AlertSettings>({
    thresholds: {
      suspicious_behavior: {
        enabled: true,
        confidence_threshold: 75,
        duration_threshold: 3,
        cooldown_period: 30
      },
      theft_detected: {
        enabled: true,
        confidence_threshold: 85,
        duration_threshold: 1,
        cooldown_period: 60
      },
      loitering: {
        enabled: true,
        confidence_threshold: 70,
        duration_threshold: 120,
        cooldown_period: 300
      }
    },
    sensitivity: {
      global_sensitivity: 75,
      time_based_adjustment: {
        enabled: true,
        day_sensitivity: 70,
        night_sensitivity: 85,
        transition_hours: {
          morning: 7,
          evening: 19
        }
      },
      zone_based_adjustment: {
        enabled: true,
        high_risk_multiplier: 1.2,
        low_risk_multiplier: 0.8
      }
    },
    general: {
      max_alerts_per_minute: 10,
      alert_aggregation_window: 30,
      auto_acknowledge_timeout: 60,
      enable_predictive_alerts: true
    }
  });

  const [loading, setLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await apiService.get('/configuration/alert-settings') as { data: AlertSettings };
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to load alert settings:', error);
      // Keep default settings if API fails
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await apiService.put('/configuration/alert-settings', settings);
      setSaveMessage('Alert settings saved successfully!');
      setHasChanges(false);
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Failed to save alert settings:', error);
      setSaveMessage('Failed to save alert settings');
      setTimeout(() => setSaveMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    loadSettings();
    setHasChanges(false);
  };

  const updateThreshold = (alertType: keyof AlertThresholds, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      thresholds: {
        ...prev.thresholds,
        [alertType]: {
          ...prev.thresholds[alertType],
          [field]: value
        }
      }
    }));
    setHasChanges(true);
  };

  const updateSensitivity = (field: string, value: any) => {
    const keys = field.split('.');
    if (keys.length === 1) {
      setSettings(prev => ({
        ...prev,
        sensitivity: {
          ...prev.sensitivity,
          [field]: value
        }
      }));
    } else if (keys.length === 2 && keys[0] && keys[1]) {
      setSettings(prev => {
        const currentValue = prev.sensitivity[keys[0] as keyof SensitivitySettings];
        return {
          ...prev,
          sensitivity: {
            ...prev.sensitivity,
            [keys[0] as string]: {
              ...(currentValue as any),
              [keys[1] as string]: value
            }
          }
        };
      });
    } else if (keys.length === 3 && keys[0] && keys[1] && keys[2]) {
      setSettings(prev => {
        const currentValue = prev.sensitivity[keys[0] as keyof SensitivitySettings] as any;
        return {
          ...prev,
          sensitivity: {
            ...prev.sensitivity,
            [keys[0] as string]: {
              ...currentValue,
              [keys[1] as string]: {
                ...(currentValue?.[keys[1]] || {}),
                [keys[2] as string]: value
              }
            }
          }
        };
      });
    }
    setHasChanges(true);
  };

  const updateGeneral = (field: keyof AlertSettings['general'], value: any) => {
    setSettings(prev => ({
      ...prev,
      general: {
        ...prev.general,
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Alert Thresholds & Sensitivity
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<ResetIcon />}
            onClick={handleReset}
            disabled={loading || !hasChanges}
          >
            Reset
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={loading || !hasChanges}
          >
            Save Settings
          </Button>
        </Box>
      </Box>

      {saveMessage && (
        <Alert severity={saveMessage.includes('success') ? 'success' : 'error'} sx={{ mb: 2 }}>
          {saveMessage}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Alert Thresholds */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Alert Thresholds
              </Typography>
              
              {Object.entries(settings.thresholds).map(([alertType, config]) => (
                <Box key={alertType} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                      {alertType.replace('_', ' ').toUpperCase()}
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={config.enabled}
                          onChange={(e) => updateThreshold(alertType as keyof AlertThresholds, 'enabled', e.target.checked)}
                        />
                      }
                      label="Enabled"
                    />
                  </Box>
                  
                  {config.enabled && (
                    <>
                      <Typography gutterBottom>
                        Confidence Threshold: {config.confidence_threshold}%
                      </Typography>
                      <Slider
                        value={config.confidence_threshold}
                        onChange={(_, value) => updateThreshold(alertType as keyof AlertThresholds, 'confidence_threshold', value)}
                        min={0}
                        max={100}
                        valueLabelDisplay="auto"
                        sx={{ mb: 2 }}
                      />
                      
                      <TextField
                        fullWidth
                        size="small"
                        label={alertType === 'loitering' ? 'Duration Before Alert (seconds)' : 'Minimum Duration (seconds)'}
                        type="number"
                        value={config.duration_threshold}
                        onChange={(e) => updateThreshold(alertType as keyof AlertThresholds, 'duration_threshold', parseInt(e.target.value))}
                        sx={{ mb: 2 }}
                      />
                      
                      <TextField
                        fullWidth
                        size="small"
                        label="Cooldown Period (seconds)"
                        type="number"
                        value={config.cooldown_period}
                        onChange={(e) => updateThreshold(alertType as keyof AlertThresholds, 'cooldown_period', parseInt(e.target.value))}
                      />
                    </>
                  )}
                  
                  {alertType !== 'loitering' && <Divider sx={{ mt: 2 }} />}
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Sensitivity Settings */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Sensitivity Settings
              </Typography>
              
              <Typography gutterBottom>
                Global Sensitivity: {settings.sensitivity.global_sensitivity}%
              </Typography>
              <Slider
                value={settings.sensitivity.global_sensitivity}
                onChange={(_, value) => updateSensitivity('global_sensitivity', value)}
                min={0}
                max={100}
                valueLabelDisplay="auto"
                sx={{ mb: 3 }}
              />
              
              <Divider sx={{ mb: 2 }} />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.sensitivity.time_based_adjustment.enabled}
                    onChange={(e) => updateSensitivity('time_based_adjustment.enabled', e.target.checked)}
                  />
                }
                label="Time-based Adjustment"
                sx={{ mb: 2 }}
              />
              
              {settings.sensitivity.time_based_adjustment.enabled && (
                <Box sx={{ ml: 2, mb: 2 }}>
                  <Typography gutterBottom>
                    Day Sensitivity: {settings.sensitivity.time_based_adjustment.day_sensitivity}%
                  </Typography>
                  <Slider
                    value={settings.sensitivity.time_based_adjustment.day_sensitivity}
                    onChange={(_, value) => updateSensitivity('time_based_adjustment.day_sensitivity', value)}
                    min={0}
                    max={100}
                    valueLabelDisplay="auto"
                    sx={{ mb: 2 }}
                  />
                  
                  <Typography gutterBottom>
                    Night Sensitivity: {settings.sensitivity.time_based_adjustment.night_sensitivity}%
                  </Typography>
                  <Slider
                    value={settings.sensitivity.time_based_adjustment.night_sensitivity}
                    onChange={(_, value) => updateSensitivity('time_based_adjustment.night_sensitivity', value)}
                    min={0}
                    max={100}
                    valueLabelDisplay="auto"
                    sx={{ mb: 2 }}
                  />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Morning Hour"
                        type="number"
                        value={settings.sensitivity.time_based_adjustment.transition_hours.morning}
                        onChange={(e) => updateSensitivity('time_based_adjustment.transition_hours.morning', parseInt(e.target.value))}
                        inputProps={{ min: 0, max: 23 }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Evening Hour"
                        type="number"
                        value={settings.sensitivity.time_based_adjustment.transition_hours.evening}
                        onChange={(e) => updateSensitivity('time_based_adjustment.transition_hours.evening', parseInt(e.target.value))}
                        inputProps={{ min: 0, max: 23 }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}
              
              <Divider sx={{ mb: 2 }} />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.sensitivity.zone_based_adjustment.enabled}
                    onChange={(e) => updateSensitivity('zone_based_adjustment.enabled', e.target.checked)}
                  />
                }
                label="Zone-based Adjustment"
                sx={{ mb: 2 }}
              />
              
              {settings.sensitivity.zone_based_adjustment.enabled && (
                <Box sx={{ ml: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="High Risk Zone Multiplier"
                    type="number"
                    value={settings.sensitivity.zone_based_adjustment.high_risk_multiplier}
                    onChange={(e) => updateSensitivity('zone_based_adjustment.high_risk_multiplier', parseFloat(e.target.value))}
                    inputProps={{ min: 0.1, max: 2.0, step: 0.1 }}
                    sx={{ mb: 2 }}
                  />
                  
                  <TextField
                    fullWidth
                    size="small"
                    label="Low Risk Zone Multiplier"
                    type="number"
                    value={settings.sensitivity.zone_based_adjustment.low_risk_multiplier}
                    onChange={(e) => updateSensitivity('zone_based_adjustment.low_risk_multiplier', parseFloat(e.target.value))}
                    inputProps={{ min: 0.1, max: 2.0, step: 0.1 }}
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* General Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                General Alert Settings
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Max Alerts per Minute"
                    type="number"
                    value={settings.general.max_alerts_per_minute}
                    onChange={(e) => updateGeneral('max_alerts_per_minute', parseInt(e.target.value))}
                    inputProps={{ min: 1, max: 100 }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Aggregation Window (seconds)"
                    type="number"
                    value={settings.general.alert_aggregation_window}
                    onChange={(e) => updateGeneral('alert_aggregation_window', parseInt(e.target.value))}
                    inputProps={{ min: 1, max: 300 }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Auto Acknowledge (minutes)"
                    type="number"
                    value={settings.general.auto_acknowledge_timeout}
                    onChange={(e) => updateGeneral('auto_acknowledge_timeout', parseInt(e.target.value))}
                    inputProps={{ min: 0, max: 1440 }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.general.enable_predictive_alerts}
                        onChange={(e) => updateGeneral('enable_predictive_alerts', e.target.checked)}
                      />
                    }
                    label="Predictive Alerts"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AlertSettings;