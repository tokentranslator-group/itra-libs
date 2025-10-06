function create_input({x, y, succ, init, tip}){
    var txt = init;
    txt = prompt(tip==undefined?"enter name":tip);
    if(txt != ""){
	succ(txt);
    };
};


function throw_error(msg){
    throw new Error(msg);
}


function check(name, options, attribute){
    let attr = options[attribute]?options[attribute]:throw_error(name+": options."+attribute+" missed");
    return attr;
}


export {create_input, throw_error, check}
