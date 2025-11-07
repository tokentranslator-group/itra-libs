// certificate for internal data exchange:
import {cert_v0 as cert} from '../env/cert.js';




function test4(){
    let failed = false;

    let signed_b = cert.sign({
	idd:"cert.test4.sign",
	
	data_type:"Branch",
	
	data_form: "Single",
	msg: {edge: {}, node:{}}
    });

    let signed_n = cert.sign({
	idd:"cert.test4.sign",
	
	data_type:"Node",
	
	data_form: "Single",
	msg: {edge: {}, node:{}}
    });

    try{

	cert.verify({
	    idd: "cert.test4.verify",
	    msg: signed_b,
	    data_form: "Single",
	    data_type: "Edge"
	});
	failed = true;
    }catch(error){

	try{
	    cert.verify({
		idd: "cert.test4.verify",
		msg: signed_b,
		data_form: "Single",
		data_type: "Node"
	    });
	    failed = true;
	}catch(err){
	    try{
		cert.verify({
		    idd: "cert.test4.verify",
		    msg: signed_n,
		    data_form: "Single",
		    data_type: "Edge"
		});
		failed = true;
	    }catch(e){
		try{
		    cert.verify({
		    idd: "cert.test4.verify",
			msg: signed_n,
			data_form: "Single",
			data_type: "Branch"
		    });
		    failed = true;
		}catch(e){
		    console.log("TEST: test4 PASSED");	
		}
	    }
	}
    }
    if(failed)
	throw new Error("TEST: test4 failed");
}


function test3(){
    let signed = cert.sign({
	idd:"cert.test3.sign",
	
	data_type:"Branch",
	
	data_form: "Single",
	msg: {edge: {}, node:{}}
    });

    cert.verify({
	idd: "cert.test3.verify",
	msg: signed,
	data_form: "Single",
	data_type: "Edge,Node"
    });

    cert.verify({
	idd: "cert.test3.verify",
	msg: signed,
	data_form: "Single",
	data_type: "Branch"
    });


    cert.verify({
	idd: "cert.test3.verify",
	msg: signed,
	data_form: "Single",
	data_type: "Branch,Edge"
    });


    cert.verify({
	idd: "cert.test3.verify",
	msg: signed,
	data_form: "Single",
	data_type: "Branch,Node"
    });

    console.log("TEST: test3 PASSED");
}


function test2(){
    let signed = cert.sign({
	idd:"cert.test2.sign",
	
	data_type:"Branch",
	
	data_form: "Single",
	msg: {edge: {}, node:{}}
    });

    cert.verify({
	idd: "cert.test2.verify",
	msg: signed,
	data_form: "Single",
	data_type: "Edge,Branch"
    });
    console.log("TEST: test2 PASSED");
}

function test1(){
    let signed_e = cert.sign({
	idd:"cert.test1.sign",
	
	data_type:"Edge",
	
	data_form: "Single",
	msg: {edge: {}}
    });
    console.log(" signed edge:", signed_e);
    cert.verify({
	idd: "cert.test1.verify",
	msg: signed_e,
	data_form: "Single",
	data_type: "Edge"
    });

    let signed_n = cert.sign({
	idd:"cert.test1.sign",
	
	data_type:"Node",
	
	data_form: "Single",
	msg: {node: {}}
    });
    cert.verify({
	idd: "cert.test1.verify",
	msg: signed_n,
	data_form: "Single",
	data_type: "Node"
    });

    console.log("TEST: test1 PASSED");
}

export function main(){
    test4();
    test3();
    test2();
    test1();
}
