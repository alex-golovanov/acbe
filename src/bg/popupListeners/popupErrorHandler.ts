// Popup error handler
import Browser from 'crossbrowser-webextension';
import runtimeOnMessage from 'bg/runtime.onMessage';
import format from 'tools/format';
import ga from 'ga';
import log from 'log';


const extensionVersion/*: string*/ =
  Browser.runtime.getManifest().version || 'n/a';

runtimeOnMessage.addListener({
  'callback': ({ 'data': { message, fileName, lineNumber } }) => {
    try {
      log.error( format(
        'message: {0}\nfilename: {1}\nlineno: {2}', message, fileName, lineNumber
      ) );

      ga.partial({
        'category': 'error',
        'action': extensionVersion,
        'label': format( '{0} at {1}:{2}', message, fileName, lineNumber ),
        'value': '0',
        'noninteraction': false
      });
    }
    catch ( error ) {
      log.error( error );
    }
  },
  'type': 'popup error',
  'popupOnly': true
});
