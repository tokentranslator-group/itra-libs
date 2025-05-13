import React from 'react';
import {useState, useEffect, useRef} from 'react';
import ReactDOM from 'react-dom';

import {events} from 'itra-behavior/src/eHandler.js';


import {HostComponent} from '../env/host/host_react.js';
import {mk_host_as_state} from  '../env/host/host_emulator.js';

export function get_host_emulator(){
    let host_fsm = mk_host_as_state("Host");

    // this is an implementation for test only.
    // it is needed since host is not fsm but state:
    host_fsm.supported_actions = ()=>{
	return {
	    self:{
		name: host_fsm.name,
		actions:[
		    {action: "add.tree.enter", input: {node_name: "new node from host_emulator"}},
		    {action: "update.tree.enter", input: {url: "url://host_emulator.test"}},
		    {action: "join.enter", input: {parent: ""}},
		] 
	    }
	};
    };
    host_fsm.on();
    return host_fsm;
}

export function main(){
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<div>
		<p>Testing Host Emulator:</p>
		<HostComponent host_fsm={get_host_emulator()}/>
		<br/>
		<button onClick={()=>console.log(events)}> Dbg eHandler to console</button>
		</div>);
}
