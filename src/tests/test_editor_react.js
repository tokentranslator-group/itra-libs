import React from 'react';
import {useState, useEffect, useRef} from 'react';
import ReactDOM from 'react-dom';

import {events} from 'itra-behavior/src/eHandler.js';

import {EditorComponent} from '../env/editor/ttabs_react.js';
// import {mk_editor_fsm} from '../env/editor/behavior.js';
import {mk_core_comp_for_editor_fsm_v1} from '../env/editor/ttabs_helpers.js';

const editor_name = "Editor";
const host_name = "Host";


function TestComponent({init_data, core_comp_builder}){
    const [data, set_data] = useState(init_data);
    const [counter, set_counter] = useState(0);
    const [show, set_show] = useState(true);

    /*When data will be changed the EditorComponent componentDidMount/unmount be called
     i.e. useEffect, which, because of set_data in EditorComponent,
     caused the latter to be rerendered*/
    function update(){
	
    }

    let editor = <div/>;

    if(true)
	editor = <EditorComponent
    name={editor_name}
    host_name={host_name}
    core_comp_builder={(options)=>core_comp_builder(options)}
    data={data}
	
    actions={{
	
	// TODO: unite to dict:
	buttons_names: ["save", "refresh", "copy"],
	tabs_buttons_callbacks:[
	    (tab_id, tab_content_text_id)=>
		(e)=>console.log("save")
	    ,
	    (tab_id, tab_content_text_id)=>
		(e)=>console.log("refresh")
	    ,
	    (tab_id, tab_content_text_id)=>
		(e)=>console.log("copy")
	    
	    
	]}}/>;
    //	   <button onClick={()=>set_show(!show)}> show </button>
    return(<div>
	   <button onClick={()=>update()}> test update tree</button>

	   <button onClick={()=>{
		events.emit("show."+editor_name, {});
	   }}> show/hide </button>
	   <br/>

	   <p>Showing the editor {show} </p>
	   
	   {editor}

	   </div>);

}


function main(){
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(
	<TestComponent
	
	core_comp_builder={(options)=>mk_core_comp_for_editor_fsm_v1(options)}
	init_data={{
	    tabs_ids: ["parser", "out"],
	    tabs_contents: ["2+2", "4"],
	    field_tags: ["math"]}}/>);
}

export {main}

