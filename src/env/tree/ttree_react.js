import React from 'react';
import {useState, useEffect, useRef} from 'react';
import ReactDOM from 'react-dom';

// import {events} from 'itra-behavior/src/eHandler.js';
import {OuterComponent} from '../react_wrapper.js';

// helper:
// import {Tree, mk_tree} from './ttree_helpers.js';


// const host_name = "Host1";
// const tree_name = "TreeFsm1";

function TreeComponent({name, host_name, core_comp_builder, data, actions}){
    return(
	    <OuterComponent
	name={name}
    
	host_name={host_name}

	element_builder = {(options)=>core_comp_builder(options)}
	data={data}
	actions={actions}
	
	show_actions={true}
	show_state={true}
	    />
    );
}

export{TreeComponent}
