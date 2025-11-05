import {events} from 'itra-behavior/src/eHandler.js';

// behavior:
// import {IO, TreeFsm, HostFsm} from '../env/tree/behavior.js';
import {mk_tree_fsm} from '../env/tree/behavior/TreeFsm.js';
// helper:
import {mk_tree_frame} from '../env/tree/ttree_helpers.js';

const host_name = "HostTree";
const tree_name = "TreeTest";

function main(){
    // const host_fsm = new HostFsm("Host1");
    const tree_fsm = mk_tree_fsm(host_name, tree_name);
    // const io = new IO("TreeFsm1");    
    

    const root = document.getElementById('root');
        
    const tree_frame = mk_tree_frame({
	storage_ref: root,
	name: tree_name,
	host_name: host_name,
	use_data_converter: false,

	data: {
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
	    activate: (event, data) => {
		console.log("clicked on: ", data.node.title);
		console.log("TEST:Tree. data.node.fromDict");
		// for expanding current node:
		data.node.fromDict({
		    title: data.node.title,
		    // folder: true,
		    children: [
			{title: "item0"},
			{title: "item1"},
		    ]
		});	
		
		
	    },
	    
	    menu:{
		
		// only single menu item for test:
		items: ["test.select", "test.add"],
		tooltips: ["test.select", "test.add"],
		    
		// keys here must be equal to ``menu_items``:
		callbacks: {

		    "test.select": ()=>{
			console.log("test.select...");
			events.emit(host_name+".DbgQueue",
				    {fargs: {
					action: "test.select",
					input:{} 
				    }});
		    },
		    "test.add": ()=>{
			console.log("test.add...");
			events.emit(host_name+".DbgQueue",
				    {fargs: {
					action: "test.add",
					input:{
					    data:{
						title: "test.add",
						// folder: true,
						children: [
						    {title: "test.add.item0"},
						    {title: "test.add.item1"},
						]
					    }
					} 
				    }});
			
		    }
		}
	    }   
	}
    });

    tree_fsm.on();
    // sending frame to the behavior, so to access the tree original methods
    events.emit(host_name+".ActionsQueue",
		{fargs: {
		    action: "mk."+tree_name,
		    input:{frame: tree_frame}}});

    // events.emit("TreeFsm1.mk_tree", {fargs: {tree: tree}});
    // events.emit("TreeFsm1.mk_tree", {fargs: {tree: tree}});
    // const root = ReactDOM.createRoot(document.getElementById('root'));
    // root.render(<MyAppCy />);


}


export {main}
