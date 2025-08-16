/* global ExtensionInfo */
import db from 'log/db';
import Diagnostics from 'bg/Diagnostics';
import runtimeOnMessage from 'bg/runtime.onMessage';
import Browser from 'crossbrowser-webextension';


const typeMap: { [ key: string ]: string } = {
  'proxyApi': 'Check proxy settings',
  'noProxyExtensions': 'Check conflicts with other extensions',
  'httpConnection': 'Check HTTP Internet connection',
  'httpsConnection': 'Check HTTPS Internet connection',
  'browsecApi': 'Check Browsec API',
  'httpProxyConnection': 'Check HTTP Internet connection with Browsec',
  'httpsProxyConnection': 'Check HTTPS Internet connection with Browsec'
};

runtimeOnMessage.addListener({
  'callback': () => Diagnostics.close(),
  'type': 'Diagnostics.close',
  'popupOnly': true
});

runtimeOnMessage.addListener({
  'callback': async() => {
    let data = await db.getAll();
    let text: string = data
      .map( ({ timestamp, type, record }) => {
        let date = new Date( timestamp );
        let dateString/*: string*/ =
          String( date.getDate() ).padStart( 2, '0' ) + '.' +
          String( date.getMonth() + 1 ).padStart( 2, '0' ) + '.' +
          date.getFullYear() + ' ' +
          String( date.getHours() ).padStart( 2, '0' ) + ':' +
          String( date.getMinutes() ).padStart( 2, '0' ) + ':' +
          String( date.getSeconds() ).padStart( 2, '0' ) + ':' +
          String( date.getMilliseconds() ).padStart( 3, '0' );

        return dateString + ' | ' + type + ' | ' + record;
      })
      .join( '\n' );

    const version: string = Browser.runtime.getManifest().version;

    const start: string = Diagnostics._states
      .map( item => {
        let { name } = item;
        let state: any = Object.assign({}, item );

        delete state.name;

        return typeMap[ name ] + '\n' + JSON.stringify( state );
      })
      .join( '\n\n' );

    return `User agent: ${navigator.userAgent}\n\nExtension version: ${version}\n\n${start}\n\n${text}`;
  },
  'type': 'Diagnostics.getLog',
  'popupOnly': true
});

runtimeOnMessage.addListener({
  'callback': () => Diagnostics.getState(),
  'type': 'Diagnostics.getState',
  'popupOnly': true
});

runtimeOnMessage.addListener({
  'callback': () => Diagnostics.getSteps(),
  'type': 'Diagnostics.getSteps',
  'popupOnly': true
});

runtimeOnMessage.addListener({
  'callback': () => Diagnostics.open(),
  'type': 'Diagnostics.open',
  'popupOnly': true
});

runtimeOnMessage.addListener({
  'callback': (
    { extensions }: { 'extensions': ExtensionInfo[] | undefined }
  ) => {
    return Diagnostics.start( extensions );
  },
  'type': 'Diagnostics.start',
  'popupOnly': true
});

runtimeOnMessage.addListener({
  'callback': () => Diagnostics.terminate(),
  'type': 'Diagnostics.terminate',
  'popupOnly': true
});
