import {events} from 'itra-behavior/src/eHandler.js';

import {mk_node, mk_idle_state} from 'itra-behavior/src/type_classes/fsm/behaviors/helpers.js';




function mk_editor_fsm(host_name, name){
    // TODO: generalize both editor and tree top/root node/fsm:
    var state_events = {};
    
    // this will be used in the BehaviorComponent.apply for wrapper_react:
    state_events["mk."+name] = {
	stack_name: "ActionsQueue",
	callback: (self, input)=>{
	    console.log("NODE::FSM: mk being called, input:", input);
	    // update editor for each state:
	    Object.entries(self.states).forEach((state)=>{
		state[1].editor = input.frame;
	    });
	    self.editor = input.frame;
	    self.editor.create_tabs();
	}
    };

    state_events["rm."+name] = {
	stack_name: "ActionsQueue",
	callback: (self, input)=>{
	    self.editor.remove();
	}
    };

    // This is only for v1 update mechanism
    // which is currently not used: see react_wrapper.js:OuterComponent
    state_events["update."+name] = {
	stack_name: "ActionsQueue",
	callback: (self, input)=>{
	    console.log("ISSUE show ::FSM on "+"update."+name+":input", input);
	    // self.editor.remove();
	    if(input.hasOwnProperty("data"))
		self.editor.load(input.data);
	    // self.editor.create_tabs();
	}
    };

    return mk_node({
	node_name: name,
	host_name: host_name,
	
	stacks_names: ["ActionsQueue"],

	protocols:{
	    on:(self, input)=>{

		console.log("NODE::FSM: on: call editor.create_tabs, input:", input);
		// self.editor.create_tabs();
	    },
	    off:(self, input)=>{
		console.log("NODE::FSM: off: call editor.remove");
		// self.editor.remove();
	    }
	},

	events:state_events,

	actions: {
	    "save.exit": {from: "Saving", to: "Idle"},
	    // "editor.done": {from: "*", to: "Idle"},
	    save: {from: "Idle", to: "Saving"}
	},

	init_state_name: "Idle",
	states:[
	    {
		name: "Saving",
		builder: (parent_name)=>mk_saving_state(parent_name, host_name)
	    },
	    {
		name: "Idle",
		builder: (parent_name)=>mk_idle_state(parent_name)
	    }
	]
    });

}

// note: use of parent external host:
function mk_saving_state(host_name, parent_host_name){
    return mk_node({
	host_name: host_name,
	node_name: "Saving",
	
	protocols:{
	    on:(self, input)=>{
		let data = self.editor.save();
		
		console.log("PROBLEM: EditorFsm input:", input);
		console.log("PROBLEM: EditorFsm data:", data);
		events.emit(parent_host_name+".ActionsQueue", ({
		    fargs:{
			action: "save.enter", input: {data: data}}
		}));
		
	    },
	    
	    off:(self, input)=>{
		console.log("PROBLEM Saving off, input.data:",input.data);
		self.editor.load(input.data);
	    }
	},
	/*
	events:{
	    "save.exit":{
		// no need for prent_name here
		stack_name:"ActionsQueue",
		callback: (self, input)=>{
	
		    console.log("========Editor.Saving.save.exit========");
		    events.emit("Host"+".ActionsQueue", ({fargs:{
			action: "editor.done"}}));
		}
	    }
	}*/
    });
}

// DEPRICATED:
/* The Root of the tree behavior */
/*
// this is an communicator/router between fsm and viewers:
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
*/
export{mk_editor_fsm}
