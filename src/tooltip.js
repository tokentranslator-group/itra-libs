console.log("log tooltip.js");

import $ from 'jquery';
import 'jquery-ui/ui/widgets/tooltip';
/*
define(['jquery'], function($){

    return {
*/

function init(){
    // FOR tooltip
    $( function() {  
	$( document ).tooltip();
    });
    // END FOR
}
export {init};
/*
    }
});
*/
