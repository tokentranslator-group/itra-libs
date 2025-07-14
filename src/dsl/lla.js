// lla-s:
export function rm(host_reducer, _id, on_succ){
    
     host_reducer.call("rm_notes", {"ids":[_id]}, (data)=>{
	 on_succ(true);
     });
}

export function save(host_reducer, data, on_succ){
    /*
     - ``data`` -- has to contain id!
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

	 // show only forward neighbors:
	 on_succ(data[1]);});
}

// TODO: map to notes
export function get(host_reducer, _id, on_succ){
    // get note from server by id:
    host_reducer.call("get", {id: _id, "table_type": "note"},
		      (data)=>on_succ(data));
}

export function gets(host_reducer, data, on_succ){
    /*
     - ``data`` -- like:
     {value:"root", table_type: "note"}
     */
    host_reducer.call("gets", data, (data)=>on_succ(data));
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

