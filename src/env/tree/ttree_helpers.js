import {events} from 'itra-behavior/src/eHandler.js';
import {Tree as TreeFrame} from './ttree.js';
import {NamedTreeStorage, TreeStorage} from './storage.js';
import {TreeBehavior as TreeBehEdp} from './behavior/TreeEdp.js';
import {mk_tree_fsm} from './behavior/TreeFsm.js';
import {BehaviorComponent, mk_core_comp, mk_core_comp_v1} from '../react_wrapper.js';
import {throw_error, check} from '../helpers.js';

import {cert_v0 as cert} from '../cert.js';


// FOR v1:
function mk_core_comp_for_tree_fsm_v1(options){
    /*
     - ``options`` -- {name, host_name, storage_ref, data, actions}
     */
    return mk_core_comp_v1(mk_tree_frame, mk_tree_fsm, options);
}


function mk_tree_frame({storage_ref, name, host_name, data, actions, use_data_converter}){

    /*The data has to be signed with protocol*/

    // console.log("PROBLEM:Tree: mk_tree_frame, data:", data);
    // console.log("PROBLEM:Tree: mk_tree_frame, use_data_converter:", use_data_converter);
    // console.log("PROBLEM:Tree: mk_tree_frame, (use_data_converter==undefined || use_data_converter):", (use_data_converter==undefined || use_data_converter));

    // console.log("PROBLEM:Tree: mk_tree_frame, apply_tree(data):", apply_tree(data));

    return new TreeFrame({
	
	storage: new NamedTreeStorage(storage_ref, name),
	
	// for avoiding canvas influence:
	menu_shift: 0, // parseInt(menu_shift_controls_top, 10),
	
	// url: url,
	tree_data: (use_data_converter==undefined || use_data_converter)?apply_tree(data):data,
	
	activator: function(event, data){
	    actions["activate"](event, data);
	},

	// TODO: 15.05.2025: emit(selected, data:{selected})
	selector: (selected)=>{
	    console.log(name+" selected:", selected);
	    events.emit(host_name+".ActionsQueue", {fargs: {
		action: "selected", input:selected.map(n=>n.data.original)}});
	},

	menu_items: actions.menu.items,
	menu_tooltips: actions.menu.tooltips,
	menu_callbacks: actions.menu.callbacks
    });
}
// END FOR

// FOR v0:
function mk_core_comp_for_tree({behavior_component, storage_ref, name, host_name, data, actions}){
    /*Build up the frame to be wrapped by React Component*/
    return mk_core_comp({
	frame: new TreeFrame({
	
	    storage: new NamedTreeStorage(storage_ref, name),

	    // for avoiding canvas influence:
	    menu_shift: 0, // parseInt(menu_shift_controls_top, 10),

	    // url: url,
	    tree_data: data,

	    activator: function(event, data){
		actions["activate"](event, data);
	    },

	    menu_items: actions.menu.items,
	    menu_tooltips: actions.menu.tooltips,
	    menu_callbacks: actions.menu.callbacks
	}),
	
	behavior: behavior_component});
}

function mk_core_comp_for_tree_fsm(options){
    /*Build up the CoreComponent for tree fsm behavior
     given by mk_tree_fsm*/
    
    const name = check("TreeFsm", options, "name");
    const host_name = check("TreeFsm", options, "host_name");

    return mk_core_comp_for_tree({
	...options,

	behavior_component: new BehaviorComponent({
	    name: name, host_name: host_name,
	    behavior_builder: mk_tree_fsm})
	});
}
// END FOR v0

function apply_tree(data){
    /*
      If `data.protocol.data_type == "Branch"`,
     then the `data` will be expected to looks like:

       {entries: [(edge, node)]}

     otherwise just {entries: [node]}.

     type Branch = (Edge, Node)

      If the Branch is used then the `tree.node.title` will use the `edge.label`
     (edge = branch[0]), while both `edge.id` and `node.id` will be preserved
     in the node as edge_id, node_id attributes.
      If the Branch is not used, the `tree.node.title` will use `node.value`
     (node = branch[1]).
     
     Will preserve the recived value into the `tree.node.original` attribute.
     (So all will be preserved inside the fancytree-s `node.data.original`)
     */
    console.log("PROBLEM: apply_tree:data", data);
    if(!data.hasOwnProperty("protocol"))
	throw new Error("apply_tree: data has no protocol!");
    if(data.protocol.data_form!=="Multi"){
	throw new Error("apply_tree accepts only Multi data form");
    }


    if(data.protocol.data_type=="Branch")
	return {children: data.entries.map((branch)=>{
	    let edge = branch[0];
	    let note = branch[1];

	    return {
		// original attributes:
		edge_id: edge.id,
		note_id: note.id,
		
		
		original:
		cert.sign({
		    idd: "from apply_tree",
		    msg: {
			node: note,
			edge: edge
		    },
		    
		    data_type:"Branch",
		    data_form: "Single"
		}),
		
		
		// tree specific attributes:
		title: edge.label,
		folder: note.kind =="folder",
		
		// have to rm them since ambiguity of meanings
		children: [],
		parents: undefined
	    };})};


    return {children: data.entries.map((note)=>(
	{...note,

	 // original attributes:
	 note_id: note.id,
	 kind: note.kind,

	 original:cert.sign({
	     idd: "from apply_tree",
	     msg:{node: note},
	     data_type:"Node",
	     data_form: "Single"
	 }),
		
	 tags: note.tags,
	 body: note.body,
	 value: note.value,

	 // tree specific attributes:
	 title: note.value,	 
	 folder: note.kind =="folder",
	 

	 // have to rm them since ambiguity of meanings
	 children: [],
	 parents: undefined
	}))};
}

// TODO:
function mk_core_comp_for_tree_edp(options){
}

// DEPRICATED
/*
class TreeEdp extends(Tree){
    constructor(options){
	super(options);
	const name = check("TreeEdp", options, "name");
	const host_name = check("TreeEdp", options, "host_name");
	
	this.behavior = new TreeBehEdp({
	    host_name: host_name,
	    tree_name: name
	});
    }	 
}

// DEPRICATED
class TreeFsm extends(Tree){
    constructor(options){
	super(options);
	const name = check("TreeFsm", options, "name");
	const host_name = check("TreeFsm", options, "host_name");
	
	this.behavior = new TreeBehFsm({
	    host_name: host_name,
	    tree_name: name
	});
    }	 
}



// DEPRICATED
function  mk_tree_edp({storage_ref, name, host_name, data, actions}){
    
    // - ``storage_ref`` -- where the tree object will be put in.
    // Will not be created here, should exist alredy.
    // Others ids will be created and should not exist.
     

    // const name = check("mk_tree", options, "name");
    // const tree_data = check("mk_tree", options, "data");
    // const actions = check("mk_tree", options, "actions");
    
    const tree = new TreeEdp({
	name: name,
	host_name: host_name,
	storage_ref: storage_ref,
	data: data,
	actions: actions
    });

    return tree;
}

// DEPRICATED
function  mk_tree_fsm({storage_ref, name, host_name, data, actions}){
    
    // - ``storage_ref`` -- where the tree object will be put in.
    // Will not be created here, should exist alredy.
    // Others ids will be created and should not exist.
    

    // const name = check("mk_tree", options, "name");
    // const tree_data = check("mk_tree", options, "data");
    // const actions = check("mk_tree", options, "actions");
    
    const tree = new TreeFsm({
	name: name,
	host_name: host_name,
	storage_ref: storage_ref,
	data: data,
	actions: actions
    });
    console.log("mk_tree_fsm:tree:", tree);
    return tree;
}
*/


export{mk_core_comp_for_tree_edp, mk_core_comp_for_tree_fsm, mk_core_comp_for_tree_fsm_v1, apply_tree, mk_tree_frame}
