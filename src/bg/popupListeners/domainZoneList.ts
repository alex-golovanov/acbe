import domainZoneList from 'bg/domainZoneList';
import runtimeOnMessage from 'bg/runtime.onMessage';


runtimeOnMessage.addListener({
  'callback': () => domainZoneList.data,
  'type': 'domain zone list',
  'popupOnly': true
});
