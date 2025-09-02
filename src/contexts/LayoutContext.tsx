import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import {
  GridLayout,
  LayoutManagerState,
  LayoutManagerActions,
  LayoutPreferences,
  GridPosition,
  CameraAssignment,
  DisplayInfo,
  MultiDisplayConfig,
  PRESET_LAYOUTS
} from '../types/layout';

// Layout Manager Context
const LayoutContext = createContext<(LayoutManagerState & LayoutManagerActions) | null>(null);

// Action types
type LayoutAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CURRENT_LAYOUT'; payload: GridLayout | null }
  | { type: 'SET_AVAILABLE_LAYOUTS'; payload: GridLayout[] }
  | { type: 'ADD_LAYOUT'; payload: GridLayout }
  | { type: 'UPDATE_LAYOUT'; payload: { id: string; updates: Partial<GridLayout> } }
  | { type: 'REMOVE_LAYOUT'; payload: string }
  | { type: 'SET_PREFERENCES'; payload: LayoutPreferences | null }
  | { type: 'SET_MULTI_DISPLAY_CONFIG'; payload: MultiDisplayConfig | null }
  | { type: 'ASSIGN_CAMERA'; payload: { cameraId: string; position: GridPosition } }
  | { type: 'REMOVE_CAMERA'; payload: string }
  | { type: 'MOVE_CAMERA'; payload: { cameraId: string; fromPosition: GridPosition; toPosition: GridPosition } };

// Initial state
const initialState: LayoutManagerState = {
  currentLayout: null,
  availableLayouts: [],
  isLoading: false,
  error: null,
  preferences: null,
  multiDisplayConfig: null,
};

// Reducer
function layoutReducer(state: LayoutManagerState, action: LayoutAction): LayoutManagerState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'SET_CURRENT_LAYOUT':
      return { ...state, currentLayout: action.payload };
    
    case 'SET_AVAILABLE_LAYOUTS':
      return { ...state, availableLayouts: action.payload };
    
    case 'ADD_LAYOUT':
      return {
        ...state,
        availableLayouts: [...state.availableLayouts, action.payload]
      };
    
    case 'UPDATE_LAYOUT':
      return {
        ...state,
        availableLayouts: state.availableLayouts.map(layout =>
          layout.id === action.payload.id
            ? { ...layout, ...action.payload.updates, updatedAt: new Date() }
            : layout
        ),
        currentLayout: state.currentLayout?.id === action.payload.id
          ? { ...state.currentLayout, ...action.payload.updates, updatedAt: new Date() }
          : state.currentLayout
      };
    
    case 'REMOVE_LAYOUT':
      return {
        ...state,
        availableLayouts: state.availableLayouts.filter(layout => layout.id !== action.payload),
        currentLayout: state.currentLayout?.id === action.payload ? null : state.currentLayout
      };
    
    case 'SET_PREFERENCES':
      return { ...state, preferences: action.payload };
    
    case 'SET_MULTI_DISPLAY_CONFIG':
      return { ...state, multiDisplayConfig: action.payload };
    
    case 'ASSIGN_CAMERA':
      if (!state.currentLayout) return state;
      
      const existingAssignment = state.currentLayout.cameraAssignments.find(
        assignment => assignment.cameraId === action.payload.cameraId
      );
      
      let newAssignments: CameraAssignment[];
      if (existingAssignment) {
        // Update existing assignment
        newAssignments = state.currentLayout.cameraAssignments.map(assignment =>
          assignment.cameraId === action.payload.cameraId
            ? { ...assignment, position: action.payload.position }
            : assignment
        );
      } else {
        // Add new assignment
        newAssignments = [
          ...state.currentLayout.cameraAssignments,
          { cameraId: action.payload.cameraId, position: action.payload.position }
        ];
      }
      
      return {
        ...state,
        currentLayout: {
          ...state.currentLayout,
          cameraAssignments: newAssignments,
          updatedAt: new Date()
        }
      };
    
    case 'REMOVE_CAMERA':
      if (!state.currentLayout) return state;
      
      return {
        ...state,
        currentLayout: {
          ...state.currentLayout,
          cameraAssignments: state.currentLayout.cameraAssignments.filter(
            assignment => assignment.cameraId !== action.payload
          ),
          updatedAt: new Date()
        }
      };
    
    case 'MOVE_CAMERA':
      if (!state.currentLayout) return state;
      
      return {
        ...state,
        currentLayout: {
          ...state.currentLayout,
          cameraAssignments: state.currentLayout.cameraAssignments.map(assignment =>
            assignment.cameraId === action.payload.cameraId
              ? { ...assignment, position: action.payload.toPosition }
              : assignment
          ),
          updatedAt: new Date()
        }
      };
    
    default:
      return state;
  }
}

// Provider component
interface LayoutProviderProps {
  children: React.ReactNode;
}

export const LayoutProvider: React.FC<LayoutProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(layoutReducer, initialState);

  // Initialize layouts on mount
  useEffect(() => {
    initializeLayouts();
    loadPreferences();
  }, []);

  const initializeLayouts = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Create preset layouts
      const presetLayouts: GridLayout[] = Object.entries(PRESET_LAYOUTS).map(([id, preset]) => ({
        id,
        ...preset,
        cameraAssignments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      // Load custom layouts from localStorage or API
      const savedLayouts = localStorage.getItem('customLayouts');
      const customLayouts: GridLayout[] = savedLayouts ? JSON.parse(savedLayouts) : [];

      const allLayouts = [...presetLayouts, ...customLayouts];
      dispatch({ type: 'SET_AVAILABLE_LAYOUTS', payload: allLayouts });

      // Set default layout
      const defaultLayout = allLayouts.find(layout => layout.id === '2x2') || allLayouts[0];
      if (defaultLayout) {
        dispatch({ type: 'SET_CURRENT_LAYOUT', payload: defaultLayout });
      }

      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize layouts' });
      console.error('Layout initialization error:', error);
    }
  }, []);

  const setLayout = useCallback(async (layoutId: string) => {
    const layout = state.availableLayouts.find(l => l.id === layoutId);
    if (layout) {
      dispatch({ type: 'SET_CURRENT_LAYOUT', payload: layout });
      
      // Save to preferences
      if (state.preferences) {
        const updatedPreferences = {
          ...state.preferences,
          defaultLayoutId: layoutId,
          recentLayouts: [layoutId, ...state.preferences.recentLayouts.filter(id => id !== layoutId)].slice(0, 5)
        };
        await savePreferences(updatedPreferences);
      }
    }
  }, [state.availableLayouts, state.preferences]);

  const createCustomLayout = useCallback(async (config: Partial<GridLayout>): Promise<string> => {
    const id = `custom-${Date.now()}`;
    const newLayout: GridLayout = {
      id,
      name: config.name || `Custom Layout ${id}`,
      rows: config.rows || 2,
      columns: config.columns || 2,
      cellAspectRatio: config.cellAspectRatio || 16/9,
      gaps: config.gaps || { horizontal: 8, vertical: 8 },
      cameraAssignments: config.cameraAssignments || [],
      isCustom: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...config
    };

    dispatch({ type: 'ADD_LAYOUT', payload: newLayout });
    
    // Save to localStorage
    const customLayouts = state.availableLayouts.filter(l => l.isCustom);
    customLayouts.push(newLayout);
    localStorage.setItem('customLayouts', JSON.stringify(customLayouts));

    return id;
  }, [state.availableLayouts]);

  const updateLayout = useCallback(async (layoutId: string, updates: Partial<GridLayout>) => {
    dispatch({ type: 'UPDATE_LAYOUT', payload: { id: layoutId, updates } });
    
    // Save custom layouts to localStorage
    const updatedLayouts = state.availableLayouts.map(layout =>
      layout.id === layoutId ? { ...layout, ...updates, updatedAt: new Date() } : layout
    );
    const customLayouts = updatedLayouts.filter(l => l.isCustom);
    localStorage.setItem('customLayouts', JSON.stringify(customLayouts));
  }, [state.availableLayouts]);

  const deleteLayout = useCallback(async (layoutId: string) => {
    const layout = state.availableLayouts.find(l => l.id === layoutId);
    if (layout && layout.isCustom) {
      dispatch({ type: 'REMOVE_LAYOUT', payload: layoutId });
      
      // Update localStorage
      const customLayouts = state.availableLayouts.filter(l => l.isCustom && l.id !== layoutId);
      localStorage.setItem('customLayouts', JSON.stringify(customLayouts));
    }
  }, [state.availableLayouts]);

  const saveLayoutPreset = useCallback(async (name: string, layout: GridLayout): Promise<void> => {
    await createCustomLayout({
      ...layout,
      name,
      id: undefined // Let createCustomLayout generate new ID
    });
  }, [createCustomLayout]);

  const assignCamera = useCallback((cameraId: string, position: GridPosition) => {
    dispatch({ type: 'ASSIGN_CAMERA', payload: { cameraId, position } });
  }, []);

  const removeCamera = useCallback((cameraId: string) => {
    dispatch({ type: 'REMOVE_CAMERA', payload: cameraId });
  }, []);

  const moveCamera = useCallback((cameraId: string, fromPosition: GridPosition, toPosition: GridPosition) => {
    dispatch({ type: 'MOVE_CAMERA', payload: { cameraId, fromPosition, toPosition } });
  }, []);

  const enableMultiMonitor = useCallback(async (displays: DisplayInfo[]) => {
    const config: MultiDisplayConfig = {
      enabled: true,
      displays,
      layoutSpanning: {
        primary: {
          displayId: displays.find(d => d.isPrimary)?.id || displays[0]?.id || '',
          gridSection: { startRow: 0, endRow: 2, startColumn: 0, endColumn: 2 }
        }
      },
      synchronization: {
        enabled: true,
        syncType: 'both',
        refreshRate: 60
      }
    };
    
    dispatch({ type: 'SET_MULTI_DISPLAY_CONFIG', payload: config });
  }, []);

  const disableMultiMonitor = useCallback(() => {
    dispatch({ type: 'SET_MULTI_DISPLAY_CONFIG', payload: null });
  }, []);

  const loadPreferences = useCallback(async () => {
    try {
      const saved = localStorage.getItem('layoutPreferences');
      if (saved) {
        const preferences: LayoutPreferences = JSON.parse(saved);
        dispatch({ type: 'SET_PREFERENCES', payload: preferences });
      } else {
        // Create default preferences
        const defaultPreferences: LayoutPreferences = {
          userId: 'default',
          defaultLayoutId: '2x2',
          customLayouts: [],
          recentLayouts: [],
          preferences: {
            autoSave: true,
            showGridLines: false,
            enableAnimations: true,
            defaultViewMode: '2x2'
          }
        };
        dispatch({ type: 'SET_PREFERENCES', payload: defaultPreferences });
        localStorage.setItem('layoutPreferences', JSON.stringify(defaultPreferences));
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  }, []);

  const savePreferences = useCallback(async (preferences: Partial<LayoutPreferences>) => {
    const updated = { ...state.preferences, ...preferences } as LayoutPreferences;
    dispatch({ type: 'SET_PREFERENCES', payload: updated });
    localStorage.setItem('layoutPreferences', JSON.stringify(updated));
  }, [state.preferences]);

  const contextValue = {
    ...state,
    setLayout,
    createCustomLayout,
    updateLayout,
    deleteLayout,
    saveLayoutPreset,
    assignCamera,
    removeCamera,
    moveCamera,
    enableMultiMonitor,
    disableMultiMonitor,
    loadPreferences,
    savePreferences,
  };

  return (
    <LayoutContext.Provider value={contextValue}>
      {children}
    </LayoutContext.Provider>
  );
};

// Hook to use layout context
export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};