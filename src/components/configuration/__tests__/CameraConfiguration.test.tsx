import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CameraConfiguration from '../CameraConfiguration';

// Mock API service
jest.mock('../../../services/apiService', () => ({
  apiService: {
    get: jest.fn().mockRejectedValue(new Error('API not available')),
    put: jest.fn().mockResolvedValue({})
  }
}));

// Mock canvas context
const mockGetContext = jest.fn(() => ({
  clearRect: jest.fn(),
  fillRect: jest.fn(),
  strokeRect: jest.fn(),
  fillText: jest.fn(),
  strokeStyle: '',
  fillStyle: '',
  lineWidth: 1,
  font: ''
}));

Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: mockGetContext
});

describe('CameraConfiguration Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders camera configuration title', () => {
    render(<CameraConfiguration />);
    expect(screen.getByText('Camera Configuration')).toBeInTheDocument();
  });

  test('renders camera selection dropdown', async () => {
    render(<CameraConfiguration />);
    
    await waitFor(() => {
      expect(screen.getByLabelText('Camera')).toBeInTheDocument();
    });
  });

  test('renders camera settings controls', async () => {
    render(<CameraConfiguration />);
    
    await waitFor(() => {
      expect(screen.getByText('Camera Settings')).toBeInTheDocument();
      expect(screen.getByLabelText('Resolution')).toBeInTheDocument();
      expect(screen.getByLabelText('Frame Rate (FPS)')).toBeInTheDocument();
      expect(screen.getByText('Night Vision')).toBeInTheDocument();
      expect(screen.getByText('Motion Detection')).toBeInTheDocument();
      expect(screen.getByText('Recording Enabled')).toBeInTheDocument();
    });
  });

  test('renders detection zones section', async () => {
    render(<CameraConfiguration />);
    
    await waitFor(() => {
      expect(screen.getByText('Detection Zones')).toBeInTheDocument();
      expect(screen.getByText('Save Configuration')).toBeInTheDocument();
    });
  });

  test('renders canvas for zone drawing', async () => {
    render(<CameraConfiguration />);
    
    await waitFor(() => {
      const canvas = screen.getByRole('img', { hidden: true });
      expect(canvas).toBeInTheDocument();
    });
  });

  test('can change camera resolution', async () => {
    render(<CameraConfiguration />);
    
    await waitFor(() => {
      const resolutionSelect = screen.getByLabelText('Resolution');
      fireEvent.mouseDown(resolutionSelect);
      
      const hdOption = screen.getByText('1280x720 (HD)');
      fireEvent.click(hdOption);
      
      expect(screen.getByDisplayValue('1280x720')).toBeInTheDocument();
    });
  });

  test('can toggle night vision', async () => {
    render(<CameraConfiguration />);
    
    await waitFor(() => {
      const nightVisionSwitch = screen.getByRole('checkbox', { name: /night vision/i });
      expect(nightVisionSwitch).toBeChecked();
      
      fireEvent.click(nightVisionSwitch);
      expect(nightVisionSwitch).not.toBeChecked();
    });
  });

  test('can adjust alert threshold', async () => {
    render(<CameraConfiguration />);
    
    await waitFor(() => {
      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: 80 } });
      
      expect(screen.getByText('Alert Threshold: 80%')).toBeInTheDocument();
    });
  });

  test('displays configured zones', async () => {
    render(<CameraConfiguration />);
    
    await waitFor(() => {
      expect(screen.getByText('Configured Zones')).toBeInTheDocument();
      expect(screen.getByText('Entry Zone')).toBeInTheDocument();
    });
  });

  test('can save configuration', async () => {
    const { apiService } = require('../../../services/apiService');
    
    render(<CameraConfiguration />);
    
    await waitFor(() => {
      const saveButton = screen.getByText('Save Configuration');
      fireEvent.click(saveButton);
      
      expect(apiService.put).toHaveBeenCalled();
    });
  });
});