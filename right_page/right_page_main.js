
let ipcRenderer = undefined

let current_tab = 'about-tab'

function change_tab (new_tab_id) {

    // make current tab invisible
    let old_tab = document.getElementById(current_tab)
    old_tab.style.display = 'none'

    // make new tab visible
    let new_tab = document.getElementById(new_tab_id)
    new_tab.style.display = 'flex'
    
    current_tab = new_tab_id
}

function set_click_listeners() {
    const right_about_tab_button = document.getElementById('right-about-tab-button')
    const right_spells_tab_button = document.getElementById('right-spells-tab-button')

    right_about_tab_button.addEventListener('click', function() {
        change_tab('about-tab')
    })
    right_spells_tab_button.addEventListener('click', function() {
        change_tab('spells-tab')
    })
}

function init(incoming_ipcRenderer){
    ipcRenderer = incoming_ipcRenderer
    set_click_listeners()
}

module.exports = {
    init
}