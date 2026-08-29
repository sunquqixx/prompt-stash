const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  loadData: () => ipcRenderer.invoke('data:load'),
  saveData: (data) => ipcRenderer.invoke('data:save', data),
  copyText: (text) => ipcRenderer.invoke('clipboard:copy', text),
  setPinned: (pinned) => ipcRenderer.invoke('window:setPinned', pinned),
})
