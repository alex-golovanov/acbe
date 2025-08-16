import store from 'store';
import runtimeOnMessage from 'bg/runtime.onMessage';


runtimeOnMessage.addListener({
  'callback': ({ id }) => {
    store.dispatch({ 'type': 'Viewed personal banners: add', 'banner': id });
  },
  'type': 'personal banner view',
  'popupOnly': true
});
