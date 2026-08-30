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

let expandedH = null                                    // 展开态的内容高度，主进程说了算
const clampH = (h) => Math.min(Math.max(200, Math.round(h) || 560), 4000)

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
    show: false,          // 等界面把折叠状态应用完再显示，避免闪一下大窗口
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })
  // 兜底：界面万一没发就绪信号，1.5 秒后也要把窗口显示出来
  setTimeout(() => { if (!win.isDestroyed() && !win.isVisible()) win.show() }, 1500)
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
  // 折叠/展开：只改高度，宽度保持不变。
  // 展开前的高度由主进程量取——渲染层的 innerHeight 要等尺寸变化传回来才更新，
  // 快速连点折叠/展开时会读到滞后的值，导致记录的高度逐次跑偏。
  ipcMain.handle('window:setHeight', (e, height, resizable) => {
    const win = BrowserWindow.fromWebContents(e.sender)
    if (!win) return null
    const [w, curH] = win.getContentSize()
    const asked = Math.max(1, Math.round(height))
    if (!resizable) {
      // 只有确实处在展开态（比目标高出一截）时才采信当前高度
      if (curH > asked + 40) expandedH = clampH(curH)
    }
    const target = resizable ? clampH(asked || expandedH || 560) : asked
    win.setMinimumSize(300, resizable ? 360 : 1)   // 最小高度会夹住 setContentSize，折叠时要先放开
    win.setContentSize(w, target)
    return expandedH
  })
  ipcMain.handle('window:ready', (e) => {
    const win = BrowserWindow.fromWebContents(e.sender)
    if (win && !win.isVisible()) win.show()
  })
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  app.quit()
})
