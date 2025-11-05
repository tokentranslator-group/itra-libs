import React from 'react';
import {useState, useEffect, useRef} from 'react';
import ReactDOM from 'react-dom';

import {events} from 'itra-behavior/src/eHandler.js';
import {cert_v0 as cert} from '../cert.js';

import $ from 'jquery';
import * as ui from 'jquery-ui';

// import 'jquery-ui/ui/widgets/tabs';
//import 'jquery-ui/ui/widgets/dialog';
import 'jquery-ui/ui/widgets/resizable';
import 'jquery-ui/ui/widgets/draggable';


function internal_data_importer(data){
    /*Transform single element, not list*/
    cert.verify({
	idd: "joiner",
	msg: data,
	data_form: "Single"
    });
    let internal_data = {

	label:data.protocol.data_form == "Branch"?data.edge.label:undefined,
	
	original: data};

    return internal_data;
}

function internal_data_exporter_dest(data){
    return cert.sign({
	idd: "joiner",
	// the data.original having node since
	// internal_data_importer required data_form == Single
	msg: {node: data.original.node},
	data_type: "Node",
	data_form: "Single"
    });
}

function internal_data_exporter_source(data){
    /*Transform single data
     data having label inside, which will be used as an edge.label*/
    
    if(!data.hasOwnProperty("label"))
	throw new Error("ERROR: joiner.internal_data_exporter: data has no label! data:", data);

    let external_data = data.original;
    
    if(external_data.protocol.data_form!="Branch"){
	// add edge to node which alredy present there
	// since internal_data_importer accept only Single
	external_data.edge = {label: data.label};
	external_data = cert.sign({
	    idd: "joiner",
	    msg: external_data,
	    data_type: "Branch",
	    data_form: "Single"
	});
    }
    else{
	external_data.edge.label = data.label;
    }
    
    return external_data;
}

export function Joiner({host_name}){
    /*Left panel is a source one.
     Right panel is a destination one.
     On spawning the given selected will be put to the left panel
     Listening for the action `selected`*/

    const name = "Joiner";
    const [show, set_show] = useState(false);

    const el = useRef();
    
    var [state, set_state] = useState(true);
    const [left_selected, set_left_selected] = useState([]);
    const [right_selected, set_right_selected] = useState([]);
    const [input_values, set_input_values] = useState([]);


    function update_labels(selected){
	// set up labels for edges
	return selected.map(
	    (elm, idx)=>elm.label!==undefined?elm.label:idx);
    }
    

    useEffect(()=>{
	console.log("Joiner: making resizable", el.current);
	if(el.current!==undefined){
	    $(el.current).draggable();
	    $(el.current).resizable();
	}
    }, [show]);

    // show/hide from edp:
    useEffect(()=>{
	events.on(`show.`+name, ({event_type, args, trace})=>{
	    console.log("selected data:", args);
	    if (args.hasOwnProperty("data")){
		let _selected = args.data["selected"].map(elm=>internal_data_importer());

		// set up labels for edges:
		let labels = update_labels(_selected);
		set_input_values(labels);

		// initial selection to the left panel
		set_left_selected(_selected);
	    }
	    set_show(true);
	},{idd:`show.`+name});

	events.on(`hide.`+name, (e)=>set_show(false), {idd: `hide.`+name});
	return ()=>{
	    if(events.has(`show.`+name, {idd:`show.`+name})){
		events.off(`show.`+name, {idd: `show.`+name});
	    }
	    if(events.has(`hide.`+name, {idd: `hide.`+name})){
		events.off(`hide.`+name, {idd: `hide.`+name});
	    }
	};
    }, []);
    
    // update selected according to state (left or rigth):
    useEffect(()=>{
	
	if(show){

	    // change left on right
	    console.log("selected: state.current!!!:", state);
	    let set_selected = state?(selected)=>{
		console.log("set up left selected: state:", state);

		// set up labels for edges:
		let labels = update_labels(selected);
		set_input_values(labels);

		set_left_selected(selected);


	    }:(selected)=>{
		    console.log("set up right selected: state", state);
		    set_right_selected(selected);};
	    
	    events.on(host_name+".ActionsQueue", ({event_type, args, trace})=>{
		if(args.action == "selected"){
		    
		    set_selected(args.input.map(elm=>internal_data_importer(elm)));
		}
	    }, {idd: `on_selected.`+name});
	}
	return ()=>{
	    console.log("BUG: eHandler off");
	    if(events.has(host_name+".ActionsQueue", {idd:`on_selected.`+name})){
		events.off(host_name+".ActionsQueue", {idd:`on_selected.`+name});
	    }
	};
    }, [show, state]);
    
    

    let LeftPanel = left_selected.map((elm, idx)=><div key={idx.toString()}>
				      <li><input
				      type="text"
				      value={input_values[idx]}
				      onChange={(e)=>{
					  set_input_values([...input_values.slice(0, idx), e.target.value, ...input_values.slice(idx+1)]);
				      }}/> edge.label</li>
				      <li>{"id: "+elm.original.node.id.toString()}</li>
				      <li>{"value: "+elm.original.node.value}</li>
				      <li>{"tags: "+elm.original.node.tags}</li>
				      <li>{"body: "+elm.original.node.body.slice(0, 30)}</li>
				      </div>);
    let RightPanel = right_selected.map((elm, idx)=><div key={idx.toString()}>
					<li>{"id: "+elm.original.node.id.toString()}</li>
					<li>{"value: "+elm.original.node.value}</li>
					<li>{"tags: "+elm.original.node.tags}</li>
					<li>{"body: "+elm.original.node.body.slice(0, 30)}</li>
					</div>);

    if(show)
	return(<div ref={el} className={"style_editor_dinamic editor_overflow"}>
	       <p> {name} State: {state.toString()}</p>
	       <p>Sources/Children</p>
	       <ul>
	       {LeftPanel}
	       </ul>
	       <p>Destination/Parents</p>
	       <ul>
	       {RightPanel}
	       </ul>
	       <button onClick={()=>{
		   // state.current = !state.current;
		   console.log("left_selected:", left_selected);
		   console.log("right_selected:", right_selected);

		   // unsubscribe before deselection:
		   if(events.has(host_name+".ActionsQueue", {idd:`on_selected.`+name})){
		       events.off(host_name+".ActionsQueue", {idd:`on_selected.`+name});
		   }

		   // TODO: deselection problem
		   events.emit(host_name+".ActionsQueue", {
		       fargs:{action: "deselect"},
		       on_done: ()=>set_state(!state)});
		   		   

	       }}>switch panel</button>
	       <button onClick={()=>{
		   console.log("Editor.link");

		   // send data to the hla.join:
		   events.emit(host_name+".ActionsQueue", {fargs:{
		       action: "join.enter", input: {
			   source: left_selected.map(
			       (elm,idx)=>({...elm, label:input_values[idx]})).map(elm=>internal_data_exporter_source(elm)),
			   destination: right_selected.map(elm=>internal_data_exporter_dest(elm))}}});

		   // clear all
		   set_left_selected([]);
		   set_right_selected([]);
		   set_input_values([]);
		   set_state(true);

		   // close self
		   set_show(false);
	       }}>link</button>
	       <button onClick={()=>set_show(false)}>close</button>
	       </div>);
    else
	return(<div/>);
}


// Not used for now:
function JoinerFsm({host_name}){
    var levents = {};
    levents[host_name+".ActionsQueue"] = (args)=>{
	if(args.action == "selected")
	    return args.input;
	return [];
    };

    const [show, data] = useEdpSpawnable({
	name: options.name,
	show:options.hasOwnProperty("show")?options.show:true,
	init_data: {selected:[]},
	levents: {
	    "joiner.on_next": (args)=>{
		console.log("Joiner: next");
		// TODO: emit(joiner.next)
	    },
	    "joiner.on_link": (args)=>{
		console.log("Joiner: link");
		// TODO: emit(joiner.link)
	    }
	    
	} 
	
    });
}
