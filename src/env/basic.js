class Storage{
    constructor(options){
	
	if(!options.container_div_id)
	    throw new Error("Storage: `container_div_id` is mandatory!");
	
	this.container_div_id = options["container_div_id"];
	
    }
    
    
}

function mk_container(storage, container_id){
    let container = document.createElement('div');
    container.id = container_id;
    storage.appendChild(container);    
}


export{mk_container}
