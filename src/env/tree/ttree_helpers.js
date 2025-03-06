import {events} from 'behavior-store/src/index.js';
import {Tree as TreeFrame} from './ttree.js';
import {NamedTreeStorage, TreeStorage} from './storage.js';
import {TreeBehavior} from './behavior.js';


class Tree{
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


function  mk_tree({storage_settings, behavior_settings, data}){
    /*
     All ids have to be uinique for each call. Or old one have to be removed with tree.rm_tree()

     - ``storage`` -- where the tree object will be put in.
     Will not be created here, should exist alredy.
     Others ids will be created and should not exist.

     - ``tree_fsm_idx`` -- the name of fsm to call upon (like TreeFsm1 for instance)
     */

    const tree_fsm_idx = behavior_settings.tree_fsm_idx?behavior_settings.tree_fsm_idx:throw_error("mk_tree: behavior_settings.tree_fsm_idx missed");
    const tree_data = data?data:throw_error("mk_tree: tree_data missed");

    const actions = behavior_settings.actions?behavior_settings.actions:throw_error("mk_tree: behavior_settings.actions missed");
    
    const tree = new TreeFrame({
	
	storage: new TreeStorage(storage_settings),

	// for avoiding canvas influence:
	menu_shift: 0, // parseInt(menu_shift_controls_top, 10),

	// url: url,
	tree_data: tree_data,

	activator: function(event, data){
	    actions["activate"](event, data);
	},
	menu_items: actions.menu.items,
	menu_tooltips: actions.menu.tooltips,
	menu_callbacks: actions.menu.callbacks
    });

    //tree.mk_tree();
    events.emit(tree_fsm_idx+".mk_tree", {fargs: {tree: tree}});

    return tree;
}


export{Tree, mk_tree, throw_error}
