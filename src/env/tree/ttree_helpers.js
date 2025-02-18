import {events} from 'behavior-store/src/index.js';
import {Tree, sort_children} from './ttree.js';

function throw_error(msg){
    throw new Error(msg);
}


function  mk_tree({storage, options}){
    /*
     All ids have to be uinique for each call. Or old one have to be removed with tree.rm_tree()

     - ``storage`` -- where the tree object will be put in.
     Will not be created here, should exist alredy.
     Others ids will be created and should not exist.

     - ``tree_fsm_idx`` -- the name of fsm to call upon (like TreeFsm1 for instance)
     */

    const container_id = options.container_id?options.container_id:throw_error("mk_tree: container_id missed");
    const tree_id = options.tree_id?options.tree_id:throw_error("mk_tree: tree_id missed");
    const menu_id = options.menu_id?options.menu_id:throw_error("mk_tree: menu_id missed");
    const input_id = options.input_id?options.input_id:throw_error("mk_tree: input_id missed");
    const search_id = options.search_id?options.search_id:throw_error("mk_tree: search_id missed");
    const tree_fsm_idx = options.tree_fsm_idx?options.tree_fsm_idx:throw_error("mk_tree: tree_fsm_idx missed");
    const tree_data = options.tree_data?options.tree_data:throw_error("mk_tree: tree_data missed");

    const actions = options.actions?options.actions:throw_error("mk_tree: actions missed");
    
    const tree = new Tree({
	
	storage: storage,
	container_div_id: "#"+container_id,

	tree_div_id: "#"+tree_id,
	menu_div_id: "#"+menu_id,
	input_div_id: "#"+input_id,
	search_div_id: "#"+search_id,
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
    events.emit("TreeFsm1.mk_tree", {fargs: {tree: tree}});

    return tree;
}


export{mk_tree}
