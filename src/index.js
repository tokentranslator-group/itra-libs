import * as css from './css/styles.css';
import * as css1 from './css/tabs.css';
import * as css2 from './css/dialog.css';
import * as css3 from './css/all.css';
import $ from 'jquery'; 
import 'jquery-ui';
import 'jquery-ui/ui/widgets/resizable';
import 'jquery-ui/ui/widgets/dialog';


// for exportin:
import {Tree, sort_children} from './env/tree/ttree.js';

// for testing:
import {main} from './tests/test_host_server.js';
// import {main} from './tests/test_mc.js';
// import {main} from './tests/test_host.js';
// import {main} from './tests/test_editor.js';
// import {main} from './tests/test_editor_react.js';
// import {main} from './tests/test_ttree_react1.js';
// import {main} from './tests/test_ttree_react.js';
// import {main} from './tests/test_ttree.js';
// import {main} from './tests/tReJs.js';
//import {main} from './tests/tStore0.js';
// import {main} from './tests/tNoStore0.js';
// import {main} from './tests/tEHandler.js';

main();

export{Tree, sort_children};

// export {mk_root, quest_store, AppGui,  Activable, Environment};
