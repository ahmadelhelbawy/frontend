import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StoreHeatmap from '../StoreHeatmap';

// Mock API service
jest.mock('../../../services/apiService', () => ({
  apiService: {
    get: jest.fn().mockRejectedValue(new Error('API not available'))
  }
}));

// Mock canvas context
const mockGetContext = jest.fn(() => ({
  clearRect: jest.fn(),
  strokeRect: jest.fn(),
  fillText: jest.fn(),
  createRadialGradient: jest.fn(() => ({
    addColorStop: jest.fn()
  })),
  beginPath: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  strokeStyle: '',
  fillStyle: '',
  lineWidth: 1,
  font: ''
}));

// Mock HTMLCanvasElement
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: mockGetContext
});

describe('StoreHeatmap Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders heatmap title', () => {
    render(<StoreHeatmap />);
    expect(screen.getByText('Store Layout Heatmap')).toBeInTheDocument();
  });

  test('renders time range selector', () => {
    render(<StoreHeatmap />);
    expect(screen.getByLabelText('Time Range')).toBeInTheDocument();
  });

  test('renders alert type filter', () => {
    render(<StoreHeatmap />);
    expect(screen.getByLabelText('Alert Type')).toBeInTheDocument();
  });

  test('renders show zones toggle', () => {
    render(<StoreHeatmap />);
    expect(screen.getByText('Show Zones')).toBeInTheDocument();
  });

  test('renders intensity slider', () => {
    render(<StoreHeatmap />);
    expect(screen.getByText('Heatmap Intensity')).toBeInTheDocument();
  });

  test('can change time range', async () => {
    render(<StoreHeatmap />);
    
    const timeRangeSelect = screen.getByLabelText('Time Range');
    fireEvent.mouseDown(timeRangeSelect);
    
    const sevenDaysOption = screen.getByText('Last 7 Days');
    fireEvent.click(sevenDaysOption);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('7d')).toBeInTheDocument();
    });
  });

  test('can change alert type filter', async () => {
    render(<StoreHeatmap />);
    
    const alertTypeSelect = screen.getByLabelText('Alert Type');
    fireEvent.mouseDown(alertTypeSelect);
    
    const theftOption = screen.getByText('Theft Detected');
    fireEvent.click(theftOption);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('theft_detected')).toBeInTheDocument();
    });
  });

  test('can toggle show zones', () => {
    render(<StoreHeatmap />);
    
    const showZonesSwitch = screen.getByRole('checkbox');
    expect(showZonesSwitch).toBeChecked();
    
    fireEvent.click(showZonesSwitch);
    expect(showZonesSwitch).not.toBeChecked();
  });

  test('displays loading state initially', () => {
    render(<StoreHeatmap />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('renders canvas element', async () => {
    render(<StoreHeatmap />);
    
    await waitFor(() => {
      const canvas = screen.getByRole('img', { hidden: true });
      expect(canvas).toBeInTheDocument();
    });
  });

  test('renders legend', async () => {
    render(<StoreHeatmap />);
    
    await waitFor(() => {
      expect(screen.getByText('Alert Types:')).toBeInTheDocument();
      expect(screen.getByText('theft detected')).toBeInTheDocument();
      expect(screen.getByText('suspicious behavior')).toBeInTheDocument();
      expect(screen.getByText('loitering')).toBeInTheDocument();
    });
  });
});