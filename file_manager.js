var fs = require('fs')
const {dialog} = require('electron')
const path = require('path');

// -------------- CONSTANTS & GLOBALS -------------
const project_filter_list = [
    {name: '', extensions: ['json']}, // system description json
    {name: 'All Files', extensions: ['*']}
]
const verilog_filter_list = [
    {name: '', extensions: ['v']}, // system description json
    {name: 'All Files', extensions: ['*']}
]

// app path
var base_path = false

// save state
var save_json = false // dictionary
var save_file_path = false // TODO: implement this correctly

// -------------- INIT -----------------
function initMain(ipcMain, base_path){
    setBasePath(base_path)
    fs.mkdirSync(path.join(base_path, "saves"), { recursive: true })
    ipcMain.on('get-save', (event, data) => {
        event.returnValue = getSave()
    })
}

// -------------- MAIN METHODS ----------------

// TODO: simplify these two so that it doesn't use a nested function
function openFileDialog (win){
    return function(e){

        let options = {
        title : "Choose File", 

        defaultPath : path.join(base_path),

        buttonLabel : "Open",

        filters : project_filter_list,
        properties: ['openFile']
        }

        //Synchronous
        let filePaths = dialog.showOpenDialogSync(win, options)

        return filePaths
    }
}

function openNewDialog(win){
    let options = {
        title : "New", 

        defaultPath : path.join(base_path,'saves'),

        buttonLabel : "Save",

        filters : project_filter_list,
        properties: ['createDirectory', 'showOverwriteConfirmation']
    }

    //Synchronous
    let filePaths = dialog.showSaveDialogSync(win, options)

    return filePaths
}

function openFolderDialog(win){
    let options = {
        title : "Generation", 

        defaultPath : path.join(base_path,'saves'),

        buttonLabel : "Output Here",

        filters : project_filter_list,
        properties: ['createDirectory', 'showOverwriteConfirmation', 'openDirectory']
    }

    //Synchronous
    let filePaths = dialog.showOpenDialogSync(win, options)

    return filePaths
}

function openSaveDialog(win, verilog = false){
    let filter = undefined

    if (verilog){
        filter = verilog_filter_list
    } else {
        filter = project_filter_list
    }

    let options = {
        title : "Save As", 

        defaultPath : path.join(base_path,'saves'),

        buttonLabel : "Save",

        filters : filter,
        properties: ['createDirectory', 'showOverwriteConfirmation']
    }

    //Synchronous
    let filePaths = dialog.showSaveDialogSync(win, options)

    return filePaths
}

function loadSave(filepath){
    let data = readJSONFile(filepath)
    if (data != "-1"){
        save_json = data

        save_file_path = filepath
        return true
    } else {
        return false
    }
}

function saveSave(){
    if (save_file_path != false){
        writeJSONToFile(save_file_path, save_json)
        return true
    } else {
        writeJSONToFile(path.join(base_path, 'saves', 'temp.json'), save_json)
        console.log("Error: either save is dummy, or no save loaded")
        return false
    }
}

function changeSavePath(file_path){
    save_file_path = file_path
}
  
function loadDummy(){
    return loadSave(dummy_save_path, true)
}

function getSave(){
    return save_json
}

// takes in json dict
function updateSave(new_json){
    save_json = new_json
}

// --------------- HELPER FUNCTIONS ----------------

// TODO: probably unneeded
function setBasePath (path){
    if (base_path != false){
        console.log('Error: base path set a second time')
    } else {
        base_path = path
    }
}

function readFile (filepath){
    try {
        var data = fs.readFileSync(filepath, 'utf8');  
    } catch(e) {
        console.log('Error:', e.stack);
    }
    return data
}

function readJSONFile (filepath){
    try {
        var data = fs.readFileSync(filepath, 'utf8');  
        data = JSON.parse(data)
        return data
    } catch(e) {
        console.log('Error:', e.stack);
    }
    return "-1"
}

function writeFile (filepath, output){
    try {
        fs.writeFileSync(filepath, output);  
        return true
    } catch(e) {
        console.log('Error:', e.stack);
    }
    return false
}

function writeJSONToFile (filepath, output){
    try {
        let data = JSON.stringify(output)
        fs.writeFileSync(filepath, data);  
        return true
    } catch(e) {
        console.log('Error:', e.stack);
    }
    return false
}

module.exports = {
    initMain,
    setBasePath,
    openFileDialog,
    openNewDialog,
    openFolderDialog,
    openSaveDialog,
    readFile,
    readJSONFile,
    writeFile,
    writeJSONToFile,
    loadDummy,
    loadSave,
    changeSavePath,
    saveSave,
    getSave,
    updateSave,
}