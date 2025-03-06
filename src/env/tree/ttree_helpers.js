import {events} from 'behavior-store/src/index.js';
import {Tree as TreeFrame} from './ttree.js';
import {NamedTreeStorage, TreeStorage} from './storage.js';
import {TreeBehavior} from './behavior.js';


class Tree{

    /*TreeFrame+TreeBehavior*/

    constructor({name, host_name, storage_ref, data, actions}){
	this.name = name;

	this.behavior = new TreeBehavior({
	    host_name: host_name,
	    tree_name: name
	});

	this.tree = new TreeFrame({
	
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
	events.emit(this.name+".mk_tree", {fargs: {tree: this.tree}});

	this.behavior.apply("init_tree", {tree: this.tree});
    }
    rm(){
	this.behavior.apply("rm_tree");
	this.behavior.exit();
    }
}


function throw_error(msg){
    throw new Error(msg);
}


function check(name, options, attribute){
    let attr = options[attribute]?options[attribute]:throw_error(name+": options."+attribute+" missed");
    return attr;
}


function  mk_tree({storage, name, host_name, data, actions}){
    /*
     - ``storage`` -- where the tree object will be put in.
     Will not be created here, should exist alredy.
     Others ids will be created and should not exist.
     */

    // const name = check("mk_tree", options, "name");
    // const tree_data = check("mk_tree", options, "data");
    // const actions = check("mk_tree", options, "actions");
    
    const tree = new Tree({
	name: name,
	host_name: host_name,
	storage_ref: storage,
	data: data,
	actions: actions
    });

    return tree;
}


export{Tree, mk_tree, throw_error, check}
