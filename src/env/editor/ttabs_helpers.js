import {ETabs} from './ttabs_extended.js';
import {NamedEditorStorage} from './storage.js';

class Editor{
    
    constructor({name, storage_ref, data, actions}){
	this.editor = new ETabs({
	    name: name,
	    storage: new NamedEditorStorage(storage_ref, name),
	    data:data,
	    actions: actions
	});
	
    }

    mk(){
	console.log("Editor.editor.storage:", this.editor.storage);
	this.editor.create_tabs();
    }
    rm(){
	this.editor.remove();
    }
}


function mk_editor({storage, options}){
	
    const tabs = new ETabs({
	div_id: div_storage_id,
	subdiv_id_name: "parser",
	// buttons_name: "save",
	header: "selected entry data:",
	tabs_ids: ["parser", "out"],
	tabs_contents: ["2+2", "4"],
	field_tags: ["math"],
	
	// TODO: unite to dict:
	buttons_names: ["save", "refresh", "copy"],
	tabs_buttons_callbacks:[]});

    return tabs;
}

export{Editor, mk_editor}
