const path = require('path')

const C = require(path.join(__dirname, '..', 'CONSTANTS.js'))
const PPVALS = require(path.join(__dirname,'player_page_values.js'))

function add_ability_automation(ipcRenderer) {

    // ability score, mod, and saving throws

    const prof_e = document.getElementById(PPVALS.get_prof_id())
    add_override_mode(prof_e)

    for (const short_ability_name of C.player_info['short_ability_scores']){
        const modified_ability_score = document.getElementById(short_ability_name.toLowerCase() + C.SAVED_ENTRIES_ID_KEY)
        add_override_mode(modified_ability_score)
        add_ability_automation_on_focusout(ipcRenderer, modified_ability_score, short_ability_name)

        const saving_throw = document.getElementById(PPVALS.get_saving_throw_id(short_ability_name))
        add_override_mode(saving_throw)
        add_ability_automation_on_focusout(ipcRenderer, saving_throw, short_ability_name)

        add_ability_automation_on_change(ipcRenderer, PPVALS.get_save_prof_node(short_ability_name), short_ability_name)

        add_ability_automation_on_focusout(ipcRenderer, prof_e, short_ability_name) 
    }

    // TODO: skills

}

// sets all ability related values, without changing any overriden values (dark blue)
function set_ability_related_values(ipcRenderer, short_ability_name){
    let ability_score = PPVALS.get_ability_score(short_ability_name)
    
    // update modifiers
    const ability_modifier_display = document.getElementById(short_ability_name.toLowerCase() + '-display')
    ability_modifier_display.textContent = ability_score

    // update saves, unless overriden
    const save_prof = document.getElementById(PPVALS.get_save_prof_id(short_ability_name)).checked
    const saving_throw = document.getElementById(PPVALS.get_saving_throw_id(short_ability_name))
    if (saving_throw.style.color != C.OVERRIDEN_BLUE){
        let bonus = ((save_prof)?PPVALS.get_prof_bonus():0)
        saving_throw.value = ability_score + bonus
    }
}

// helper functions
function add_ability_automation_on_focusout(ipcRenderer, node, short_ability_name){
    node.addEventListener('focusout', (event) => {
        // propagate
        set_ability_related_values(ipcRenderer, short_ability_name)
    })
}

function add_ability_automation_on_change(ipcRenderer, node, short_ability_name){
    node.addEventListener('change', (event) => {
        // propagate
        set_ability_related_values(ipcRenderer, short_ability_name)
    })
}

function add_override_mode(node){
    if (node.nodeName == 'INPUT' && node.type == 'text'){
        node.style.color = C.BLACK

        // press shift to activate override mode (dark blue)
        node.addEventListener('keydown', function(event){
            if (event.shiftKey){
                if (node.style.color == C.BLACK){
                    node.style.color = C.OVERRIDEN_BLUE
                } else {
                    node.style.color = C.BLACK
                }
            }
        })
    }
    
}

module.exports = {
    add_ability_automation
}