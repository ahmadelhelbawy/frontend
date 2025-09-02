import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AlertNotifications from '../AlertNotifications';
import { WebSocketProvider } from '../../../contexts/WebSocketContext';
import { NotificationProvider } from '../../../contexts/NotificationContext';

// Mock socket.io-client
const mockSocket = {
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn()
};

jest.mock('socket.io-client', () => ({
  io: () => mockSocket
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <NotificationProvider>
    <WebSocketProvider>
      {children}
    </WebSocketProvider>
  </NotificationProvider>
);

describe('AlertNotifications Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders alert notifications title', () => {
    render(
      <TestWrapper>
        <AlertNotifications />
      </TestWrapper>
    );
    
    expect(screen.getByText('Real-time Alerts')).toBeInTheDocument();
  });

  test('shows no alerts message when no alerts present', () => {
    render(
      <TestWrapper>
        <AlertNotifications />
      </TestWrapper>
    );
    
    expect(screen.getByText('No alerts at this time')).toBeInTheDocument();
  });

  test('can expand and collapse alert list', () => {
    render(
      <TestWrapper>
        <AlertNotifications />
      </TestWrapper>
    );
    
    const expandButton = screen.getByRole('button');
    fireEvent.click(expandButton);
    
    // After collapse, the "No alerts" message should not be visible
    expect(screen.queryByText('No alerts at this time')).not.toBeInTheDocument();
  });

  test('sets up socket event listeners on mount', () => {
    render(
      <TestWrapper>
        <AlertNotifications />
      </TestWrapper>
    );
    
    expect(mockSocket.on).toHaveBeenCalledWith('new_alert', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('alert_acknowledged', expect.any(Function));
  });

  test('cleans up socket listeners on unmount', () => {
    const { unmount } = render(
      <TestWrapper>
        <AlertNotifications />
      </TestWrapper>
    );
    
    unmount();
    
    expect(mockSocket.off).toHaveBeenCalledWith('new_alert');
    expect(mockSocket.off).toHaveBeenCalledWith('alert_acknowledged');
  });
});