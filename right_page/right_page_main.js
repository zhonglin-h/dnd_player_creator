let ipcRenderer = undefined

function init(incoming_ipcRenderer){
    ipcRenderer = incoming_ipcRenderer
}

module.exports = {
    init
}