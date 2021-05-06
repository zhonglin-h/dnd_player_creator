const path = require('path')

const saved_entries_id_key = "-entry"

const classes_info = require(path.join(__dirname, "constants", "classes_info.json"))
const player_info = require(path.join(__dirname, "constants", "player_info.json"))

module.exports = {
    classes_info,
    player_info,
    saved_entries_id_key
}