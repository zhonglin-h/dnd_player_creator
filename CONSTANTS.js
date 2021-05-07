const path = require('path')

const SAVED_ENTRIES_ID_KEY = "-entry"
const OVERRIDE_KEY = '-override'

const classes_info = require(path.join(__dirname, "constants", "classes_info.json"))
const player_info = require(path.join(__dirname, "constants", "player_info.json"))

const OVERRIDEN_BLUE = 'rgb(3, 157, 252)'
const BLACK = 'rgb(0, 0, 0)'

module.exports = {
    classes_info,
    player_info,
    SAVED_ENTRIES_ID_KEY,
    OVERRIDE_KEY,
    OVERRIDEN_BLUE,
    BLACK
}