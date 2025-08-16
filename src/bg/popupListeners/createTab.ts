import Browser from 'crossbrowser-webextension';
import runtimeOnMessage from 'bg/runtime.onMessage';


runtimeOnMessage.addListener({
  'callback': ({ options }/*: { 'options': any }*/ ) => {
    return Browser.tabs.create( options );
  },
  'type': 'create tab',
  'popupOnly': true
});
