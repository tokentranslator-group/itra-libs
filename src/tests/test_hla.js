/*Testing sequential huge level actions each composed from
events which once started is unknown when ended. Once ended
it should call/trigger next event in the seq. 
Sequential means that the order should be preserved.
For instance: the rm_nodes call to the server should be triggered only
after the mk_nodes from the server return succ.
 It looks rather like rxjs pipes, I quess*/

import React from 'react';
import {useState, useEffect, useRef} from 'react';
import ReactDOM from 'react-dom';

import {events} from 'itra-behavior/src/eHandler.js';


import {FsmCurrentStateViewer, useEdpHook} from 'itra-behavior/src/type_classes/fsm/views/helpers.js';

import {HostComponent} from '../env/host/host_react.js';
import {mk_host_server, ServiceReducer, $_db_handler} from  '../env/host/host_server.js';


import {gets, mk_notes, save, rm} from '../dsl/lla.js';


const host_name = "GraphDb";
const service_name = "graph_db";


// helper
function run_host(){

    let host_fsm = mk_host_server({
	host_name: host_name,
	service_name: service_name,
	url: "http://localhost:8888/",
	db_handler: $_db_handler});

    // no need since HostComponent use useEffect now:
    host_fsm.on();
    
}


function test_rm(){
       
    run_host();
    
    const reducer = new ServiceReducer({
	host_name: host_name,
	service_name: service_name});

    mk_notes(reducer, [{value: "testing_rm0.lla"}, {value: "testing_rm1.lla"}],
	     
	     // replace all ids with notes:
	     (notes_ids)=>{
		 console.log("rm.lla: created notes_ids:", notes_ids);

		 console.log("rm.lla: calling rm...");

		 rm(reducer, notes_ids, (data)=>{
		     console.log("rm.lla: result:", data);
		     
		     // get all notes in db:
		     gets(reducer, {table_type: "note"}, (data)=>{
			 console.log("rm.lla: all db notes:", data);
		     });
		 });
	     });
}


function test_save(){
       
    run_host();
    
    const reducer = new ServiceReducer({
	host_name: host_name,
	service_name: service_name});

    mk_notes(reducer, [{value: "testing_save.lla"}],
	     
	     // replace all ids with notes:
	     (notes_ids)=>{
		 console.log("save.lla: created notes_ids:", notes_ids);

		 console.log("save.lla: calling save...");

		 save(reducer, {id:notes_ids[0], table_type: "note"}, (data)=>{
		     console.log("save.lla: result:", data);
		     
		     // get all notes in db:
		     gets(reducer, {table_type: "note"}, (data)=>{
			 console.log("save.lla: all db notes:", data);
		     });
		 });
	     });
}


function test_gets(){
       
    run_host();
    
    const reducer = new ServiceReducer({
	host_name: host_name,
	service_name: service_name});

    
    mk_notes(reducer, [{value: "testing_gets.lla"}],
	     
	     // replace all ids with notes:
	     (notes_ids)=>{
		 console.log("gets.lla: created notes_ids:", notes_ids);
		 
		 console.log("gets.lla: calling save...");
		 
		 gets(reducer, {value:"testing_gets.lla", table_type: "note"},
		      (data)=>console.log("gets.lla result:", data));
	     });
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

function test_comp(){
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(
	    <div>
	    <TestHla/>
	    </div>
    );

}

export function main(){
    test_rm();
    // test_save();
    // test_gets();
    // test_comp();
}
