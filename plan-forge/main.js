// Electron main process for Plan Forge
// - Creates the BrowserWindow
// - Loads/saves the workspace JSON file (one file holds all projects)
// - Exposes IPC: load, save, import-xlsx, export-xlsx, export-json

const { app, BrowserWindow, ipcMain, dialog, Menu, shell } = require('electron');
const fs = require('fs');
const path = require('path');

const WORKSPACE_FILE = path.join(app.getPath('userData'), 'plan-forge-workspace.json');

// --------------------------------------------------------------- workspace

function readWorkspace() {
  try {
    const raw = fs.readFileSync(WORKSPACE_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return { projects: [], activeProjectId: null, schemaVersion: 1 };
  }
}

function writeWorkspace(data) {
  // Atomic write: write to tmp then rename
  const tmp = WORKSPACE_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmp, WORKSPACE_FILE);
}

// --------------------------------------------------------------- window

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    title: 'Plan Forge',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  win.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith('file://')) {
      e.preventDefault();
      shell.openExternal(url);
    }
  });
}

// --------------------------------------------------------------- menu

function buildMenu() {
  const isMac = process.platform === 'darwin';
  const template = [
    ...(isMac ? [{ role: 'appMenu' }] : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'New Project',
          accelerator: 'CmdOrCtrl+N',
          click: () => win.webContents.send('shortcut', 'new-project'),
        },
        { type: 'separator' },
        {
          label: 'Import from Excel…',
          accelerator: 'CmdOrCtrl+I',
          click: () => win.webContents.send('shortcut', 'import-xlsx'),
        },
        {
          label: 'Export Project as JSON…',
          click: () => win.webContents.send('shortcut', 'export-json'),
        },
        {
          label: 'Export Project as Excel…',
          click: () => win.webContents.send('shortcut', 'export-xlsx'),
        },
        { type: 'separator' },
        {
          label: 'Reveal Workspace File',
          click: () => shell.showItemInFolder(WORKSPACE_FILE),
        },
        isMac ? { role: 'close' } : { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' }, { role: 'redo' }, { type: 'separator' },
        { role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' },
        { type: 'separator' },
        {
          label: 'Quick Search',
          accelerator: 'CmdOrCtrl+K',
          click: () => win.webContents.send('shortcut', 'quick-search'),
        },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' }, { role: 'forceReload' }, { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    { role: 'windowMenu' },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// --------------------------------------------------------------- IPC

ipcMain.handle('workspace:load', () => readWorkspace());

ipcMain.handle('workspace:save', (_e, data) => {
  writeWorkspace(data);
  return { ok: true };
});

ipcMain.handle('workspace:path', () => WORKSPACE_FILE);

ipcMain.handle('dialog:import-xlsx', async () => {
  const result = await dialog.showOpenDialog(win, {
    title: 'Import Excel Workbook',
    filters: [{ name: 'Excel', extensions: ['xlsx', 'xlsm', 'xls'] }],
    properties: ['openFile'],
  });
  if (result.canceled || !result.filePaths[0]) return { canceled: true };
  const filePath = result.filePaths[0];
  try {
    const XLSX = require('xlsx');
    const wb = XLSX.readFile(filePath, { cellDates: true });
    const sheets = {};
    for (const name of wb.SheetNames) {
      sheets[name] = XLSX.utils.sheet_to_json(wb.Sheets[name], { defval: '', raw: false });
    }
    return { ok: true, filePath, sheets };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
});

ipcMain.handle('dialog:export-json', async (_e, { defaultName, data }) => {
  const result = await dialog.showSaveDialog(win, {
    title: 'Export Project as JSON',
    defaultPath: defaultName || 'project.json',
    filters: [{ name: 'JSON', extensions: ['json'] }],
  });
  if (result.canceled || !result.filePath) return { canceled: true };
  fs.writeFileSync(result.filePath, JSON.stringify(data, null, 2), 'utf8');
  return { ok: true, filePath: result.filePath };
});

ipcMain.handle('dialog:export-xlsx', async (_e, { defaultName, sheets }) => {
  const result = await dialog.showSaveDialog(win, {
    title: 'Export Project as Excel',
    defaultPath: defaultName || 'project.xlsx',
    filters: [{ name: 'Excel', extensions: ['xlsx'] }],
  });
  if (result.canceled || !result.filePath) return { canceled: true };
  const XLSX = require('xlsx');
  const wb = XLSX.utils.book_new();
  for (const [name, rows] of Object.entries(sheets)) {
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31));
  }
  XLSX.writeFile(wb, result.filePath);
  return { ok: true, filePath: result.filePath };
});

ipcMain.handle('dialog:confirm', async (_e, { title, message, detail, buttons }) => {
  const result = await dialog.showMessageBox(win, {
    type: 'question',
    title: title || 'Confirm',
    message: message || '',
    detail: detail || '',
    buttons: buttons || ['Cancel', 'OK'],
    defaultId: (buttons || []).length - 1,
    cancelId: 0,
  });
  return result.response;
});

// --------------------------------------------------------------- app lifecycle

app.whenReady().then(() => {
  buildMenu();
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
