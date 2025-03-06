import $ from 'jquery';
import {Storage} from '../storage/basic.js';


class EditorStorage extends(Storage){
    /* Contained all what is necessary for the Tree storage.
     */
    constructor(options){
	super(options);
	var self = this;

	self.subdiv_id_name = options["subdiv_id_name"];
    }

    fill_container(){
    }

    free_container(){
	this.$(this.container_div_id).empty();
    }

}

class NamedEditorStorage extends(EditorStorage){
    constructor(storage_ref, name){
	
	super({
	    storage: storage_ref,
	    container_div_id: "mc_0_"+name,
	    subdiv_id_name: "parser_"+name});
    }
}

export{EditorStorage, NamedEditorStorage};
