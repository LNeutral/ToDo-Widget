const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Store = require('electron-store');

const store = new Store();
let mainWindow;

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

app.whenReady().then(() => {
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
