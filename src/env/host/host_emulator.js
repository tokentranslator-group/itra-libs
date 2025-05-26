import {events} from 'itra-behavior/src/eHandler.js';

import {mk_state_ActionsQueue} from 'itra-behavior/src/type_classes/fsm/behaviors/helpers.js';

var counter = 1;

function mk_host_as_state(host_name){
    let host_fsm = mk_state_ActionsQueue({
	
	// name in inner stack hierarchy:
	host_name: host_name,
	state_name: "Server",

	actions: {
	    "save.enter": (self, input)=>{
		console.log("HostEmulator: save.enter:input:" , input);
		// simulating the server:
		const entry ={
		    tabs_ids: ["parser", "out"],
		    tabs_contents: ["HostEmulator simulated save result", "4"],
		    field_tags: ["math"]};

		// the data having been updated, call to everyone:
		events.emit(host_name+".ActionsQueue", {
		    fargs: {action: "save.exit", input:{data: entry}},
		    on_done: (trace)=>{
			console.log("HostEmulator: save.exit done");
		    }});

	    },

	    "add.tree.enter": (self, input)=>{
		// simulating the server:
		var node = {"title": input.node_name, "folder": false};
		
		console.log("NODE::Server.add.enter: adding data to server...");
		
		// data having been updated, call to everyone:
		events.emit(host_name+".ActionsQueue", {
		    fargs: {action: "add.tree.exit", input:{node: node}},
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

	    "join.enter": (self, input)=>{
	    	let parent = input.destination;
		let children = input.source;
		
		console.log("NODE::Server.join.enter: joining on server...");
		// data having been updated, call to everyone:
		events.emit(host_name+".ActionsQueue",  {
		    fargs: {
			action:"join.exit",
			input:{
			    tree_data:{
				children:[{
				    title: "joined done",
				    key: "1",
				    folder: true,
				    children: children}]}}},
		    on_done: (trace)=>{
			console.log("HostEmulator: join.exit done");
		    }});
	    },
	    
	    "fetch.enter": (self, input)=>{
	    	let query = input.query;
				
		console.log("NODE::Server.fetch.enter: fetching from server...");
		
		// data having been updated, call to everyone:
		events.emit(host_name+".ActionsQueue",  {
		    fargs: {
			action:"fetch.exit",
			input:{
			    entries:[
				{title: query+" fetched 1", key: "1"},
				{title: query+" fetched 2", key: "2"},
				{title: query+" fetched 3", key: "3"}
			    ]}},

		    on_done: (trace)=>{
			console.log("HostEmulator: fetch.exit done");
		    }});
	    }

	}
    });
    return host_fsm;
}


export{mk_host_as_state}
