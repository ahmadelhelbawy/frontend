const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // Dialog methods
  showMessageBox: (options) => ipcRenderer.invoke('show-message-box', options),
  
  // Settings
  onOpenSettings: (callback) => ipcRenderer.on('open-settings', callback),
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
  
  // System info
  platform: process.platform,
  
  // File system operations (for future use)
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  selectFile: (filters) => ipcRenderer.invoke('select-file', filters),
  
  // Notification methods
  showNotification: (title, body) => ipcRenderer.invoke('show-notification', { title, body })
});

// Security: Remove node integration from window object
delete window.require;
delete window.exports;
delete window.module;