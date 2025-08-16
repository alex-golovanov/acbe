import log from 'log';
import runtimeOnMessage from 'bg/runtime.onMessage';


runtimeOnMessage.addListener({
  'callback': ({ data }/*: { 'data': Array<any> }*/ ) => {
    log.apply({}, data );
  },
  'type': 'log',
  'popupOnly': true
});

runtimeOnMessage.addListener({
  'callback': ({ data }/*: { 'data': Array<any> }*/ ) => {
    log.warn.apply( log, data );
  },
  'type': 'log.warn',
  'popupOnly': true
});

runtimeOnMessage.addListener({
  'callback': ({ data }/*: { 'data': Array<any> }*/ ) => {
    log.error.apply( log, data );
  },
  'type': 'log.error',
  'popupOnly': true
});
