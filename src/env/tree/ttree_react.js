import React from 'react';
import {useState, useEffect, useRef} from 'react';
import ReactDOM from 'react-dom';

// import {events} from 'itra-behavior/src/eHandler.js';
import {OuterComponent} from '../react_wrapper.js';
import {mk_core_comp_for_tree_fsm_v1} from './ttree_helpers.js';

// helper:
// import {Tree, mk_tree} from './ttree_helpers.js';


// const host_name = "Host1";
// const tree_name = "TreeFsm1";

function TreeComponent({name, host_name, data, actions, use_data_converter}){
    /*
     - ``use_data_converter`` -- so do not apply_tree to the data:
     */
    return(
	    <OuterComponent
	name={name}
    
	host_name={host_name}

	
	core_comp_builder = {
	    (options)=>
		// options here could be extended for behavior, if necessary
		mk_core_comp_for_tree_fsm_v1({...options, use_data_converter:use_data_converter})}
	
	data={data}
	actions={actions}
	
	show_actions={true}
	show_state={true}

	draggable={false}
	resizable={true}
	
	    />
    );
}

export{TreeComponent}
