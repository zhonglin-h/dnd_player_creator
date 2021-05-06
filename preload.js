const {ipcRenderer} = require('electron')
const path = require('path')

const C = require(path.join(__dirname,'CONSTANTS.js'))
const player_page = require(path.join(__dirname, 'player_page', 'player_page.js'))


// main code
window.addEventListener('DOMContentLoaded', () => {
    ipcRenderer.send('debug', "Test2")
    player_page.init(ipcRenderer)
})