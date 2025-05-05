import React from 'react';
import {useState, useEffect, useRef} from 'react';
import ReactDOM from 'react-dom';

import {FsmActionsViewer, FsmCurrentStateViewer} from 'itra-behavior/src/type_classes/fsm/views/helpers.js';

import {events} from 'itra-behavior/src/eHandler.js';

// helper:
// import {Tree, mk_tree} from './ttree_helpers.js';


// const host_name = "Host1";
// const tree_name = "TreeFsm1";



function TreeComponent({element_builder, name, host_name, data, actions}){
    /*
     - ``tree_wrapper_id`` - id to use for component wrapper.
     Must not exist yet.
     */
    
    const comp_ref = useRef();
    const behavior_ref = useRef();

    const storage = useRef(); // storage_id
    const [ready, set_ready] = useState(false);

    // on init/exit
    useEffect(()=>{

	const comp = element_builder({
	    name: name,
	    host_name: host_name,
	    storage_ref: storage.current,
	    data: data,
	    actions: actions
	});
    
	// console.log("storage.current", storage.current);
	if (!comp_ref.current){
	    // TODO: spawning behavior: comp.mk(()=>set_show(!show))
	    comp.mk();
	    console.log("ENTERING: calling mk_comp to init the three.current");
	    comp_ref.current = comp;
	    behavior_ref.current = comp.behavior.fsm;
	    set_ready(!ready);
	}
	else
	    {
		// TODO: this code seems never used
		console.log("RELOADING: calling comp.current.reload_container");
		comp_ref.current.frame.reload_container();
	    }

	return ()=>{
	    console.log("EXITING: calling comp.current.rm_comp");
	    comp_ref.current.rm();
	};
    }, []);

    // ISSUE: this is not realy necessary since update happend
    // by vActions
    // on comp_data update
    /*
    useEffect(()=>{
	events.emit(host_name+".update.exit", {
	    // TODO generalize name:
	    fargs: {tree_data: data}});
    }, [data]);
    */
    return(<div>
	   <button onClick={(e)=>{
	       console.log("behavior_ref.current.current_state:",
			   behavior_ref.current.current_state);
	   }}> comp state</button>

	   <button onClick={(e)=>events.emit(host_name+".ActionsQueue", {
	       fargs: {
		   action: "mk_tree", input: {tree:"test mk_tree"}}})}>mk_tree</button><br/>
	   <br/>

	   <FsmCurrentStateViewer fsm_name={behavior_ref.current?behavior_ref.current.name:false} cb_idd={behavior_ref.current?(behavior_ref.current.idd+"_"+behavior_ref.current.name+"StateViewer"):false}/>
	   <br/>

	   <FsmActionsViewer behavior={behavior_ref.current}/>
 	   <br/>

	   <div ref={el=>storage.current = el}
	   style={{"borderWidth": "1px",
		   "borderColor":"black"}}>This is react wrapper for a comp</div>
	   </div>	   
	  );
}

export{TreeComponent}
