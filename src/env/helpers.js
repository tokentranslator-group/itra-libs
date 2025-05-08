function throw_error(msg){
    throw new Error(msg);
}


function check(name, options, attribute){
    let attr = options[attribute]?options[attribute]:throw_error(name+": options."+attribute+" missed");
    return attr;
}

export {throw_error, check}
