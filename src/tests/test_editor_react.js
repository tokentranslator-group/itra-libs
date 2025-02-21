import React from 'react';
import {useState, useEffect, useRef} from 'react';
import ReactDOM from 'react-dom';

import {EditorComponent} from '../env/editor/ttabs_react.js';


function TestComponent({init_data}){
    const [data, set_data] = useState(init_data);
    const [counter, set_counter] = useState(0);
    const [show, set_show] = useState(true);

    /*When data will be changed the EditorComponent componentDidMount/unmount be called
     i.e. useEffect, which, because of set_data in EditorComponent,
     caused the latter to be rerendered*/
    function update(){
	
    }

    let editor = <div/>;

    if(show)
	editor = <EditorComponent data={data}/>;

    return(<div>
	   <button onClick={()=>update()}> test update tree</button>
	   <button onClick={()=>set_show(!show)}> show </button>
	   <p>Showing the editor {show} </p>
	   
	   {editor}

	   </div>);

}


function main(){
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(
	<TestComponent init_data={{
		    tabs_ids: ["parser", "out"],
		    tabs_contents: ["2+2", "4"],
		    field_tags: ["math"]}}/>);
}

export {main}

