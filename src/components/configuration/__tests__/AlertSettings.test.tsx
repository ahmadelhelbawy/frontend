import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AlertSettings from '../AlertSettings';

// Mock API service
jest.mock('../../../services/apiService', () => ({
  apiService: {
    get: jest.fn().mockRejectedValue(new Error('API not available')),
    put: jest.fn().mockResolvedValue({})
  }
}));

describe('AlertSettings Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders alert settings title', () => {
    render(<AlertSettings />);
    expect(screen.getByText('Alert Thresholds & Sensitivity')).toBeInTheDocument();
  });

  test('renders alert thresholds section', () => {
    render(<AlertSettings />);
    expect(screen.getByText('Alert Thresholds')).toBeInTheDocument();
    expect(screen.getByText('SUSPICIOUS_BEHAVIOR')).toBeInTheDocument();
    expect(screen.getByText('THEFT_DETECTED')).toBeInTheDocument();
    expect(screen.getByText('LOITERING')).toBeInTheDocument();
  });

  test('renders sensitivity settings section', () => {
    render(<AlertSettings />);
    expect(screen.getByText('Sensitivity Settings')).toBeInTheDocument();
    expect(screen.getByText('Global Sensitivity: 75%')).toBeInTheDocument();
  });

  test('renders general settings section', () => {
    render(<AlertSettings />);
    expect(screen.getByText('General Alert Settings')).toBeInTheDocument();
    expect(screen.getByLabelText('Max Alerts per Minute')).toBeInTheDocument();
    expect(screen.getByLabelText('Aggregation Window (seconds)')).toBeInTheDocument();
  });

  test('can toggle alert type enabled state', () => {
    render(<AlertSettings />);
    
    const suspiciousSwitch = screen.getAllByRole('checkbox')[0]; // First switch is for suspicious behavior
    expect(suspiciousSwitch).toBeChecked();
    
    fireEvent.click(suspiciousSwitch);
    expect(suspiciousSwitch).not.toBeChecked();
  });

  test('can adjust confidence threshold', () => {
    render(<AlertSettings />);
    
    const sliders = screen.getAllByRole('slider');
    const confidenceSlider = sliders[0]; // First slider is confidence threshold
    
    fireEvent.change(confidenceSlider, { target: { value: 80 } });
    expect(screen.getByText('Confidence Threshold: 80%')).toBeInTheDocument();
  });

  test('can toggle time-based adjustment', () => {
    render(<AlertSettings />);
    
    const timeBased = screen.getByRole('checkbox', { name: /time-based adjustment/i });
    expect(timeBased).toBeChecked();
    
    fireEvent.click(timeBased);
    expect(timeBased).not.toBeChecked();
  });

  test('can toggle zone-based adjustment', () => {
    render(<AlertSettings />);
    
    const zoneBased = screen.getByRole('checkbox', { name: /zone-based adjustment/i });
    expect(zoneBased).toBeChecked();
    
    fireEvent.click(zoneBased);
    expect(zoneBased).not.toBeChecked();
  });

  test('can change max alerts per minute', () => {
    render(<AlertSettings />);
    
    const maxAlertsInput = screen.getByLabelText('Max Alerts per Minute');
    fireEvent.change(maxAlertsInput, { target: { value: '15' } });
    
    expect(maxAlertsInput).toHaveValue(15);
  });

  test('can toggle predictive alerts', () => {
    render(<AlertSettings />);
    
    const predictiveSwitch = screen.getByRole('checkbox', { name: /predictive alerts/i });
    expect(predictiveSwitch).toBeChecked();
    
    fireEvent.click(predictiveSwitch);
    expect(predictiveSwitch).not.toBeChecked();
  });

  test('save button is disabled initially', () => {
    render(<AlertSettings />);
    
    const saveButton = screen.getByText('Save Settings');
    expect(saveButton).toBeDisabled();
  });

  test('save button becomes enabled after changes', () => {
    render(<AlertSettings />);
    
    // Make a change
    const maxAlertsInput = screen.getByLabelText('Max Alerts per Minute');
    fireEvent.change(maxAlertsInput, { target: { value: '15' } });
    
    const saveButton = screen.getByText('Save Settings');
    expect(saveButton).not.toBeDisabled();
  });

  test('can save settings', async () => {
    const { apiService } = require('../../../services/apiService');
    
    render(<AlertSettings />);
    
    // Make a change to enable save button
    const maxAlertsInput = screen.getByLabelText('Max Alerts per Minute');
    fireEvent.change(maxAlertsInput, { target: { value: '15' } });
    
    const saveButton = screen.getByText('Save Settings');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(apiService.put).toHaveBeenCalledWith('/configuration/alert-settings', expect.any(Object));
    });
  });
});