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


export function Querier({host_name, on_selected, on_deselected}){
    /*Left panel is a source one.
     Right panel is a destination one.
     On spawning the given selected will be put to the left panel

     All entries use internal format: {id, value, kind, tags, date}

     - ``on_selected`` -- (elm)=>{} - what to do for an clicked element
     (spawn editor)

     - ``on_deselected`` -- (elm)=>{} - what to do for an clicked element second time
     (close editor)

     */

    const name = "Querier";
    const on_show_idd = `show.entries.`+name;
    const on_update_idd = `update.`+name;

    const el = useRef();

    const [query, set_query] = useState("");
    const [date, set_date] = useState();
    const [selected, set_selected] = useState([]);
    const [entries, set_entries] = useState([]);

    useEffect(()=>{
	console.log("Querier: making resizable", el.current);
	if(el.current!==undefined){
	    $(el.current).draggable();
	    $(el.current).resizable();
	}
    }, []);

    // show/hide (Entries only) from edp:
    useEffect(()=>{


	events.on(host_name+`.ActionsQueue`, ({event_type, args, trace})=>{
	    
	    if(args.action=="fetch.exit"){
		console.log("PROBLEM: querier.selected data:", args.input.entries);	
		set_entries(args.input.entries);
	    }
	},{idd: on_show_idd});

	return ()=>{
	    if(events.has(host_name+`.ActionsQueue`, {idd:on_show_idd})){
		events.off(host_name+`.ActionsQueue`, {idd: on_show_idd});
	    }
	};
    }, []);

    useEffect(()=>{
	// re featch the data when some entry having been changed (by editor)
	events.on(host_name+`.ActionsQueue`, ({event_type, args, trace})=>{
	    
	    if(args.action=="fetch.update"){
		fetch(query, date);
	    }
	},{idd: on_update_idd});

	return ()=>{
	    if(events.has(host_name+`.ActionsQueue`, {idd:on_update_idd})){
		events.off(host_name+`.ActionsQueue`, {idd: on_update_idd});
	    }
	};
    }, [query]);

    // TODO: onClick, onRightClick, 
    let Entries = entries.map(
	(elm, idx)=>{
	    // find current elm inside selected:
	    let sel_idx = selected.findIndex(_elm=>_elm.id==elm.id);
	    return <div
	    key={idx.toString()}
	    onClick={()=>{
		let new_selected;
		
		if(sel_idx>=0)
		    // rm element if it was alredy selected
		    new_selected = [...selected.slice(0, sel_idx),
				    ...selected.slice(sel_idx+1)];
		else
		    new_selected = [...selected, elm];
	    
		console.log("PROBLEM: Querier.new_selected:", new_selected);
		events.emit(host_name+".ActionsQueue", {
		    fargs: {
			action: "selected",
			
			input: new_selected.map((elm)=>cert.sign({
			    idd:"querier selected",

			    msg: {node: elm},
			  
			    data_type:"Node",
			    data_form: "Single"
			}))
			
		    },
		    on_done: ()=>{
			// update all selected:

			set_selected(new_selected);

			let msg = cert.sign({
			    idd:"querier on_selected",
			    
			    msg: {node: elm},
			    
			    data_type:"Node",
			    data_form: "Single"
			});

			// but use parent wrapper only on selected one:
			if (on_selected!==undefined && sel_idx < 0)
			    on_selected(msg);
			if (on_deselected!==undefined && sel_idx >= 0)
			    on_deselected(msg);
			
		    }
		});
	    }}
	    style={{background:(sel_idx<0)?"#AAAAAA":"#39414A", border:3, borderColor:"black"}}
		>
		<li>{"id: "+elm.id.toString()}</li>
		<li>{"value: "+elm.value}</li>
		<li>{"tags: "+elm.tags}</li>
		<li>{"date: "+elm.date}</li>
		<li>{"body: "+elm.body.slice(0, 30)}</li>
		
	    </div>;
	});// TODO: fix format

    function fetch(query, date){

	console.log("PROBLEM: query", query);
	    // remove old:
	    set_selected([]);
	    set_entries([]);
	    
	console.log("PROBLEM: fetch.enter, events", events);
	    // send data to the host:
	    events.emit(host_name+".ActionsQueue", {
		fargs:{
		    action: "fetch.enter", input: {
			query: query,
			date: date}},
		on_done: (trace)=>{console.log("PROBLEM: fetch.enter done");}
	    });
    }

    return(<div ref={el} className={"style_editor_dinamic editor_overflow"}
	   style={{
		position:"absolute",
		"zIndex": 2,
		top: "10%", left:"23%", width: "30%",
		border: "1px solid",
		"border-color": "black"
		
	    }}>
	   <p>Query</p><br/>
	   Tags:
	   <input onChange={(e)=>set_query(e.target.value)}
	   style={{
	       "position":"absolute",
	       "WebkitBoxSizing": "border-box",
	       "MozBoxSizing": "border-box",
	       "OBoxSizing": "border-box",
	       "MsBoxSizing": "border-box",
	       "BoxSizing": "border-box"}}
	   /><br/>

	   Date:
	   <input onChange={(e)=>set_date(e.target.value)}
	   style={{
	       "position":"absolute",
	       "WebkitBoxSizing": "border-box",
	       "MozBoxSizing": "border-box",
	       "OBoxSizing": "border-box",
	       "MsBoxSizing": "border-box",
	       "BoxSizing": "border-box"}}
	   /><br/>

	   <button onClick={()=>fetch(query, date)}>send</button><br/>
	   
	   <p>Query result</p>
	   <ul style={{
	       position: "inhereted",
	       overflow: "auto",
	       width: "100%",
	       height: "100%",
	       border: "1px solid",
	       "border-color": "black"
		
	   }}>
	   {Entries}
	   </ul>
	   </div>);
}

