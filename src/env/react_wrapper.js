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
	 - ``behavior_builder``-- function which accept
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
    // used for mk, rm methods
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
	/*
	 - ``behavior`` -- should have mk, rm methods
	 see: BehaviorComponent
	 */
	this.name = behavior.name;

	this.frame = frame;
	this.behavior = behavior;
	
    }
    
    mk(options){
	
	this.behavior.enter(options);
	
	// events.emit(this.name+".mk_tree", {fargs: {tree: this.tree}});
	// TODO:
	this.behavior.apply("mk."+this.name, {frame: this.frame});
    }
    rm(){
	this.behavior.apply("rm."+this.name);
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


function InnerComponent({core_comp_builder, name, host_name, data, actions,
			 on_behavior_loaded}){
    /*
     - ``core_comp_builder`` - CoreComponent builder.
     
     - ``on_behavior_loaded`` - called when behavior will be initiated.
     take component.behavior.core as behavior arg.
     */
    
    const comp_ref = useRef();
    const behavior_ref = useRef();

    const storage = useRef(); // storage_id
    const [ready, set_ready] = useState(false);
    
    // on init/exit
    useEffect(()=>{

	const comp = core_comp_builder({
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
		// comp_ref.current.rm();
		

		// comp_ref.current.mk({});
		// comp_ref.current.frame.reload_container();
	    }

	return ()=>{
	    console.log("EXITING: calling comp.current.rm_comp");
	    comp_ref.current.rm();

	    // for ISSUE::hide/show: this will force to reinitiate the comp when
	    // the data being changed:
	    comp_ref.current = false;
	};
	// for ISSUE::hide/show: this will update wrapped when data being changed:
    }, [data]);

    // ISSUE: this is not realy necessary since update happend
    // on fsm event now
    // 
    /*
    useEffect(()=>{
	events.emit("update."+name+".ActionsQueue", {
	    fargs: {data: data}});
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
// var counter = 0;


function useShowHook({name, init_data, show}){
    /*Used to spawn a component, which use this hook, or close it.
     On spawn if `args.data` given in the msg, it will be
     returned back to the component.

     Used for show/hide behavior i.e. it define  `show.${options.name}`
     and `hide.${options.name}` events which could be called outside
     with use of eHandler:
     
     // Example:
    // hide first then reopen again:
    events.emit("hide."+editor_name, {
	on_done:(trace)=>{
	    events.emit("show."+editor_name,{fargs:{data: {
		tabs_ids: ["parser"],
		tabs_contents: [data.node.title],
		field_tags: ["math"]}}});
	}});
     */
    const [_show, set_show] = useState(show);
    const [data, set_data] = useState(init_data);

    // if someone emit `show."comp_name"` with data given,
    // it will show/update editor
    useEffect(()=>{
	function handler_show(hoptions){
	    // console.log("OuterComponent: calling handler: show", show);
	    // spawned[behavior.name] = true;
	    // spawned[behavior.name] = (spawned.hasOwnProperty(behavior.name))?!spawned[behavior.name]:false;
	    console.log("ISSUE::show: hoptions:", hoptions);
	    if(hoptions.args.hasOwnProperty("data")){
		// ISSUE: v0: in this version data should be updated
		// on InnerComponent param and its useEffect
		set_data(hoptions.args.data);
		
		// ISSUE: v1 for this method to use it required that
		// the fsm support "update."+options.name effect
		// (see: editor/behavior.js::mk_editor_fsm)
		
		// v1.0
		// events.emit(options.host_name+".ActionsQueue", {
		//    fargs:{action:"update."+options.name, input:{data:hoptions.args.data}}});
		// v1.1
		// behavior.apply("update."+options.name, {data:hoptions.args.data})		
	    }
	    // console.log("OuterComponent: calling handler: show", show);
	    // console.log("OuterComponent: calling handler: spawned", spawned);
	    // counter = counter+1;
	    set_show(true);
	    // set_show(spawned[behavior.name]);	    
	}

	function handler_hide(hoptions){
	    // spawned[behavior.name] = false;
	    // counter = 0;
	    // set_data(false);
	    set_show(false);
	    // set_show(spawned[behavior.name]);	    
	}

	//if(behavior){
	    events.on(`show.`+name, handler_show,
		      {
			  idd:`show.`+name// behavior.idd
		      });
	    events.on(`hide.`+name, handler_hide, {idd: `hide.`+name});
	//}
	return ()=>{
	   // if(behavior){
		if(events.has(`show.`+name)){
		    events.off(`show.`+name,
			       {idd: `show.`+name});
		}
		if(events.has(`hide.`+name)){
		    events.off(`hide.`+name, {idd: `hide.`+name});
		}
		
	//    }
		//events.off(handler);
	};
    }, []);
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
    return [_show, data];
}

function OuterComponent(options){
    /* This component use the useShowHook to show/hide itself
     on according events. In case of showing/spawning if
     the data having been given in the msg (and hence returned back by useShowHook)
     then the component.InnerComponent.Core.frame will be reinitiated with this data. 
     
     And also having 
 	    vActions = <FsmActionsViewer behavior = {behavior}/>;
	    vCurrentState = <FsmCurrentStateViewer
    components which will be shown
     if params show_state, show_actions was given in options
     */

    const [show, data] = useShowHook({
	name: options.name,
	show:options.hasOwnProperty("show")?options.show:true,
	init_data: options.data
    });
    console.log("ISSUE: show: show, data", [show, data]);
    // this is necessary for FsmActionsViewer and FsmCurrentStateViewer:
    const [behavior, set_behavior] = useState();

    // for show:
    // const [data, set_data] = useState(options.data);

    let core = <div/>;
    let vActions = <div/>;
    let vCurrentState = <div/>;

    if(show){
	// when behavior is ready:
	let args = {...options,
		    on_behavior_loaded: ({behavior})=>set_behavior(behavior)};

	// update the data if its be given by show:
	if(data)
	    args = {...args, data: data};

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
