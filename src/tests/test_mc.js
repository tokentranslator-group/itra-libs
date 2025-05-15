import React from 'react';
import {useState, useEffect, useRef} from 'react';
import ReactDOM from 'react-dom';

import {events} from 'itra-behavior/src/eHandler.js';

import {mk_core_comp_for_tree_fsm_v1} from '../env/tree/ttree_helpers.js';
import {get_host_emulator} from './test_host.js';
import {HostComponent} from '../env/host/host_react.js';
import {TreeComponent} from '../env/tree/ttree_react.js';

import {EditorComponent} from '../env/editor/ttabs_react.js';
// import {mk_editor_fsm} from '../env/editor/behavior.js';
import {mk_core_comp_for_editor_fsm_v1} from '../env/editor/ttabs_helpers.js';

const host_name = "Host";
const tree_name = "LTree";
const editor_name = "Editor";

function test_mc(){
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(
	    <div>
	    <p>Host Emulator:</p>
	    <HostComponent host_fsm={get_host_emulator()}/>

	    <p> OuterComponent:</p>

	    <div style={{position:"absolute", width: "20%", height: "50%"}}>
	    <TreeComponent 
	name={tree_name}	
	host_name={host_name}
	core_comp_builder={(options)=>mk_core_comp_for_tree_fsm_v1(options)}
	
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
	    activate: (event, data) => {
		console.log("clicked on: ", data.node.title);
		
		// hide first then reopen again:
		// events.emit("hide."+editor_name, {
		//    on_done:(trace)=>{
		events.emit("show."+editor_name,{fargs:{data: {
		    tabs_ids: ["parser"],
		    tabs_contents: [data.node.title],
		    field_tags: ["math"]}}});
		 //   }});
		
		
	    },
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
	    </div>

	    <div style={{position:"absolute", buttom:"10%", top: "10%", left:"50%", width: "30%", height: "100px"}}>

	    <EditorComponent
	name={editor_name}
	host_name={host_name}
	core_comp_builder={(options)=>{
	    console.log("ISSUE:show/hidecore_comp_builder : options:", options);
	    return mk_core_comp_for_editor_fsm_v1(options);}}
	data={{
	    tabs_ids: ["parser", "out"],
	    tabs_contents: ["2+2", "4"],
	    field_tags: ["math"]}}
	
	actions={{
	
	    // TODO: unite to dict:
	    buttons_names: ["save", "close"],
	    tabs_buttons_callbacks:[
		(tab_id, tab_content_text_id, _self)=>
		    (e)=>{
			console.log("Editor.save");
			events.emit(host_name+".ActionsQueue",
				    {fargs: {action: "save.enter",
					    input: _self.data}});

		    },
		(tab_id, tab_content_text_id, _self)=>
		    (e)=>{
			console.log("Editor.close");
			events.emit("hide."+editor_name, {});
		    }	    	    
	]}}
	show={false}
	    />;
	</div>
	    </div>
    );
}


export function main(){
    test_mc();
}
