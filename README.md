# itra-libs

&nbsp; Several usefull components wrapped with React. 
Supports of views/react separated event driven behavior through common stacks in decentrilized manner.
 To simplify control the latter make use of internal data protocol. 

More detailed doc will be available soon on [tra-doc page]()

 
# Compositions:

### MC
 (smth like The GNU Midnight Commander)

 - Components:
    - internal data protocol:
        - itra-libs/src/env/cert.js
        - itra-libs/src/tests/cert.js

 - Tests:
    - itra-libs/src/tests/test_mc.js
    - itra-libs/src/tests/test_mc_srv.js
  

# Components:

### Tree:
 The fancytree wrapper:

 - Components:
    - react component: itra-libs/src/env/tree/ttree_react.js
    - frame: itra-libs/src/env/tree/ttree.js

 - Behavior:
    - fsm: itra-libs/src/env/tree/behavior/TreeFsm.js
    - edp (depricated): itra-libs/src/env/tree/behavior/TreeEdp.js
    - hla: save, rename, load_root, activate, rm, add (deprecated), add_seq 
 
 - Helpers:
    - itra-libs/src/env/tree/ttree_helpers.js

 - Tests: 
    - itra-libs/src/tests/test_mc_srv.j
    - itra-libs/src/tests/test_mc.js
    - itra-libs/src/tests/test_ttree_react1.js
    - itra-libs/src/tests/test_ttree_react.js
    - itra-libs/src/tests/test_ttree.js

### Editor
 For editing entries with the dynamic tabs and tags.

 - Components:
    - react component: itra-libs/src/env/editor/ttabs_react.js
    - frame: itra-libs/src/env/editor/ttabs_extended.js

 - Behavior:
    - fsm: itra-libs/src/env/editor/behavior.js
    - hla: save
 
 - Helpers:
    - itra-libs/src/env/editor/ttabs_helpers.js

 - Tests:
    - itra-libs/src/tests/test_editor_react.js

### Querier
 For fetching data from db with the tags been given.

 - Components:
    - itra-libs/src/env/querier/querier_react.js

 - Behavior:
    - hla: fetch

 - Tests: 
    - itra-libs/src/tests/test_mc.js
    - itra-libs/src/tests/test_mc_srv.js

### Joiner
 For Joining/link entries/nodes by edges in graph and tree.

 - Components:
    - itra-libs/src/env/joiner/joiner_react.js

 - Behavior:
    - hla: join

 - Tests: 
    - ref: itra-libs/src/tests/test_mc.js
    - ref: itra-libs/src/tests/test_mc_srv.js


### Hosts:
 - Host emulator
    - itra-libs/src/tests/test_host.js
 - Host
    - itra-libs/src/tests/test_host_server.js
 
# Behaviors:
### Events driven domain specific actions:
 Hla (High level actions) and Lla (Low level actions).

 - Refs:
    - itra-libs/src/tests/test_hla.js
    - itra-libs/src/dsl/


# Others:
### Storage:
 - Ref: itra-libs/src/env/tree/storage.js  