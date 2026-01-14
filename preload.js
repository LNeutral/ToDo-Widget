// Preload script exposing a safe IPC API from Electron to the renderer.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  getTasks: () => ipcRenderer.invoke('get-tasks'),
  saveTasks: (tasks) => ipcRenderer.invoke('save-tasks', tasks),
  getTheme: () => ipcRenderer.invoke('get-theme'),
  saveTheme: (theme) => ipcRenderer.invoke('save-theme', theme),
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  toggleAutoLaunch: (enabled) => ipcRenderer.invoke('toggle-auto-launch', enabled),
  getAutoLaunchStatus: () => ipcRenderer.invoke('get-auto-launch-status')
});
