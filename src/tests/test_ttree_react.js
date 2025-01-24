import React from 'react';
import {useState, useEffect, useRef} from 'react';
import ReactDOM from 'react-dom';


import {TreeComponent} from '../env/tree/ttree_react.js';
import {mk_tree} from './test_ttree.js';



function TestComponent({init_tree_data}){
    const [tree_data, set_tree_data] = useState(init_tree_data);
    const [counter, set_counter] = useState(0);

    function update_tree(){
	let new_counter = counter + 1;
	const new_tree_data = {
	    title: "updated available", key: "1", folder: true,
	    children: [
		{title: "updated "+new_counter+" times root", folder:true, key: "2",
		 children: [
		     {title: "updated first child", key: "5"},
		     {title: "second", key: "6"}
		 ]}
	    ]};
	set_tree_data(new_tree_data);
	set_counter(new_counter);
    }

    return(<div>
	   <button onClick={()=>update_tree()}> test update tree</button>
	   <p>Tree was updated {counter} times</p>

	    <TreeComponent tree_wrapper_id={"react_tree_storage"}
	   mk_tree={mk_tree}
	   tree_data = {tree_data}/>

	   </div>);
}


function main(){
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(
	<TestComponent init_tree_data={{
	    title: "available", key: "1", folder: true,
	    children: [
		{title: "eqs parser", folder:true, key: "2",
		 children: [
		     {title: "tokens path", key: "5"},
		     {title: "tokens", key: "6"},
		     {title: "play space", key: "7"},
		     {title: "db path", key: "8"},
		     {title: "db", key: "9"}]},
	    ]}}/>
    );
}

export {main}
