const { app, BrowserWindow, screen, ipcMain, Menu} = require('electron')
const path = require('path')

const file_manager = require('../dnd_player_creator/file_manager.js')

var win = null

function setMenu () {
    Menu.setApplicationMenu(null)
}

function setMainListeners(){
    ipcMain.on('debug', function(event,arg){
        console.log("debug: " + arg)
    })

    ipcMain.on('save', function (event, arg){
        file_manager.updateSave(arg)
        file_manager.saveSave()
    })

    ipcMain.on('open', function(event,arg) {
        let file_path = file_manager.openFileDialog(win)()
        if (file_path != undefined){
            let result = file_manager.loadSave(file_path[0])

            if (result){
                event.reply('update-displayed-data', file_manager.getSave())
            } else {
                event.reply('error', "failed to load file")
            }
        }
    })
}

function createWindow () {
    win = new BrowserWindow({
        width: screen.getPrimaryDisplay().workAreaSize['width'],
        height: screen.getPrimaryDisplay().workAreaSize['height'],
        resizable: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    win.loadFile('main.html')

    file_manager.setBasePath(app.getAppPath())

    setMainListeners()
    setMenu()
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