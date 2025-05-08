import React from 'react';
import {useState, useEffect, useRef} from 'react';
import ReactDOM from 'react-dom';

import {FsmActionsViewer, FsmCurrentStateViewer} from 'itra-behavior/src/type_classes/fsm/views/helpers.js';

import {events} from 'itra-behavior/src/eHandler.js';

import {throw_error, check} from './helpers.js';


/* The Root of the tree behavior */
class BehaviorComponent{
    constructor({host_name, name, behavior_builder}){
	/*
	 - ``behavior_builder``-- function which accpet
	 the arguments: host_name, component_name.
	  (ex: mk_tree_fsm(this.host_name, this.name))
	 This is used here as a builder since We need
	 it to be initiated only on the enter method call.
	 */
	this.host_name = host_name;
	this.name = name;
	this.builder = behavior_builder;
    }
    
    enter({on_init}){
	// this.host_fsm = mk_host_as_state(this.host_name);
	// this.host_fsm.on();

	this.core = this.builder(this.host_name, this.name);
	// TODO: problem here: not tree available yet:
	this.core.on();
	// TODO
	// this.io = new IO(this.host_name);
	// events.on("show."+this.name)
	
    }

    // some kind of reducer here:    
    apply(action_name, args){
	
	events.emit(this.host_name+".ActionsQueue", {
	    fargs: {
		action: action_name, input: args}});

    }
    
    exit(){
	// this.io.unregister();
	this.core.off();
	// this.host_fsm.off();
    }
}


class CoreComponent{

    /*Frame+Behavior*/

    constructor({name, frame, behavior}){
	this.name = behavior.name;

	this.frame = frame;
	this.behavior = behavior;
	
    }
    
    mk(options){
	
	this.behavior.enter(options);
	
	// events.emit(this.name+".mk_tree", {fargs: {tree: this.tree}});
	// TODO:
	this.behavior.apply("mk", {frame: this.frame});
    }
    rm(){
	this.behavior.apply("rm");
	this.behavior.exit();
    }
}


function mk_core_comp({frame, behavior}){
     return new CoreComponent({frame:frame, behavior:behavior});
}

function mk_core_comp_v1(frame_builder,  behavior_builder, options){
    const name = check("mk_core_comp", options, "name");
    const host_name = check("mk_core_comp", options, "host_name");

    return new CoreComponent({
	frame: frame_builder(options),
	behavior: new BehaviorComponent({
      	    name: name, host_name: host_name, 
            behavior_builder: behavior_builder
	    })
    });
}


function InnerComponent({element_builder, name, host_name, data, actions,
			 on_behavior_loaded}){
    /*
     - ``element_builder`` - CoreComponent builder.
     
     - ``on_behavior_loaded`` - called when behavior will be initiated.
     take component.behavior.core as behavior arg.
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
	    comp.mk({});
	    console.log("ENTERING: calling mk_comp to init the three.current");
	    comp_ref.current = comp;
	    behavior_ref.current = comp.behavior.core;

	    // call outer component method:
	    on_behavior_loaded({behavior: comp.behavior.core});
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

	   <div ref={el=>storage.current = el}
	   style={{"borderWidth": "1px",
		   "borderColor":"black"}}>This is react wrapper for a comp</div>
	   </div>	   
	  );
}

// dict to store what have been spawned
var spawned = {};

function OuterComponent(options){
    const [show, set_show] = useState(true);
    const [behavior, set_behavior] = useState();

    let core = <div/>;
    let vActions = <div/>;
    let vCurrentState = <div/>;

    // if someone emit `show."comp_name"` it will be show/hide
    useEffect(()=>{
	function handler(options){
	    // console.log("OuterComponent: calling handler: show", show);
	    spawned[behavior.name] = (spawned.hasOwnProperty(behavior.name))?!spawned[behavior.name]:false;
	    // console.log("OuterComponent: calling handler: show", show);
	    // console.log("OuterComponent: calling handler: spawned", spawned);
	    set_show(spawned[behavior.name]);	    
	}

	if(behavior)
	    events.on(`show.`+behavior.name, handler, {idd: behavior.idd});
	return ()=>{
	    if(behavior)
		if(events.has(`show.`+behavior.name))
		    events.off(`show.`+behavior.name, {idd: behavior.idd});
		//events.off(handler);
	};
    }, [behavior]);
    /*
    useEffect(()=>{
	return ()=>{
	    console.log("OuterComponent: exiting: events", events);
	    if(behavior)
		if(events.has(`show.`+behavior.name))
		    events.off(`show.`+behavior.name, {idd: behavior.idd});
	};
    }, []);
     */
    if(show){
	let args = {...options,
		    on_behavior_loaded: ({behavior})=>set_behavior(behavior)};
	core = <InnerComponent {...args} />;

	if(options.show_actions)
	    vActions = <FsmActionsViewer behavior = {behavior}/>;

	if(options.show_state)
	    vCurrentState = <FsmCurrentStateViewer
	fsm_name={behavior?behavior.name:false}
	cb_idd={behavior?(behavior.idd+"_"+behavior.name+"StateViewer"):false} />;
    }

    /*
     <button onClick={(e)=>{
	       console.log("behavior_ref.current.current_state:",
			   behavior.current_state);
	   }}> comp state</button>

   <button onClick={(e)=>events.emit(host_name+".ActionsQueue", {
	       fargs: {
		   action: "mk_tree", input: {tree:"test mk_tree"}}})}>mk_tree</button><br/>

     */
    return(<div>
	    <p>Wrapper show: {show.toString()}</p>
	   <br/>
	   
	   {core}
	   <br/>

	   {vActions}
	   <br/>

	   {vCurrentState}

	   <br/>
	   <button onClick={()=>{
	       console.log(events);
	   events.show_observers();
	   events.show_delayed();}}>eHandler</button>
	   </div>
	  );
    
}

export{OuterComponent, BehaviorComponent, mk_core_comp, mk_core_comp_v1}
