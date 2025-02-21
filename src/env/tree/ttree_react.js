import React from 'react';
import {useState, useEffect, useRef} from 'react';
import ReactDOM from 'react-dom';

import {events} from 'behavior-store/src/index.js';
import {IO, TreeFsm, HostFsm} from './behavior.js';

// helper:
import {mk_tree} from './ttree_helpers.js';


function TreeComponent({storage_id,  options}){
    /*
     - ``tree_wrapper_id`` - id to use for component wrapper.
     Must not exist yet.
     */
    const tree = useRef();
    const storage = useRef(); // storage_id
    const [tree_state, set_tree_state] = useState(options.data);

    // on tree_data update
    useEffect(()=>{
	events.emit("Host1.update.exit", {
	    fargs: {tree_data: options.tree_data}});
    }, [options.tree_data]);


    // on init/exit
    useEffect(()=>{

	const host_fsm = new HostFsm("Host1");
	const tree_fsm = new TreeFsm("TreeFsm1", "Host1");
	const io = new IO("TreeFsm1");    
    
	// console.log("storage.current", storage.current);
	if (!tree.current){
	    console.log("ENTERING: calling mk_tree to init the three.current");
	    tree.current = mk_tree({
		storage: storage.current,
		
		options:options
	    });
	}
	else
	    {
		// TODO: this code seems never used
		console.log("RELOADING: calling tree.current.reload_container");
		tree.current.reload_container();
	    }
	// initiate the fsm with the tree:
	events.emit("TreeFsm1.mk_tree", {fargs: {tree: tree.current}});
	return ()=>{
	    console.log("EXITING: calling tree.current.rm_tree");
	    tree.current.rm_tree();
	    io.unregister();
	    tree_fsm.unregister();
	    host_fsm.unregister();
	};
    }, []);

    return(<div ref={el=>storage.current = el}
	   style={{"borderWidth": "1px",
		   "borderColor":"black"}}>This is react wrapper for a tree</div>);
}

export{TreeComponent}
