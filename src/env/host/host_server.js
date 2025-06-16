import {events} from 'itra-behavior/src/eHandler.js';
import {mk_node, mk_idle_state} from 'itra-behavior/src/type_classes/fsm/behaviors/helpers.js';
import $ from 'jquery';

function $_get_data({url, to_send, succ, dbg}){
    dbg = dbg?dbg:true;
    $.ajax(
	{
	    url: url,
	    type: 'POST',
	    data: JSON.stringify(to_send),
	    
	    success: function (jsonResponse) {
		var objresponse = JSON.parse(jsonResponse);
		
		var data = objresponse;
		if(dbg){
		    console.log("SVR: data_successfuly_recived: data", data);
		}
		// to_send["result"] = data;
		if (succ)
		    succ(data);
	    },
	    
	    error: function (jqXHR, textStatus, errorThrown) {
		var msg = "SVR: error to send";
		console.log(msg);
		console.log("jqXHR: ", jqXHR);
		console.log("textStatus: ", textStatus);
		console.log("errorThrown:", errorThrown);
		alert(msg);
	    }
	});
}


class ServiceReducer{
    constructor({host_name, service_name}){
	this.host_name = host_name;
	this.service_name = service_name;
    }
    call(action, args, on_succ){
	/*
	 Examples:
	 
	 reducer("init", {})
	 */
	let host_name = this.host_name;
	let service_name = this.service_name;

	// example of usage:
	events.emit(host_name+".ActionsQueue", {
	    fargs:{
		// action for host_fsm:
		action: service_name+".enter",


		input:{
		    // action for host_fsm.on.fetch
		    // i.e. for reducer itself:
		    action: action,
		    args: args,
		    on_succ: on_succ
		}
	    }});
    }
}


function mk_host_server(host_name, service_name, url){
    /*
    // example of usage:
    events.emit(host_name+".ActionsQueue", {
	fargs:{
	    // action for host_fsm:
	    action: service_name+".enter",
	    input:{
		// action for host_fsm.on.fetch
		// i.e. for reducer itself:
		action: "init",
		args: {
		    
		}
	    }
	}});

     # REF: test_host_server.js
     */

    let main_actions = {};
    main_actions[service_name+".enter"] = {from: "Idle", to:"Waiting"};
    main_actions[service_name+".exit"] = {from: "Waiting", to:"Idle"};

    return mk_node({
	host_name: host_name,
	node_name: "HostServer",
	
	stacks_names: ["ActionsQueue"],
	
	actions: main_actions,

	init_state_name: "Idle",
	
	states: [
	    {
		name: "Idle",
		builder: (parent_name)=>mk_idle_state(parent_name, "Idle")
	    },
	    {
		name: "Waiting",
		builder: (parent_name)=>mk_node({
		    host_name, parent_name,
		    node_name: "Waiting",
		    protocols: {
			on:(self, input)=>{
			    console.log("SVR: getting data");
			    
			    $_get_data({
				url,
				to_send:{
				    
				    service: {
					name: service_name,
					action: {
					    name: input.action,
					    args: input.args
					}
				    }}, 
				succ: (data)=>{
				    
				    console.log("SVR: "+host_name+" data returned:", data);
				    
				    if(input.on_succ!==undefined)
					input.on_succ(data);

				    // switch self to idle
				    // and send data to others:
				    events.emit(host_name+".ActionsQueue", {
					fargs:{
					    action:service_name+".exit",
					    input:{
						action: input.action,
						data: data
					    }}
				    });
				    // to catch it from some other state use:
				    /*
				    mk_node(){
				     events: {
					(service_name+".exit"):{
					    stack_name: "ActionsQueue",
					    callback: (self, input)=>{
					       // use input.data here:
				               // as recived one
				               // ...
					    }
					}
				      }
				     }

				     // or just from edp:
				    events.on(host_name+".ActionsQueue",
					      ({event_type, args, trace})=>{
						  if(args.input.action=="some_action")
				                      // use recived data here
						      some_func(args.input.data);
					      });
				     */
				}});
			    // not working:
			    // get_data(url, service_name, input);
			}
			
		    }
		    
		})
	    }
	]
    });		
}


// not working: result arrived but response.ok is false and
// response.json() return error:
async function get_data(url, service_name, input){
    try {
	const response = await fetch(
	    url,
	    {
		mode:"no-cors",
		method: "POST",
		headers: {
		    "Content-Type": "application/json",
		    Accept: "application/json"
		},
		body: JSON.stringify({
		    
		    service: {
			name: service_name,
			action: {
			    name: input.action,
			    args: input.args
			}
		    }})
	    });

	if (!response.ok) {
	    throw new Error(`SRV: Response status: ${response.status}`);
	}
	
	const json = await response.json();
	console.log("SRV:json", json);
    } catch (error) {
	console.log("SRV:error: ", error);
	console.error(error.message);
    }
   
}

export{mk_host_server, ServiceReducer}

