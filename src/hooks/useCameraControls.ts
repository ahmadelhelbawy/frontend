import { useState, useCallback, useEffect } from 'react';

interface PersonTracking {
  trackId: string;
  customerNumber: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  currentLocation: string;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  aiDetection: {
    confidence: number;
    threatLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  };
  facialRecognition?: {
    isMatched: boolean;
    confidence: number;
  };
}

interface CameraSettings {
  zoom: number;
  brightness: number;
  contrast: number;
  exposure: number;
  focus: number;
  isAutoFocus: boolean;
  isPersonTrackingEnabled: boolean;
  isFacialRecognitionEnabled: boolean;
  isAIDetectionEnabled: boolean;
  detectionZones: DetectionZone[];
  followPersonMode: boolean;
  lockedOnPerson?: string;
}

interface DetectionZone {
  id: string;
  name: string;
  coordinates: { x: number; y: number; width: number; height: number };
  isActive: boolean;
  sensitivity: number;
  type: 'general' | 'high_value' | 'entrance' | 'exit' | 'restricted';
}

interface UseCameraControlsProps {
  cameraId: string;
  initialSettings?: Partial<CameraSettings>;
}

interface UseCameraControlsReturn {
  settings: CameraSettings;
  updateSettings: (updates: Partial<CameraSettings>) => void;
  focusOnPerson: (trackId: string) => void;
  createDetectionZone: (zone: Omit<DetectionZone, 'id'>) => void;
  updateDetectionZone: (zoneId: string, updates: Partial<DetectionZone>) => void;
  deleteDetectionZone: (zoneId: string) => void;
  resetSettings: () => void;
  isPersonLocked: (trackId: string) => boolean;
  getZoomLevel: () => number;
  getCameraTransform: () => string;
}

const defaultSettings: CameraSettings = {
  zoom: 1.0,
  brightness: 50,
  contrast: 50,
  exposure: 50,
  focus: 50,
  isAutoFocus: true,
  isPersonTrackingEnabled: true,
  isFacialRecognitionEnabled: true,
  isAIDetectionEnabled: true,
  detectionZones: [],
  followPersonMode: false,
  lockedOnPerson: undefined
};

export const useCameraControls = ({ 
  cameraId, 
  initialSettings = {} 
}: UseCameraControlsProps): UseCameraControlsReturn => {
  const [settings, setSettings] = useState<CameraSettings>({
    ...defaultSettings,
    ...initialSettings
  });

  // Update settings
  const updateSettings = useCallback((updates: Partial<CameraSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  // Focus on a specific person
  const focusOnPerson = useCallback((trackId: string) => {
    setSettings(prev => ({
      ...prev,
      lockedOnPerson: trackId,
      followPersonMode: true,
      zoom: Math.max(prev.zoom, 1.5) // Ensure minimum zoom when focusing
    }));
  }, []);

  // Create a new detection zone
  const createDetectionZone = useCallback((zone: Omit<DetectionZone, 'id'>) => {
    const newZone: DetectionZone = {
      ...zone,
      id: `zone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    setSettings(prev => ({
      ...prev,
      detectionZones: [...prev.detectionZones, newZone]
    }));
  }, []);

  // Update an existing detection zone
  const updateDetectionZone = useCallback((zoneId: string, updates: Partial<DetectionZone>) => {
    setSettings(prev => ({
      ...prev,
      detectionZones: prev.detectionZones.map(zone =>
        zone.id === zoneId ? { ...zone, ...updates } : zone
      )
    }));
  }, []);

  // Delete a detection zone
  const deleteDetectionZone = useCallback((zoneId: string) => {
    setSettings(prev => ({
      ...prev,
      detectionZones: prev.detectionZones.filter(zone => zone.id !== zoneId)
    }));
  }, []);

  // Reset all settings to defaults
  const resetSettings = useCallback(() => {
    setSettings({ ...defaultSettings, ...initialSettings });
  }, [initialSettings]);

  // Check if a person is currently locked
  const isPersonLocked = useCallback((trackId: string) => {
    return settings.lockedOnPerson === trackId;
  }, [settings.lockedOnPerson]);

  // Get current zoom level
  const getZoomLevel = useCallback(() => {
    return settings.zoom;
  }, [settings.zoom]);

  // Get CSS transform for camera feed based on settings
  const getCameraTransform = useCallback(() => {
    const transforms = [];
    
    // Apply zoom
    if (settings.zoom !== 1.0) {
      transforms.push(`scale(${settings.zoom})`);
    }
    
    // Apply brightness and contrast filters
    const filters = [];
    if (settings.brightness !== 50) {
      const brightnessValue = settings.brightness / 50; // Convert 0-100 to 0-2
      filters.push(`brightness(${brightnessValue})`);
    }
    
    if (settings.contrast !== 50) {
      const contrastValue = settings.contrast / 50; // Convert 0-100 to 0-2
      filters.push(`contrast(${contrastValue})`);
    }
    
    if (filters.length > 0) {
      transforms.push(`filter: ${filters.join(' ')}`);
    }
    
    return transforms.join(' ');
  }, [settings.zoom, settings.brightness, settings.contrast]);

  // Save settings to localStorage when they change
  useEffect(() => {
    const settingsKey = `camera_settings_${cameraId}`;
    localStorage.setItem(settingsKey, JSON.stringify(settings));
  }, [cameraId, settings]);

  // Load settings from localStorage on mount
  useEffect(() => {
    const settingsKey = `camera_settings_${cameraId}`;
    const savedSettings = localStorage.getItem(settingsKey);
    
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.warn('Failed to load camera settings from localStorage:', error);
      }
    }
  }, [cameraId]);

  // Auto-unlock person if they're no longer being tracked
  useEffect(() => {
    if (settings.lockedOnPerson && settings.followPersonMode) {
      // This would typically check if the person is still in the tracking list
      // For now, we'll implement a timeout-based unlock
      const unlockTimer = setTimeout(() => {
        // In a real implementation, you'd check if the person is still being tracked
        // For demo purposes, we'll keep the lock active
      }, 30000); // 30 seconds timeout

      return () => clearTimeout(unlockTimer);
    }
  }, [settings.lockedOnPerson, settings.followPersonMode]);

  return {
    settings,
    updateSettings,
    focusOnPerson,
    createDetectionZone,
    updateDetectionZone,
    deleteDetectionZone,
    resetSettings,
    isPersonLocked,
    getZoomLevel,
    getCameraTransform
  };
};

export default useCameraControls;