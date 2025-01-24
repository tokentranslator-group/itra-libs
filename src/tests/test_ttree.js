import React from 'react';
import {useState, useEffect, useRef} from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';

import {events} from 'behavior-store/src/index.js';

import {Tree, sort_children} from '../ttree.js';


class HostFsm{
    /*The HostFsm or Parent of TreeFsm. They both sharing same
     `stack` i.e. same root through the eHandler events names
     i.e. through the observer pattern*/
    constructor(idx){
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
}


class TreeFsm{
    /*
     switch_to(adding)
        self.state_adding.on_exit() -> unregister adding.exit, register adding.enter
        self.state_adding.on_enter() -> register adding.exit, unregister adding.enter

     */
    constructor(idx, parent_idx){

	var self = this;
	self.idx = idx;
	self.parent_idx = parent_idx;

	// update tree:
	events.on(self.idx+".mk_tree", ({event_type, args, trace})=>{
	    self.tree = args.tree;
	});

	// FOR |specific methods from parent fsm:

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

	// specific methods from children:

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

class IO{
    constructor(tree_fsm_idx){
	document.addEventListener('keyup', (event)=>{
	    console.log("event.key:", event.key);
	    if(event.key == "a")
		events.emit(tree_fsm_idx+".mk", {});

	    if(event.key == "u")
		events.emit(tree_fsm_idx+".update", {});

	});

	// 'onclick'
	window.addEventListener('onclick', (event)=>{
	    console.log("onclick");
	});
	
	
	// document.removeEventListener('keyup', key_handler);
    }
}


function  mk_tree({storage, container_id, tree_id, menu_id, input_id, search_id, tree_fsm_idx, tree_data}){
    /*
     All ids have to be uinique for each call. Or old one have to be removed with tree.rm_tree()

     - ``storage_id`` -- where the tree object will be put in.
     Will not be created here, should exist alredy.
     Others ids will be created and should not exist.

     - ``tree_fsm_idx`` -- the name of fsm to call upon (like TreeFsm1 for instance)
     */
    


    const tree = new Tree({
	
	storage: storage,
	container_div_id: "#"+container_id,

	tree_div_id: "#"+tree_id,
	menu_div_id: "#"+menu_id,
	input_div_id: "#"+input_id,
	search_div_id: "#"+search_id,
	// for avoiding canvas influence:
	menu_shift: 0, // parseInt(menu_shift_controls_top, 10),

	// url: url,
	tree_data: tree_data,

	activator: function(event, data){
	    console.log("clicked on: ", data.node.title);
	},

	// FOR menu:
	menu_items: ["join", "mk", "load", "save"],
	
	menu_tooltips: ["join", "mk", "load entry", "rewrite selected model"],

	// keys here must be equal to ``menu_items``:
	menu_callbacks: {
	    "join": ()=>events.emit(tree_fsm_idx+".join", {}),
	    "mk": ()=>{
		console.log("mk...");
		events.emit(tree_fsm_idx+".mk", {});
	    },
	    "load": ()=>{
		console.log("loading...");
		
		// fsm.emit("add.enter")
	    },
	    "save": ()=>console.log("saving...")
	    }
	// END FOR
    });

    return tree;
}


function main(){
    const host_fsm = new HostFsm("Host1");
    const tree_fsm = new TreeFsm("TreeFsm1", "Host1");
    const io = new IO("TreeFsm1");    
    

    const root = document.getElementById('root');
    
    const tree = mk_tree({
	storage: root,

	container_id: "mc_0",
	tree_id: "left_tree_id",
	menu_id: "menu_id",
	input_id: "input_id",
	search_id: "search_id",

	tree_fsm_idx:"TreeFsm1",
	
	tree_data: {
	    title: "available", key: "1", folder: true,
	    children: [
		{title: "eqs parser", folder:true, key: "2",
		 children: [
		     {title: "tokens path", key: "5"},
		     {title: "tokens", key: "6"},
		     {title: "play space", key: "7"},
		     {title: "db path", key: "8"},
		     {title: "db", key: "9"}]},
	    ]}
    });

    events.emit("TreeFsm1.mk_tree", {fargs: {tree: tree}});
    // const root = ReactDOM.createRoot(document.getElementById('root'));
    // root.render(<MyAppCy />);


}


export {main, mk_tree, HostFsm, TreeFsm, IO}
