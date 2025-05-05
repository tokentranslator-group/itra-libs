import React from 'react';
import {useState, useEffect, useRef} from 'react';
import ReactDOM from 'react-dom';

import {FsmActionsViewer, FsmCurrentStateViewer} from 'itra-behavior/src/type_classes/fsm/views/helpers.js';

import {events} from 'itra-behavior/src/eHandler.js';


function HostComponent({host_fsm}){
    const ref = useRef(host_fsm);
    // ISSUE: the FsmCurrentStateViewer will not going to work here since 
    // host_fsm is not actually fsm but state!
    return(<div>
	   <FsmActionsViewer behavior={host_fsm}/>
	   <FsmCurrentStateViewer fsm_name={host_fsm.name} cb_idd={host_fsm.idd+"_HostStateViewer"}/>
	   </div>);
}


export{HostComponent}
