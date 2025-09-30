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
import {mk_core_comp_for_editor_fsm_v1, map_host_editor, map_editor_host} from '../env/editor/ttabs_helpers.js';

import {Joiner} from '../env/joiner/joiner_react.js';


import {Querier} from '../env/querier/querier_react.js';

import {load_root, add, add_seq, activate, fetch, join, rm, save} from '../dsl/hla.js';

const host_name = "GraphDb";
const service_name = "graph_db";
const tree_name = "LTree";
const editor_name = "Editor";


function TestMc({db_handler}){
    const reducer = new ServiceReducer({
	host_name: host_name,
	service_name: service_name});

    const [tree_init_data, set_tree_init_data] = useState({children:[{title: "loading..."}]});
    useEffect(()=>{

	// load data from server and spawn the tree:
	load_root(reducer, (data)=>{
	    	
	    events.emit("show."+tree_name, {
		fargs:{data:apply_tree(data)}});
	});

	// for querier:
	fetch(reducer, (data)=>apply_tree(data).children);

	// for joiner:
	join(reducer, (data)=>apply_tree(data).children);

	// for saving:
	save(reducer, map_editor_host, map_host_editor);

	
    },[]);


    useEffect(() => {
	function handler(e){
	    if(e.key=="i"){
		console.log("DBG:PROBLEM:events:", events);
		events.show_observers();
	    }
	}	    
	window.addEventListener('keyup', handler);

	return () => window.removeEventListener('keyup', handler);
    }, []); 
   
    return(
	<>

	    <div>
	    
	    <Querier host_name={host_name}
	on_selected={(elm)=>{
	    console.log("PROBLEM map: elm:", elm);
	    events.emit("show."+editor_name,{fargs:{data: {
		tabs_ids: ["parser"],
		tabs_contents: [elm.title],
		field_tags: ["math"]}}});
	}}
	on_deselected={(elm)=>{
	    events.emit("hide."+editor_name, {});
	}}
	    />
	    </div>

	    <div style={{ top: "10%", left:"10%", width: "50%", height: "70px",
			  "zIndex": 1,
			  position: "absolute"
			}}>
	    <Joiner host_name={host_name}/>
	    </div>
	    
	    <TreeComponent 
	name={tree_name}	
	host_name={host_name}
	core_comp_builder={(options)=>mk_core_comp_for_tree_fsm_v1(options)}
	
	data={tree_init_data}
	show={false}
	actions={{
	    activate: (event, data) => {
		console.log("clicked on: ", data.node);
		let node = data.node.data;
		console.log("PROBLEM: tree activate node:", node);

		console.log("PROBLEM: tree activate map node:",
			    map_host_editor(node));
		if(node.kind == "folder")
		    activate(reducer, data.node.data.id, (nodes)=>{
			console.log("PROBLEM: activate folder nodes:", nodes);

			// for expanding current node:
			data.node.fromDict({
			    title: data.node.title,
			    children: apply_tree(nodes).children
			});	
		    });
		else

		    // alert("spawn editor");
		    // spawn editor:
		    // hide first then reopen again:
		    // events.emit("hide."+editor_name, {
		    //    on_done:(trace)=>{
		    // TODO: not give him data, only id,
		    // the data he should fetch by itself!
		    // or rather get(host, id, (node)=>emit(show,data:node))!
		    events.emit("show."+editor_name,{
			fargs:{data: map_host_editor(node)}});
		    /*
		    events.emit("show."+editor_name,{fargs:{data: {
			tabs_ids: ["body", "kind", "value"],
			tabs_contents: [node.body, node.kind, node.value],
			field_tags: [node.tags]}}});*/
		//   }});
	    },
	    //TODO: data_update: (),
	    menu:{
		
		items: ["join", "mk_folder", "add", "load", "rm"],
		tooltips: ["join", "mk_folder", "add", "load entry", "remove selected"],
		
		// keys here must be equal to ``menu_items``:
		callbacks: {
		    "join": ()=>{
			events.emit(host_name+".ActionsQueue",
				    {fargs: {action: "join"}});
		    },

		    "mk_folder": ()=>{
			console.log("adding folder...");

			// last param means folder:
			add_seq(reducer, (note)=>apply_tree([note]).children[0], true);
			// this also working:
			// add(reducer, (note)=>apply_tree([note]).children[0], true);
			// events.emit(host_name+".ActionsQueue",
			//	    {fargs: {action: "add", input:{folder: true}}});
			// events.emit(tree_name+".add", {});
		    },
		    "add": ()=>{
			console.log("adding...");

				
			add(reducer,
			    // transform note to tree format:    
			    (note)=>apply_tree([note]).children[0],

			    // last param means folder:
			    false);
			//events.emit(dhost_name+".ActionsQueue",
			//	    {fargs: {action: "add", folder: false}});
			// events.emit(tree_name+".add", {});
		    },
		    "load": ()=>{
			console.log("loading...");
			
			// fsm.emit("add.enter")
		    },
		    "rm": ()=>{
			console.log("removing...");
			rm(reducer);
		    }
		}
	    }}}

	    />

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
				    {fargs: {action: "save",
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

	    <HostComponent host_fsm={get_host(db_handler)}/>
    	    
    </>);
}


export function main(){
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(
	    <div>
	    <TestMc db_handler={$_db_handler}/>
	    </div>
    );

}
