import React from 'react';
import {useState, useEffect, useRef} from 'react';
import ReactDOM from 'react-dom';
import {createPortal} from 'react-dom';


import $ from 'jquery';


import {events} from 'behavior-store/src/index.js';

// import {Tree, sort_children} from '../ttree.js';
import {mk_tree, HostFsm, TreeFsm, IO} from './test_ttree.js';


function TreeComponent({tree_wrapper_id,  tree_data}){
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

function TestComponent({init_tree_data}){
    const [tree_data, set_tree_data] = useState(init_tree_data);
    const [counter, set_counter] = useState(0);

    function update_tree(){
	let new_counter = counter + 1;
	const new_tree_data = {
	    title: "updated available", key: "1", folder: true,
	    children: [
		{title: "updated "+new_counter+" times root", folder:true, key: "2",
		 children: [
		     {title: "updated first child", key: "5"},
		     {title: "second", key: "6"}
		 ]}
	    ]};
	set_tree_data(new_tree_data);
	set_counter(new_counter);
    }

    return(<div>
	   <button onClick={()=>update_tree()}> test update tree</button>
	   <p>Tree was updated {counter} times</p>
	    <TreeComponent tree_wrapper_id={"react_tree_storage"}
	   tree_data = {tree_data}/>
	   </div>);
}


function main(){
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(
	<TestComponent init_tree_data={{
	    title: "available", key: "1", folder: true,
	    children: [
		{title: "eqs parser", folder:true, key: "2",
		 children: [
		     {title: "tokens path", key: "5"},
		     {title: "tokens", key: "6"},
		     {title: "play space", key: "7"},
		     {title: "db path", key: "8"},
		     {title: "db", key: "9"}]},
	    ]}}/>
    );
}

export {main}
