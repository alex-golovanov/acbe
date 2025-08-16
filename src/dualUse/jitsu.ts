import ajax from 'tools/ajax';
import Browser from 'crossbrowser-webextension';
import config from 'config';
import ga from 'ga';
import sendMessage from 'tools/sendMessage';
import storage from 'storage';
import store from 'store';
import log from 'log';
import { experimentsHelper } from 'experiments';

const bgRequest = location.href.includes( 'background' );

export default {
  'track': async(
    eventName: string,
    data: { [ key: string ]: string } = {}
  ) => {
    if( !bgRequest ) {
      return sendMessage({ 'type': 'jitsu.track', eventName, data });
    }

    // check for FireFox
    const isFirefox = typeof browser !== 'undefined';
    if( isFirefox ) {
      const dontSendTelemetry = await storage.get( 'dontSendTelemetry' ) || false;
      if( dontSendTelemetry && eventName !== 'telemetry_optout' ) { return; }
    }

    // Must be at top-level of code
    const clientEventTimestamp = String( Date.now() );

    const id = await ga.full.userIdPromise;
    const storeState = await store.getStateAsync();

    const expvarid = await experimentsHelper.getEngagedEnabledExpvarid() || '';
    const manifestVersion = await storage.get( 'installVersion' );
    const statistics = await storage.get( 'statistics' ) || {};
    const installDate: number | undefined = statistics.installDate;

    const extraData = Object.assign(
      {
        'cid': id,
        'experiments': expvarid,
        'premium': storeState.user.premium ? '1' : '0'
      },
      data,
      {
        'app_version': Browser.runtime.getManifest().version,
        'client_event_timestamp': clientEventTimestamp,
        'platform': 'extension',
      }
    );
    if( manifestVersion ) {
      Object.assign( extraData, {
        'install_app_version': manifestVersion
      });
    }
    if( installDate ) {
      Object.assign( extraData, {
        'install_timestamp': String( Math.round( installDate / 1000 ) )
      });
    }

    const domain = config.type.startsWith( 'qa' )
      ? 'bmqan2static.b-cdn.net'
      : 'bmext1static.b-cdn.net';

    const urlObject = new URL( `https://${domain}/api/st/event` );

    for( const [ key, value ] of Object.entries( extraData ) ) {
      urlObject.searchParams.append( key, value );
    }
    urlObject.searchParams.append( 'event_name', eventName );

    log( '[jitsu]', eventName, data );

    return ajax(
      urlObject.toString(), { 'method': 'GET' }
    );
  }
};
