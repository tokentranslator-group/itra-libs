import $ from 'jquery';


class Storage{
    constructor(options){

	/*
	 - ``options.storage`` -- object created with document.createElement(`div`)
	 or by react ref. If given it will be forfilled with other container ids,
	 otherwise the other container ids divs has to be present alredy.

	 - ``options.container_div_id`` -- be used to div which will be added to 
	 storage

	 Note:
	  During the Storage type overriding only
	 options should be used, not `this`. Since this will not
	 be initialized before the parent constructor complited (before super()) 
	 but this constructor will call upon mk_storage 
	 which in turn call fill_container which is overriden by child
	 and hence cannot use other params than that which presented here.
	  So either it both constructor have to use options param or
	 the parent constructor should not call any methods has to be implemented
	 by children.
	 */

	var self = this;
	
	// Problem here: because all children will overide self.fill_container
	// it should not used this.param if it not initiated in the constructor
	// so options is used instead of direct call this.param
	// see self.mk_storages
	this.options = options;

	if(!options.container_div_id)
	    throw new Error("Storage: `container_div_id` is mandatory!");	
	this.container_div_id = options["container_div_id"];

	
	// create necessary storage divs
	self.storage = options["storage"]?options["storage"]:false;
	/*
	 // cannot use it here since the problem described above
	 
	if (self.storage)
	    self.mk_storages();
	 */
    }
    
    mk_storages(){
	/* The storage have to be given during initialization*/
	
	var self = this;
	if(!self.storage)
	    throw new Error("Storage.mk_storage: storage should be defined!");
	self.mk_container();

	// Problem here: this function will be overriden and hence
	// do not have to use this.
	self.fill_container();
    }
    
    mk_container(){
	/*Only if storage have to be given during initialization*/
	var self = this;
	if(self.storage){
	    console.log("Storage: mk_container");
	    let container = document.createElement('div');
	    container.id = self.container_div_id;
	    self.storage.appendChild(container);    
	}
    }

    rm_container(){
	this.$(self.container_div_id).remove();

    }

    // fix for jquery `div_id`-s names:
    $(div_id){
	return $("#"+div_id);
    }
}



export{Storage}
