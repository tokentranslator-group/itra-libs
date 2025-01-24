import React from 'react';
import {useState, useEffect, useRef} from 'react';
import ReactDOM from 'react-dom';
import {createPortal} from 'react-dom';


import $ from 'jquery';


import {events} from 'behavior-store/src/index.js';

// import {Tree, sort_children} from '../ttree.js';
import {mk_tree, HostFsm, TreeFsm, IO} from './test_ttree.js';


function Component({tree_storage_id, child_content, child_dom}){
    const tree = useRef();
    const storage = useRef("react_tree_storage");
    const container = useRef();
    const main_tree = useRef();
    const tree_menu = useRef();
    const tree_input = useRef();

    useEffect(()=>{

	const host_fsm = new HostFsm("Host1");
	const tree_fsm = new TreeFsm("TreeFsm1", "Host1");
	const io = new IO("TreeFsm1");    
    
	// TODO:
	console.log("storage.current", storage.current);
	if (!tree.current)
	    tree.current = mk_tree({storage: storage.current, container_id: "mc_0", tree_id: "left_tree_id", menu_id: "menu_id", input_id: "input_id", tree_fsm_idx:"TreeFsm1"});
	else
	    tree.current.reload_container();

	events.emit("TreeFsm1.mk_tree", {fargs: {tree: tree.current}});
	return ()=>{
	    
	};
    }, []);

    return(<div ref={el=>storage.current = el}
	   style={{"borderWidth": "1px",
		   "borderColor":"black"}}>This is react wrapper for a tree</div>);
}


function main(){
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<Component/>);
}

export {main}
