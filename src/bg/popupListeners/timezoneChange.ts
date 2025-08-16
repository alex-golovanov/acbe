import runtimeOnMessage from 'bg/runtime.onMessage';
import timezoneChange from 'bg/contentScripts/timezoneChange';


runtimeOnMessage.addListener({
  'callback': ({ value }) => timezoneChange.set( value ),
  'type': 'timezoneChange.set',
  'popupOnly': true
});
