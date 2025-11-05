import {cert_v0 as cert} from '../env/cert.js';

// lla-s:
export function rm(host_reducer, ids, on_succ){
    
     host_reducer.call("rm_notes", {"ids": ids}, (data)=>{
	 on_succ(true);
     });
}

export function save(host_reducer, data, on_succ){
    /*Save note or edge.

     - ``data`` -- has to contain id and table_type ("note" or "edge")!
     save(reducer, {id:notes_ids[0], table_type: "note"}, console.log)
     */
    if(!data.hasOwnProperty("id"))
	throw new Error("save.hla: data has to contain id!");

     host_reducer.call("update_note", data, (data)=>{
	 on_succ(true);
     });
}

export function ls_note(host_reducer, _id, on_succ){
     host_reducer.call("ls", {id: _id}, (data)=>{
	 // console.log("PROBLEM: ls_note:data", data);
	 let children_branches = data["[[Obj], [Obj]]"][1];

	 let msg = cert.sign({
	     idd:"lla.ls_note",

	     // show only forward neighbors:
	     msg: {entries: children_branches},
	     // msg: {entries: data[1]},

	     data_type:"Branch",
	     data_form: "Multi"
	 });
	 
	 on_succ(msg);
     });
}


// TODO: map to notes
export function get(host_reducer, _id, on_succ, table_type){
    table_type = (table_type==undefined)?"note":table_type;
    // get note from server by id:
    host_reducer.call("get", {id: _id, "table_type": table_type},
		      (data)=>on_succ({...data, protocol: host_reducer.data_protocol}));
}



export function gets(host_reducer, data, on_succ){
    /*
     - ``data`` -- like:
     {value:"root", table_type: "note"}
     */

    
				        
    host_reducer.call("gets", data, (data)=>on_succ(
	data.map((n)=>({...n, protocol:host_reducer.data_protocol}))));
}


export function mk_edges(host_reducer, edges_list, on_succ){							      
    host_reducer.call("mk_edges",
		      {edges:edges_list}, (data)=>on_succ(data["[Id]"]));
}

// TODO: map to notes:
export function mk_notes(host_reducer, notes_list, on_succ){
    // console.log("PROBLEM: folder notes to create:", notes_list);
    host_reducer.call("mk_notes", {notes: notes_list},
		      (data)=>on_succ(data["[Id]"]));
}

export function init(host_reducer, data, on_succ){
    // const host_reducer = new ServiceReducer(host_name, service_name);
    host_reducer.call("init", {}, (data)=>on_succ(data));
}

