import {events} from 'itra-behavior/src/eHandler.js';
import {unsubscribe} from 'itra-behavior/src/core/dsl/hlaEdpSeq.js';

import {ls_note, get, gets, mk_edges, mk_notes, rm as _rm, save as _save} from './lla.js';

import {cert_v0 as cert} from '../env/cert.js';


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
// all should respect the internal format spec
export function save(host_reducer, on_succ){
    /*
     Registering for save.
     So save(host) will not saving anything 

     Saving meddiator
     No need for unregistering since used only once in init

     Triggering event: `save.enter`
     args: args.input.data::Dict
     */

    let hla_idd = "HlaEdpSeq.save";
    events.on(
	stack_name,
	({event_type, args, trace})=>{
	    
	    if(args.action=="save.enter"){
		console.log("PROBLEM save.enter:", args);
		
		// recived msg protocol check: 
		// TODO: editor.fsm do not have one!
		//host_reducer.verify(hla_idd, args.input);

		let data = args.input;
		console.log("PROBLEM:protocol: save.enter:", data);
		_save(
		    host_reducer,
		    data,
		    (result)=>{
			if(result)
			    // fetch updated results:
			    get(host_reducer, data.id, (data)=>{

				let msg = data;
				console.log("PROBLEM: saving: data", data);
				events.emit(host_name+".ActionsQueue", {
				    fargs: {
					action: "save.exit",
					input: msg},
				    
				    on_done: (trace)=>{
					on_succ()
					console.log("Host: save.exit done");
				}});
			    });
			
		    });
	    }
	}, {idd: hla_idd});
}


export function rm(host_reducer){
    /*
     Will work on call, not just registering
     so rm(host) will trigger the removal

     Triggering event: `rm.enter`
     args: args.input.selected // list of entries with id
     */
    let hla_idd = "HlaEdpSeq.rm";

    events.on(
	stack_name,
	({event_type, args, trace})=>{
	    if(args.action=="rm.enter"){
		// console.log("PROBLEM: rm: input:", args.input);

		
		_rm(host_reducer, args.input.selected.map((node)=>{
		    
		    // recived msg protocol check: 
		    // host_reducer.verify(hla_idd, node);
		
		    return node.note_id;}), (result)=>
		    {
		      events.emit(stack_name, 
				  {
				      fargs: {
					  action: "rm.exit",
					  input: {result: result}
				      },
				      
				      on_done: (trace)=>{
					  if(events.has(stack_name, {idd:hla_idd})){
					      events.off(stack_name, {idd:hla_idd});
					  }
					  
				      }});
		  });
	    }
	});


    events.emit(stack_name,
		{
		    fargs: {action: "rm"}
		    
		});
}


export function join(host_reducer, on_succ){
    /*
     Joiner meddiator
     No need for unregistering since used only once in init

     Triggering event: "join.enter"
     args: // from fancytree format:
       args.input.destination as parents // each have data.id
       args.input.source as children  // each have data.id
       
     */

    let hla_idd = "HlaEdpSeq.join";
    events.on(
	stack_name,
	({event_type, args, trace})=>{
	    if(args.action=="join.enter"){
		console.log("PROBLEM.Joiner.args:", args);
		let parents = args.input.destination;
		let children = args.input.source;
		console.log("PROBLEM.Joiner children:", children);
		let new_edges = parents.reduce(
		    (acc, parent)=>(
			[...acc, ...children.map(
			    (child)=>({
				label: child.edge.label,
				_from: parent.node.id,
				_to: child.node.id
				//_from: parent.data.id,
				//_to: child.data.id
			    }))]), []);
		console.log("PROBLEM.Joiner new_edges:", new_edges);
		mk_edges(
		    host_reducer,
		    new_edges,
		    (data_edges)=>{
			events.emit(host_name+".ActionsQueue", {
			    fargs:{
				action:"join.exit",
				input: {}},
			    on_done: (trace)=>{
				on_succ();
				
			    }
			});
		    });	
	    }
	}, {idd: hla_idd});
}


export function fetch(host_reducer,on_succ){
    /*Fetch data for the Querier.
     - ``on_succ`` -- : entries->entries

     All entries use internal format: {id, value, kind, tags, date}
     
     Triggering event: `fetch.enter`
     args: // from querier:
      args.input.query::String // will be used as tags

     return:
       input.entries:: Dict
     */

    let hla_idd = "HlaEdpSeq.fetch";

    events.on(
	stack_name,
	({event_type, args, trace})=>{
	    if(args.action=="fetch.enter")
		host_reducer.call(
		    "ls_tags", (args.input.date!==undefined)?{
			tags: args.input.query.split(","),
			date: args.input.date
		    }:{
			tags: args.input.query.split(",")
		    },
		    (nodes_list)=>{
			events.emit(
			    host_name+".ActionsQueue",
			    {
				fargs:{
				    action:"fetch.exit",
				    input: {entries: on_succ(nodes_list)}}
				
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


export function add_seq(host_reducer, folder){
    /*Sequential reimplementation of add
     Only work with a tree

      Since the edges is interpreted as a links, the newly created
     folder node will have same value as label of the edge firstly
     attached to it. When such folder be copied (i.e new edge attached to it)
     its name still be the same as its firstly created edge. Since
     the activate hla is used a edges.labels
     there should be no problem.

     Triggering event: `add.tree.enter`
     Args: // from fancytree
       args.input.node_name::String
       args.input.parent_node::Dict // should have id

     :: NodeDict -> Dict
     - ``apply_tree_for_node`` -- to convert final result
     */

    let hla_idd = "HlaEdpSeq.add";
    let idd_idx = 0;

    folder = folder==undefined?true:folder;

    // mk_notes:
    events.on(stack_name,
	      ({event_type, args, trace})=>{
		  if(args.action=="add.tree.enter"){
		      let state = args.input;

		      // create a child:
		      let new_node = {
			  // TODO: adjust format value?body:
	
			  // the name of the new node will be same as
			  // the label of its first edge.label
			  value: state.new_node_name,
			  kind: folder?"folder":"note"};
		  
		      mk_notes(
			  host_reducer,
			  [new_node],

			  (notes_ids)=>{
			      events.emit(hla_idd+0, {
				  fargs:{
				      // update the state:
				      input: {...state, notes_ids:notes_ids}
				  },
			      on_done: (trace)=>unsubscribe(stack_name, hla_idd)});
			  });
		  }
	      }, {idd: hla_idd});
    
    // mk_edges:
    events.on(hla_idd+0, ({event_type, args, trace})=>{
	let state = args.input;
	let new_node_name = state.new_node_name;
	let notes_ids = state.notes_ids;
	const child_id = notes_ids[0];
	
	// connect parent to child:
	let new_edge = {
	    // the name of the new node will be same as the label of its
	    // first edge.label
	    label: new_node_name,
	    _from: state.parent_node.note_id,
	    _to:child_id};

	// create an edge:
	mk_edges(
	    host_reducer,
	    [new_edge],
	    (edges_ids)=>events.emit(hla_idd+1, {
		fargs:{
		    // extend the state with new edge id:
		    input: {...state, edge_id:edges_ids[0], child_id: child_id}},
		on_done: (trace)=>unsubscribe(hla_idd+0, hla_idd)}));
	    
    }, {idd: hla_idd});

    // get new node:
    events.on(hla_idd+1, ({event_type, args, trace})=>{
	let state = args.input;
	// let edge_id = state.edge_id;
	// const parent_id = state.parent_node.id;
	let child_id = state.child_id;

	// get new node obj:
	get(
	    host_reducer, child_id,
	    (child_node)=>events.emit(hla_idd+2, {

		// extend the state with child_node:
		fargs:{input: {...state, child_node:child_node}},
		on_done: (trace)=>unsubscribe(hla_idd+1, hla_idd)}),
	    "note");
	    
    }, {idd: hla_idd});

    // get new edge:
    events.on(hla_idd+2, ({event_type, args, trace})=>{
	let state = args.input;
	let edge_id = state.edge_id;
	// const parent_id = state.parent_node.id;
	// let child_id = state.child_id;

	// get new edge obj:
	get(
	    host_reducer, edge_id,
	    (child_edge)=>events.emit(hla_idd+3, {

		// extend state with child_edge:
		fargs:{input: {...state, child_edge:child_edge}},
		on_done: (trace)=>unsubscribe(hla_idd+2, hla_idd)}),
	    "edge");
	    
    }, {idd: hla_idd});

    // sign the date with internal protocol:
    events.on(hla_idd+3, ({event_type, args, trace})=>{
	let state = args.input;
	let new_node = state.child_node;
	let new_edge = state.child_edge;
	
	let msg = cert.sign({
	     idd:"hla.add_seq",

	     // show only forward neighbors:
	     msg: {entries: [[new_edge, new_node]]},
	     // msg: {entries: data[1]},

	     data_type:"Branch",
	     data_form: "Multi"
	 });

	// console.log("PROBLEM: hla.add_seq, msg:", msg);

	// finally:
	// send new branch(=(edge, node)) back to tree:
	events.emit(
	    host_name+".ActionsQueue",
	    {
		fargs:{
		    // trigger tree fsm
		    action:"add.tree.exit",
		    input: {data: msg}},
		
		on_done: (trace)=>unsubscribe(hla_idd+3, hla_idd)
	    });
	
    }, {idd: hla_idd});

    // and only now run:
    // calling tree.add to send tree to Adding state 
    // and emit add.tree.enter event which will start a chain defined above:
    events.emit(host_name+".ActionsQueue",
		{
		    fargs: {action: "add"}
		});
}

export function add(host_reducer, apply_tree_for_node, folder){
    /*
     Registering for stack_name-s add.tree.enter event.
     When reciving one, trigger host add action and wait for results.

     Triggering event: `add.tree.enter`
     Args: // from fancytree
       args.input.node_name::String
       args.input.parent_node::Dict // should have id

     - ``apply_tree_for_node`` -- used here to convert result before returning/sending/emitting it back to tree
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
			  // TODO: adjust format value?body:
			  [{

			      kind: folder?"folder":"note"}],
			  (notes_ids)=>{
			      const child_id = notes_ids[0];

			      // connect child to parent:
			      mk_edges(
				  host_reducer,
				  [{
				      label: args.input.node_name,
				      _from: args.input.parent_node.id,
				      _to:child_id
				  }],
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
							  // trigger tree fsm
							  action:"add.tree.exit",
							  input: {
							      node: apply_tree_for_node(data_get_child)}},
						      
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
    gets(host_reducer, {
	// TODO: adjust format value?body:
	value:"root", table_type: "note", kind: "folder"},

	 // succ
	 (data)=>{
	     // console.log("PROBLEM: load_root: data", data);
	     if(data.length == 0)
		 
		 // create root node if not exist
		 mk_notes(host_reducer, [{value: "root", kind:"folder"}],
			  
			  // replace all ids with notes:
			  (notes_ids)=>
			  map_to_notes(
			      host_reducer, notes_ids,
			      (data)=>on_succ(cert.sign({
				  idd: "load_root",
				  msg: {entries: data},
				  data_type: "Node",
				  data_form: "Multi"
			      }))));
	     else
		 on_succ(cert.sign({
		     idd: "load_root",
		     msg: {entries: data},
		     data_type: "Node",
		     data_form: "Multi"
		 }));
	 });
}

// ::ids -> Dict
export function map_to_notes(host_reducer, ids, on_succ, result){
    /*
     Map ids to Notes entries by calling get.
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
    /*For the node with id get its connected children (not parents!) branches,
     ie (child_edge, child_node) with id from host. Will work only if
     node.kind == "folder".*/

    get(host_reducer, id, (data)=>{
	if(data.kind == "folder")
	    ls_note(host_reducer, id, on_succ);
	else
	    throw new Error("tree.activate: only folders supported for expansion!");
    });
}
