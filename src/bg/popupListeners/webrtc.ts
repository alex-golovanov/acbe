import runtimeOnMessage from 'bg/runtime.onMessage';
import webrtc from 'bg/webrtc';


runtimeOnMessage.addListener({
  'callback': () => webrtc.isAvailable(),
  'type': 'webrtc.available',
  'popupOnly': true
});

runtimeOnMessage.addListener({
  'callback': () => webrtc.getControlState(),
  'type': 'webrtc.getControlState',
  'popupOnly': true
});

runtimeOnMessage.addListener({
  'callback': () => webrtc.disable(),
  'type': 'webrtc.disable',
  'popupOnly': true
});

runtimeOnMessage.addListener({
  'callback': () => webrtc.enable(),
  'type': 'webrtc.enable',
  'popupOnly': true
});
