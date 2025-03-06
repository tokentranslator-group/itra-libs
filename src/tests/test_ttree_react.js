import React from 'react';
import {useState, useEffect, useRef} from 'react';
import ReactDOM from 'react-dom';

import {events} from 'behavior-store/src/index.js';

import {TreeComponent} from '../env/tree/ttree_react.js';
import {TreeBehavior, IO, TreeFsm, HostFsm} from '../env/tree/behavior.js';




function TestComponent({init_data}){
    // host_name, component, init_data, new_data, actions

    const [data, set_data] = useState(init_data);
    const [counter, set_counter] = useState(0);
    const [show, set_show] = useState(true);

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
	// update data
	set_data(new_tree_data);
	set_counter(new_counter);
    }
    let tree_name = "LTree";
    let tree = <div/>;

    // storage_id={"react_tree_storage"}
    if(show)
	tree = <TreeComponent

    name={tree_name}

    host_name={"Host"}

    data={data}

    actions = {{
	activate: (event, data) => console.log("clicked on: ", data.node.title),
	
	menu:{
	    
	    items: ["join", "mk", "load", "save"],
	    tooltips: ["join", "mk", "load entry", "rewrite selected model"],
	    
	    // keys here must be equal to ``menu_items``:
	    callbacks: {
		"join": ()=>events.emit(tree_name+".join", {}),
		"mk": ()=>{
		    console.log("mk...");
		    events.emit(tree_name+".mk", {});
		},
		"load": ()=>{
		    console.log("loading...");
		    
		    // fsm.emit("add.enter")
		},
		"save": ()=>console.log("saving...")
	    }
	}
    }}/>;
    
    return(<div>
	   <button onClick={()=>update_tree()}> test update tree</button>
	   <button onClick={()=>set_show(!show)}> show tree</button>
	   <p>Showing the tree {show} </p>
	   <p>Tree was updated {counter} times</p>
	   {tree}

	   </div>);
}


function main(){
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(
	<TestComponent init_data={{
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
