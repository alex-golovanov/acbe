import jitsu from 'jitsu';
import runtimeOnMessage from 'bg/runtime.onMessage';


runtimeOnMessage.addListener({
  'callback': (
    { eventName, data }
  ) => {
    jitsu.track( eventName, data );
  },
  'type': 'jitsu.track',
  'popupOnly': true
});
