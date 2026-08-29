const { app, BrowserWindow, ipcMain, clipboard } = require('electron')
const fs = require('fs')
const path = require('path')

// 防止双开：重复启动时聚焦已有窗口
if (!app.requestSingleInstanceLock()) {
  app.exit(0)
}
app.on('second-instance', () => {
  const win = BrowserWindow.getAllWindows()[0]
  if (win) {
    win.show()
    win.focus()
  }
})

const dataFile = () => path.join(app.getPath('userData'), 'prompts-data.json')

function loadData() {
  try {
    return JSON.parse(fs.readFileSync(dataFile(), 'utf8'))
  } catch {
    return null
  }
}

function saveData(data) {
  fs.writeFileSync(dataFile(), JSON.stringify(data, null, 2))
}

// 高层级置顶 + 跨 Spaces/台前调度可见
function applyPinned(win, pinned) {
  win.setAlwaysOnTop(pinned, 'screen-saver')
  win.setVisibleOnAllWorkspaces(pinned, { visibleOnFullScreen: true })
}

function createWindow() {
  const pinned = loadData()?.pinned !== false
  const win = new BrowserWindow({
    width: 380,
    height: 560,
    minWidth: 300,
    minHeight: 360,
    alwaysOnTop: pinned,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })
  applyPinned(win, pinned)
  win.setFullScreenable(false)
  win.loadFile('index.html')
}

app.whenReady().then(() => {
  ipcMain.handle('data:load', () => loadData())
  ipcMain.handle('data:save', (_e, data) => saveData(data))
  ipcMain.handle('clipboard:copy', (_e, text) => clipboard.writeText(text))
  ipcMain.handle('window:setPinned', (e, pinned) => {
    const win = BrowserWindow.fromWebContents(e.sender)
    if (win) applyPinned(win, pinned)
  })
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  app.quit()
})
