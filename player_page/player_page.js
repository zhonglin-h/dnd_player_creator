const path = require('path')

const C = require(path.join(__dirname,'..', 'CONSTANTS.js'))
const PPVALS = require(path.join(__dirname,'player_page_values.js'))
const automation = require(path.join(__dirname,'player_page_automation.js'))

let ipcRenderer = undefined

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
        element.id = short_ability_name.toLowerCase() + C.SAVED_ENTRIES_ID_KEY
        ability_scores_list.appendChild(element)
    }
    // add display
    for (const short_ability_name of C.player_info['short_ability_scores']){
        let element = document.createElement('p')
        element.id = short_ability_name.toLowerCase() + '-display'
        element.textContent = " 0"
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
    // saving throw proficiencies
    for (const short_ability_name of C.player_info['short_ability_scores']){
        let element = document.createElement('input')
        element.type = 'checkbox'
        element.id = PPVALS.get_save_prof_id(short_ability_name)
        element.checked = false
        ability_scores_list.appendChild(element)
    }
    // add saving throws
    for (const short_ability_name of C.player_info['short_ability_scores']){
        let element = document.createElement('input')
        element.id = short_ability_name.toLowerCase() + '-saving-throw-entry'
        element.value = ""
        ability_scores_list.appendChild(element)
    }

    // skill list
    const skills_list = document.getElementById('player-skill-list')
    skills_list.style.gridTemplateRows = "repeat(" + C.player_info['skills'].length + ", auto)"
    for (const skill of C.player_info['skills']){
        let bonus_display = document.createElement('input')
        bonus_display.id = skill['name'].toLowerCase() + '-skill-bonus-entry'
        bonus_display.textContent = ""
        bonus_display.className = 'small-scaling-text'
        skills_list.appendChild(bonus_display)

        let skill_text_display = document.createElement('p')
        skill_text_display.textContent = skill['name'] + " (" + skill['ability_type'] + ")"
        skill_text_display.className = 'small-scaling-text'
        skills_list.appendChild(skill_text_display) 

        // prof and expertise
        let prof_exp_select = document.createElement('select')
        prof_exp_select.id = skill['name'].toLowerCase() + '-prof-exp-entry'
        fill_drop_down(prof_exp_select, ['-', 'P', 'E'])
        skills_list.appendChild(prof_exp_select)
    }


    // automation
    automation.add_ability_automation(ipcRenderer)
}

function set_click_listeners(){
    const open_button = document.getElementById('open-button')
    const save_button = document.getElementById('save-button')
    const new_button = document.getElementById('new-button')

    new_button.addEventListener('click', function() {
        ipcRenderer.send('debug', "new called\n")

        const root_node = document.getRootNode()

        new_dict = {}
        let result = recursive_entry_new(root_node, new_dict)

        if (result == 0){
            ipcRenderer.send('new', new_dict)
        } else {
            ipcRenderer.send('debug', "problem with new")
        }
        
    })

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
}

function set_ipc_listeners(){
    ipcRenderer.on('update-displayed-data', function(event,arg){
        update_displayed_data(arg)
    })
}

// helper functions
function update_displayed_data(dict){
    const root_node = document.getRootNode()

    recursive_entry_editing(root_node, dict)

    automation.refresh_automation(ipcRenderer)
}

// TODO: make these recursive functions ignore certain tabs, like the entire list of every spell

function recursive_entry_new (node, dict){
    let return_val = 0;
    
    // add it in if it's data
    if (node.id != undefined && node.id != "" && node.id.search(C.SAVED_ENTRIES_ID_KEY) > 0){
        if (node.id in dict){
            ipcRenderer.send('debug', "this node id was repeated: " + node.id)
            return -1;
        }
        
        if (node.nodeName == 'INPUT' && node.type == 'text'){
            dict[node.id] = ""
        } else if (node.nodeName == 'INPUT' && node.type == 'checkbox') {
            dict[node.id] = false
        } else if (node.nodeName == 'TEXTAREA') {
            dict[node.id] = ""
        } else if (node.nodeName == 'SELECT') {
            dict[node.id] = node.childNodes[0].value
        } else if (node.nodeName == 'BUTTON') {
            // do nothing
        } else {
            ipcRenderer.send('debug', "type unrecognized: " + node.id + ", " + node.nodeName + ", " + node.type + ", " + node.value)
        }
    }

    // check children
    for (const element of node.childNodes){
        let r_val = recursive_entry_new(element, dict)

        if (r_val != 0){
            return_val = r_val
            break
        }
    }

    return return_val
}

function recursive_entry_editing(node, dict){
    let return_val = 0;
    
    // edit it in if it's data
    if (node.id != undefined && node.id != "" && node.id.search(C.SAVED_ENTRIES_ID_KEY) > 0){
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

        if (node.id + C.OVERRIDE_KEY in dict){
            node.style.color = dict[node.id + C.OVERRIDE_KEY]
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
    if (node.id != undefined && node.id != "" && node.id.search(C.SAVED_ENTRIES_ID_KEY) > 0){
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

        // deal with overrides
        dict[node.id + C.OVERRIDE_KEY] = node.style.color;
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

function fill_drop_down(node, options_arr){
    for (const option of options_arr){
        let new_element = document.createElement("option")

        new_element.textContent = option
        new_element.value = option

        node.appendChild(new_element)
    }
}


// main code
function init(given_ipcRenderer){
    ipcRenderer = given_ipcRenderer

    preload_from_constants()
    set_click_listeners()
    set_ipc_listeners()
}

module.exports = {
    init,
}