import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NotificationSettings from '../NotificationSettings';

// Mock API service
jest.mock('../../../services/apiService', () => ({
  apiService: {
    get: jest.fn().mockRejectedValue(new Error('API not available')),
    put: jest.fn().mockResolvedValue({}),
    post: jest.fn().mockResolvedValue({})
  }
}));

describe('NotificationSettings Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders notification settings title', () => {
    render(<NotificationSettings />);
    expect(screen.getByText('Notification Settings')).toBeInTheDocument();
  });

  test('renders email notifications section', () => {
    render(<NotificationSettings />);
    expect(screen.getByText('Email Notifications')).toBeInTheDocument();
  });

  test('renders webhook notifications section', () => {
    render(<NotificationSettings />);
    expect(screen.getByText('Webhook Notifications')).toBeInTheDocument();
  });

  test('renders desktop notifications section', () => {
    render(<NotificationSettings />);
    expect(screen.getByText('Desktop Notifications')).toBeInTheDocument();
  });

  test('renders mobile notifications section', () => {
    render(<NotificationSettings />);
    expect(screen.getByText('Mobile Notifications')).toBeInTheDocument();
  });

  test('can toggle email notifications', () => {
    render(<NotificationSettings />);
    
    const emailSwitch = screen.getAllByRole('checkbox')[0]; // First switch is for email
    expect(emailSwitch).not.toBeChecked();
    
    fireEvent.click(emailSwitch);
    expect(emailSwitch).toBeChecked();
  });

  test('shows email configuration when enabled', () => {
    render(<NotificationSettings />);
    
    const emailSwitch = screen.getAllByRole('checkbox')[0];
    fireEvent.click(emailSwitch);
    
    expect(screen.getByLabelText('SMTP Server')).toBeInTheDocument();
    expect(screen.getByLabelText('Port')).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  test('can toggle webhook notifications', () => {
    render(<NotificationSettings />);
    
    const webhookSwitch = screen.getAllByRole('checkbox')[1]; // Second switch is for webhooks
    expect(webhookSwitch).not.toBeChecked();
    
    fireEvent.click(webhookSwitch);
    expect(webhookSwitch).toBeChecked();
  });

  test('can add email recipient', () => {
    render(<NotificationSettings />);
    
    // Enable email notifications first
    const emailSwitch = screen.getAllByRole('checkbox')[0];
    fireEvent.click(emailSwitch);
    
    const addButton = screen.getByText('Add');
    fireEvent.click(addButton);
    
    expect(screen.getByText('Add Email Recipient')).toBeInTheDocument();
  });

  test('can add webhook endpoint', () => {
    render(<NotificationSettings />);
    
    // Enable webhook notifications first
    const webhookSwitch = screen.getAllByRole('checkbox')[1];
    fireEvent.click(webhookSwitch);
    
    const addWebhookButton = screen.getByText('Add Webhook');
    fireEvent.click(addWebhookButton);
    
    expect(screen.getByText('Add Webhook')).toBeInTheDocument();
  });

  test('desktop notifications are enabled by default', () => {
    render(<NotificationSettings />);
    
    const desktopSwitch = screen.getAllByRole('checkbox')[2]; // Third switch is for desktop
    expect(desktopSwitch).toBeChecked();
  });

  test('can toggle desktop notification sound', () => {
    render(<NotificationSettings />);
    
    const soundSwitch = screen.getByRole('checkbox', { name: /sound enabled/i });
    expect(soundSwitch).toBeChecked();
    
    fireEvent.click(soundSwitch);
    expect(soundSwitch).not.toBeChecked();
  });

  test('can toggle mobile notifications', () => {
    render(<NotificationSettings />);
    
    const mobileSwitch = screen.getAllByRole('checkbox')[5]; // Mobile switch
    expect(mobileSwitch).not.toBeChecked();
    
    fireEvent.click(mobileSwitch);
    expect(mobileSwitch).toBeChecked();
  });

  test('shows mobile configuration when enabled', () => {
    render(<NotificationSettings />);
    
    const mobileSwitch = screen.getAllByRole('checkbox')[5];
    fireEvent.click(mobileSwitch);
    
    expect(screen.getByLabelText('Push Service')).toBeInTheDocument();
  });

  test('can change mobile push service', () => {
    render(<NotificationSettings />);
    
    // Enable mobile notifications first
    const mobileSwitch = screen.getAllByRole('checkbox')[5];
    fireEvent.click(mobileSwitch);
    
    const pushServiceSelect = screen.getByLabelText('Push Service');
    fireEvent.mouseDown(pushServiceSelect);
    
    const firebaseOption = screen.getByText('Firebase');
    fireEvent.click(firebaseOption);
    
    expect(screen.getByDisplayValue('firebase')).toBeInTheDocument();
  });

  test('can save notification settings', async () => {
    const { apiService } = require('../../../services/apiService');
    
    render(<NotificationSettings />);
    
    const saveButton = screen.getByText('Save Settings');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(apiService.put).toHaveBeenCalledWith('/configuration/notification-settings', expect.any(Object));
    });
  });

  test('can test email configuration', async () => {
    const { apiService } = require('../../../services/apiService');
    
    render(<NotificationSettings />);
    
    // Enable email notifications first
    const emailSwitch = screen.getAllByRole('checkbox')[0];
    fireEvent.click(emailSwitch);
    
    // Add a recipient first (simplified for test)
    const addButton = screen.getByText('Add');
    fireEvent.click(addButton);
    
    // Fill in email details in dialog
    const emailInput = screen.getByLabelText('Email Address');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    const saveEmailButton = screen.getByRole('button', { name: 'Save' });
    fireEvent.click(saveEmailButton);
    
    // Now test email
    const testButton = screen.getByText('Test');
    fireEvent.click(testButton);
    
    await waitFor(() => {
      expect(apiService.post).toHaveBeenCalledWith('/configuration/test-email', expect.any(Object));
    });
  });
});