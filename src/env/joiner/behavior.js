import {events} from 'itra-behavior/src/eHandler.js';

import {mk_node, mk_idle_state} from 'itra-behavior/src/type_classes/fsm/behaviors/helpers.js';

export function mk_joiner_fsm(host_name){
    return mk_node({
	node_name: "Joiner",
	host_name: host_name,
	
	stacks_names: ["ActionsQueue"],

    });
}
