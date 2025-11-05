import {events} from 'itra-behavior/src/eHandler.js';
import {mk_node, mk_fsm, mk_state, mk_state_ActionsQueue} from 'itra-behavior/src/type_classes/fsm/behaviors/helpers.js';
import {IO as IOBase} from './TreeEdp.js';

// import {mk_host_as_state} from '../../host/host_emulator.js';
import {apply_tree} from '../ttree_helpers.js';




function mk_tree_fsm(host_name, state_name){
    return mk_fsm({
	host_name: host_name,
	fsm_name: state_name?state_name:"Tree",

	// these will be checked automatically in all stacks:
	actions:{
	    
	    done: {from: "*", to: "Idle"},
	    "join.exit": {from: "Joining", to: "Idle"},
	    "join": {from: "Idle", to: "Joining"},
	    add: {from: "Idle", to: "Adding"},
	    rm: {from: "Idle", to: "Removing"},
	    "rm.exit": {from: "Removing", to: "Idle"},
	    update: {from: "Idle", to: "Updating"}
	    
	},

	protocols: {
	    on: (self, input)=>{
		console.log("NODE::PROTOCOLS: Tree:on:input:", input);
		console.log("NODE::PROTOCOLS: Tree:on:self:", self);
		
	    }},
	
	effects:{},

	
	// these been used only for mk_tree, rm_tree, set_init_data:
	stacks_spec:{
	    names: [
		"ActionsQueue",

		// Currently only ised in the Idle state
		"DbgQueue"  
	    ],
	    
	    // TODO: optional override of parent cb by current_state one 
	    options:{ActionsQueue: {
		inheretence: "always" // "newer" | "normal"
	    }},
	
	    // all this callbacks will only work if the current_state
	    // has no ActionsQueue support (ie for Idle state only)
	    // if it has smth on  ActionsQueue, this cb will be
	    // ignored!
	    callbacks: {
		ActionsQueue: (self, {event_type, args, trace})=>{
		    /*
		     Usage:
		     events.emit(host_name+".ActionsQueue",
				 {fargs: {
				     action: "mk."+tree_name,
				     input:{frame: tree_frame}}});

		     // send init data to all:
		     events.emit(host_name+".ActionsQueue",
				 {fargs: {
				     action: "set_init_data",
				     input: {reducer:reducer}
				 }});
		     */

		    // action, input, state
		    let action_name = args.action;
		    let input = args.input;
		    let state = args.state;
		    console.log("NODE::TreeFsm.ActionsQueue: reciving action:", action_name);
		    switch(action_name){

		    case "set_init_data":
			if(input.hasOwnProperty("init_options")){
			    Object.entries(self.states).forEach((state)=>{
				
				state[1].cert = input.cert;
				
			    });
		
			    self.cert = input.cert;
			    
			}
			
			break;
		    case "mk."+state_name:
			// update tree for each state:
			Object.entries(self.states).forEach((state)=>{
			    
			    state[1].tree = input.frame;
			    
			});
			
			self.tree = input.frame;
			// console.log("self.states", self.states);
			
			break;
			
		    case "rm."+state_name: self.tree.rm_tree();
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
			
			"add.tree.exit":(self, input)=>{
			    console.log("NODE::ACTIONS:Tree:Adding add node tree after add.exit, with input:", input);

			    // converting reciving data to the tree format:
			    let node = apply_tree(input.data).children;
			    console.log("PROBLEM::Tree:Adding add node tree after add.exit, node:", node);
			    // call frame original method:
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
			    
			    self.tree.menu.input.create_input(x, y, (new_node_name)=>{
				let parent_node = self.tree.get_selected_node();
				let parents_list = self.tree.get_parents_list(parent_node);
				// TODO: input.on_succ(data)
				events.emit(host_name+".ActionsQueue", ({fargs:{
				    action: "add.tree.enter", input: {
					new_node_name: new_node_name,
	
					parent_node: parent_node.data,
					parents_list: parents_list
				    }}}));
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
			    // TODO: input.on_succ(data)

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
			    // TODO: input.on_succ(data, input)
			    //  inside which the Host will emit("exit", input)
			    // and so input will arrive on State.update.tree.exit
			    // handler where it could be called
			    // or Just register them all in some event stack
			    // so they could be called one after another 
			    // with some trace.msg
			    events.emit(host_name+".ActionsQueue",  {fargs:{
				action: "update.tree.enter", input: {url:"url"}}});
			}
		    }
		})
	    },

	    // Note the usage of mk_node here
	    // and protocols only scheme (events used only for deselection):
	    {
		name: "Joining",
		builder: (parent_name)=> mk_node({
		    host_name: parent_name,
		    node_name: "Joining",
		    
		    stacks_names: ["ActionsQueue"],
		    
		    events: {deselect:{
			stack_name: "ActionsQueue",
			callback: (self, input)=>{
			    self.tree.deselect();
			}
		    }},

		    protocols: {
		    	on:(self, input)=>{
			    console.log("PROBLEM:Joining.on,get_selected()",self.tree.get_selected());
			    // TODO: input.on_succ(data)
			    events.emit("show."+"Joiner",{
				fargs:{
				    action: "None",
				    input: {
					selected: self.tree.get_selected()
					    // TODO: data_protocol
					    .map((entry)=>({
						id: entry.data.id,
						value: entry.data.title
					    }))}}
				//on_done: (trace)=>self.tree.deselect()
			    });
			},
			off:(self, input)=>{
			    console.log("NODE::ACTIONS:Joining: updating tree after join.exit: input", input);			    
			    let tree_data = input.tree_data;

			    if(tree_data!==undefined)
				self.tree.update_tree(tree_data);
			}
		    }
		})
		
	    },


	    // Note the usage of mk_node here
	    // and protocols only scheme (events used only for deselection):
	    {
		name: "Removing",
		builder: (parent_name)=> mk_node({
		    host_name: parent_name,
		    node_name: "Removing",
		    
		    stacks_names: ["ActionsQueue"],
		    
		    events: {},

		    protocols: {
		    	on:(self, input)=>{
			    // TODO: input.on_succ(data)
			    events.emit(host_name+".ActionsQueue",{
				fargs:{
				    action: "rm.enter",
				    
				    input: {
					selected: self.tree.get_selected().map((entry)=>entry.data)}}
				//on_done: (trace)=>self.tree.deselect()
			    });
			},
			off:(self, input)=>{
			    console.log("NODE::ACTIONS:Removing.off: rm.exit: input", input);
			    let result = input.result;
			    // if sere is some result
			    if(result)
				self.tree.rm_selected(false);
			    else
				throw new Error("NODE::ACTIONS:Removing.off: some error hapend on server side");
			}
		    }
		})
		
	    },

	    {
		name: "Idle",
		builder: (parent_name)=> mk_state({
		    host_name: parent_name,
		    state_name: "Idle",
		    stacks_spec: {
			// in order to work, the parent fsm should also 
			// support the DbgQueue.
			names:["DbgQueue"], 
			callbacks:{
			    /*Just for testing:
			     Usage:
			     events.emit(host_name+".DbgQueue",
				    {fargs: {
					action: "test.add",
					input:{
					    data:{
						title: "test.add",
						// folder: true,
						children: []}}}});
			     */
			    
			    DbgQueue: (self,{event_type, args, trace})=>{	
				// action, input, state
				let action_name = args.action;
				let input = args.input;
				let state = args.state;
				console.log("DBG:Tree:Idle.self", self);
				console.log("DBG:Tree:Idle.action_name", action_name);
				console.log("DBG:Tree:Idle.input", input);
				switch(action_name){
				case "test.add":
				    self.tree.add_node(input.data);
				    break;
				case "test.select":
				    console.log("DBG:Tree:Idle. test.select: self.tree.get_selected()",
						self.tree.get_selected());
				    
				    break;
				
				}
				
			    }
			}}
		    // stacks_spec: {names:[], callbacks:[]}
		})
	    }]});
}

// TODO: make keis as params:
/*TODO:
  state manipulation:

init
 events.on(focused, (focused)=>{
    if focused in self.keys:
      self.keys[self.focused]
 })

register(name, keys)
 self.keys[name] = keys

*/
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

export{mk_tree_fsm}
