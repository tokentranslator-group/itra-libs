console.log("log tags.js");
import $ from 'jquery';
import 'jquery-ui/ui/widgets/tooltip';

/*
define(['jquery'],
       function($){
*/	   
function Tags(options){
    var self = this;
    
    self.div_tags_storage_id = options.div_tags_storage_id;
    self.field_tags_separator = options.field_tags_separator || ",";
    self.div_field_tags_id = options.div_field_tags_id;
    self.b_mark_done = options.b_mark_done || "b_tags_mark_done";
    
    self.data = options.data || {field_tags: []};
    self.dbg = options.dbg || false;
};

Tags.prototype.apply_tags = function(succ){
    /*
     Working chain:
     If "todo" in tags replace it by "done"
     else 
     if "done" in tags remove it
     else add "todo"
     */
    var self = this;
    
    // FOR mark_done:
    var edit_tags_done = function(){
	// concat([]) for a copy:
	var old_tags = self.data["field_tags"].concat([]);
		   
	// take active index:
	var idx = old_tags.findIndex(e=>e=="todo"); 
	var tags;
	if(idx < 0)
	{
	    idx = old_tags.findIndex(e=>e=="done");
	    if (idx >= 0)
	    {
		// remove "done":
		// concat([]) for a copy:
		tags = old_tags.concat([]);
		tags.splice(idx, 1);
		// return(null);
	    }
	    else
		tags = Array.concat([old_tags, ["todo"]]);
	}
	else
	    tags = old_tags.map(tag=>tag=="todo"?("done"):(tag));
	if(self.dbg)
	    console.log("mark_done tags:", tags);
	return(tags.join(self.field_tags_separator));		       
    };
    $("#"+self.b_mark_done).on("click", function(event){
	self.callback_tags(succ, edit_tags_done);
    });
    // END FOR

    // FOR add tags:
    var edit_tags = function(){
	
	var old_tags = self.data["field_tags"].join(self.field_tags_separator);
	if(self.dbg)
	    console.log("add_tags: old_tags", old_tags);

	// take active index:
	var tags = prompt('Editing tags. Use "'
			  + self.field_tags_separator
			  + '" for separation',
			  old_tags);
	return(tags);
    };
    $("#"+self.div_tags_storage_id).on("click", function(event){
	self.callback_tags(succ, edit_tags);
    });
    // END FOR
};


Tags.prototype.callback_tags = function(succ, edit_tags){
    var self = this;
    
    var tags = edit_tags();
    if(self.dbg)
	console.log("add_tags: tags", tags);
    
    if(tags){
	if(succ)
	    succ(tags.split(self.field_tags_separator));
	
	// self.data["field_tags"] = tags.split(self.field_tags_separator);
    };
    if(self.dbg)
	console.log('add_tags: self.data["field_tags"]', self.data["field_tags"]);
};

Tags.prototype.draw_tags = function(){
    var self = this;
    return('<div id="'+self.div_tags_storage_id+'"'
	   + ' title="click for edit tags"'
	   + ' class="style_editor_static"' +'>'
	   +'<p id="'+self.div_field_tags_id+'"></p>'
	   +'</div>'
	   +`<br><input type="button" value="mark as done" id="`+self.b_mark_done+`">`);
};


Tags.prototype.apply_tooltip = function(){
    var self = this;
    $("#"+self.div_tags_storage_id).tooltip();
};
export{Tags}

/*	   
	   return {
	       Tags: Tags 
	       };
       });

*/
