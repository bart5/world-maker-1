/**
 * This file is supported by 'vue-cli-plugin-electron-builder'
 * way of using ipcRendered in the browser without allowing
 * possibly insecure nodeIntegration, and also giving
 * convenient global access via window.
 */

import { ipcRenderer } from 'electron'

window.ipcRenderer = ipcRenderer
