const path = require('path')

const C = require(path.join(__dirname, '..', 'CONSTANTS.js'))
const PPVALS = require(path.join(__dirname,'player_page_values.js'))

let all_overrideable_inputs = []

function add_ability_automation(ipcRenderer) {

    // ability score, mod, and saving throws

    const prof_e = document.getElementById(PPVALS.get_prof_id())
    add_override_mode(prof_e)
    all_overrideable_inputs.push(prof_e)

    for (const short_ability_name of C.player_info['short_ability_scores']){
        const modified_ability_score = document.getElementById(short_ability_name.toLowerCase() + C.SAVED_ENTRIES_ID_KEY)
        add_override_mode(modified_ability_score)
        all_overrideable_inputs.push(modified_ability_score)
        add_ability_automation_on_focusout(ipcRenderer, modified_ability_score, short_ability_name)

        const saving_throw = document.getElementById(PPVALS.get_saving_throw_id(short_ability_name))
        add_override_mode(saving_throw)
        all_overrideable_inputs.push(saving_throw)
        add_ability_automation_on_focusout(ipcRenderer, saving_throw, short_ability_name)

        add_ability_automation_on_change(ipcRenderer, PPVALS.get_save_prof_node(short_ability_name), short_ability_name)

        add_ability_automation_on_focusout(ipcRenderer, prof_e, short_ability_name) 
    }

    // skills
    for (const skill of C.player_info['skills']){
        const skill_node = PPVALS.get_skill_mod_node(skill)

        add_override_mode(skill_node)
        all_overrideable_inputs.push(skill_node)
        add_ability_automation_on_focusout(ipcRenderer, skill_node, skill['ability_type'])

        add_ability_automation_on_change(ipcRenderer, PPVALS.get_skill_prof_node(skill), skill['ability_type'])
    }
}

function refresh_overrides(){
    for (const node of all_overrideable_inputs){
        reset_node_override(node)
    }
}

function refresh_automation(ipcRenderer) {
    ipcRenderer.send('debug', 'test')

    for (const short_ability_name of C.player_info['short_ability_scores']){
        set_ability_related_values(ipcRenderer, short_ability_name)
    }
}

// sets all ability related values, without changing any overriden values (dark blue)
function set_ability_related_values(ipcRenderer, short_ability_name){
    let ability_score = PPVALS.get_ability_score(short_ability_name)
    
    // update modifiers
    const ability_modifier_display = document.getElementById(short_ability_name.toLowerCase() + '-display')
    ability_modifier_display.textContent = ability_score

    // update saving throws, unless overriden
    const save_prof = document.getElementById(PPVALS.get_save_prof_id(short_ability_name)).checked
    const saving_throw = document.getElementById(PPVALS.get_saving_throw_id(short_ability_name))
    if (saving_throw.style.color != C.OVERRIDEN_BLUE){
        let bonus = ((save_prof)?PPVALS.get_prof_bonus():0)
        saving_throw.value = ability_score + bonus
    }

    // update skills
    for (const skill of C.player_info['skills']){
        if (skill['ability_type'] == short_ability_name){
            const skill_node = PPVALS.get_skill_mod_node(skill)
            const skill_prof = PPVALS.get_skill_prof(skill)

            if (skill_node.style.color != C.OVERRIDEN_BLUE){
                skill_node.value = ability_score + get_bonus_from_prof(skill_prof, PPVALS.get_prof_bonus())
            }
        }
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

function reset_node_override(node){
    if (node.nodeName == 'INPUT' && node.type == 'text'){
        node.style.color = C.BLACK
    }
}

// changes '-', 'P', and 'E' to number bonus
function get_bonus_from_prof(prof_state, prof_bonus){
    if (prof_state == '-')
        return 0
    else if (prof_state == 'P')
        return prof_bonus
    else if (prof_state == 'E')
        return prof_bonus * 2
    else
        return NaN
}

module.exports = {
    add_ability_automation,
    refresh_automation,
    refresh_overrides
}