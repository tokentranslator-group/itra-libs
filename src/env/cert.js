/*Define the internal data protocol/certificate currently to be used
in all itra data exchange tasks*/

// Internal data format protocol,
// should be respected by all components and their behavior.
const protocol_v0 = {
    type:"internal",
    name: "TheMcInternalProtocol"
};

class Certificate{
    /*There is internal data protocol which been checked for
     each hla and should be respected/supported by all components
     and their behavior.
	 
     So each msg should looks like
	    {
	     node:{...}
	     edge:{...}
	     protocol: protocol_v0,
	    }

     see test_cert.js
     */
    constructor({data_protocol}){
	
	this.data_protocol = data_protocol;
    }

    // TODO: registering for sign and verify events
    // to subsc from stack
    verify({idd, msg, data_type, data_form}){
	/*Verify that internal data format protocol spec hold for a msg in
	 hla with hla_idd
	 
	 - ``idd`` -- identifier of the component using this verification
	 will be used in errors messages
	 
	 - ``msg`` -- the data to be verified. Should contain a protocol attr.
	 
	 - ``data_form`` -- Multi (ie List) or Single (ie entry).
	 In the former case the msg has to have
	 entries attribute inside.
	 
	 - ``data_type`` -- the type of data which should be used in msg
	 (like Branch, Node or Edge). Optional. Could contain several at once:
	 "Branch,Node" or "Branch,Edge", separated by semicolumn. 

	 # Example:
	 cert.verify({
	    idd: "joiner",
	    msg: data,
	    data_form: "Single"
	 });
	 
	 */
	const protocol = this.data_protocol;

	if(!msg.hasOwnProperty("protocol")){
	    console.log("msg:", msg);
	    throw new Error(idd+" "+"Recived msg having no spec protocol!");
	}
	if(msg.protocol.type!==protocol.type){
	    console.log("msg:", msg);
	    throw new Error(idd+" "+"protocol types verification failure! in ");
	}
	if(msg.protocol.name!==protocol.name){
	    console.log("msg:", msg);
	    throw new Error(idd+" "+"protocol names verification failure! in ");
	}
	try {
	    this._check_data(idd, msg.protocol.data_type, msg.protocol.data_form);  
	} catch (error) {
	    console.error("verify._check_data error:", error.message);
	    console.log("VerificationError msg:", msg);
	} 
	

	if(data_type!==undefined){
	    let data_type_correct = this._type_tester(data_type, msg.protocol.data_type);
	    if(!data_type_correct){
		console.log("VerificationError msg:", msg);
		console.log("VerificationError data_type:", data_type);
		throw new Error(idd+" "+"protocol data_type verification failure! in ");
		}
	}
	if(data_form=="Multi" && !msg.hasOwnProperty("entries")){
	    console.log("VerificationError msg:", msg);
	    console.log("VerificationError data_form:", data_form);
	    throw new Error(idd+" "+"protocol data_form verification failure! no entries given in the msg");	    
	}
	
	
	if(data_form=="Single" && msg.protocol.data_type=="Node" && !msg.hasOwnProperty("node")){
		console.log("VerificationError msg:", msg);
		console.log("VerificationError data_form:", data_form);
		throw new Error(idd+" "+"protocol data_form verification failure! no node given in the msg");	    
	    }
	    
	if(data_form=="Single" && msg.protocol.data_type=="Edge" && !msg.hasOwnProperty("edge")){
	    
		console.log("VerificationError msg:", msg);
		console.log("VerificationError data_form:", data_form);
		throw new Error(idd+" "+"protocol data_form verification failure! no edge given in the msg");	    
	    }
	
	if(data_form=="Single" && msg.protocol.data_type=="Branch" && (!msg.hasOwnProperty("edge")||!msg.hasOwnProperty("node"))){
	    console.log("VerificationError msg:", msg);
	    console.log("VerificationError data_form:", data_form);
	    throw new Error(idd+" "+"protocol data_form verification failure! no edge or node given in the msg");	    
	}
	
	return true;
    }

    sign({idd, msg, data_type, data_form}){
	/*
	 If the `data_form` has `Single` as its value, the msg should have:
	  |node attr, if data_type is Node
	  |edge attr, if data_type is Edge
	  |both node and edge, if data_type is Branch

	 If the `data_form` has `Multi` as its value, the msg should have
	 the entries list which contain:
	  |(edge, node) pairs, if `data_type` is `Branch`
	  | edge obj/dict, if `data_type` is `Edge`
	  | node obj/dict, if `data_type` is Node
	 
	 Will return sign data by the self.data_protocol

	 - ``data_type`` -- Branch, Node or Edge
	 - ``data_form`` -- Multi, Single

	 # Example:

	 let msg = cert.sign({
	     idd:"lla.ls_note",

	     // show only forward neighbors:
	     msg: {entries: children_branches},
	     // msg: {entries: data[1]},

	     data_type:"Branch",
	     data_form: "Multi"
	 });

	 see test_cert.js
	 */
	msg.protocol = {...this.data_protocol};
	msg.protocol.data_type = data_type;

	this._check_data(idd, data_type, data_form);

	if(data_form =="Multi")
	    if(!msg.hasOwnProperty("entries"))
		throw new Error(idd+" ProtocolDataError: for data_form 'Multi' the data has to have entries property!");

	if(data_form == "Single")
	    switch(data_type){
		case "Branch":
		if(!(msg.hasOwnProperty("edge") && msg.hasOwnProperty("node")))
		    throw new Error(idd+" ProtocolDataError: when the data_form 'Single' and the data_type 'Branch', the msg has to have both edge and node attrs!");
		break;

		case "Node":
		if(!msg.hasOwnProperty("node"))
		    throw new Error(idd+" ProtocolDataError: when the data_form 'Single' and the data_type 'Node', the msg has to have a node attr!");
		break;

		case "Edge":
		if(!msg.hasOwnProperty("edge"))
		    throw new Error(idd+" ProtocolDataError: when the data_form 'Single' and the data_type 'Edge', the msg has to have a edge attr!");
		break;
		
	    }
	
	msg.protocol.data_form = data_form;
	msg.protocol.owner = idd;
	return {...msg};
    }

    _type_tester(data_type, type_value){
	/*
	 - ``data_type`` -- is a user query
	 - ``type_value`` -- is what the data actual have

	  To check if there is the `type_value` inside `data_type`.
	 The latter could looks like "Edge" or "Edge,Branch".
	  If type_value is Branch, the data_type = "Edge,Node" will
	 also return true
	 */
	let res = data_type.split(",").findIndex(_type=>_type==type_value)>=0;

	if(type_value=="Branch" && !res)
	    return this._type_tester(data_type, "Node") && this._type_tester(data_type, "Edge"); 
	return res;
    }
    
    _check_data(idd, data_type, data_form){
	// checking data_type:
	if(["Branch", "Node", "Edge"].indexOf(data_type)<0){
	    
	    throw new Error(idd+" "+" ProtocolDataError: data_type should be: Branch, Node or Edge, found ", data_type);
	}
	// checking data_form:
	if(["Multi", "Single"].indexOf(data_form)<0)
	   throw new Error(idd+" "+" ProtocolDataError: data_form should be: Multi or Single, found ", data_form);
	
    }

}

const cert_v0 = new Certificate({data_protocol: protocol_v0});

export{cert_v0}
