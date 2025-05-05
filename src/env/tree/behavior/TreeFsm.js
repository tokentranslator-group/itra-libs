import {events} from 'itra-behavior/src/eHandler.js';
import {mk_fsm, mk_state, mk_state_ActionsQueue} from 'itra-behavior/src/type_classes/fsm/behaviors/helpers.js';
import {IO as IOBase} from './TreeEdp.js';

// import {mk_host_as_state} from '../../host/host_emulator.js';




function mk_tree_fsm(host_name, state_name){
    return mk_fsm({
	host_name: host_name,
	fsm_name: state_name?state_name:"Tree",

	// these will be checked automatically in all stacks:
	actions:{
	    
	    done: {from: "*", to: "Idle"},
	    join: {from: "Idle", to: "Joining"},
	    add: {from: "Idle", to: "Adding"},
	    update: {from: "Idle", to: "Updating"}
	},

	effects:{},

	// these been used only for mk_tree, rm_tree:
	stacks_spec:{
	    names: ["ActionsQueue"],

	    options:{ActionsQueue: {
		inheretence: "always" // "newer" | "normal"
	    }},
	    
	    callbacks: {
		ActionsQueue: (self, {event_type, args, trace})=>{
		    
		    // action, input, state
		    let action_name = args.action;
		    let input = args.input;
		    let state = args.state;
		    console.log("NODE::TreeFsm.ActionsQueue: reciving action:", action_name);
		    switch(action_name){
			
		    case "mk_tree":
			// update tree for each state:
			Object.entries(self.states).forEach((state)=>{
			    
			    state[1].tree = input.tree;
			});
			
			self.tree = input.tree;
			break;
			
		    case "rm_tree": self.tree.rm_tree();
			break;
		    }	    
		}
	    }
	},


	init_state_name: "Idle",

	states:[
	    
	    {
		name: "Adding",

		// Behavior:
		// protocols: on->emit add.enter
		// stack: on ActionsQueue.add.exit->add node+emit(done)
		builder: (parent_name)=> mk_state_ActionsQueue({
		    host_name: parent_name, state_name: "Adding",

		    actions: {
			
			"add.exit":(self, input)=>{
			    console.log("NODE::ACTIONS:Tree:Adding add node tree after add.exit, with input:", input);
			    let node = input.node;
			    self.tree.add_node(node);	

			    // send request to switch back to idle:
			    events.emit(host_name+".ActionsQueue",  {fargs:{action: "done"}});
			}
		    },

		    // what to do when entering state
		    protocols: {
			on: (self, input)=>{
			    console.log("NODE::PROTOCOLS: Tree:Adding:on add.enter");

			    const [x, y] = [0, 0];
			    // no need any x, y for input - it will be in the middle of the screen
			    // var x = self.tree.menu.offset[0];
			    // var y = self.tree.menu.offset[1];
			    
			    self.tree.menu.input.create_input(x, y, (node_name)=>{
				events.emit(host_name+".ActionsQueue", ({fargs:{
				    action: "add.enter", input: {node_name: node_name}}}));
			    });
			}}
		})
	    },

	    {
		name: "Updating",

		// on->emit update.enter
		// on ActionsQueue.uptate.exit->update tree+emit(done)
		builder: (parent_name)=> mk_state_ActionsQueue({
		    host_name: parent_name, state_name: "Updating",

		    actions: {
			"update.tree.exit": (self, input)=>{
			    let tree_data = input.tree_data;
			    console.log("NODE::ACTIONS:Updating:ActionsQueue updating tree after update.exit: input", input);
			    
			    self.tree.update_tree(tree_data);

			    // send request to switch back to idle:
			    events.emit(host_name+".ActionsQueue",  {fargs:{action: "done"}});
			}
		    },
		    
		    protocols:{
			on: (self, input)=>{
			    console.log("NODE::PROTOCOLS:Updating:on update.enter");
			    events.emit(host_name+".ActionsQueue",  {fargs:{
				action: "update.tree.enter", input: {url:"url"}}});
			}
		    }
		})
	    },

	    {
		name: "Idle",
		builder: (parent_name)=> mk_state({
		    host_name: parent_name,
		    state_name: "Idle",
		    stacks_spec: {names:[], callbacks:[]}
		})
	    }]});
}

// TODO: make keis as params:
class IO extends(IOBase){

    keys_handler(event){
	/*this.idx means/(used as) host_name here */
	var self = this;
	console.log("event.key:", event.key);
	console.log("event.key:", self);
	if(event.key == "a")
	    events.emit(self.idx+".ActionsQueue", {
		fargs: {action: "add"}});

	if(event.key == "u")
	    events.emit(self.idx+".ActionsQueue", {
		fargs:{action: "update"}});

    }	

}

/* The Root of the tree behavior */
class TreeBehavior{
    constructor({host_name, tree_name}){
	this.host_name = host_name;
	this.tree_name = tree_name;
    }
    
    enter(){
	// this.host_fsm = mk_host_as_state(this.host_name);
	// this.host_fsm.on();

	this.fsm = mk_tree_fsm(this.host_name, this.tree_name);
	// TODO: problem here: not tree available yet:
	this.fsm.on();
	
	this.io = new IO(this.host_name);    
    }
    
    // some kind of reducer here:
    apply(action_name, args){
	var self = this;
	switch(action_name){

	    case "init_tree":
	    // initiate the fsm with the tree:
	    console.log("mk_tree: args:", args);
	    events.emit(self.host_name+".ActionsQueue", {
		fargs: {
		    action: "mk_tree", input: args}});
	    break;

	    case "rm_tree":
	    events.emit(self.host_name+".ActionsQueue", {
		fargs:{action: "rm_tree", input: args}});
	    break;

	    default: throw new Error("TreeBehavior.apply: no such action: ", action_name);
	}}
    
    exit(){
	this.io.unregister();
	this.fsm.off();
	// this.host_fsm.off();
    }
}

export{TreeBehavior}
