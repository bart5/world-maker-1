import { app, protocol, BrowserWindow, Menu, shell } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer';
import path from 'path'
import setupCommunicaton, { emittersFactory } from './ipcHandlersMain';

const isDevelopment = process.env.NODE_ENV !== 'production';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win: BrowserWindow | null;

const getWindow = (): typeof win => win

setupCommunicaton(getWindow)

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } },
]);

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: (process.env.ELECTRON_NODE_INTEGRATION as unknown) as boolean,
      preload: path.join(__dirname, 'preload.js')
    },
  });

  const contents = win.webContents

  const emitters = emittersFactory(contents)

  const menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        {
          label: 'Create New Project',
          click() { emitters.onStartNewProject() }
        },
        {
          label: 'Open',
          click() { emitters.onOpenProject() }
        },
        { type: 'separator' },
        {
          label: 'Open project folder',
          click() { emitters.onOpenProjectDirectory() }
        },
        { type: 'separator' },
        {
          label: 'Save',
          click() { emitters.onSave() }
        },
        {
          label: 'Save As',
          click() { emitters.onSaveAs() }
        },
        { type: 'separator' },
        {
          label: 'Configuration',
          click() { emitters.onConfiguration() }
        },
        { type: 'separator' },
        {
          label: 'Close',
          click() { emitters.onClose() }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Edit Types',
          click() { emitters.onShowTypesEditor() }
        }
      ]
    },
    {
      role: 'viewMenu',
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Learn More',
          click: async () => {
            await shell.openExternal('https://electronjs.org')
          }
        }
      ]
    }
  ])

  Menu.setApplicationMenu(menu);

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol('app');
    // Load the index.html when not in development
    win.loadURL('app://./index.html');
  }

  win.on('close', () => {
    emitters.onClose()
  })

  win.on('closed', () => {
    win = null;
  });
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS);
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString());
    }
  }
  createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit();
      }
    });
  } else {
    process.on('SIGTERM', () => {
      app.quit();
    });
  }
}
