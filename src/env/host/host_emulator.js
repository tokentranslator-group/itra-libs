import {events} from 'itra-behavior/src/eHandler.js';

import {mk_state_ActionsQueue} from 'itra-behavior/src/type_classes/fsm/behaviors/helpers.js';

var counter = 1;

function mk_host_as_state(host_name){
    let host_fsm = mk_state_ActionsQueue({
	
	// name in inner stack hierarchy:
	host_name: host_name,
	state_name: "Server",

	actions: {
	    "add.enter": (self, input)=>{
		// simulating the server:
		var node = {"title": input.node_name, "folder": false};
		
		console.log("NODE::Server.add.enter: adding data to server...");
		
		// data having been updated, call to everyone:
		events.emit(host_name+".ActionsQueue", {
		    fargs: {action: "add.exit", input:{node: node}},
		    on_done: (trace)=>{
			console.log("HostEmulator: add.exit done");
		    }});
	    },

	    "update.tree.enter": (self, input)=>{
	    	console.log("NODE::Server.update.enter: joining on server...");
		const url = input.url;
		console.log("NODE::Server.update.enter: url:", url);
		
		counter +=1;
		// data having been updated, call to everyone:
		events.emit(host_name+".ActionsQueue",  {
		    fargs: {
			action: "update.tree.exit",
			input:{tree_data:{
			    title: "updated available", key: "1", folder: true,
			    children: [
				{title: "updated root "+ counter, folder:true, key: "2",
				 children: [
				     {title: "updated first child", key: "5"},
				     {title: "second", key: "6"}
				 ]}
			    ]}}},
		    on_done: (trace)=>{
			console.log("HostEmulator: update.exit done");
		    }});
	    },

	    // TODO:
	    "join.enter": (self, input)=>{
	    	let parent = input.parent;
		let children = input.children;
		
		console.log("NODE::Server.join.enter: joining on server...");
		// data having been updated, call to everyone:
		events.emit(host_name+".ActionsQueue",  {
		    fargs: {action:".join.exit", tree_data:{}},
		    on_done: (trace)=>{
			console.log("HostEmulator: join.exit done");
		    }});
	    }
	}
    });
    return host_fsm;
}


export{mk_host_as_state}
