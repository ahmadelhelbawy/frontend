import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HistoricalDataBrowser from '../HistoricalDataBrowser';

// Mock date picker
jest.mock('@mui/x-date-pickers/DatePicker', () => ({
  DatePicker: ({ label, onChange }: any) => (
    <input
      placeholder={label}
      onChange={(e) => onChange && onChange(new Date(e.target.value))}
    />
  )
}));

jest.mock('@mui/x-date-pickers/LocalizationProvider', () => ({
  LocalizationProvider: ({ children }: any) => <div>{children}</div>
}));

jest.mock('@mui/x-date-pickers/AdapterDateFns', () => ({
  AdapterDateFns: jest.fn()
}));

// Mock API service
jest.mock('../../../services/apiService', () => ({
  apiService: {
    get: jest.fn().mockRejectedValue(new Error('API not available'))
  }
}));

describe('HistoricalDataBrowser Component', () => {
  test('renders browser title', () => {
    render(<HistoricalDataBrowser />);
    expect(screen.getByText('Historical Data Browser')).toBeInTheDocument();
  });

  test('renders date filters', () => {
    render(<HistoricalDataBrowser />);
    expect(screen.getByPlaceholderText('Start Date')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('End Date')).toBeInTheDocument();
  });

  test('renders filter controls', () => {
    render(<HistoricalDataBrowser />);
    expect(screen.getByLabelText('Alert Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Camera')).toBeInTheDocument();
    expect(screen.getByLabelText('Severity')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  test('renders export button', () => {
    render(<HistoricalDataBrowser />);
    expect(screen.getByText('Export')).toBeInTheDocument();
  });

  test('renders data table headers', () => {
    render(<HistoricalDataBrowser />);
    expect(screen.getByText('Timestamp')).toBeInTheDocument();
    expect(screen.getByText('Camera')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Severity')).toBeInTheDocument();
    expect(screen.getByText('Confidence')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  test('can change alert type filter', async () => {
    render(<HistoricalDataBrowser />);
    
    const alertTypeSelect = screen.getByLabelText('Alert Type');
    fireEvent.mouseDown(alertTypeSelect);
    
    const theftOption = screen.getByText('Theft Detected');
    fireEvent.click(theftOption);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('theft_detected')).toBeInTheDocument();
    });
  });

  test('can change severity filter', async () => {
    render(<HistoricalDataBrowser />);
    
    const severitySelect = screen.getByLabelText('Severity');
    fireEvent.mouseDown(severitySelect);
    
    const highOption = screen.getByText('High');
    fireEvent.click(highOption);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('high')).toBeInTheDocument();
    });
  });

  test('can enter search term', () => {
    render(<HistoricalDataBrowser />);
    
    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    
    expect(searchInput).toHaveValue('test search');
  });

  test('displays mock data after loading', async () => {
    render(<HistoricalDataBrowser />);
    
    // Wait for loading to complete and mock data to appear
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Should show some mock data rows
    expect(screen.getAllByText(/suspicious behavior|theft detected|loitering/i)).toHaveLength(10);
  });

  test('renders pagination controls', () => {
    render(<HistoricalDataBrowser />);
    expect(screen.getByText('Rows per page:')).toBeInTheDocument();
  });

  test('can click view details button', async () => {
    render(<HistoricalDataBrowser />);
    
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    const viewButtons = screen.getAllByRole('button', { name: /view/i });
    if (viewButtons.length > 0) {
      fireEvent.click(viewButtons[0]);
      
      await waitFor(() => {
        expect(screen.getByText('Alert Details')).toBeInTheDocument();
      });
    }
  });
});