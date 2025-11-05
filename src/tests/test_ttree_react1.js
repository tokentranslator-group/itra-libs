import React from 'react';
import {useState, useEffect, useRef} from 'react';
import ReactDOM from 'react-dom';

import {events} from 'itra-behavior/src/eHandler.js';


import {mk_core_comp_for_tree_edp, mk_core_comp_for_tree_fsm, mk_core_comp_for_tree_fsm_v1} from '../env/tree/ttree_helpers.js';
import {get_host_emulator} from './test_host.js';
import {HostComponent} from '../env/host/host_react.js';
import {TreeComponent} from '../env/tree/ttree_react.js';


const tree_name = "LTree";
const host_name = "Host";



function test_tree(core_comp_builder){
    /*Testing: Tree+Host; show/hide; some tree actions */

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(
	    <div>
	    <p>Host Emulator:</p>
	    <HostComponent host_fsm={get_host_emulator()}/>

	    <p> OuterComponent:</p>

	    <TreeComponent 
	name={tree_name}	
	host_name={host_name}

	// use_data_converter so do not apply_tree to the data:
	use_data_converter={false}
	

	data={{
	    title: "available", key: "1", folder: true,
	    children: [
		{title: "eqs parser", folder:true, key: "2",
		 children: [
		     {title: "tokens path", key: "5"},
		     {title: "tokens", key: "6"},
		     {title: "play space", key: "7"},
		     {title: "db path", key: "8"},
		     {title: "db", key: "9"}]},
	    ]}}
	
	actions={{
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
			events.emit(host_name+".ActionsQueue",
				    {fargs: {action: "add"}});
			// events.emit(tree_name+".add", {});
		    },
		    "load": ()=>{
			console.log("loading...");
			
			// fsm.emit("add.enter")
		    },
		    "save": ()=>console.log("saving...")
		}
	    }}}
	
	    />
	    <button onClick={()=>{
		events.emit("show."+tree_name, {
		    fargs:{data:{
			children: [{
			    title: "data_from_show", key: "1", folder: true,
			    children: [{title: "tokens path", key: "2"}]}]}}});
	    }}> show </button>
	    
	    <button onClick={()=>{
		events.emit("hide."+tree_name, {});
	    }}> hide </button>
	    <br/>

	    </div>
    );

}


function main(){
    test_tree(mk_core_comp_for_tree_fsm_v1);
    // test_tree(mk_core_comp_for_tree_fsm);
}


export {main}
