import { ipcRenderer } from 'electron';

declare global {
  interface Window {
    ipcRenderer: typeof Electron.ipcRenderer
  }
}
