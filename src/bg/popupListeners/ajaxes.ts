import ajaxes from 'ajaxes';
import runtimeOnMessage from 'bg/runtime.onMessage';


runtimeOnMessage.addListener({
  'callback': ({ credentials, filters }) => (
    ajaxes.setSmartSettings({ credentials, filters })
  ),
  'type': 'ajaxes.setSmartSettings',
  'popupOnly': true
});

runtimeOnMessage.addListener({
  'callback': ({ url }) => ajaxes.availableServerTest( url ),
  'type': 'ajaxes.availableServerTest',
  'popupOnly': true
});

runtimeOnMessage.addListener({
  'callback': () => ajaxes.availableServerServerList(),
  'type': 'ajaxes.availableServerServerList',
  'popupOnly': true
});
