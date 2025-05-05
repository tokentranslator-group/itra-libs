import React from 'react';
import {useState, useEffect, useRef} from 'react';
import ReactDOM from 'react-dom';

import {events} from 'itra-behavior/src/eHandler.js';

import {TreeComponent} from '../env/tree/ttree_react.js';
import {mk_tree_edp, mk_tree_fsm} from '../env/tree/ttree_helpers.js';
import {get_host_emulator} from './test_host.js';
import {HostComponent} from '../env/host/host_react.js';
// import {TreeBehavior, IO, TreeFsm, HostFsm} from '../env/tree/behavior/TreeEdp.js';




function TestComponent({init_data, element_builder}){
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

    element_builder = {(options)=>element_builder(options)}
    data={data}

    actions = {{
	activate: (event, data) => console.log("clicked on: ", data.node.title),
	//TODO: data_update: (),
	menu:{
	    
	    items: ["join", "add", "load", "save"],
	    tooltips: ["join", "add", "load entry", "rewrite selected model"],
	    
	    // keys here must be equal to ``menu_items``:
	    callbacks: {
		"join": ()=>events.emit(tree_name+".join", {}),
		"add": ()=>{
		    console.log("add...");
		    events.emit(tree_name+".add", {});
		},
		"load": ()=>{
		    console.log("loading...");
		    
		    // fsm.emit("add.enter")
		},
		"save": ()=>console.log("saving...")
	    }
	}
    }}/>;
    
    //
    return(<div>
	   <button onClick={()=>events.show_observers()}> show observers </button>

	   <button onClick={()=>update_tree()}> test update tree</button>
	   <button onClick={()=>set_show(!show)}> show tree</button>
	   <br/>
	   <p>Testing Host Emulator:</p>
	   <HostComponent host_fsm={get_host_emulator()}/>
	   <br/>
	   <button onClick={()=>console.log(events)}> Dbg eHandler to console</button>
	   
	   <br/>
	   <p>Showing the tree {show} </p>
	   <p>Tree was updated {counter} times</p>
	   {tree}

	   </div>);
}



function test_tree(element_builder){
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(
	<TestComponent
	element_builder = {(options)=>element_builder(options)}
	init_data={{
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

function main(){
    test_tree(mk_tree_fsm);
    //test_tree(mk_tree_edp);
}

export {main}
