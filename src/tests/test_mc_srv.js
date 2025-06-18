import React from 'react';
import {useState, useEffect, useRef} from 'react';
import ReactDOM from 'react-dom';

import * as css from '../css/styles.css';
import * as css1 from '../css/tabs.css';
import * as css2 from '../css/dialog.css';
import * as css3 from '../css/all.css';

import {events} from 'itra-behavior/src/eHandler.js';

import {mk_core_comp_for_tree_fsm_v1} from '../env/tree/ttree_helpers.js';
import {get_host_emulator} from './test_host.js';
import {HostComponent} from '../env/host/host_react.js';
import {mk_host_server, ServiceReducer,$_db_handler, sim_db_handler} from  '../env/host/host_server.js';
import {get_host} from './test_host_server.js';

import {TreeComponent} from '../env/tree/ttree_react.js';
import {apply_tree} from '../env/tree/ttree_helpers.js';

import {EditorComponent} from '../env/editor/ttabs_react.js';
// import {mk_editor_fsm} from '../env/editor/behavior.js';
import {mk_core_comp_for_editor_fsm_v1} from '../env/editor/ttabs_helpers.js';

import {Joiner} from '../env/joiner/joiner_react.js';


import {Querier} from '../env/querier/querier_react.js';

import {load_root} from './test_hla.js';

const host_name = "GraphDb";
const service_name = "graph_db";
const tree_name = "LTree";
const editor_name = "Editor";


function TestMc({db_handler}){
    const [tree_init_data, set_tree_init_data] = useState({});
    useEffect(()=>{
	
	load_root((data)=>set_tree_init_data(apply_tree(data)));
	
	/*
	// TODO: to separate test:
	function cont(data){
	    events.emit("show."+tree_name, {
		fargs:{data:{
		    children: [{
			title: "data_from_show", key: "1", folder: true,
			children: [{title: "tokens path", key: "2"}]}]}}});
	}
	function cont1(){
	    events.on(host_name+".ActionsQueue",
		      ({event_type, args, trace})=>{
			  if(args.input.action=="gets"){
			  if(args.input.data.length>0)
			      // use recived data here
			      cont(args.input.data);
			  else{
			      // create root and try again:
			      // unsubscibe
			      events.off({idd: "fetch_kb"});

			      // subscribe to mk_node to trigger
			      // self again:
			      host.on(mk_nodes, cont1());
			      // emit mk_node do above 
			      host.emit.mk_nodes({"title": "root"});
			      
			  }
			  
		      }
		      
		      host.emit.gets;
		  }, {idd:"fetch_kb"});
	
	}
	 */
    },[]);
    return(
	<>
	    <HostComponent host_fsm={get_host(db_handler)}/>
    	    
	    <TreeComponent 
	name={tree_name}	
	host_name={host_name}
	core_comp_builder={(options)=>mk_core_comp_for_tree_fsm_v1(options)}
	
	data={tree_init_data}
	
	actions={{
	    activate: (event, data) => {
		console.log("clicked on: ", data.node.title);
		
		// TODO:
		// for expanding current node:
		//data.node.fromDict({
		//    title: data.node.title,
		//    children: dict_children["both"]
		//});

		// spawn editor:
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
		    "join": ()=>events.emit("join",{
			fargs:{data: {}}}),

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
    </>);
}


export function main(){
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(
	    <div>
	    <TestMc db_handler={sim_db_handler}/>
	    </div>
    );

}
