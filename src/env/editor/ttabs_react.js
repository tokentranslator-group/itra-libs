import React from 'react';
import {useState, useEffect, useRef} from 'react';
import ReactDOM from 'react-dom';

import {mk_core_comp_for_editor_fsm_v1} from './ttabs_helpers.js';
import {OuterComponent} from '../react_wrapper.js';


function EditorComponent({name, host_name, core_comp_builder, data, actions, show}){
    return(
	    <OuterComponent
	name={name}
    
	host_name={host_name}

	element_builder = {(options)=>core_comp_builder(options)}
	data={data}
	actions={actions}
	
	show_actions={true}
	show_state={true}
	show={show}
	    />
    );
}

/*
// DEPRICATED:
function EditorComponent({name, host_name, data, actions}){
    *
     - ``tree_wrapper_id`` - id to use for component wrapper.
     Must not exist yet.
     *
    const editor = useRef();
    const storage = useRef();
    const [state, set_state] = useState(data);

    // on tree_data update
    useEffect(()=>{
	console.log("data being updated");
	// events.emit(host_name+".update.exit", {
	//    fargs: {editor_data: data}});
    }, [data]);


    // on init/exit
    useEffect(()=>{

	// component.storage should not be initiated on init but on mk!
	// since storage.current not yet having been initiated 
	const editor = new Editor({
	    name: name,
	    storage_ref: storage.current, 
	    data:data,		
	    actions: actions
	});
	
	if (!editor.current){
	    console.log("ENTERING: calling new ETabs():");

	    editor.mk();
	    editor.current = editor;
	}
	else
	    {
		console.log("calling editor.current.reload_container");
		// editor.current.reload_container();
	    }
	// events.emit("EditorFsm.mk_editor", {fargs: {editor: editor.current}});
	return ()=>{
	    console.log("EXITING: calling editor.current.rm_tree");
	    editor.rm();

	};
    }, []);

    return(<div ref={el=>storage.current = el}
	   style={{"borderWidth": "1px",
		   "borderColor":"black"}}>This is react wrapper for an editor</div>);
}
*/
export{EditorComponent}
