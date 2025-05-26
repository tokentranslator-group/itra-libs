import React from 'react';
import {useState, useEffect, useRef} from 'react';
import ReactDOM from 'react-dom';

import {FsmActionsViewer, FsmCurrentStateViewer} from 'itra-behavior/src/type_classes/fsm/views/helpers.js';

import {events} from 'itra-behavior/src/eHandler.js';


function HostComponent({host_fsm}){
    const ref = useRef(host_fsm);
    // ISSUE: the FsmCurrentStateViewer will not going to work here since 
    // host_fsm is not actually fsm but state!
    return(<div className={"style_editor_dinamic editor_overflow"}
	   style={{
		position:"absolute",
		"z-index": 1,
		top: "70%", left:"2%", width: "70%",
		border: "1px solid",
		"border-color": "black"
		
	    }}>
	   <p>Host</p>
	   <FsmActionsViewer behavior={host_fsm}/>
	   <FsmCurrentStateViewer fsm_name={host_fsm.name} cb_idd={host_fsm.idd+"_HostStateViewer"}/>
	   </div>);
}


export{HostComponent}
