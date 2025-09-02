// Layout Management Types for Professional Surveillance UI

export interface GridPosition {
  row: number;
  column: number;
  rowSpan?: number;
  columnSpan?: number;
}

export interface CameraAssignment {
  cameraId: string;
  position: GridPosition;
  priority?: number;
  groupId?: string;
}

export interface GridLayout {
  id: string;
  name: string;
  rows: number;
  columns: number;
  cellAspectRatio: number;
  gaps: {
    horizontal: number;
    vertical: number;
  };
  cameraAssignments: CameraAssignment[];
  displaySpanning?: MultiDisplayConfig;
  isCustom: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MultiDisplayConfig {
  enabled: boolean;
  displays: DisplayInfo[];
  layoutSpanning: {
    primary: DisplayLayout;
    secondary?: DisplayLayout;
    tertiary?: DisplayLayout;
  };
  synchronization: SyncConfig;
}

export interface DisplayInfo {
  id: string;
  name: string;
  width: number;
  height: number;
  scaleFactor: number;
  isPrimary: boolean;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface DisplayLayout {
  displayId: string;
  gridSection: {
    startRow: number;
    endRow: number;
    startColumn: number;
    endColumn: number;
  };
}

export interface SyncConfig {
  enabled: boolean;
  syncType: 'time' | 'events' | 'both';
  refreshRate: number;
}

export interface LayoutPreferences {
  userId: string;
  defaultLayoutId: string;
  customLayouts: string[];
  recentLayouts: string[];
  preferences: {
    autoSave: boolean;
    showGridLines: boolean;
    enableAnimations: boolean;
    defaultViewMode: string;
  };
}

export interface DragItem {
  type: 'camera';
  cameraId: string;
  sourcePosition?: GridPosition;
}

export interface DropResult {
  targetPosition: GridPosition;
  dropEffect: 'move' | 'copy';
}

// Preset layout configurations
export const PRESET_LAYOUTS: Record<string, Omit<GridLayout, 'id' | 'cameraAssignments'>> = {
  '2x2': {
    name: '2x2 Grid',
    rows: 2,
    columns: 2,
    cellAspectRatio: 16/9,
    gaps: { horizontal: 8, vertical: 8 },
    isCustom: false,
  },
  '3x3': {
    name: '3x3 Grid',
    rows: 3,
    columns: 3,
    cellAspectRatio: 16/9,
    gaps: { horizontal: 6, vertical: 6 },
    isCustom: false,
  },
  '4x4': {
    name: '4x4 Grid',
    rows: 4,
    columns: 4,
    cellAspectRatio: 16/9,
    gaps: { horizontal: 4, vertical: 4 },
    isCustom: false,
  },
  'control-room': {
    name: 'Control Room',
    rows: 3,
    columns: 4,
    cellAspectRatio: 16/9,
    gaps: { horizontal: 6, vertical: 6 },
    isCustom: false,
  },
  'security-wall': {
    name: 'Security Wall',
    rows: 4,
    columns: 6,
    cellAspectRatio: 16/9,
    gaps: { horizontal: 2, vertical: 2 },
    isCustom: false,
  },
  'single': {
    name: 'Single View',
    rows: 1,
    columns: 1,
    cellAspectRatio: 16/9,
    gaps: { horizontal: 0, vertical: 0 },
    isCustom: false,
  },
};

export interface LayoutManagerState {
  currentLayout: GridLayout | null;
  availableLayouts: GridLayout[];
  isLoading: boolean;
  error: string | null;
  preferences: LayoutPreferences | null;
  multiDisplayConfig: MultiDisplayConfig | null;
}

export interface LayoutManagerActions {
  setLayout: (layoutId: string) => Promise<void>;
  createCustomLayout: (config: Partial<GridLayout>) => Promise<string>;
  updateLayout: (layoutId: string, updates: Partial<GridLayout>) => Promise<void>;
  deleteLayout: (layoutId: string) => Promise<void>;
  saveLayoutPreset: (name: string, layout: GridLayout) => Promise<void>;
  assignCamera: (cameraId: string, position: GridPosition) => void;
  removeCamera: (cameraId: string) => void;
  moveCamera: (cameraId: string, fromPosition: GridPosition, toPosition: GridPosition) => void;
  enableMultiMonitor: (displays: DisplayInfo[]) => Promise<void>;
  disableMultiMonitor: () => void;
  loadPreferences: () => Promise<void>;
  savePreferences: (preferences: Partial<LayoutPreferences>) => Promise<void>;
}