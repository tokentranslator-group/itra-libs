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

function cont(data, on_succ){
    events.on(stack_name,
	      ({event_type, args, trace})=>{
		  if(args.action=="done")
		      on_succ(args.data);
	      });
    
    events.emit(stack_name, {
	fargs:{
	    action:"done",
	    data: data},
	on_done: ()=>on_succ(data)});
}

function cont1(){
    
}


function TestHlaFsm(){
    /*Some tests plan:
     client-s call for gets(value="root") action result in
     creating root node at first (mk_notes({titile: root}))
     and then recall gets(value="root") again (or use mk_notes result)

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
