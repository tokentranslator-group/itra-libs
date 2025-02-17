import {events} from 'behavior-store/src/index.js';
import {Tree, sort_children} from './ttree.js';


function  mk_tree({storage, container_id, tree_id, menu_id, input_id, search_id, tree_fsm_idx, tree_data}){
    /*
     All ids have to be uinique for each call. Or old one have to be removed with tree.rm_tree()

     - ``storage`` -- where the tree object will be put in.
     Will not be created here, should exist alredy.
     Others ids will be created and should not exist.

     - ``tree_fsm_idx`` -- the name of fsm to call upon (like TreeFsm1 for instance)
     */
    


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
	    console.log("clicked on: ", data.node.title);
	},

	// FOR menu:
	menu_items: ["join", "mk", "load", "save"],
	
	menu_tooltips: ["join", "mk", "load entry", "rewrite selected model"],

	// keys here must be equal to ``menu_items``:
	menu_callbacks: {
	    "join": ()=>events.emit(tree_fsm_idx+".join", {}),
	    "mk": ()=>{
		console.log("mk...");
		events.emit(tree_fsm_idx+".mk", {});
	    },
	    "load": ()=>{
		console.log("loading...");
		
		// fsm.emit("add.enter")
	    },
	    "save": ()=>console.log("saving...")
	    }
	// END FOR
    });
    events.emit("TreeFsm1.mk_tree", {fargs: {tree: tree}});

    return tree;
}


export{mk_tree}
