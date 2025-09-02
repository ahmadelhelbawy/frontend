import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BehavioralTrendsChart from '../BehavioralTrendsChart';

// Mock recharts
jest.mock('recharts', () => ({
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  Area: () => <div data-testid="area" />,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>
}));

// Mock API service
jest.mock('../../../services/apiService', () => ({
  apiService: {
    get: jest.fn().mockRejectedValue(new Error('API not available'))
  }
}));

describe('BehavioralTrendsChart Component', () => {
  test('renders chart title', () => {
    render(<BehavioralTrendsChart />);
    expect(screen.getByText('Behavioral Trends Analysis')).toBeInTheDocument();
  });

  test('renders time range selector', () => {
    render(<BehavioralTrendsChart />);
    expect(screen.getByLabelText('Time Range')).toBeInTheDocument();
  });

  test('renders chart type toggle buttons', () => {
    render(<BehavioralTrendsChart />);
    expect(screen.getByText('Line')).toBeInTheDocument();
    expect(screen.getByText('Area')).toBeInTheDocument();
    expect(screen.getByText('Bar')).toBeInTheDocument();
  });

  test('can change time range', async () => {
    render(<BehavioralTrendsChart />);
    
    const timeRangeSelect = screen.getByLabelText('Time Range');
    fireEvent.mouseDown(timeRangeSelect);
    
    const sevenDaysOption = screen.getByText('Last 7 Days');
    fireEvent.click(sevenDaysOption);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('7d')).toBeInTheDocument();
    });
  });

  test('can change chart type', () => {
    render(<BehavioralTrendsChart />);
    
    const areaButton = screen.getByText('Area');
    fireEvent.click(areaButton);
    
    expect(screen.getByTestId('area-chart')).toBeInTheDocument();
  });

  test('displays loading state initially', () => {
    render(<BehavioralTrendsChart />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('renders line chart by default', async () => {
    render(<BehavioralTrendsChart />);
    
    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
  });

  test('switches to bar chart when selected', async () => {
    render(<BehavioralTrendsChart />);
    
    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
    
    const barButton = screen.getByText('Bar');
    fireEvent.click(barButton);
    
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });
});