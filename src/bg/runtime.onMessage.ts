/* global RuntimeMessageSender */
import Browser from 'crossbrowser-webextension';
import log from 'log';
import { type as configType } from 'config';


type ListenerObject = {
  'callback': ( message: any, sender: RuntimeMessageSender ) => any,
  'type': string,
  'popupOnly'?: boolean
};


let listeners: ListenerObject[] = [];


Browser.runtime.onMessage.addListener(
  ( message, sender ) => new Promise( resolve => {
    const type = message?.type;
    if( !type ) return;

    if( configType === 'development' ) {
      log( 'browser.runtime.onMessage', message, sender );
    }

    const onlyCertifiedPagesAllowed =
      typeof sender.url === 'string'
      && [
        Browser.runtime.getURL( '/popup/popup.html' ),
        Browser.runtime.getURL( '/pages/congratulations/congratulations.html' ),
        Browser.runtime.getURL( '/pages/diagnostics/diagnostics.html' ),
        Browser.runtime.getURL( '/pages/unblock_proxy/unblock_proxy.html' ),
        Browser.runtime.getURL( '/pages/firefoxAgreeConditions/firefoxAgreeConditions.html' ),
      ].includes( sender.url );

    const typeListeners = listeners.filter( item => (
      item.type === type
      && onlyCertifiedPagesAllowed === Boolean( item.popupOnly )
    ) );
    if( !typeListeners.length ) return;

    const results =
      typeListeners.map( listener => listener.callback( message, sender ) );

    // NOTE: return only for first listener of certain type
    const result = results[ 0 ];
    if( result instanceof Promise ) result.then( resolve );
    else resolve( result );
  })
);


/** Async and only version of runtime.onMessage (NOTE critical -> must be the ONLY!)
@class singleton */
export default {
  /** @method */
  'addListener': ( listener: ListenerObject ): void => {
    listeners.push( listener );
  },

  /** @method */
  'removeListener': (
    params: string | ( ( message: any ) => any )
  ): void => {
    switch( typeof params ) {
      case 'string':
        listeners = listeners.filter( ({ type }) => type !== params );
        break;
      case 'function':
        listeners = listeners.filter( ({ callback }) => callback !== params );
        break;
    }
  }
};
