// Preload: expose a minimal, typed API to the renderer.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  loadWorkspace: () => ipcRenderer.invoke('workspace:load'),
  saveWorkspace: (data) => ipcRenderer.invoke('workspace:save', data),
  workspacePath: () => ipcRenderer.invoke('workspace:path'),

  importXlsx: () => ipcRenderer.invoke('dialog:import-xlsx'),
  exportJson: (payload) => ipcRenderer.invoke('dialog:export-json', payload),
  exportXlsx: (payload) => ipcRenderer.invoke('dialog:export-xlsx', payload),
  confirm: (payload) => ipcRenderer.invoke('dialog:confirm', payload),

  onShortcut: (cb) => ipcRenderer.on('shortcut', (_e, name) => cb(name)),
});
