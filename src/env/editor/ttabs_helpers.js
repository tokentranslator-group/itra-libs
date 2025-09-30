import {ETabs as EditorFrame} from './ttabs_extended.js';
import {NamedEditorStorage} from './storage.js';
import {mk_core_comp_v1} from '../react_wrapper.js';
import {mk_editor_fsm} from './behavior.js';


export function map_host_editor({id, body, type, tags, date}){
    let check = (attr)=>(attr!==undefined)?attr:"";
    return {
	id: id,
	tabs_ids: [
	    "body", "kind",
	    // "date"
	],
	tabs_contents: [
	    check(body), check(type),
	    //check(date)
	],
	field_tags: tags.split(",")
    };
}

export function map_editor_host({id, tabs_ids, tabs_contents, field_tags}){
    
    return {
	body: tabs_contents[0],
	kind: tabs_contents[1],
	// date: tabs_contents[2],
	tags: field_tags.join(","),
	id: id
    };
}

// FOR v1:
function mk_core_comp_for_editor_fsm_v1(options){
    /*
     - ``options`` -- {name, host_name, storage_ref, data, actions}
     */
    return mk_core_comp_v1(mk_editor_frame, mk_editor_fsm, options);
}


function mk_editor_frame({storage_ref, name, host_name, data, actions}){
    return new EditorFrame({

	    name: name,
	    storage: new NamedEditorStorage(storage_ref, name),
	    data:data,
	    actions: actions
    });
}
// END FOR

// DEPRICATED:
/*
class Editor{
    
    constructor({name, storage_ref, data, actions}){
	// this.frame
	this.editor = new ETabs({
	    name: name,
	    storage: new NamedEditorStorage(storage_ref, name),
	    data:data,
	    actions: actions
	});
	
	//this.behavior
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
*/
export{mk_core_comp_for_editor_fsm_v1}
