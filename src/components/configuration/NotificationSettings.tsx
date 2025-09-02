import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  PlayArrow as TestIcon
} from '@mui/icons-material';
import { apiService } from '../../services/apiService';

interface EmailNotification {
  id: string;
  email: string;
  name: string;
  alertTypes: string[];
  enabled: boolean;
}

interface WebhookNotification {
  id: string;
  name: string;
  url: string;
  method: 'POST' | 'PUT';
  headers: Record<string, string>;
  alertTypes: string[];
  enabled: boolean;
}

interface NotificationSettings {
  email: {
    enabled: boolean;
    smtp_server: string;
    smtp_port: number;
    username: string;
    password: string;
    use_tls: boolean;
    from_address: string;
    recipients: EmailNotification[];
  };
  webhooks: {
    enabled: boolean;
    endpoints: WebhookNotification[];
  };
  desktop: {
    enabled: boolean;
    sound_enabled: boolean;
    show_preview: boolean;
    alert_types: string[];
  };
  mobile: {
    enabled: boolean;
    push_service: 'firebase' | 'apns' | 'none';
    api_key: string;
    alert_types: string[];
  };
}

const NotificationSettings: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSettings>({
    email: {
      enabled: false,
      smtp_server: '',
      smtp_port: 587,
      username: '',
      password: '',
      use_tls: true,
      from_address: '',
      recipients: []
    },
    webhooks: {
      enabled: false,
      endpoints: []
    },
    desktop: {
      enabled: true,
      sound_enabled: true,
      show_preview: true,
      alert_types: ['theft_detected', 'suspicious_behavior']
    },
    mobile: {
      enabled: false,
      push_service: 'none',
      api_key: '',
      alert_types: ['theft_detected']
    }
  });

  const [loading, setLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [webhookDialogOpen, setWebhookDialogOpen] = useState(false);
  const [editingEmail, setEditingEmail] = useState<EmailNotification | null>(null);
  const [editingWebhook, setEditingWebhook] = useState<WebhookNotification | null>(null);

  const alertTypes = [
    { value: 'theft_detected', label: 'Theft Detected' },
    { value: 'suspicious_behavior', label: 'Suspicious Behavior' },
    { value: 'loitering', label: 'Loitering' }
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await apiService.get('/configuration/notification-settings') as { data: NotificationSettings };
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to load notification settings:', error);
      // Keep default settings if API fails
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await apiService.put('/configuration/notification-settings', settings);
      setSaveMessage('Notification settings saved successfully!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Failed to save notification settings:', error);
      setSaveMessage('Failed to save notification settings');
      setTimeout(() => setSaveMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleTestEmail = async () => {
    try {
      await apiService.post('/configuration/test-email', {
        smtp_server: settings.email.smtp_server,
        smtp_port: settings.email.smtp_port,
        username: settings.email.username,
        password: settings.email.password,
        use_tls: settings.email.use_tls,
        from_address: settings.email.from_address,
        to_address: settings.email.recipients[0]?.email || ''
      });
      setSaveMessage('Test email sent successfully!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage('Failed to send test email');
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleTestWebhook = async (webhook: WebhookNotification) => {
    try {
      await apiService.post('/configuration/test-webhook', {
        url: webhook.url,
        method: webhook.method,
        headers: webhook.headers
      });
      setSaveMessage('Webhook test successful!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage('Webhook test failed');
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleSaveEmail = () => {
    if (!editingEmail) return;

    if (editingEmail.id.startsWith('new-')) {
      setSettings(prev => ({
        ...prev,
        email: {
          ...prev.email,
          recipients: [...prev.email.recipients, { ...editingEmail, id: Date.now().toString() }]
        }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        email: {
          ...prev.email,
          recipients: prev.email.recipients.map(r => r.id === editingEmail.id ? editingEmail : r)
        }
      }));
    }

    setEmailDialogOpen(false);
    setEditingEmail(null);
  };

  const handleSaveWebhook = () => {
    if (!editingWebhook) return;

    if (editingWebhook.id.startsWith('new-')) {
      setSettings(prev => ({
        ...prev,
        webhooks: {
          ...prev.webhooks,
          endpoints: [...prev.webhooks.endpoints, { ...editingWebhook, id: Date.now().toString() }]
        }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        webhooks: {
          ...prev.webhooks,
          endpoints: prev.webhooks.endpoints.map(w => w.id === editingWebhook.id ? editingWebhook : w)
        }
      }));
    }

    setWebhookDialogOpen(false);
    setEditingWebhook(null);
  };

  const handleDeleteEmail = (id: string) => {
    setSettings(prev => ({
      ...prev,
      email: {
        ...prev.email,
        recipients: prev.email.recipients.filter(r => r.id !== id)
      }
    }));
  };

  const handleDeleteWebhook = (id: string) => {
    setSettings(prev => ({
      ...prev,
      webhooks: {
        ...prev.webhooks,
        endpoints: prev.webhooks.endpoints.filter(w => w.id !== id)
      }
    }));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Notification Settings
        </Typography>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={loading}
        >
          Save Settings
        </Button>
      </Box>

      {saveMessage && (
        <Alert severity={saveMessage.includes('success') ? 'success' : 'error'} sx={{ mb: 2 }}>
          {saveMessage}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Email Notifications */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Email Notifications</Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.email.enabled}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        email: { ...prev.email, enabled: e.target.checked }
                      }))}
                    />
                  }
                  label="Enabled"
                />
              </Box>

              {settings.email.enabled && (
                <>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={8}>
                      <TextField
                        fullWidth
                        size="small"
                        label="SMTP Server"
                        value={settings.email.smtp_server}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          email: { ...prev.email, smtp_server: e.target.value }
                        }))}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Port"
                        type="number"
                        value={settings.email.smtp_port}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          email: { ...prev.email, smtp_port: parseInt(e.target.value) }
                        }))}
                      />
                    </Grid>
                  </Grid>

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Username"
                        value={settings.email.username}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          email: { ...prev.email, username: e.target.value }
                        }))}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Password"
                        type="password"
                        value={settings.email.password}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          email: { ...prev.email, password: e.target.value }
                        }))}
                      />
                    </Grid>
                  </Grid>

                  <TextField
                    fullWidth
                    size="small"
                    label="From Address"
                    value={settings.email.from_address}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      email: { ...prev.email, from_address: e.target.value }
                    }))}
                    sx={{ mb: 2 }}
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.email.use_tls}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          email: { ...prev.email, use_tls: e.target.checked }
                        }))}
                      />
                    }
                    label="Use TLS"
                    sx={{ mb: 2 }}
                  />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1">Recipients</Typography>
                    <Box>
                      <Button
                        size="small"
                        startIcon={<TestIcon />}
                        onClick={handleTestEmail}
                        disabled={!settings.email.recipients.length}
                        sx={{ mr: 1 }}
                      >
                        Test
                      </Button>
                      <Button
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => {
                          setEditingEmail({
                            id: 'new-' + Date.now(),
                            email: '',
                            name: '',
                            alertTypes: ['theft_detected'],
                            enabled: true
                          });
                          setEmailDialogOpen(true);
                        }}
                      >
                        Add
                      </Button>
                    </Box>
                  </Box>

                  <List dense>
                    {settings.email.recipients.map(recipient => (
                      <ListItem key={recipient.id}>
                        <ListItemText
                          primary={recipient.name}
                          secondary={
                            <Box>
                              <Typography variant="body2">{recipient.email}</Typography>
                              <Box sx={{ mt: 0.5 }}>
                                {recipient.alertTypes.map(type => (
                                  <Chip key={type} label={type.replace('_', ' ')} size="small" sx={{ mr: 0.5 }} />
                                ))}
                              </Box>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setEditingEmail(recipient);
                              setEmailDialogOpen(true);
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteEmail(recipient.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Webhook Notifications */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Webhook Notifications</Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.webhooks.enabled}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        webhooks: { ...prev.webhooks, enabled: e.target.checked }
                      }))}
                    />
                  }
                  label="Enabled"
                />
              </Box>

              {settings.webhooks.enabled && (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1">Endpoints</Typography>
                    <Button
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => {
                        setEditingWebhook({
                          id: 'new-' + Date.now(),
                          name: '',
                          url: '',
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          alertTypes: ['theft_detected'],
                          enabled: true
                        });
                        setWebhookDialogOpen(true);
                      }}
                    >
                      Add Webhook
                    </Button>
                  </Box>

                  <List dense>
                    {settings.webhooks.endpoints.map(webhook => (
                      <ListItem key={webhook.id}>
                        <ListItemText
                          primary={webhook.name}
                          secondary={
                            <Box>
                              <Typography variant="body2">{webhook.method} {webhook.url}</Typography>
                              <Box sx={{ mt: 0.5 }}>
                                {webhook.alertTypes.map(type => (
                                  <Chip key={type} label={type.replace('_', ' ')} size="small" sx={{ mr: 0.5 }} />
                                ))}
                              </Box>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            size="small"
                            onClick={() => handleTestWebhook(webhook)}
                          >
                            <TestIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setEditingWebhook(webhook);
                              setWebhookDialogOpen(true);
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteWebhook(webhook.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Desktop Notifications */}
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Desktop Notifications</Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.desktop.enabled}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        desktop: { ...prev.desktop, enabled: e.target.checked }
                      }))}
                    />
                  }
                  label="Enabled"
                />
              </Box>

              {settings.desktop.enabled && (
                <>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.desktop.sound_enabled}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          desktop: { ...prev.desktop, sound_enabled: e.target.checked }
                        }))}
                      />
                    }
                    label="Sound Enabled"
                    sx={{ mb: 1 }}
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.desktop.show_preview}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          desktop: { ...prev.desktop, show_preview: e.target.checked }
                        }))}
                      />
                    }
                    label="Show Preview"
                    sx={{ mb: 2 }}
                  />

                  <Typography variant="subtitle2" gutterBottom>
                    Alert Types
                  </Typography>
                  {alertTypes.map(type => (
                    <FormControlLabel
                      key={type.value}
                      control={
                        <Switch
                          checked={settings.desktop.alert_types.includes(type.value)}
                          onChange={(e) => {
                            const newTypes = e.target.checked
                              ? [...settings.desktop.alert_types, type.value]
                              : settings.desktop.alert_types.filter(t => t !== type.value);
                            setSettings(prev => ({
                              ...prev,
                              desktop: { ...prev.desktop, alert_types: newTypes }
                            }));
                          }}
                        />
                      }
                      label={type.label}
                    />
                  ))}
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Mobile Notifications */}
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Mobile Notifications</Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.mobile.enabled}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        mobile: { ...prev.mobile, enabled: e.target.checked }
                      }))}
                    />
                  }
                  label="Enabled"
                />
              </Box>

              {settings.mobile.enabled && (
                <>
                  <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                    <InputLabel>Push Service</InputLabel>
                    <Select
                      value={settings.mobile.push_service}
                      label="Push Service"
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        mobile: { ...prev.mobile, push_service: e.target.value as any }
                      }))}
                    >
                      <MenuItem value="none">None</MenuItem>
                      <MenuItem value="firebase">Firebase</MenuItem>
                      <MenuItem value="apns">Apple Push Notification</MenuItem>
                    </Select>
                  </FormControl>

                  {settings.mobile.push_service !== 'none' && (
                    <TextField
                      fullWidth
                      size="small"
                      label="API Key"
                      type="password"
                      value={settings.mobile.api_key}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        mobile: { ...prev.mobile, api_key: e.target.value }
                      }))}
                      sx={{ mb: 2 }}
                    />
                  )}

                  <Typography variant="subtitle2" gutterBottom>
                    Alert Types
                  </Typography>
                  {alertTypes.map(type => (
                    <FormControlLabel
                      key={type.value}
                      control={
                        <Switch
                          checked={settings.mobile.alert_types.includes(type.value)}
                          onChange={(e) => {
                            const newTypes = e.target.checked
                              ? [...settings.mobile.alert_types, type.value]
                              : settings.mobile.alert_types.filter(t => t !== type.value);
                            setSettings(prev => ({
                              ...prev,
                              mobile: { ...prev.mobile, alert_types: newTypes }
                            }));
                          }}
                        />
                      }
                      label={type.label}
                    />
                  ))}
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Email Dialog */}
      <Dialog open={emailDialogOpen} onClose={() => setEmailDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingEmail?.id.startsWith('new-') ? 'Add Email Recipient' : 'Edit Email Recipient'}
        </DialogTitle>
        <DialogContent>
          {editingEmail && (
            <Box sx={{ pt: 1 }}>
              <TextField
                fullWidth
                label="Name"
                value={editingEmail.name}
                onChange={(e) => setEditingEmail({ ...editingEmail, name: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={editingEmail.email}
                onChange={(e) => setEditingEmail({ ...editingEmail, email: e.target.value })}
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Alert Types</InputLabel>
                <Select
                  multiple
                  value={editingEmail.alertTypes}
                  onChange={(e) => setEditingEmail({ ...editingEmail, alertTypes: e.target.value as string[] })}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value.replace('_', ' ')} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {alertTypes.map(type => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControlLabel
                control={
                  <Switch
                    checked={editingEmail.enabled}
                    onChange={(e) => setEditingEmail({ ...editingEmail, enabled: e.target.checked })}
                  />
                }
                label="Enabled"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmailDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveEmail} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Webhook Dialog */}
      <Dialog open={webhookDialogOpen} onClose={() => setWebhookDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingWebhook?.id.startsWith('new-') ? 'Add Webhook' : 'Edit Webhook'}
        </DialogTitle>
        <DialogContent>
          {editingWebhook && (
            <Box sx={{ pt: 1 }}>
              <TextField
                fullWidth
                label="Name"
                value={editingWebhook.name}
                onChange={(e) => setEditingWebhook({ ...editingWebhook, name: e.target.value })}
                sx={{ mb: 2 }}
              />
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={3}>
                  <FormControl fullWidth>
                    <InputLabel>Method</InputLabel>
                    <Select
                      value={editingWebhook.method}
                      label="Method"
                      onChange={(e) => setEditingWebhook({ ...editingWebhook, method: e.target.value as any })}
                    >
                      <MenuItem value="POST">POST</MenuItem>
                      <MenuItem value="PUT">PUT</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={9}>
                  <TextField
                    fullWidth
                    label="URL"
                    value={editingWebhook.url}
                    onChange={(e) => setEditingWebhook({ ...editingWebhook, url: e.target.value })}
                  />
                </Grid>
              </Grid>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Alert Types</InputLabel>
                <Select
                  multiple
                  value={editingWebhook.alertTypes}
                  onChange={(e) => setEditingWebhook({ ...editingWebhook, alertTypes: e.target.value as string[] })}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value.replace('_', ' ')} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {alertTypes.map(type => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControlLabel
                control={
                  <Switch
                    checked={editingWebhook.enabled}
                    onChange={(e) => setEditingWebhook({ ...editingWebhook, enabled: e.target.checked })}
                  />
                }
                label="Enabled"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWebhookDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveWebhook} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NotificationSettings;