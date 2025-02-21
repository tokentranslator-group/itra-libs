import {events} from 'behavior-store/src/index.js';

class Fsm{
    unregister(handlers){

	handlers.forEach((name)=> events.off(name));
    }
}

class HostFsm extends(Fsm){
    /*The HostFsm or Parent of TreeFsm. They both sharing same
     `stack` i.e. same root through the eHandler events names
     i.e. through the observer pattern*/
    constructor(idx){
	super();
	var self = this;
	this.idx = idx;
	
	events.on(self.idx+".add.enter", ({event_type, args, trace})=>{
	    let node_name = args.node_name;

	    // simulating the server:
	    var node = {"title": node_name, "folder": false};

	    console.log(self.idx+".add.enter: adding data to server...");
	    // data having been updated, call to everyone:
	    events.emit(self.idx+".add.exit", {
		fargs: {node:node}});
	});

	// TODO: mk_action({enter:()=>..., exit: ()=>...}) 
	events.on(self.idx+".join.enter", ({event_type, args, trace})=>{
	    let parent = args.parent;
	    let children = args.children;

	    console.log(self.idx+".join.enter: joining on server...");
	    // data having been updated, call to everyone:
	    events.emit(self.idx+".join.exit", {
		fargs: {tree_data:{}}});
	});

	// TODO: mk_action({enter:()=>..., exit: ()=>...}) 
	events.on(self.idx+".update.enter", ({event_type, args, trace})=>{
	    
	    console.log(self.idx+".update.enter: joining on server...");
	    const url = args.url;
	    console.log(self.idx+".update.enter: url:", url);

	    // data having been updated, call to everyone:
	    events.emit(self.idx+".update.exit", {
		fargs: {
		    tree_data:{
			title: "updated available", key: "1", folder: true,
			children: [
			    {title: "updated root", folder:true, key: "2",
			     children: [
				 {title: "updated first child", key: "5"},
				 {title: "second", key: "6"}
			     ]}
			]}}});
	});

    }

    unregister(){
	var self = this;
	super.unregister([self.idx+".update.enter",
			  self.idx+".join.enter",
			  self.idx+".add.enter"
			 ]);
	events.show_observers();
    }
}


class TreeFsm extends(Fsm){
    /*
     This looks like signle State rather then fsm.
     State.enter -> register on parent.on_exit methods
                 -> register on self.on_action methods
     State.exit -> unregister
     State.apply(action)

     switch_to(adding)
        self.state_adding.on_exit() -> unregister adding.exit, register adding.enter
        self.state_adding.on_enter() -> register adding.exit, unregister adding.enter

     */
    constructor(idx, parent_idx){
	super();
	var self = this;
	self.idx = idx;
	self.parent_idx = parent_idx;

	// update tree:
	events.on(self.idx+".mk_tree", ({event_type, args, trace})=>{
	    self.tree = args.tree;
	});

	// FOR |specific methods from parent fsm:
	// TODO: subs_to_parents

	// state == updating
	events.on(self.parent_idx+".update.exit", ({event_type, args, trace})=>{
	    let tree_data = args.tree_data;
	    console.log("updating tree after Parent.update.exit...");
	    self.tree.update_tree(tree_data);

	    // update state then
	    // self.switch(updating->idle, entry)
	});

	// state == joining:
	events.on(self.parent_idx+".join.exit", ({event_type, args, trace})=>{
	    let tree_data = args.tree_data;
	    console.log("updating tree after Parent.join.exit...");
	    // update state then
	    // self.switch(joining->idle, entry)
	});

	// state == adding
	events.on(self.parent_idx+".add.exit", ({event_type, args, trace})=>{
	    let node = args.node;
	    self.tree.add_node(node);
	    // update state then
	    // self.switch_to(adding->idle, entry)
	});

	// FOR specific methods from children:
	// TODO: subs_to_child

	// state == idle
	events.on(self.idx+".join", ({event_type, args, trace})=>{
	    // swithch_to(idle->join)
	    // 
	    self.join();
	    
	});
	
	events.on(self.idx+".mk", ({event_type, args, trace})=>{
	    self.mk();
	});

	events.on(self.idx+".update", ({event_type, args, trace})=>{
	    self.update();
	});
	// END FOR
	

	this._transitions = {};	
    }

    unregister(){
	var self = this;
	super.unregister([
	    // self:
	    self.idx+".mk_tree",
	    self.idx+".join",
	    self.idx+".mk",
	    self.idx+".update",

	    // parents:
	    self.parent_idx+".update.exit",
	    self.parent_idx+".join.exit",
	    self.parent_idx+".add.exit",
	]);
    }


    update(){
	const self = this;

	// simulate call to parent for data:
	events.emit(self.parent_idx+".update.enter", {fargs:{url:"url"}});
	
    }
    
    join(){
	// collecting input/percept
	const self = this;
	const active_node = self.tree.get_selected_node();
	console.log("active_node:", active_node.title);

	const selected_nodes = self.tree.get_selected_nodes();
	console.log("selected_node:", selected_nodes);
	const selected_node_names = selected_nodes.map(node=>node["title"]);
	console.log("node_name:", selected_node_names);

	// switch_to(idle->joining), inform others:
	events.emit(self.parent_idx+".join.enter", {
	    fargs:{
		parent: active_node,
		children: selected_node_names
	    }});
    }
    
    mk(){
	var self = this;

	const [x, y] = [0, 0];
	// no need any x, y for input - it will be in the middle of the screen
	// var x = self.tree.menu.offset[0];
	// var y = self.tree.menu.offset[1];
	
	console.log("TreeFsm:dbg:self.tree", self.tree);
	self.tree.menu.input.create_input(x, y, (node_name)=>{
	    events.emit(self.parent_idx+".add.enter", ({fargs:{node_name: node_name}}));
	});

    }
}

/* This Input is responsible for keyboard shortcuts */
class IO{
    // TODO: instead of tree_fsm_idx use ActionsQueue
    // so it will not be restricted by Tree only 
    constructor(tree_fsm_idx){
	var self = this;
	this.idx = tree_fsm_idx;
	
	this.keys_handler = this.keys_handler.bind(this);
	document.addEventListener('keyup', this.keys_handler);

	// 'onclick'
	this.click_handler = this.click_handler.bind(this);
	window.addEventListener('onclick', this.click_handler);
	
    }

    unregister(){
	document.removeEventListener('keyup', this.keys_handler);
	document.removeEventListener('onclick', this.click_handler);
    }

    click_handler(event){
	console.log("onclick");
    }

    keys_handler(event){
	var self = this;
	console.log("event.key:", event.key);
	console.log("event.key:", self);
	if(event.key == "a")
	    events.emit(self.idx+".mk", {});

	if(event.key == "u")
	    events.emit(self.idx+".update", {});

    }	
}


export{IO, TreeFsm, HostFsm}
