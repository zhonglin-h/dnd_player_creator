const path = require('path')

const C = require(path.join(__dirname, '..', 'CONSTANTS.js'))

// --------- VALUES
function get_ability_score(short_ability_name){
    const modified_ability_score = document.getElementById(short_ability_name.toLowerCase() + C.SAVED_ENTRIES_ID_KEY)
    // compute ability score total
    return sum_string_array(modified_ability_score.value.split('+'))
}

function get_prof_bonus(){
    return parseInt(document.getElementById(get_prof_id()).value)
}

// --------- Nodes
function get_save_prof_node(short_ability_name){
    return document.getElementById(get_save_prof_id(short_ability_name))
}

// --------- IDs
function get_prof_id(){
    return 'prof-bonus-entry'
}

function get_save_prof_id(short_ability_name){
    return short_ability_name.toLowerCase() + '-saving-throw-prof' + C.SAVED_ENTRIES_ID_KEY
}

function get_saving_throw_id(short_ability_name){
    return short_ability_name.toLowerCase() + '-saving-throw' + C.SAVED_ENTRIES_ID_KEY
}

// helper functions
function sum_string_array(array){
    let total = 0
    for (const val of array){
        let result = ability_score_to_modifier(parseInt(val))
        if (result == NaN){
            return false
        } else {
            total += result
        }
    }
    return total
}

function ability_score_to_modifier(score){
    return Math.floor((score-10) / 2)
}

module.exports = {
    get_ability_score,
    get_prof_bonus,
    get_save_prof_node,
    get_prof_id,
    get_save_prof_id,
    get_saving_throw_id
}