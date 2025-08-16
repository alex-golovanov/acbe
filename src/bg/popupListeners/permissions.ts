import permissions from 'bg/permissions';
import runtimeOnMessage from 'bg/runtime.onMessage';


runtimeOnMessage.addListener({
  'callback': ({ permission }) => permissions.includes( permission ),
  'type': 'permissions.includes',
  'popupOnly': true
});

runtimeOnMessage.addListener({
  'callback': () => permissions.get(),
  'type': 'permissions.get',
  'popupOnly': true
});
