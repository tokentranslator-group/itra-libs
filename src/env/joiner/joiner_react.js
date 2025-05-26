import React from 'react';
import {useState, useEffect, useRef} from 'react';
import ReactDOM from 'react-dom';

import {events} from 'itra-behavior/src/eHandler.js';

import $ from 'jquery';
import * as ui from 'jquery-ui';

// import 'jquery-ui/ui/widgets/tabs';
//import 'jquery-ui/ui/widgets/dialog';
import 'jquery-ui/ui/widgets/resizable';
import 'jquery-ui/ui/widgets/draggable';


export function Joiner({host_name}){
    /*Left panel is a source one.
     Right panel is a destination one.
     On spawning the given selected will be put to the left panel*/
    const name = "Joiner";
    const [show, set_show] = useState(false);

    const el = useRef();
    
    var [state, set_state] = useState(true);
    const [left_selected, set_left_selected] = useState([]);
    const [right_selected, set_right_selected] = useState([]);
    
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
	    if (args.hasOwnProperty("data"))
		// initial selection to the left panel
		set_left_selected(args.data["selected"]);
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

    // update selected according to state:
    useEffect(()=>{
	
	if(show){

	    // change left on right
	    console.log("selected: state.current!!!:", state);
	    let set_selected = state?(selected)=>{
		console.log("set up left selected: state:", state);
		set_left_selected(selected);}:(selected)=>{
		    console.log("set up right selected: state", state);
		    set_right_selected(selected);};
	    
	    events.on(host_name+".ActionsQueue", ({event_type, args, trace})=>{
		if(args.action == "selected")
		    set_selected(args.input);
	    }, {idd: `on_selected.`+name});
	}
	return ()=>{
	    console.log("BUG: eHandler off");
	    if(events.has(host_name+".ActionsQueue", {idd:`on_selected.`+name})){
		events.off(host_name+".ActionsQueue", {idd:`on_selected.`+name});
	    }
	};
    }, [show, state]);
    
    let LeftPanel = left_selected.map((elm, idx)=><li key={idx.toString()}>{elm.title}</li>);
    let RightPanel = right_selected.map((elm, idx)=><li key={idx.toString()}>{elm.title}</li>);

    if(show)
	return(<div ref={el} className={"style_editor_dinamic editor_overflow"}>
	       <p>State: {state.toString()}</p>
	       <p>Source</p>
	       <ul>
	       {LeftPanel}
	       </ul>
	       <p>Destination</p>
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

		   // send data to the host:
		   events.emit(host_name+".ActionsQueue", {fargs:{
		       action: "join.enter", input: {source: left_selected, destination: right_selected}}});

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
