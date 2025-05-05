import {events} from 'itra-behavior/src/eHandler.js';
import {Tree as TreeFrame} from './ttree.js';
import {NamedTreeStorage, TreeStorage} from './storage.js';
import {TreeBehavior as TreeBehEdp} from './behavior/TreeEdp.js';
import {TreeBehavior as TreeBehFsm} from './behavior/TreeFsm.js';


class Tree{

    /*TreeFrame+TreeBehavior*/

    constructor({name, host_name, storage_ref, data, actions}){
	this.name = name;

	this.frame = new TreeFrame({
	
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
	});

	
    }
    
    mk(){
	
	this.behavior.enter();
	
	// events.emit(this.name+".mk_tree", {fargs: {tree: this.tree}});

	this.behavior.apply("init_tree", {tree: this.frame});
    }
    rm(){
	this.behavior.apply("rm_tree");
	this.behavior.exit();
    }
}


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


function throw_error(msg){
    throw new Error(msg);
}


function check(name, options, attribute){
    let attr = options[attribute]?options[attribute]:throw_error(name+": options."+attribute+" missed");
    return attr;
}


function  mk_tree_edp({storage_ref, name, host_name, data, actions}){
    /*
     - ``storage_ref`` -- where the tree object will be put in.
     Will not be created here, should exist alredy.
     Others ids will be created and should not exist.
     */

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


function  mk_tree_fsm({storage_ref, name, host_name, data, actions}){
    /*
     - ``storage_ref`` -- where the tree object will be put in.
     Will not be created here, should exist alredy.
     Others ids will be created and should not exist.
     */

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




export{Tree, mk_tree_edp, mk_tree_fsm, throw_error, check}
