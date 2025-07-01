import React from 'react';
import {useState, useEffect, useRef} from 'react';
import ReactDOM from 'react-dom';

import {events} from 'itra-behavior/src/eHandler.js';

import {FsmCurrentStateViewer, useEdpHook} from 'itra-behavior/src/type_classes/fsm/views/helpers.js';

import {HostComponent} from '../env/host/host_react.js';
import {mk_host_server, ServiceReducer} from  '../env/host/host_server.js';
import {get_host} from  './test_host_server.js';

const host_name = "GraphDb";
const service_name = "graph_db";

const stack_name = host_name+".ActionsQueue";


function middleware(data, on_body, on_succ){
    let name = "mid_name";
    events.on(stack_name+".Middleware",
	      ({event_type, args, trace})=>{
		  if(args.action=="done" && args.name == name)
		      on_body(args.data);
	      });
    
    events.emit(stack_name+".Middleware", {
	fargs:{
	    action:"done",
	    name: name,
	    data: data},
	on_done: ()=>on_succ(data)});
}


export function cont01(data, on_succ, root){
    const host_reducer = new ServiceReducer(host_name, service_name);
    host_reducer.call("ls", data, (data)=>{
	on_succ(data);
	if(root && data.length == 0)
	    host_reducer.call("mk_nodes", [{title: "root"}, (data)=>{
		on_succ([]);// since root has no child yet
	    }]);
	else
	    on_succ(data);
    });
}

// hla-s:
export function add_v1(host_reducer, parent_id, on_succ){
    /*Approach here is similiar to the old itra one:
     call each hla with common res object to forfill
     Although code is clearer - it still not without problems.
     See add_tree_enter desc.
      This approach will not going to work since host_reducer is a fsm 
     which will be in the Waiting state when on_succ will be called.
     So only v0 for now
     */

    var res = {};
    // return node_name
    res["node_name"] = add_tree_enter();
    // res["node_name"] should be ready here because of synch

    // create child:
    mk_notes(
	host_reducer,
	[{value: res["node_name"]}],
	(notes_ids)=>{
	    const child_id = notes_ids[0];
	    res["child_id"] = child_id;
	});

    // just create an edge:
    mk_edges(
	host_reducer,
	[{_from: parent_id, _to:res["child_id"]}],
	(data_edges)=>{
	    // this data no realy needed:
	    res["edge_id"] = data_edges[0];
	});
    
    // get child note:
    get(
	host_reducer, res["child_id"],
	(data_get_child)=>{
	    res["child"] = data_get_child;
	});

    // finally:
    events.emit(host_name+".ActionsQueue", {fargs:{action:"add.tree.exit", input: {node: res["child"]}}});
	    
}

function add_tree_enter(){
    /* Ask a tree to take name of new node from an user.

     # ISSUE:
      This will not work if eHandler.waiting[stack_name]
     is not empty. In this case the events.emit will be
     put into the waiting list and the code will continue.
     This will hapend if this function been called from 
     events.emit(stack_name).
     
      Await will not going to solve this problem since
     while we waiting the second emit event, the first
     one (from which this func have been called) never
     finished.
     */
    var node_name;
    events.on(stack_name,
	      ({event_type, args, trace})=>{
		  if(args.action=="add.tree.enter")
		      
		      node_name = args.input.node_name;
		  });

    events.emit(host_name+".ActionsQueue",
		{fargs: {action: "add"}});
    return node_name;
}


export function add(host_reducer, apply_tree_for_node, folder){
    /*
     - ``apply_tree_for_node`` -- used here to convert result before sending/emitting it to tree
     */
    // identifier for this hla subs/unsubs:
    let hla_idd = "HlaEdpSeq.add";
    
    // let hla_action_name = "hla.edp.seq.add";

    folder = folder==undefined?true:folder;
    console.log("PROBLEM: folder:", folder);
    events.on(stack_name,
	      ({event_type, args, trace})=>{
		  if(args.action=="add.tree.enter")
		  
		      // create child:
		      mk_notes(
			  host_reducer,
			  [{value: args.input.node_name, kind: folder?"folder":"note"}],
			  (notes_ids)=>{
			      const child_id = notes_ids[0];

			      // connect child to parent:
			      mk_edges(
				  host_reducer,
				  [{_from: args.input.parent_node.id,
				    _to:child_id}],
				  (data_edges)=>

				      // get new node obj:
				      get(
					  host_reducer, child_id,
					  (data_get_child)=>{

					      // finally:
					      events.emit(
						  host_name+".ActionsQueue",
						  {
						      fargs:{
							  action:"add.tree.exit",
							  input: {node: apply_tree_for_node(data_get_child)}},
						      
						      // unsubscribe on complition
						      on_done: (trace)=>{
							  if(events.has(host_name+".ActionsQueue", {idd:hla_idd})){
							      events.off(host_name+".ActionsQueue", {idd:hla_idd});
							  }
						      }
						  });},
					  
					  
				      ));
			  });
		  
	      }, {idd: hla_idd});
    
    // calling tree.add
    events.emit(host_name+".ActionsQueue",
		{
		    fargs: {action: "add"}
		});
}


export function load_root(host_reducer, on_succ){
    
    // list root note:
    gets(host_reducer, {value:"root", table_type: "note"},

	 // succ
	 (data)=>{
	     console.log("PROBLEM: load_root: data", data);
	     if(data.length == 0)
		 
		 // create root node if not exist
		 mk_notes(host_reducer, [{value: "root", kind:"folder"}],
			  
			  // replace all ids with notes:
			  (notes_ids)=>
			  map_to_notes(host_reducer, notes_ids, on_succ));
	     else
		 on_succ(data);
	 });
}


export function map_to_notes(host_reducer, ids, on_succ, result){
    /*
     Call get hla for each index in ids list reqursivelly.  
     Reqursive - this is a glimps on how hla could be called sequentially*/

    result = result==undefined?[]:result;
    if(ids.length>0){
	let first = ids[0];
	let rest = ids.slice(1);
	get(host_reducer, first, (data)=>(map_to_notes(host_reducer, rest, on_succ, [...result, data])));	
    }
    else
	//finally: 
	on_succ(result);   
}


export function activate(host_reducer, id, on_succ){
    get(host_reducer, id, (data)=>{
	if(data.kind == "folder")
	    ls_note(host_reducer, id, on_succ);
	else
	    throw new Error("tree.activate: only folders supported for expansion!");
    });
}

// lla-s:

export function ls_note(host_reducer, _id, on_succ){
     host_reducer.call("ls", {id: _id}, (data)=>{
	 console.log("PROBLEM: ls_note:data", data);

	 // show only forward neighbors:
	 on_succ(data[1]);});
}

// TODO: map to notes
function get(host_reducer, _id, on_succ){
    // get note from server by id:
    host_reducer.call("get", {id: _id, "table_type": "note"},
		      (data)=>on_succ(data));
}

function gets(host_reducer, data, on_succ){
    host_reducer.call("gets", data, (data)=>on_succ(data));
}


function mk_edges(host_reducer, edges_list, on_succ){							      
    host_reducer.call("mk_edges",
		      {edges:edges_list}, (data)=>on_succ(data["[Id]"]));
}

// TODO: map to notes:
function mk_notes(host_reducer, notes_list, on_succ){
    console.log("PROBLEM: folder notes to create:", notes_list);
    host_reducer.call("mk_notes", {notes: notes_list},
		      (data)=>on_succ(data["[Id]"]));
}

function init(data, on_succ){
    const host_reducer = new ServiceReducer(host_name, service_name);
    host_reducer.call("init", {}, (data)=>on_succ(data));
}



function TestHlaFsm(){
    /*Some tests plan:
     client-s call for gets(value="root") action result in
     creating root node at first (mk_notes({titile: root}))
     and then recall gets(value="root") again (or use mk_notes result)

   // Presumably used for Tree.on_activate
   // running either by Tree.activate or by component loading:
   // in first case it will be called from Tree.activate with
   // request to `update data.node.fromDict(recived)` 
   // while in the second case it will be request to
   // set_init_tree_data(recived)
   def  cont0(root=false, on_failure: cont1):// fetch root node
     // root means we init tree first time on components load
     // for this case, if root not yet exist on server side it
     // have to be created there

     // some sort of middiator:
     // catch the "server.exit" event
     // and trigger the "client.exit" one:
     on(stack_name, {
      ({event_type, args, trace})=>{
      	if(args.action=="server.exit")
	  if(args.input.action=="gets")
            if(not root)
             // if(args.input.data not empty )
             // even if it is empty - it is not a problem when not root
                
	       events.emit(stack_name, {
	        fargs{
	         action: "client.exit",
	         input:{data:args.input.data}} })
            else // if root            
                cont1()
     })

     emit(stack_name, fargs:{action: "server.enter" input:{action: "gets", args:{"value":"root"}}}).
     ?on_done(()=>emit(Host.add))

   def cont1 // create root node:
      
     // some sort of middiator:
     // catch the "server.exit" event
     // and trigger the "client.exit" one:
     on(stack_name, {
      ({event_type, args, trace})=>{
      	if(args.action=="server.exit")
	  if(args.input.action=="mk_notes")
            cont0() // v0: try again
            // or v1: just emit
	       events.emit(stack_name, {
	        fargs{
	         action: "client.exit",
	         input:{data:args.input.data}} }) 
            // this will be better since client is in waiting state
            // alredy and we not need to close and then reopen this again
            // as with v0
     })

     emit(stack_name, fargs:{action: "server.enter" input:{action: "mk_notes", args:[{"value":"root"}]}}).
     
     */
}

function TestHlaEdp(){
    /*Some tests plan:
     client-s call for gets(value="root") action result in
     no succ - since no such exist.
     For this case client call to create such note with value="root"
     and then call again
     at succ it will trigger some react hook:
     
    def cont0: // fetch the root node
     on client.activate()
      1. -> subs to server.call(gets) by 
          (data)=>{
             unsubs to server.call(gets)  
             if no data:
                cont1()    
             else 
                cont2(data)
          }
      2. -> call server.call(gets)

    def cont1: // create root node:
      1. -> subs to server.call(mk_notes({value: root})) by
        (data)=>{
           unsubs to server.call(mk_notes({value: root}))
           cont0() // or cont2 if not want to resent gets query
      }
      2. -> call server.call(mk_notes({value: root}))

     cont2(data):
        set_update(data) // reactjs.Reducer?
     */
}


export function main(){
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(
	    <div>
	    <TestHla/>
	    </div>
    );

}
