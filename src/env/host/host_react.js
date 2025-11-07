import React from 'react';
import {useState, useEffect, useRef} from 'react';
import ReactDOM from 'react-dom';

import {FsmActionsViewer, FsmCurrentStateViewer} from 'itra-behavior/src/type_classes/fsm/views/helpers.js';

import {events} from 'itra-behavior/src/eHandler.js';

import $ from 'jquery';
import * as ui from 'jquery-ui';

// import 'jquery-ui/ui/widgets/tabs';
//import 'jquery-ui/ui/widgets/dialog';
import 'jquery-ui/ui/widgets/resizable';
import 'jquery-ui/ui/widgets/draggable';

function HostComponent({host_fsm}){
    const ref = useRef(host_fsm);
    const el = useRef();

    useEffect(()=>{
	host_fsm.on();
	return ()=>host_fsm.off();
    }, []);

    useEffect(()=>{
	console.log("Querier: making resizable", el.current);
	if(el.current!==undefined){
	    $(el.current).draggable();
	    $(el.current).resizable();
	}
    }, []);

    // ISSUE: the FsmCurrentStateViewer will not going to work here since 
    // host_fsm is not actually fsm but state!
    return(<div ref={el} className={"style_editor_dinamic editor_overflow"}
	   style={{
		position:"absolute",
		// "zIndex": 1,
		top: "30%", right:"10%", width: "40%",
		border: "1px solid",
		"border-color": "black"
		
	    }}>
	   <p>Host</p>
	   <FsmActionsViewer behavior={host_fsm}/>
	   <FsmCurrentStateViewer fsm_name={host_fsm.name} cb_idd={host_fsm.idd+"_HostStateViewer"}/>
	   </div>);
}


export{HostComponent}
