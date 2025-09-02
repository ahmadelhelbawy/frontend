import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CameraFeed from '../CameraFeed';

const mockAlert = {
  id: 'alert-1',
  type: 'suspicious_behavior' as const,
  confidence: 0.85,
  timestamp: new Date(),
  boundingBox: { x: 100, y: 100, width: 200, height: 200 }
};

const defaultProps = {
  cameraId: 'cam-001',
  name: 'Test Camera',
  streamUrl: '/test-stream',
  isActive: true,
  alerts: [],
  onToggleCamera: jest.fn(),
  onCameraSettings: jest.fn()
};

describe('CameraFeed Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders camera name and status', () => {
    render(<CameraFeed {...defaultProps} />);
    
    expect(screen.getByText('Test Camera')).toBeInTheDocument();
    expect(screen.getByText('Live')).toBeInTheDocument();
  });

  test('shows offline status when camera is inactive', () => {
    render(<CameraFeed {...defaultProps} isActive={false} />);
    
    expect(screen.getByText('Offline')).toBeInTheDocument();
  });

  test('displays alert count badge', () => {
    render(<CameraFeed {...defaultProps} alerts={[mockAlert]} />);
    
    const badge = screen.getByText('1');
    expect(badge).toBeInTheDocument();
  });

  test('opens menu when more options clicked', () => {
    render(<CameraFeed {...defaultProps} />);
    
    const moreButton = screen.getByRole('button', { name: /more/i });
    fireEvent.click(moreButton);
    
    expect(screen.getByText('Turn Off')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  test('calls onToggleCamera when toggle menu item clicked', () => {
    const onToggleCamera = jest.fn();
    render(<CameraFeed {...defaultProps} onToggleCamera={onToggleCamera} />);
    
    const moreButton = screen.getByRole('button', { name: /more/i });
    fireEvent.click(moreButton);
    
    const toggleItem = screen.getByText('Turn Off');
    fireEvent.click(toggleItem);
    
    expect(onToggleCamera).toHaveBeenCalledWith('cam-001');
  });

  test('calls onCameraSettings when settings menu item clicked', () => {
    const onCameraSettings = jest.fn();
    render(<CameraFeed {...defaultProps} onCameraSettings={onCameraSettings} />);
    
    const moreButton = screen.getByRole('button', { name: /more/i });
    fireEvent.click(moreButton);
    
    const settingsItem = screen.getByText('Settings');
    fireEvent.click(settingsItem);
    
    expect(onCameraSettings).toHaveBeenCalledWith('cam-001');
  });

  test('shows video element when camera is active', () => {
    render(<CameraFeed {...defaultProps} />);
    
    const video = screen.getByRole('video');
    expect(video).toBeInTheDocument();
  });

  test('shows camera off icon when camera is inactive', () => {
    render(<CameraFeed {...defaultProps} isActive={false} />);
    
    // The VideocamOffIcon should be present in the video area
    const videoArea = screen.getByRole('video', { hidden: true }).parentElement;
    expect(videoArea).toBeInTheDocument();
  });
});