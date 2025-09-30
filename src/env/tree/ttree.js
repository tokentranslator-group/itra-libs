console.log("log ttree.js");


import $ from 'jquery';
import * as ui from 'jquery-ui';

import 'jquery.fancytree';
import 'jquery.fancytree/dist/modules/jquery.fancytree.filter';
import 'jquery.fancytree/dist/skin-xp/ui.fancytree.css';  // CSS or LESS


// import './fancytree/modules/jquery.fancytree.js';

// import './fancytree/skin-xp/ui.fancytree.css';  // CSS or LESS

// import 'jquery.fancytree/dist/skin-lion/ui.fancytree.css';  // CSS or LESS

// import './fancytree/modules/jquery.fancytree.filter.js';
// import * as fancytree from './fancytree/modules/jquery.fancytree.js';

// import {createTree} from 'jquery.fancytree';

// import 'jquery.fancytree/dist/modules/jquery.fancytree.edit';

// import 'jquery.fancytree/dist/modules/jquery.fancytree.filter';

// import {TreeStorage} from './storage.js';
import * as tmenu from '../menu/tmenu.js';
import * as tinput from '../input/tinput.js';


function Tree(options){

    /*Create tree with context menu in it.
     mk_tree is used to create tree and all necessary components placeholders

     Input:
     
     -- ``options.storage`` - object created with document.createElement(`div`)
     or by react ref. Now it is mandatory.

     # this is no longer correct:
     // If given it will be forfilled with other container ids,
     // otherwise the other container ids divs has to be present alredy.

     (see self.storage.mk_storages). During self.rm_tree only contents of storage will be removed.
     (so the storage itself will not be removed). During self.reload_container container also will not
     be removed but cleared only.
 
     -- ``activator(event, data)`` - function, that define
     what hapend if user click right button.

     -- ``menu_items, menu_tooltips, menu_callbacks`` - for menu.

     -- ``tree_data, url`` - if tree_data is not specified,
     url will be used for ajax to get it.

     Example: 
     	tree_data: {
	    title: "available", key: "1", folder: true,
	    children: [
		{title: "eqs parser", folder:true, key: "2",
		 children: [
		     {title: "tokens path", key: "5"},
	    ]},
     */

    options || (options = {});

    var self = this;
    // self.net = net;

    if(!options.storage)
	throw new Error("storage arg to ttabs is mandatory!");
    
    self.storage = options["storage"];
    // self.storage.mk_storages();

    // self.storage = new TreeStorage(options);
    
    self.dbg = options["dbg"] || false;
    if(self.dbg)
	console.log('options["menu_shift"]=', options["menu_shift"]);

    self.menu_shift = options["menu_shift"]?options["menu_shift"]:[0,0];


    // FOR activate:
    self.activator = options["activator"];
    self.selector = options["selector"];
    // END FOR

    // FOR menu:
    self.menu_items = options["menu_items"];
    self.menu_tooltips = options["menu_tooltips"];

    // dict, whose keys must be equal to ``self.manu_items``:
    self.menu_callbacks = options["menu_callbacks"];

    self.menu = new tmenu.Menu(
	// TODO: remove "#" for menu:
	"#"+ self.storage.menu_div_id,
	"#"+ self.storage.input_div_id,
	
	self.menu_items,
	self.menu_tooltips,
	self.menu_callbacks);    
    // END FOR

    
    // FOR init data:
    if ("tree_data" in options){
	
	var init_data = options["tree_data"];
	self.mk_tree(init_data);
	// self.create_tree(init_data);
    }
    else
	if ("url" in options){
	    
	    self.set_tree_from_server(options["url"]);
	    // self.init_data = server_respounse;
	}		   
    // END FOR
}

Tree.prototype.$ = function(div_id){
    return this.storage.$(div_id);
}


// FOR reload:
Tree.prototype.update_tree = function(data){
    var self = this;
    self.rm_tree();
    self.mk_tree(data);
}


Tree.prototype.mk_tree = function(init_data){
    /*Only if a storage have been given during initialization of the Tree*/
    var self = this;
    self.storage.mk_storages();
    self.create_tree(init_data);
}


Tree.prototype.rm_tree = function(){
    /*Only in that case the container will be removed*/
    var self = this;
    self.storage.free_container();

    // removing the container also:
    self.storage.rm_container();

}


Tree.prototype.reload_container = function(){
	       
    /*
     Reload tree container before rewrite tree.
     The container itself will not be removed!

     $("#main_tree").empty(); not work
     TODO:
     use reload winth init_data (as well for menu)
     // var tree = $(self.tree_div_id).fancytree('getTree');
     // tree.reload(init_data);
     // tree.render(true);
     */
    var self = this;
	       
    self.storage.free_container();
    self.storage.fill_container();
};
// END FOR


// FOR server side:
Tree.prototype.set_tree_from_server = function(url){
    
    /*Fetch data from url and use it for creating tree*/

    var self = this;
    var to_send = {mode: "init"};
    
    var succ = function(data){
	var init_data = data["tree"];
	if(self.dbg){
	    console.log("set_tree_from_server init_data:");
	    console.log(init_data);
	}

	self.create_tree(init_data);

	// add tree roots:
	self.roots = data["roots"];
    };
    this.send_data(url, to_send, succ);
};

	   
Tree.prototype.add_node_server = function(url, node, node_data, succ){
	       
    /*Add node to both self.tree and server.*/

    var self = this;

    // add node to self.tree:
    self.add_node(node);
	       			   
    var selected_node = self.get_selected_node();
    var parent_node = selected_node; 
    var parents_list = self.get_parents_list(parent_node);
	       
    // convert to json and send to server:
    // var tree = this.convert_tree_to_dict();
    var to_send = {mode: "add",
		   node: node,
		   node_data: node_data,
		   // tree: tree
		   parent: parent_node.toDict(),
		   parents_list: parents_list
		  };
    /*
     var succ = function(data){
     self.add_node(node_name, is_folder);
     };
     */
    this.send_data(url, to_send, succ);
};


Tree.prototype.rename_node_server = function(url, node_name){
    var self = this;

    // rename node to js tree:
    var selected_node = self.get_selected_node();
    if(self.dbg)
	console.log("selected node:", selected_node);
    var node = selected_node;
    var old_name = self.rename_node(node, node_name);
    var parents_list = self.get_parents_list(node);

    var node_dict = node.toDict();

    // fix old name in old data:
    node_dict["title"] = old_name;
    // convert to json and send to server:
    // var tree = this.convert_tree_to_dict();
    var to_send = {mode: "rename",
		   node: node_dict,
		   node_data: {title: node_name},
		   // tree: tree
		   parent: {},
		   parents_list: parents_list
		  };
    
    /*
     var succ = function(data){
     self.add_node(node_name, is_folder);
     };
     */
    this.send_data(url, to_send);
};


Tree.prototype.remove_selected_node_server = function(url, check_empty){
    
    /* Remove selected and put children nodes to common parent.
     Report to server.*/

    var self = this;

    // remove selected node to js tree:
    var selected_node = self.get_selected_node();
    
    var parents_list = self.get_parents_list(selected_node);
    
    var node = self.remove_selected_node(check_empty);
    
    // var tree = this.convert_tree_to_dict();

    // convert to json and send to server:	       
    var to_send = {mode: "remove",
		   node: node.toDict(),
		   node_data: {},
		   // tree: tree
		   parent: {},
		   parents_list: parents_list
		  };
    
    /*
     var succ = function(data){
     self.add_node(node_name, is_folder);
     };
     */
    this.send_data(url, to_send);
};


Tree.prototype.save_node_server = function(url, node, node_data){

    /* Use selected node as storage for current model.
     Report to server.
     When clicked at env_content*/

    var self = this;

    // var node = self.get_selected_node();
    var node_dict = node.toDict();
    node_dict["node_data"] = node_data;

    var node_parent = self.get_node_parent(node);
    // var node_parent_dict = node_parent.toDict();
    var parents_list = self.get_parents_list(node);
    
    // convert to json and send to server:
    // var tree = this.convert_tree_to_dict();
    
    var to_send = {mode: "save",
		   node: node_dict,
		   parent: {},
		   parents_list: parents_list};
    /*
     var to_send = {mode: "rewrite",
     node_name: node.title,
     node_data: node_data,
     tree: tree};
     */
    /*
     var succ = function(data){
     self.add_node(node_name, is_folder);
     };
     */
    this.send_data(url, to_send);
};


Tree.prototype.convert_tree_to_dict = function(){
    var self = this;
    
    // Convert the whole tree into an dictionary
    var tree = self.$(self.storage.tree_div_id).fancytree("getTree");
    var d = tree.toDict(true);
    return(JSON.stringify(d));
};

	   
Tree.prototype.send_data = function(url, to_send, succ){
    
    /*
     -- ``succ`` - if given, will be called after success
     with data as arg.
     */
    var self = this;
    if(self.dbg){
	console.log("send_data to_send:");
	console.log(to_send);
    }
    $.ajax(
	{
	    url: url,
	    type: 'POST',
	    data: JSON.stringify(to_send),
	    
	    success: function (jsonResponse) {
		var objresponse = JSON.parse(jsonResponse);
		
		var data = objresponse;
		if(self.dbg){
		    console.log("\ndata_successfuly_recived:");
		    console.log(data);
		}
		// to_send["result"] = data;
		if (succ)
		    succ(data);
	    },

	    error: function (jqXHR, textStatus, errorThrown) {
		var msg = "error to send";
		console.log(msg);
		console.log("jqXHR: ", jqXHR);
		console.log("textStatus: ", textStatus);
		console.log("errorThrown:", errorThrown);
		alert(msg);
	    }
	});
    
};
// END FOR


// FOR node editing:
Tree.prototype.get_node_parent = function(node){
    return(node.parent);
};

	   
Tree.prototype.get_parents_list = function(node){
    return($.map(node.getParentList(), function(elm, id){
	return(elm.title);
    }));
};


Tree.prototype.add_node = function(node){
	       
    /* Add node to self.tree (i.e. frontend only). */
    
    var self = this;
    
    var parent_node = self.$(self.storage.tree_div_id).fancytree("getActiveNode");
    if(!parent_node)
	parent_node = self.$(self.storage.tree_div_id).fancytree("getRootNode");
    if(self.dbg)
	console.log("parent_node = ", parent_node);

    self.check_node_unique(parent_node, node["title"]);
    /*
     if (!self.active_node)
     return;
     var node = self.active_node;
     */
	       
    parent_node.addChildren(node);
    if(self.dbg)
	console.log("done");
    //node.fromDict({title: node.title,
    //children: [{title: name, folder: is_folder}]});
};

	   
Tree.prototype.check_node_unique = function(parent_node, name){
    /*Check if name is unique in parent_node.children,
     generate error, if not.
     Also remove input, if not.*/

    var children_titles = $.map(parent_node.children, function(elm, id){
	return(elm.title);
    });
    if(self.dbg){
	console.log("children_titles = ", children_titles);
	console.log("node.title = ", name);
    }
    // here + "" used for convert int to string, if any:
    if(children_titles.indexOf(name+"") >= 0){
	// remove input:
	self.menu.input.remove_input();
	// console.error("node with such name alredy exist: "+node["title"]);
	var msg = ("node with such name alredy exist: "
		   + name);
	alert(msg);
	throw new Error(msg);
    }

};


Tree.prototype.get_selected = function(){
    return this.$(this.storage.tree_div_id).fancytree("getTree").getSelectedNodes();     
};

Tree.prototype.rm_selected = function(){
    let selected = this.$(this.storage.tree_div_id).fancytree("getTree").getSelectedNodes();     
    // console.log("PROBLEM: rm_selected: selected:", selected);
    selected.forEach((node, idx)=>node.remove());
};


Tree.prototype.deselect = function(){
    this.$(this.storage.tree_div_id).fancytree("getTree").selectAll(false);     
};


Tree.prototype.remove_selected_node = function(check_empty){
	       
    /*.*/
    
    var self = this;

    /*
     if (!self.active_node)
     return;
     */
    var node = self.$(self.storage.tree_div_id).fancytree("getActiveNode");
    console.log("PROBLEM: ttree.remove_selected_node node:", node);
    if(!node)
	return;
    if(check_empty)
	while( node.hasChildren() ) {
	    var msg = "node not empty!";
	    alert(msg);
	    throw new Error(msg);
	    // And keep children:
	    // node.getFirstChild().moveTo(node.parent, "child");
	}
    var title = node.title;
    node.remove();
    return(node);
    /*
     var tree = $(self.tree_div_id).fancytree("getTree"),
     selNodes = tree.getSelectedNodes();
     console.log("selNodes = ", selNodes);
     
     selNodes.forEach(function(node) {
     while( node.hasChildren() ) {
     node.getFirstChild().moveTo(node.parent, "child");
     }
     node.remove();
     });
     */
};
	   

Tree.prototype.rename_node = function(node, name){

    /* In js tree. */

    var self = this;
    /*
     var node = $(self.tree_div_id).fancytree("getActiveNode");
     if(!node)
     return;
     */
    
    var parent_node = self.get_parent_node(node);
    self.check_node_unique(parent_node, name);
    /*
     if (!self.active_node)
     return;
     */
    var old_name = node.title;
    node.setTitle(name);
    return(old_name);
};


Tree.prototype.get_parent_node = function(node){
    return(node.parent);
};


Tree.prototype.get_selected_node = function(){
    var self = this;
    var node = self.$(self.storage.tree_div_id).fancytree("getActiveNode");
    if(!node)
	return;
    return(node);
};


Tree.prototype.get_selected_nodes = function(){
    var self = this;
    const root_node = self.get_root_node();
    const nodes = root_node.getSelectedNodes();
    console.log("nodes:", nodes);
    if(!nodes)
	return;
    return(nodes.map((node)=>node.toDict()));
};
	   

Tree.prototype.get_root_node = function(){
    var self = this;
    return(self.$(self.storage.tree_div_id).fancytree("getRootNode"));
};
// REF: http://wwwendt.de/tech/fancytree/demo/#sample-api.html
// END FOR


Tree.prototype.create_tree = function(init_data){
    
    /*Create tree with contextmenu.*/
    
    var self = this;

    // var original_tree_div_id = self.tree_div_id.slice(1);
    if(self.dbg)
	console.log("self.storage.tree_div_id = ", self.storage.tree_div_id);
    console.log("self.storage.tree_div_id = ", self.storage.tree_div_id);
    // prevent default:
    document.getElementById(self.storage.tree_div_id)
	.addEventListener("contextmenu", function(event){
	    event.preventDefault();
	    if(self.dbg)
		console.log("event prevent = ", event);
	    
	}, false);

    // remove menu on left click:
    document.getElementById(self.storage.tree_div_id)
	.addEventListener("click", function(event){
	    self.menu.update_remove();
	    
	}, false);

    self.$(self.storage.tree_div_id).fancytree({
	/*
	 click: function(event, data){
	 console.log("event click = ", event);
	 // self.menu.update_remove();
	 },
	 */
	source: init_data,
	checkbox: true,
		   
	extensions: ["filter"],
	quicksearch: true,
	filter: {
	    autoApply: true,   // Re-apply last filter if lazy data is loaded
	    autoExpand: true, // Expand all branches that contain matches while filtered
	    counter: true,     // Show a badge with number of matching child nodes near parent icons
	    fuzzy: false,      // Match single characters in order, e.g. 'fb' will match 'FooBar'
	    hideExpandedCounter: true,  // Hide counter badge if parent is expanded
	    hideExpanders: false,       // Hide expanders if all child nodes are hidden by filter
	    highlight: true,   // Highlight matches by wrapping inside <mark> tags
	    leavesOnly: false, // Match end nodes only
	    nodata: true,      // Display a 'no data' status node if result is empty
	    mode: "hide"       // "dimm" Grayout unmatched nodes (pass "hide" to remove unmatched node instead)
	},

	select:  function(event, data){
	    var selected = $.map(data.tree.getSelectedNodes(), function(node){
		return node.toDict();
            });
	    if(self.hasOwnProperty("selector"))
		self.selector(selected);
	},

	activate: function(event, data){
	    if(self.dbg){
		console.log("data.node:");
		console.log(data.node);
	    }
	    $(data.node).addClass("ui-state-focus ui-state-active");
	    self.activator(event, data);
	    self.active_node = data.node;
	    /*
	     // var tree = $(self.tree_div_id).fancytree("getTree");
	     var match = $(self.search_div_id).val();
	     $(self.search_div_id).val(match.slice(0, -1));
	     $(self.search_div_id).trigger("keyup");
	     console.log("match: ", match);
	     */
	    // tree.filterBranches.call(tree, match.slice(0, -1), {mode: "hide", autoExpand: true});
	    
	    // , leavesOnly: true, hideExpanders: true
	    // console.log("tree.getActiveNode()");
	    // console.log(tree.getActiveNode());
	    // if(match.length>0)
	    // tree.getActiveNode().setExpanded(true).done(function(){console.log("expanded");})
	    //	   .fail(function(){console.log("fail to expand")});
	    // tree.getActiveNode().setFocus(true);
	    // tree.getActiveNode().visit(true);
	    // , autoExpand: true
	    //$(self.search_div_id).trigger("keyup");
	},
	deactivate: function(event, data){
	    $(data.node).removeClass("ui-state-focus ui-state-active");
	    self.active_node = undefined;
	}
    }).on("contextmenu", function(event, data){
		   
	/*Create menu on right click.*/

	if(self.dbg)
	    console.log("event contextmenu = ", event);
	var tree = self.$(self.storage.tree_div_id).fancytree("getTree");
	var d = tree.toDict(true);
	if(self.dbg)
	    console.log(JSON.stringify(d));
	var x = event.originalEvent.clientX;
	var y = event.originalEvent.clientY;
	if(self.dbg){
	    console.log("x, y = ", [x,y]);
	    console.log("self.menu_shift = ", self.menu_shift);
	}
	self.menu.update(x+self.menu_shift[0], y+self.menu_shift[1]);
	
    });
    
    self.$(self.storage.search_div_id).on("keyup", function(e){
	/*
	 REF: http://wwwendt.de/tech/fancytree/demo/#sample-ext-filter.html
	 REF: https://github.com/mar10/fancytree/wiki/ExtFilter
	 */
		   
	var tree = self.$(self.storage.tree_div_id).fancytree("getTree");
	// tree.filterBranches : tree.filterNodes,
	var match = $(this).val();
	if(e && e.which === $.ui.keyCode.ESCAPE || $.trim(match) === ""){
	    tree.clearFilter();
	    return;
	}

	/*
	 if( !tree.getActiveNode() ) {
	 alert("Please activate a folder.");
	 return;
	 }
	 tree.filterBranches(function(node){
	 return node.isActive();
	 }, {
	 mode: "hide",
	 });

	 */
	// tree.filterNodes.call(tree, match, {mode: "hide", autoExpand: true, leavesOnly: true, hideExpanders: false});
	tree.filterBranches.call(tree, match, {mode: "dimm", autoExpand: true});
    });
    // , leavesOnly: true, hideExpanders: true
    // $("#nav").resizable();
    // console.log("self.container_div_id = ", self.container_div_id);
};


function sort_children(children, prioritized){
	       
    // take only entries (like board, proposal):		   
    var entry_children = children.filter(
	entry =>
	    // entry["title"].search("/")>=0 && 
	    !entry["folder"]);
	       
    // take only folders:
    var folder_children = children.filter(entry=>entry["folder"]);
    
    // split folders into prioritized and rest and sort the latter:
    var folders_prior = [];
    var folders_rest = [];
    var idx_prior;
    var elm_folder;
    if (prioritized){
	for(var i=0; i<folder_children.length;i++){
	    elm_folder = folder_children[i];
	    idx_prior = prioritized.findIndex(e=>e==elm_folder["title"]);
	    if(idx_prior >= 0)
		folders_prior.push(elm_folder);
	    else
		folders_rest.push(elm_folder);
	}
	// TODO:
	//folders_rest.sort((a, b)=>a["title"].localeCompare(b["title"]));
	console.log("folders_prior:", folders_prior);
	console.log("folders_rest:", folders_rest);
	folder_children = folders_rest;
    }
    
    // sorting:
    entry_children.sort((a, b)=>a["title"].localeCompare(b["title"]));
    folder_children.sort((a, b)=>a["title"].localeCompare(b["title"]));

    // push sorted after prioritized:
    if (prioritized)
	folder_children = folders_prior.concat(folder_children);

    return({"fchildren": folder_children,
	    "echildren": entry_children,
	    "both": folder_children.concat(entry_children)});
};


export{Tree, sort_children};
/*
	   return {
	       Tree: Tree,
	       sort_children: sort_children
	   }});
*/
