//import {events} from 'behavior-store/src/index.js';

// behavior:
//import {IO, TreeFsm, HostFsm} from '../env/tree/behavior.js';
import * as ui from 'jquery-ui';

import 'jquery-ui/ui/widgets/tabs';
import 'jquery-ui/ui/widgets/dialog';


import {ETabs} from '../env/editor/ttabs_extended.js';
import {EditorStorage} from '../env/editor/storage.js';


function mk_editor({storage, data}){
    let editor = new ETabs({
	name: "Editor",
	storage: new EditorStorage({
	    storage: storage,
	    container_div_id: "mc_0",
	    subdiv_id_name: "parser"}),
	
	data:data,
	
	actions: {
	    
	    // TODO: unite to dict:
	    buttons_names: ["save", "refresh", "copy"],
	    tabs_buttons_callbacks:[
		(tab_id, tab_content_text_id)=>{
		    console.log("save");
		},
		(tab_id, tab_content_text_id)=>{
		    console.log("refresh");
		},
		(tab_id, tab_content_text_id)=>{
		    console.log("copy");
		}
		
	    ]}
    });
    editor.create_tabs();

}


function main(){
    const root = document.getElementById('root');
    mk_editor({
	storage:root,
	data: {
	    tabs_ids: ["parser", "out"],
	    tabs_contents: ["2+2", "4"],
	    field_tags: ["math", "phys"]}});
}


export{main}
