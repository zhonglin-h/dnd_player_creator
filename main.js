const { app, BrowserWindow, screen } = require('electron')
const path = require('path')

function createWindow () {
    const win = new BrowserWindow({
        width: screen.getPrimaryDisplay().workAreaSize['width'],
        height: screen.getPrimaryDisplay().workAreaSize['height'],
        resizable: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    win.loadFile('main.html')
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})