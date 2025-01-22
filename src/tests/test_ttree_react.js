import React from 'react';
import {useState, useEffect, useRef} from 'react';
import ReactDOM from 'react-dom';
import {createPortal} from 'react-dom';


import $ from 'jquery';


import {Tree, sort_children} from '../ttree.js';


function Component({child_content, child_dom}){
    const portal_sorage = useRef(document.createElement("div"));
    const container = useRef();
    const main_tree = useRef();
    const tree_menu = useRef();
    const tree_input = useRef();

    return(<div ref={container}>
	   {createPortal(
	       <>
	           <div ref={(el)=>main_tree.current = el} className="tree_positioned" style={{position: "inherit", top: "100px"}}/>
		   <div ref={(el)=>tree_menu.current = el} style={{"z-index": 0}}/>
		   <div ref={(el)=>tree_input.current = el}/>, 
	       </>
	   child_dom)}
	   </div>);
}


function main(){
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<MyAppCy />);
}

export {main}
