const {ipcRenderer} = require('electron')
const path = require('path')

const C = require(path.join(__dirname,'CONSTANTS.js'))
const player_page = require(path.join(__dirname, 'player_page', 'player_page.js'))
const right_page = require(path.join(__dirname, 'right_page', 'right_page_main.js'))


// main code
window.addEventListener('DOMContentLoaded', () => {
    player_page.init(ipcRenderer)
    right_page.init(ipcRenderer)
})