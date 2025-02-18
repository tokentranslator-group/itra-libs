import {ETabs} from './ttabs_extended.js';

function mk_editor({storage, options}){
	
    const tabs = new ETabs({
	div_id: div_storage_id,
	subdiv_id_name: "parser",
	// buttons_name: "save",
	header: "selected entry data:",
	tabs_ids: ["parser", "out"],
	tabs_contents: ["2+2", "4"],
	field_tags: ["math"],
	
	// TODO: unite to dict:
	buttons_names: ["save", "refresh", "copy"],
	tabs_buttons_callbacks:[]});

    return tabs;
}

export{mk_editor}
