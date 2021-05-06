const {ipcRenderer} = require('electron')

function recursive_entry_adding(node, dict){
    let return_val = 0;
    
    // add it in if it's data
    if (node.id != undefined && node.id != "" && node.id.search('-entry') > 0){
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
        } else if (node.nodeName == 'BUTTON') {
            // do nothing
        } else {
            ipcRenderer.send('debug', node.id.search('-entry'))
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

window.addEventListener('DOMContentLoaded', () => {
    // set onclick listeners
    const save_button = document.getElementById('save-button')

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
})