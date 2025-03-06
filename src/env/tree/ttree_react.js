import React from 'react';
import {useState, useEffect, useRef} from 'react';
import ReactDOM from 'react-dom';

import {events} from 'behavior-store/src/index.js';
// import {TreeBehavior, IO, TreeFsm, HostFsm} from './behavior.js';

// helper:
import {Tree, mk_tree} from './ttree_helpers.js';


// const host_name = "Host1";
// const tree_name = "TreeFsm1";



function TreeComponent({name, host_name, data, actions}){
    /*
     - ``tree_wrapper_id`` - id to use for component wrapper.
     Must not exist yet.
     */
    
    const tree = useRef();
    const storage = useRef(); // storage_id
    // const [tree_state, set_tree_state] = useState(data);

    // on tree_data update
    useEffect(()=>{
	events.emit(host_name+".update.exit", {
	    // TODO generalize name:
	    fargs: {tree_data: data}});
    }, [data]);


    // on init/exit
    useEffect(()=>{

	const tree = new Tree({
	    name: name,
	    host_name: host_name,
	    storage_ref: storage.current,
	    data: data,
	    actions: actions
	});

    
	// console.log("storage.current", storage.current);
	if (!tree.current){
	    tree.mk();
	    console.log("ENTERING: calling mk_tree to init the three.current");
	    tree.current = tree;
	}
	else
	    {
		// TODO: this code seems never used
		console.log("RELOADING: calling tree.current.reload_container");
		tree.current.tree.reload_container();
	    }

	return ()=>{
	    console.log("EXITING: calling tree.current.rm_tree");
	    tree.rm();
	};
    }, []);

    return(<div ref={el=>storage.current = el}
	   style={{"borderWidth": "1px",
		   "borderColor":"black"}}>This is react wrapper for a tree</div>);
}

export{TreeComponent}
