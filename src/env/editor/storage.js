import $ from 'jquery';
import {Storage} from '../basic.js';


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

export{EditorStorage};
