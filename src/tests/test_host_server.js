import React from 'react';
import {useState, useEffect, useRef} from 'react';
import ReactDOM from 'react-dom';

import {events} from 'itra-behavior/src/eHandler.js';

import {FsmCurrentStateViewer, useEdpHook} from 'itra-behavior/src/type_classes/fsm/views/helpers.js';

import {HostComponent} from '../env/host/host_react.js';
import {mk_host_server, ServiceReducer,$_db_handler, sim_db_handler} from  '../env/host/host_server.js';


const host_name = "GraphDb";
const service_name = "graph_db";


export function get_host(db_handler){
    let host_fsm = mk_host_server({
	host_name: host_name,
	service_name: service_name,
	url: "http://localhost:8888/",
	db_handler: db_handler});

    // no need since HostComponent use useEffect now:
    // host_fsm.on();
    return host_fsm;
}

function TestComponent({db_handler}){
    const reducer = new ServiceReducer({
	host_name: host_name,
	service_name: service_name});

    const [data, set_data] = useState({});

    let levents = {};
    levents[host_name+".ActionsQueue"] = (args)=>{
	if(args.action == service_name+".exit"){
	    console.log(host_name+".ActionsQueue.exit data");
	    return args.input.data;
	}else
	    return {};
    };
    
    let hook_data = useEdpHook(levents, {}, service_name+"_cb");

    return(
	    <div>
	    <p>Testing Host Emulator:</p>
	    <HostComponent host_fsm={get_host(db_handler)}/>
	    <br/>

	    <button onClick={()=>{
		reducer.call("init", {}, (data)=>set_data(data));
	    }}>Test call init</button><br/>

	    <button onClick={()=>{
		reducer.call("mk_notes", {
		    "notes": [
			{"body": "Hello", "tags": "Hello tag"},
			{"body": "World", "tags": "World tag"}]
		}, (data)=>set_data(data));
	    }}>Test call mk_notes</button><br/>


	    <button onClick={()=>{
		reducer.call("mk_edges", {
		    "edges": [
			{"title": "forward", "_from": 1, "_to": 2},
			{"title": "backward", "_from": 2, "_to": 1}]
		}, (data)=>set_data(data));
	    }}>Test call mk_edges</button><br/>

	    <button onClick={()=>{
		reducer.call("ls", {"id": "1"}, (data)=>set_data(data));
	    }}>Test call ls ("id": "1")</button><br/>

	    <button onClick={()=>{
		reducer.call("ls_tags", {"tags": ["Hello"]}, (data)=>set_data(data));
	    }}>Test call ls tags "Hello"</button><br/>


	    <div>Result:{JSON.stringify(data)}</div><br/>

	    <button onClick={()=>{
		console.log("eHandler: ", events);
		console.log(data);
	    }}> Dbg eHandler to console</button>
	    </div>
    );
}


export function main(){
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<TestComponent db_handler={sim_db_handler}/>);
    // root.render(<TestComponent db_handler={$_db_handler}/>);
}
