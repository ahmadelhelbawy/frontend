export interface ElectronDisplay {
  id: number;
  label?: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  workArea: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  scaleFactor: number;
  rotation: number;
  primary: boolean;
}

export interface ElectronAPI {
  getAppVersion: () => Promise<string>;
  showMessageBox: (options: {
    type?: 'none' | 'info' | 'error' | 'question' | 'warning';
    buttons?: string[];
    defaultId?: number;
    title?: string;
    message: string;
    detail?: string;
  }) => Promise<{ response: number; checkboxChecked?: boolean }>;
  onOpenSettings: (callback: () => void) => void;
  removeAllListeners: (channel: string) => void;
  platform: string;
  selectDirectory: () => Promise<string | null>;
  selectFile: (filters?: { name: string; extensions: string[] }[]) => Promise<string | null>;
  showNotification: (title: string, body: string) => Promise<void>;
  screen: {
    getAllDisplays: () => Promise<ElectronDisplay[]>;
    getPrimaryDisplay: () => Promise<ElectronDisplay>;
    getDisplayNearestPoint: (point: { x: number; y: number }) => Promise<ElectronDisplay>;
    getDisplayMatching: (rect: { x: number; y: number; width: number; height: number }) => Promise<ElectronDisplay>;
  };
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
    electron?: ElectronAPI; // For backward compatibility
  }
}