import {events} from 'behavior-store/src/index.js';

// behavior:
import {IO, TreeFsm, HostFsm} from '../env/tree/behavior.js';

// helper:
import {mk_tree} from '../env/tree/ttree_helpers.js';




function main(){
    const host_fsm = new HostFsm("Host1");
    const tree_fsm = new TreeFsm("TreeFsm1", "Host1");
    const io = new IO("TreeFsm1");    
    

    const root = document.getElementById('root');

    let tree_fsm_idx = "TreeFsm1";
    
    const tree = mk_tree({
	storage: root,
	options: {
	    container_id: "mc_0",
	    tree_id: "left_tree_id",
	    menu_id: "menu_id",
	    input_id: "input_id",
	    search_id: "search_id",

	    tree_fsm_idx:"TreeFsm1",
	
	    tree_data: {
		title: "available", key: "1", folder: true,
		children: [
		    {title: "eqs parser", folder:true, key: "2",
		     children: [
			 {title: "tokens path", key: "5"},
			 {title: "tokens", key: "6"},
			 {title: "play space", key: "7"},
			 {title: "db path", key: "8"},
			 {title: "db", key: "9"}]}
		]},

	    actions: {
		activate: (event, data) => console.log("clicked on: ", data.node.title),
		
		menu:{
		    
		    items: ["join", "mk", "load", "save"],
		    tooltips: ["join", "mk", "load entry", "rewrite selected model"],
		    
		    // keys here must be equal to ``menu_items``:
		    callbacks: {
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
		}
		
	    }
	    
	}});

    // events.emit("TreeFsm1.mk_tree", {fargs: {tree: tree}});
    // const root = ReactDOM.createRoot(document.getElementById('root'));
    // root.render(<MyAppCy />);


}


export {main}
