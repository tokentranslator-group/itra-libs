import React from 'react';
import {useState, useEffect, useRef} from 'react';
import ReactDOM from 'react-dom';
import {EditorStorage} from './storage.js';
import {ETabs} from './ttabs_extended.js';


function EditorComponent({data}){
    /*
     - ``tree_wrapper_id`` - id to use for component wrapper.
     Must not exist yet.
     */
    const editor = useRef();
    const storage = useRef();
    const [state, set_state] = useState(data);

    // on tree_data update
    useEffect(()=>{
	console.log("data being updated");
	// events.emit("Host1.update.exit", {
	//    fargs: {editor_data: data}});
    }, [data]);


    // on init/exit
    useEffect(()=>{

	// const host_fsm = new HostFsm("Host1");
	//const tree_fsm = new TreeFsm("TreeFsm1", "Host1");
	
	// const io = new IO("TreeFsm1");    
    
	// console.log("storage.current", storage.current);
	if (!editor.current){
	    console.log("ENTERING: calling new ETabs():");
	    editor.current = new ETabs({
		name: "Editor",
		storage: new EditorStorage({
		    storage: storage.current,
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
	    editor.current.create_tabs();
	    // events.emit("TreeFsm1.mk_tree", {fargs: {tree: tree}});

	}
	else
	    {
		console.log("calling editor.current.reload_container");
		// editor.current.reload_container();
	    }
	// events.emit("EditorFsm.mk_editor", {fargs: {editor: editor.current}});
	return ()=>{
	    console.log("EXITING: calling editor.current.rm_tree");
	    editor.current.remove();

	    // io.unregister();
	    // tree_fsm.unregister();
	    // host_fsm.unregister();
	};
    }, []);

    return(<div ref={el=>storage.current = el}
	   style={{"borderWidth": "1px",
		   "borderColor":"black"}}>This is react wrapper for an editor</div>);
}

export{EditorComponent}
