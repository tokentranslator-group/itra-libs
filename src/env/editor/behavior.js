import {events} from 'itra-behavior/src/eHandler.js';

import {mk_node} from 'itra-behavior/src/type_classes/fsm/behaviors/helpers.js';

// this is an communicator/router between fsm and viewers:
function mk_editor_fsm(host_name){
    return mk_node({
	node_name: "Editor",
	host_name: host_name,
	
	stacks_names: ["IOQueue", "ActionsQueue"],

	

    });
}

/* The Root of the tree behavior */
class EditorBehavior{
    constructor({host_name, name}){
	this.host_name = host_name;
	this.name = name;
    }
    
    enter(){
	// this.host_fsm = mk_host_as_state(this.host_name);
	// this.host_fsm.on();

	this.fsm = false;// mk_editor_fsm(this.host_name, this.name);
	// TODO: problem here: not tree available yet:
	this.fsm.on();
	
	// this.io = new IO(this.host_name);    
    }
    
    // some kind of reducer here:
    apply(action_name, args){
	var self = this;
	switch(action_name){

	    case "init":
	    // initiate the fsm with the tree:
	    console.log("mk_tree: args:", args);
	    events.emit(self.host_name+".ActionsQueue", {
		fargs: {
		    action: "mk_editor", input: args}});
	    break;

	    case "rm_tree":
	    events.emit(self.host_name+".ActionsQueue", {
		fargs:{action: "rm_editor", input: args}});
	    break;

	    default: throw new Error("EditorBehavior.apply: no such action: ", action_name);
	}}
    
    exit(){
	this.io.unregister();
	this.fsm.off();
	// this.host_fsm.off();
    }
}

export{EditorBehavior}
