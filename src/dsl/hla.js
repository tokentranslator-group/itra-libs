import {events} from 'itra-behavior/src/eHandler.js';
import {unsubscribe} from 'itra-behavior/src/core/dsl/hlaEdpSeq.js';

import {ls_note, get, gets, mk_edges, mk_notes} from './lla.js';

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


export function cont01(host_reducer, data, on_succ, root){
    // const host_reducer = new ServiceReducer(host_name, service_name);
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
export function join(host_reducer, on_succ){
    /*
     Joiner meddiator
     No need for unregistering since used only once in init*/

    let hla_idd = "HlaEdpSeq.join";
    events.on(
	stack_name,
	({event_type, args, trace})=>{
	    if(args.action=="join.enter"){
		// console.log("PROBLEM.Joiner.args:", args);
		let parents = args.input.destination;
		let children = args.input.source;
		// console.log("PROBLEM.Joiner children:", children);
		let new_edges = parents.reduce(
		    (acc, parent)=>(
			[...acc, ...children.map(
			    (child)=>({
				_from: parent.data.id,
				_to: child.data.id}))]), []);
		// console.log("PROBLEM.Joiner new_edges:", new_edges);
		mk_edges(
		    host_reducer,
		    new_edges,
		    (data_edges)=>{
			events.emit(stack_name, {fargs:{
			    action:"join.exit",
			    input: {}}});
		    });	
	    }
	}, {idd: hla_idd});
}


export function fetch(host_reducer,on_succ){
    /*Fetch data for the Querier.
     - ``on_succ`` -- : entries->entries*/

    let hla_idd = "HlaEdpSeq.fetch";

    events.on(
	stack_name,
	({event_type, args, trace})=>{
	    if(args.action=="fetch.enter")
		host_reducer.call(
		    "ls_tags", {tags: args.input.query.split(",")},
		    (data)=>{
			events.emit(
			    host_name+".ActionsQueue",
			    {
				fargs:{
				    action:"fetch.exit",
				    input: {entries: on_succ(data)}}
				
				// here this is not necessary
				// since only one instance of this hla being
				// used (on init of mc component)
				// unsubscribe on complition
				/*
				on_done: (trace)=>{
				    if(events.has(host_name+".ActionsQueue", {idd:hla_idd})){
					events.off(host_name+".ActionsQueue", {idd:hla_idd});
				    }
				}
				 */
			    });});
	    
	}, {idd: hla_idd});    
}


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


export function add_seq(host_reducer, apply_tree_for_node, folder){
    /*Sequential reimplementation of add*/

    let hla_idd = "HlaEdpSeq.add";
    let idd_idx = 0;

    folder = folder==undefined?true:folder;

    // mk_notes:
    events.on(stack_name,
	      ({event_type, args, trace})=>{
		  if(args.action=="add.tree.enter")
		  
		      // create child:
		      mk_notes(
			  host_reducer,
			  [{
			      value: args.input.node_name,
			      kind: folder?"folder":"note"}],

			  (notes_ids)=>{
			      events.emit(hla_idd+0, {
				  fargs:{
				      input: args.input,
				      notes_ids:notes_ids},
			      on_done: (trace)=>unsubscribe(stack_name, hla_idd)});
			  });
	      }, {idd: hla_idd});
    
    // mk_edges:
    events.on(hla_idd+0, ({event_type, args, trace})=>{
	let notes_ids = args.notes_ids;
	const child_id = notes_ids[0];
	
	// connect child to parent:
	mk_edges(
	    host_reducer,
	    [{_from: args.input.parent_node.id,
	      _to:child_id}],
	    (data_edges)=>events.emit(hla_idd+1, {
		fargs:{data_edges:data_edges, child_id: child_id},
		on_done: (trace)=>unsubscribe(hla_idd+0, hla_idd)}));
	    
    }, {idd: hla_idd});

    // get:
    events.on(hla_idd+1, ({event_type, args, trace})=>{
	let data_edges = args.data_edges;
	const child_id = args.child_id;
		
	// get new node obj:
	get(
	    host_reducer, child_id,
	    (data_get_child)=>events.emit(hla_idd+2, {
		fargs:{data_get_child:data_get_child},
		on_done: (trace)=>unsubscribe(hla_idd+1, hla_idd)}));
	    
    }, {idd: hla_idd});


    // finally:
    events.on(hla_idd+2, ({event_type, args, trace})=>{
	let data_get_child = args.data_get_child;
		
	// finally:
	events.emit(
	    host_name+".ActionsQueue",
	    {
		fargs:{
		    action:"add.tree.exit",
		    input: {node: apply_tree_for_node(data_get_child)}},
		
		on_done: (trace)=>unsubscribe(hla_idd+2, hla_idd)
	    });
	
    }, {idd: hla_idd});

    // calling tree.add
    events.emit(host_name+".ActionsQueue",
		{
		    fargs: {action: "add"}
		});
}

export function add(host_reducer, apply_tree_for_node, folder){
    /*
     - ``apply_tree_for_node`` -- used here to convert result before sending/emitting it to tree
     */
    // identifier for this hla subs/unsubs:
    let hla_idd = "HlaEdpSeq.add";
    
    // let hla_action_name = "hla.edp.seq.add";

    folder = folder==undefined?true:folder;
    // console.log("PROBLEM: folder:", folder);
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
	     // console.log("PROBLEM: load_root: data", data);
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
