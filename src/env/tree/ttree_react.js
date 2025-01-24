import React from 'react';
import {useState, useEffect, useRef} from 'react';
import ReactDOM from 'react-dom';

import {events} from 'behavior-store/src/index.js';
import {IO, TreeFsm, HostFsm} from './behavior.js';


function TreeComponent({tree_wrapper_id,  tree_data, mk_tree}){
    /*
     - ``tree_wrapper_id`` - id to use for component wrapper.
     Must not exist yet.
     */
    const tree = useRef();
    const storage = useRef(tree_wrapper_id);
    const [tree_state, set_tree_state] = useState(tree_data);

    useEffect(()=>{
	events.emit("Host1.update.exit", {
	    fargs: {tree_data: tree_data}});
    }, [tree_data]);

    useEffect(()=>{

	const host_fsm = new HostFsm("Host1");
	const tree_fsm = new TreeFsm("TreeFsm1", "Host1");
	const io = new IO("TreeFsm1");    
    
	// console.log("storage.current", storage.current);
	if (!tree.current)
	    tree.current = mk_tree({
		storage: storage.current,
		
		container_id: "mc_0",
		tree_id: "left_tree_id",
		menu_id: "menu_id",
		input_id: "input_id",
		search_id: "search_id",

		tree_fsm_idx:"TreeFsm1",

		tree_data: tree_data
	    });
	else
	    tree.current.reload_container();

	events.emit("TreeFsm1.mk_tree", {fargs: {tree: tree.current}});
	return ()=>{
	    tree.current.rm_tree();
	};
    }, []);

    return(<div ref={el=>storage.current = el}
	   style={{"borderWidth": "1px",
		   "borderColor":"black"}}>This is react wrapper for a tree</div>);
}

export{TreeComponent}
