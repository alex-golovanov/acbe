import db from 'log/db';
import runtimeOnMessage from 'bg/runtime.onMessage';


runtimeOnMessage.addListener({
  'callback': () => db.getAll(),
  'type': 'db.getAll',
  'popupOnly': true
});
