// Electron main process entry that creates the window and handles IPC/storage/auto-launch wiring.

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Store = require('electron-store');
const AutoLaunch = require('auto-launch');

const store = new Store();
let mainWindow;

// single instance lock to prevent multiple windows
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {

    // If a second instance tries to launch, focus the existing window
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

// Initialize auto-launch
let autoLauncher;

function initializeAutoLauncher() {
  autoLauncher = new AutoLaunch({
    name: 'Todo Widget',
    path: app.getPath('exe'),
  });
}

function createWindow() {
  // Get saved position or use defaults
  const windowBounds = store.get('windowBounds', { 
    x: 100, 
    y: 100, 
    width: 240, 
    height: 340 
  });

  mainWindow = new BrowserWindow({
    x: windowBounds.x,
    y: windowBounds.y,
    width: windowBounds.width,
    height: windowBounds.height,
    minWidth: 220,
    minHeight: 300,
    maxWidth: 600,
    maxHeight: 1000,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: true,
    skipTaskbar: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('index.html');

  // Save window position and size when moved or resized
  mainWindow.on('moved', () => {
    const bounds = mainWindow.getBounds();
    store.set('windowBounds', bounds);
  });

  mainWindow.on('resized', () => {
    const bounds = mainWindow.getBounds();
    store.set('windowBounds', bounds);
  });

  // Handle minimize
ipcMain.on('minimize-window', () => {
  const bounds = mainWindow.getBounds();
  store.set('windowBounds', bounds);
  mainWindow.minimize();
});

  // Handle window close
  mainWindow.on('close', () => {
    const bounds = mainWindow.getBounds();
    store.set('windowBounds', bounds);
  });
}

// IPC handlers for data persistence
ipcMain.handle('get-tasks', () => {
  return store.get('tasks', []);
});

ipcMain.handle('save-tasks', (event, tasks) => {
  store.set('tasks', tasks);
  return true;
});

ipcMain.handle('get-theme', () => {
  return store.get('theme', 'mischka');
});

ipcMain.handle('save-theme', (event, theme) => {
  store.set('theme', theme);
  return true;
});

ipcMain.handle('toggle-auto-launch', async (event, enabled) => {
  try {
    if (enabled) {
      await autoLauncher.enable();
    } else {
      await autoLauncher.disable();
    }
    store.set('autoLaunchEnabled', enabled);
    return true;
  } catch (err) {
    console.error('Error toggling auto-launch:', err);
    return false;
  }
});

ipcMain.handle('get-auto-launch-status', async () => {
  try {
    const enabled = await autoLauncher.isEnabled();
    return enabled;
  } catch (err) {
    console.error('Error getting auto-launch status:', err);
    return store.get('autoLaunchEnabled', false);
  }
});

app.whenReady().then(() => {
  initializeAutoLauncher();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
