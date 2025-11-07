console.log("log parser_base.js");

import $ from 'jquery';
import * as ui from 'jquery-ui';

import 'jquery-ui/ui/widgets/tabs';
import 'jquery-ui/ui/widgets/dialog';
import 'jquery-ui/ui/widgets/resizable';
import 'jquery-ui/ui/widgets/draggable';

import {Tabs} from './ttabs.js';
import {Tags} from '../ttags.js';

/*
define(['require', 'jquery', 'ttabs', 'ttags'],
       function(require, $, ttabs, ttags){
*/	   
	   /*
	    Extend ttabs for creating dynamic tabs.
	    Accept same options as ttabs.

	    ``data`` dict must have a ``tabs_ids``
	    and ``tabs_contents`` fields with same length,
	    and ``field_tags`` list of tags with arbitrary length. 
	    
	    // for init:
	    self.tabs = new tabs.Tabs({
	        div_id: "scene",
	        subdiv_id_name: "parser",
	        header: "header",

	        tabs_ids: ["parser", "out"],
	        tabs_contents: ["2+2", "4"],
	        field_tags: ["math"],
	        tabs_buttons_callback: function(tab_id, tab_content_text_div_id)
	        dialog_edit_callback: function(tab_content_text_div_id)
	    });

	    // load data from json
	    tabs.load({
	        tabs_ids: ["parser", "out"],
	        tabs_contents: ["2+2", "4"],
	        field_tags: ["math"]})
	    */

function ETabs(options){
    console.log("FROM Etabs:");
    var self = this;
    self.dbg = options.dbg || false;
    if(self.dbg){
	console.log("options:");
	console.log(options);
    }

    Tabs.call(this, options);

    self.data.field_tags = options.data.field_tags;
    self.tags = new Tags({
	div_tags_storage_id: self.get_field_tags_storage_id(),
	div_field_tags_id: self.get_field_tags_id(),
	data: {field_tags: options.data.field_tags}
    });

};
ETabs.prototype = Object.create(Tabs.prototype);

// define ETabs.prototype.constructor:
Object.defineProperty(ETabs.prototype, 'constructor',
		      {value: ETabs, enumerable: false, writable: true});


ETabs.prototype.get_field_tags_storage_id = function(){
    
    var div_id = "entry_field_tags_storage";
    return(div_id);
};

ETabs.prototype.get_field_tags_id = function(){
    var div_id = "entry_field_tags";
    return(div_id);
};


ETabs.prototype.load = function(json_data){
    /*
     Load tabs from json.
     Only Etabs.load method is public.

     -- ``json_data`` - must contain "tabs_ids",
     "tabs_contents".
     */
    var self = this;
    if(self.dbg){
	console.log("ttabs.Tabs");
	console.log(Tabs);
    }
    Tabs.prototype.load.call(this, json_data);
    if(self.dbg)
	console.log("Etabs.load: json_data = ", json_data);

    self.tags.data["field_tags"] = json_data.field_tags
	|| [""];
    
    // for entry_fields:
    $("#"+self.get_field_tags_id())
	.text(json_data["field_tags"].join(self.tags.field_tags_separator));	       
};



ETabs.prototype.create_tabs = function(){

    /*Override of original ``create_tabs`` method
     with use of dynamic tabs
     and ``self.tags.data["field_tags"]``*/

    var self = this;
    self.storage.mk_storages();

    var board_str = self.draw_tabs();
    board_str += self.draw_tabs_buttons();
    
    // for field_tabs:
    board_str += self.tags.draw_tags();
    
    // for add dialog div:
    // board_str += self.draw_dialog(self.get_dialog_id(), self.get_dialog_editor_id());

    $("#"+self.div_id).html(board_str);
    $("#"+self.get_field_tags_storage_id()).tooltip();

    self.draw_tabs_content();

    $("#"+self.get_tabs_id()).tabs();
    
    self.apply_editor_and_buttons();
    
    self.apply_dynamic_tabs();
    self.tags.apply_tooltip();
    
    // FOR tags:
    var tags_succ = function(tags){
	$("#"+self.get_field_tags_id()).text(tags);
	self.tags.data["field_tags"] = tags;
	self.data["field_tags"] = self.tags.data["field_tags"];
    };
    self.tags.apply_tags(tags_succ);
    // END FOR
    // console.log("ttabs.div_id:", self.div_id);
    $("#"+self.div_id).draggable({handle: "p.ui-widget-header"});
    // $("#"+self.div_id).css({position: "absolute"});
};


// FOR dynamic tabs:
ETabs.prototype.get_buttons_id = function(){
    var self = this;
    var buttons_id = "buttons_" + self.div_id;
    return(buttons_id);
};
ETabs.prototype.get_button_add_id = function(){
    var self = this;
    var button_add_id = "b_add_tabs_"+self.div_id;
    return(button_add_id);
};
ETabs.prototype.get_text_add_id = function(){
    var self = this;
    var text_add_id = "t_add_tabs_text_"+self.div_id;
    return(text_add_id);
};
ETabs.prototype.get_button_remove_id = function(){
    var self = this;
    var button_remove_id = "b_remove_tab_" + self.div_id;
    return(button_remove_id);
};

ETabs.prototype.draw_tabs_buttons = function(){
    /*draw buttons for add/remove tabs.*/
    var self = this;
    var board_str = ('<div id="'+self.get_buttons_id()+'">'
		     + ('<input type="button" id="'+self.get_button_add_id()+'"'
			+ ' value="add tab" class="ui-button">')
		     // + '<input type="text" id="'+self.get_text_add_id()+'">'
		     // + '<br>'
		     + ('<input type="button" id="'+self.get_button_remove_id()+'"'
			+ ' value="remove active tab"  class="ui-button">')
		     + '</div>');
    return(board_str);
};

ETabs.prototype.apply_dynamic_tabs = function(){

    /*Apply create/remove tab to buttons*/

    var self = this;
    
    // remove tab:
    $("#"+self.get_button_remove_id()).on("click", function(event){
	// take active index:
	var active = $("#"+self.get_tabs_id()).tabs("option", "active");

	// use active index for take active_id:
	var active_id = $("#"+self.get_tabs_uls_id())[0].children[active].id.split("-")[1];
	if(self.dbg){
	    console.log("active_id");
	    console.log(active_id);
	}
	self.data["tabs_ids"].splice(active_id, 1);
	self.data["tabs_contents"].splice(active_id, 1);

	$("#"+self.get_tab_id(active_id)).remove();
	$("#"+self.get_tab_content_id(active_id)).remove();
	$("#"+self.get_tabs_id()).tabs("refresh");

    });

    // add tab:
    $("#"+self.get_button_add_id()).on("click", function(event){
	if (self.dbg)
	    console.log("clicked");
	
	var name = prompt("enter tab name");
	// var name = $("#"+self.get_text_add_id()).val();
	if (self.dbg){
	    console.log(name);
	    console.log(self.get_text_add_id());
	}
	self.data["tabs_ids"].push(name);
	self.data["tabs_contents"].push("empty");
	self.save();
	/*
	 // add tab:
	 $("#"+self.get_tabs_uls_id()).append(
	 '<li id="' + self.get_tab_id(self.items_ids) + '"><a href="'
	 + self.get_tab_content_id(self.items_ids) + '">'+ name +'</a></li>');

	 // add tab's content:
	 $("#"+self.get_tabs_content_id()).append(
	 '<div id="'+self.get_tab_content_id(self.items_ids)+'">'
	 + self.draw_tab_content(self.items_ids, "empty")
	 + '</div>'
	 );
	 // # '<div id="'+ self.get_tab_content_id(self.items_ids) + '">hello</div>'

	 console.log("self.items_ids = ", self.items_ids);
	 console.log("self.get_tabs_content_id() = ", self.get_tabs_content_id());

	 // add dialog callback:
	 var edit_id = "#"+ self.get_tab_content_text_id(self.items_ids);
	 $(edit_id).on("click",
	 self.create_dialog_callback(edit_id));

	 self.items_ids += 1;
	 // $("#"+self.get_tabs_id()).tabs("refresh");
	 */
	// self.remove();
	self.load(self.data);
	if(self.dbg)
	    console.log("self.tabs_id = ", self.get_tabs_id());
    });
};
// END FOR

export{ETabs};
/*
	   return {
	       Tabs: ETabs 
	   };
       });
*/
