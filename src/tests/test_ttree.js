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
    constructor(){
	events.on("Host.add.enter", ({event_type, args, trace})=>{
	    let node_name = args.node_name;

	    // simulating the server:
	    var node = {"title": node_name, "folder": false};

	    console.log("Host.add.enter: adding data to server...");
	    // data having been updated, call to everyone:
	    events.emit("Host.add.exit", {
		fargs: {node:node}});
	});

	// TODO: mk_action({enter:()=>..., exit: ()=>...}) 
	events.on("Host.join.enter", ({event_type, args, trace})=>{
	    let parent = args.parent;
	    let children = args.children;

	    console.log("Host.join.enter: joining on server...");
	    // data having been updated, call to everyone:
	    events.emit("Host.join.exit", {
		fargs: {tree_data:{}}});
	});

    }
}


class TreeFsm{
    constructor(){
	var self = this;

	// update tree:
	events.on("TreeFsm.mk_tree", ({event_type, args, trace})=>{
	    self.tree = args.tree;
	});

	// specific methods from parent fsm:
	events.on("Host.join.exit", ({event_type, args, trace})=>{
	    let tree_data = args.tree_data;
	    console.log("updating tree after Host.join.exit...");
	    // update state then
	    // self.switch_to(idle, entry)
	});

	events.on("Host.add.exit", ({event_type, args, trace})=>{
	    let node = args.node;
	    self.tree.add_node(node);
	    // update state then
	    // self.switch_to(idle, entry)
	});

	// specific methods from children:
	events.on("TreeFsm.join", ({event_type, args, trace})=>{
	    self.join();
	});
	
	events.on("TreeFsm.mk", ({event_type, args, trace})=>{
	    self.mk();
	});
	
	

	this._transitions = {};	
    }

    join(){
	const self = this;
	const active_node = self.tree.get_selected_node();
	console.log("active_node:", active_node.title);

	const selected_nodes = self.tree.get_selected_nodes();
	console.log("selected_node:", selected_nodes);
	const selected_node_names = selected_nodes.map(node=>node["title"]);
	console.log("node_name:", selected_node_names);

	events.emit("Host.join.enter", {
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
	
	self.tree.menu.input.create_input(x, y, (node_name)=>{
	    events.emit("Host.add.enter", ({fargs:{node_name: node_name}}));
	});

    }
}

class IO{
    constructor(){
	document.addEventListener('keyup', (event)=>{
	    console.log("event.key:", event.key);
	    if(event.key == "a")
		events.emit("TreeFsm.mk", {});
	});

	// 'onclick'
	window.addEventListener('onclick', (event)=>{
	    console.log("onclick");
	});
	
	
	// document.removeEventListener('keyup', key_handler);
    }
}

function main(){

    const host_fsm = new HostFsm();
    const tree_fsm = new TreeFsm();
    const io = new IO();    

    $("#root").html(` <div id="mc_0" class="mc">
      <div id="main_tree" class="tree_positioned" style="position: inherit; top: 100px;"></div>
      <div id="tree_menu" style="z-index: 0;"></div>
      <div id="tree_input"></div>
    </div>
   `);


    const tree = new Tree({
	
	
	container_div_id: "#mc_0",

	tree_div_id: "#main_tree",
	menu_div_id: "#tree_menu",
	input_div_id: "#tree_input",
	
	// for avoiding canvas influence:
	menu_shift: 0, // parseInt(menu_shift_controls_top, 10),

	// url: url,
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
	    ]},

	activator: function(event, data){
	    console.log("clicked on: ", data.node.title);
	},

	// FOR menu:
	menu_items: ["join", "mk", "load", "save"],
	
	menu_tooltips: ["join", "mk", "load entry", "rewrite selected model"],

	// keys here must be equal to ``menu_items``:
	menu_callbacks: {
	    "join": ()=>events.emit("TreeFsm.join", {}),
	    "mk": ()=>{
		console.log("mk...");
		events.emit("TreeFsm.mk", {});
	    },
	    "load": ()=>{
		console.log("loading...");
		
		// fsm.emit("add.enter")
	    },
	    "save": ()=>console.log("saving...")
	    }
	// END FOR
    });

    events.emit("TreeFsm.mk_tree", {fargs: {tree: tree}});
    // const root = ReactDOM.createRoot(document.getElementById('root'));
    // root.render(<MyAppCy />);


}


export {main}
