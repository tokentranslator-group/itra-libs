import React from 'react';
import {useState, useEffect, useRef} from 'react';
import ReactDOM from 'react-dom';

import * as css from '../css/styles.css';
import * as css1 from '../css/tabs.css';
import * as css2 from '../css/dialog.css';
import * as css3 from '../css/all.css';

import {events} from 'itra-behavior/src/eHandler.js';

// import {mk_core_comp_for_tree_fsm_v1} from '../env/tree/ttree_helpers.js';
import {get_host_emulator} from './test_host.js';
import {HostComponent} from '../env/host/host_react.js';
import {ServiceReducer,$_db_handler, sim_db_handler} from  '../env/host/host_server.js';
import {get_host} from './test_host_server.js';

import {TreeComponent} from '../env/tree/ttree_react.js';
import {apply_tree} from '../env/tree/ttree_helpers.js';


import {EditorComponent} from '../env/editor/ttabs_react.js';
// import {mk_editor_fsm} from '../env/editor/behavior.js';
import {mk_core_comp_for_editor_fsm_v1, map_cert_editor} from '../env/editor/ttabs_helpers.js';

import {Joiner} from '../env/joiner/joiner_react.js';


import {Querier} from '../env/querier/querier_react.js';

import {load_root, add, add_seq, activate, fetch, join, rm, save, rename} from '../dsl/hla.js';

// certificate for internal data exchange:
import {cert_v0 as cert} from '../env/cert.js';

const host_name = "GraphDb";
const service_name = "graph_db";
const tree_name = "LTree";
const editor_name = "Editor";



function TestMc({db_handler}){
    const reducer = new ServiceReducer({
	host_name: host_name,
	service_name: service_name});

    const [tree_init_data, set_tree_init_data] = useState(
	cert.sign({
	    idd: "TestMc",
	    msg: {entries:[{value: "loading..."}]},
	    data_type: "Node",
	    data_form: "Multi"
	}));

    useEffect(()=>{

	// send init data to all:
	events.emit(host_name+".ActionsQueue",
		    {fargs: {
			action: "set_init_data",
			input: {cert:cert}
		    }});
	
	// load data from server and spawn the tree:
	load_root(reducer, (data)=>{
	    	
	    events.emit("show."+tree_name, {
		fargs:{data: data}});
	});

	// for querier:
	fetch(reducer, (entries)=>entries);
	// fetch(reducer, (data)=>apply_tree(data).children);

	// for joiner:
	join(reducer, ()=>{
	    // update tree after joining done
	    // load data from server and spawn the tree:
	    load_root(reducer, (data)=>{
	    	
		events.emit("show."+tree_name, {
		    fargs:{data:data}});
	    });			
	});

	// for saving editor only:
	save(reducer, ()=>{
	    	
	    // update querier:
	    events.emit(host_name+`.ActionsQueue`, {
		fargs:{action:"fetch.update"},
	    on_done: (trace)=>{console.log("PROBLEM: fetch.update");}});

	    // update tree after saving done
	    // load data from server and spawn the tree:
	    load_root(reducer, (data)=>{
	    	console.log("PROBLEM: tree fetch.update");
		events.emit("show."+tree_name, {
		    fargs:{data:data}});
	    });		

	});
	
	rename(reducer);

	
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
	    // TODO:
	    events.emit("show."+editor_name,
			{fargs:{data: map_cert_editor(elm)}});

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
	
	
	data={tree_init_data}
	show={false}
	actions={{
	    activate: (event, data) => {
		// data.node is fancytree node
		// data.node.data.original is original data from db, which
		// after having been recived from host was signed then
		// with use of the internal data protocol

		console.log("clicked on: ", data.node);
		let data_original = data.node.data.original;
		let node = data_original.node;
		// console.log("PROBLEM: tree activate node:", node);
		if(node.id == undefined)
		    throw new Error("the trees data.node.data.note_id is undefined");
		if(node.kind=="folder")
		// if(data.node.folder || node.kind=="folder")
		    activate(reducer, node.id, (entriesEdgeNode)=>{
			// console.log("PROBLEM:hla.activate folder pairsEdgeNode:", entriesEdgeNode);
			
			// for expanding current node:
			data.node.fromDict({
			    title: data.node.title,
			    // folder: true,
			    children: apply_tree(entriesEdgeNode).children
			    /*TODO:
			    apply_tree(pairsEdgeNode.map((pair)=>{
				
				// recived msg protocol check: 
				reducer.verify(tree_name, n);
				return n;
			    })).children*/
			});	
		    });
		else{
		    console.log("PROBLEM: tree activate map node:",
			    map_cert_editor(data_original));
		
		    // alert("spawn editor");
		    // spawn editor:
		    // hide first then reopen again:
		    // events.emit("hide."+editor_name, {
		    //    on_done:(trace)=>{
		    // TODO: not give him data, only id,
		    // the data he should fetch by itself!
		    // or rather get(host, id, (node)=>emit(show,data:node))!
		    events.emit("show."+editor_name,{
			// TODO: use protocol
			fargs:{data: map_cert_editor(data_original)}});
		    /*
		    events.emit("show."+editor_name,{fargs:{data: {
			tabs_ids: ["body", "kind", "value"],
			tabs_contents: [node.body, node.kind, node.value],
			field_tags: [node.tags]}}});*/
		//   }});
		}
	    },
	    //TODO: data_update: (),
	    menu:{
		
		items: ["join", "mk_folder", "add", "load", "rm", "rename"],
		tooltips: ["join", "mk_folder", "add", "load entry", "remove selected", "rename"],
		
		// keys here must be equal to ``menu_items``:
		callbacks: {
		    "join": ()=>{
			events.emit(host_name+".ActionsQueue",
				    {fargs: {action: "join"}});
		    },

		    "mk_folder": ()=>{
			console.log("adding folder...");

			// last param means folder:
			add_seq(reducer, true);
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
		    },
		    "rename":()=>{
			events.emit(host_name+".ActionsQueue",
				    {fargs: {action: "rename"}});
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
					
			// trigger editor action
			events.emit(host_name+".ActionsQueue",
				    {fargs: {
					action: "save"}});
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
