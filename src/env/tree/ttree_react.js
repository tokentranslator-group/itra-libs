import React from 'react';
import {useState, useEffect, useRef} from 'react';
import ReactDOM from 'react-dom';

import {events} from 'behavior-store/src/index.js';
import {IO, TreeFsm, HostFsm} from './behavior.js';

// helper:
import {mk_tree} from './ttree_helpers.js';


function TreeComponent({tree_wrapper_id,  tree_options}){
    /*
     - ``tree_wrapper_id`` - id to use for component wrapper.
     Must not exist yet.
     */
    const tree = useRef();
    const storage = useRef(tree_wrapper_id);
    const [tree_state, set_tree_state] = useState(tree_options.tree_data);

    // on tree_data update
    useEffect(()=>{
	events.emit("Host1.update.exit", {
	    fargs: {tree_data: tree_options.tree_data}});
    }, [tree_options.tree_data]);


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
		
		options:tree_options
	    });
	}
	else
	    {
		console.log("calling tree.current.reload_container");
		tree.current.reload_container();
	    }
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
