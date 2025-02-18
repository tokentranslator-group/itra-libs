import $ from 'jquery';
import {Storage} from '../basic.js';


class TreeStorage extends(Storage){
    /* Contained all what is necessary for the Tree storage.
     */
    constructor(options){
	super(options);
	var self = this;

	self.tree_div_id = options["tree_div_id"];
	self.menu_div_id = options["menu_div_id"];
	self.input_div_id = options["input_div_id"];
	self.search_div_id = options["search_div_id"];  // for filter
    }

    fill_container(){
	/*Fill existing container
	 Here only this.options.param is used instead of this.param
	 since js inheretence do not understand this before super is called
	 in constructor (see Storage.constructor desc)
	 */
	var self = this;
	
	console.log("Storage: fill_container:", self.container_div_id);
	console.log("Storage: fill_container:", self.options.tree_div_id);
	self.$(self.container_div_id).append(
	    ('<div id="'
	     + self.options.tree_div_id
	     + '" class="tree_positioned" style="top: 100px;"></div>'));
	
	self.$(self.container_div_id).append(
	    ('<input id="' + self.options.search_div_id 
	     + '" name="search" placeholder="Filter..." autocomplete="off"'
	     + 'style="position: inherit; left: 13%; top: 97%; width: 70%;"><br><br>'));
	
	self.$(self.container_div_id).append(
	    ('<div id="' + self.options.menu_div_id + '"></div>'));
	self.$(self.container_div_id).append(
	    ('<div id="' + self.options.input_div_id + '"></div>'));	
    }

    free_container(){
	/*Remove container-s contant*/
	var self = this;
	self.$(self.options.tree_div_id).remove();
	self.$(self.options.menu_div_id).remove();
	self.$(self.options.input_div_id).remove();
	self.$(self.options.search_div_id).remove();
    }

}

export{TreeStorage};
