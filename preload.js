const {ipcRenderer} = require('electron')

const C = require('../dnd_player_creator/CONSTANTS.js')

// dynamically fill in options
function preload_from_constants(){
    const alignment_entry = document.getElementById('alignment-entry')
    fill_drop_down(alignment_entry, C.player_info['alignment'])

    const ability_scores_list = document.getElementById('player-ability-scores-list')
    // add text
    for (const short_ability_name of C.player_info['short_ability_scores']){
        let element = document.createElement('p')
        element.textContent = short_ability_name
        ability_scores_list.appendChild(element)
    }
    // add inputs
    for (const short_ability_name of C.player_info['short_ability_scores']){
        let element = document.createElement('input')
        element.id = short_ability_name.toLowerCase() + C.saved_entries_id_key
        ability_scores_list.appendChild(element)
    }
    // add display
    for (const short_ability_name of C.player_info['short_ability_scores']){
        let element = document.createElement('p')
        element.id = short_ability_name.toLowerCase() + '-display'
        element.textContent = "0"
        ability_scores_list.appendChild(element)
    }
    // add buffer
    let save_title = document.createElement('p')
    save_title.textContent = "Saves"
    ability_scores_list.appendChild(save_title)
    for (let i = 1; i < C.player_info['short_ability_scores'].length; i++){
        let buffer = document.createElement('p')
        ability_scores_list.appendChild(buffer)
    }
    // add saving throws
    for (const short_ability_name of C.player_info['short_ability_scores']){
        let element = document.createElement('p')
        element.id = short_ability_name.toLowerCase() + 'saving-throw-display'
        element.textContent = "0"
        ability_scores_list.appendChild(element)
    }
}

function update_displayed_data(dict){
    const root_node = document.getRootNode()

    recursive_entry_editing(root_node, dict)
}

function recursive_entry_editing(node, dict){
    let return_val = 0;
    
    // edit it in if it's data
    if (node.id != undefined && node.id != "" && node.id.search(C.saved_entries_id_key) > 0){
        if (node.nodeName == 'INPUT' && node.type == 'text'){
            node.value = dict[node.id]
        } else if (node.nodeName == 'INPUT' && node.type == 'checkbox') {
            node.checked = dict[node.id]
        } else if (node.nodeName == 'TEXTAREA') {
            node.value = dict[node.id]
        } else if (node.nodeName == 'SELECT') {
            node.value = dict[node.id]
        } else if (node.nodeName == 'BUTTON') {
            // do nothing
        } else {
            ipcRenderer.send('debug', "type unrecognized: " + node.id + ", " + node.nodeName + ", " + node.type + ", " + node.value)
        }
    }

    // check children
    for (const element of node.childNodes){
        let r_val = recursive_entry_editing(element, dict)

        if (r_val != 0){
            return_val = r_val
            break
        }
    }

    return return_val
}

function recursive_entry_adding(node, dict){
    let return_val = 0;
    
    // add it in if it's data
    if (node.id != undefined && node.id != "" && node.id.search(C.saved_entries_id_key) > 0){
        if (node.id in dict){
            ipcRenderer.send('debug', "this node id was repeated: " + node.id)
            return -1;
        }
        
        if (node.nodeName == 'INPUT' && node.type == 'text'){
            dict[node.id] = node.value
        } else if (node.nodeName == 'INPUT' && node.type == 'checkbox') {
            dict[node.id] = node.checked
        } else if (node.nodeName == 'TEXTAREA') {
            dict[node.id] = node.value
        } else if (node.nodeName == 'SELECT') {
            dict[node.id] = node.value
        } else if (node.nodeName == 'BUTTON') {
            // do nothing
        } else {
            ipcRenderer.send('debug', "type unrecognized: " + node.id + ", " + node.nodeName + ", " + node.type + ", " + node.value)
        }
    }

    // check children
    for (const element of node.childNodes){
        let r_val = recursive_entry_adding(element, dict)

        if (r_val != 0){
            return_val = r_val
            break
        }
    }

    return return_val
}

// helper functions
function fill_drop_down(node, options_arr){
    for (const option of options_arr){
        let new_element = document.createElement("option")

        new_element.textContent = option
        new_element.value = option

        node.appendChild(new_element)
    }
}


// main code

window.addEventListener('DOMContentLoaded', () => {
    preload_from_constants()

    // set onclick listeners
    const open_button = document.getElementById('open-button')
    const save_button = document.getElementById('save-button')

    open_button.addEventListener('click', function() {
        ipcRenderer.send('debug', "open called\n")
        
        ipcRenderer.send('open', "")
    })

    save_button.addEventListener('click', function() {
        ipcRenderer.send('debug', "save called\n")

        const root_node = document.getRootNode()

        // recursive go through all the nodes and add ones with 'entry' in it's name to dict
        var save_dict = {}
        let error = recursive_entry_adding(root_node, save_dict)

        if (error != 0){
            ipcRenderer.send('debug', "problemo in recursive entry adding")
            return
        }

        // save dict someone
        ipcRenderer.send('save', save_dict)
    })

    // add listeners
    ipcRenderer.on('update-displayed-data', function(event,arg){
        update_displayed_data(arg)
    })
})