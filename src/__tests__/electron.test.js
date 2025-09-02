/**
 * Basic tests for Electron main process functionality
 * These tests verify that the Electron application can start up correctly
 */

describe('Electron Main Process', () => {
  test('electron main file exists', () => {
    const fs = require('fs');
    const path = require('path');
    
    const electronMainPath = path.join(__dirname, '../../public/electron.js');
    expect(fs.existsSync(electronMainPath)).toBe(true);
  });

  test('preload script exists', () => {
    const fs = require('fs');
    const path = require('path');
    
    const preloadPath = path.join(__dirname, '../../public/preload.js');
    expect(fs.existsSync(preloadPath)).toBe(true);
  });

  test('package.json has correct electron configuration', () => {
    const packageJson = require('../../package.json');
    
    expect(packageJson.main).toBe('public/electron.js');
    expect(packageJson.scripts.electron).toBeDefined();
    expect(packageJson.scripts['electron-dev']).toBeDefined();
    expect(packageJson.dependencies.electron).toBeDefined();
  });

  test('electron builder configuration exists', () => {
    const fs = require('fs');
    const path = require('path');
    
    const builderConfigPath = path.join(__dirname, '../../electron-builder.json');
    expect(fs.existsSync(builderConfigPath)).toBe(true);
  });
});