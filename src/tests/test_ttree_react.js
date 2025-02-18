import React from 'react';
import {useState, useEffect, useRef} from 'react';
import ReactDOM from 'react-dom';

import {events} from 'behavior-store/src/index.js';

import {TreeComponent} from '../env/tree/ttree_react.js';




function TestComponent({init_tree_data}){
    const [tree_data, set_tree_data] = useState(init_tree_data);
    const [counter, set_counter] = useState(0);
    const [show_tree, set_show_tree] = useState(true);

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
    let tree_fsm_idx = "TreeFsm1";
    let tree = <div/>;

    if(show_tree)
	tree = <TreeComponent tree_wrapper_id={"react_tree_storage"}
	   tree_options = {{
	       container_id: "mc_0",
	       tree_id: "left_tree_id",
	       menu_id: "menu_id",
	       input_id: "input_id",
	       search_id: "search_id",
	       
	       tree_fsm_idx: tree_fsm_idx,
	       
	       tree_data: tree_data,
	       actions: {
		   activate: (event, data) => console.log("clicked on: ", data.node.title),

		   menu:{
		       
		       items: ["join", "mk", "load", "save"],
		       tooltips: ["join", "mk", "load entry", "rewrite selected model"],

		       // keys here must be equal to ``menu_items``:
		       callbacks: {
			   "join": ()=>events.emit(tree_fsm_idx+".join", {}),
			   "mk": ()=>{
			       console.log("mk...");
			       events.emit(tree_fsm_idx+".mk", {});
			   },
			   "load": ()=>{
			       console.log("loading...");
			       
			       // fsm.emit("add.enter")
			   },
			   "save": ()=>console.log("saving...")
		       }
		   }
		   
	       }
	   }}/>;
    
    return(<div>
	   <button onClick={()=>update_tree()}> test update tree</button>
	   <button onClick={()=>set_show_tree(!show_tree)}> show tree</button>
	   <p>Showing the tree {show_tree} </p>
	   <p>Tree was updated {counter} times</p>
	   {tree}

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
