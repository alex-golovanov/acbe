import proxy from 'proxy';
import runtimeOnMessage from 'bg/runtime.onMessage';
import store from 'store';


runtimeOnMessage.addListener({
  'callback': async() => {
    store.dispatch({
      'type': 'Proxy is broken: set',
      'data': false
    });

    try {
      await proxy.setFromStore();
      return { 'success': true };
    }
    catch ( error ) {
      return { error };
    }
  },
  'type': 'proxy disable broken mode',
  'popupOnly': true
});
