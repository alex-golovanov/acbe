import Browser from 'crossbrowser-webextension';
import config from 'config';
import database from './database';
import proxy from 'proxy';
import storage from 'storage';
import urlToDomain from 'tools/urlToDomain';


// записываем то что есть в момент, когда запрашивается урл
if( typeof browser === 'undefined' ) {
  Browser.webRequest.onBeforeSendHeaders.addListener(
    async({ url, requestId, timeStamp }) => {
      if( !url ) return;
  
      const value = await storage.get( 'Diagnostic requests trigger' );
      if( value !== true ) return;
  
      // Only our servers
      const servers: string[] =
        await storage.get( 'availableServerList' )
        || config.apiServerUrls.map( item => item + 'v1' );
      if( servers.every( server => !url.startsWith( server ) ) ) return;

      const hasProxy = await ( async() => {
        const pac = await proxy.getPac();
        if( !pac ) return false;
  
        const ignoredDomains: string[] =
          JSON.parse( /'DIRECT'; if \((.+?)\.some/g.exec( pac )?.[ 1 ] || '' );
        const domain = urlToDomain( url ) as string;
  
        return ignoredDomains.every(
          ignoredDomain => ignoredDomain !== domain && !domain.endsWith( '.' + ignoredDomain )
        );
      })();
  
      database.add({ hasProxy, requestId, timeStamp, url });
    },
    { 'urls': [ '<all_urls>' ] }
  );
}


//
Browser.webRequest.onCompleted.addListener(
  async({ requestId, statusCode, url }) => {
    if( !url ) return;

    const value = await storage.get( 'Diagnostic requests trigger' );
    if( value !== true ) return;

    // Only our servers
    const servers: string[] =
      await storage.get( 'availableServerList' )
      || config.apiServerUrls.map( item => item + 'v1' );
    if( servers.every( server => !url.startsWith( server ) ) ) return;

    database.update( requestId, { 'status': statusCode });
  },
  { 'urls': [ '<all_urls>' ] }
);


Browser.webRequest.onErrorOccurred.addListener(
  async({ requestId, 'error': errorText, url }) => {
    if( !url ) return;

    const value = await storage.get( 'Diagnostic requests trigger' );
    if( value !== true ) return;

    // Only our servers
    const servers: string[] =
      await storage.get( 'availableServerList' )
      || config.apiServerUrls.map( item => item + 'v1' );
    if( servers.every( server => !url.startsWith( server ) ) ) return;

    database.update( requestId, { errorText });
  },
  { 'urls': [ '<all_urls>' ] }
);


export default async() => {
  const value = await storage.get( 'Diagnostic requests trigger' );
  if( value === true ) return;

  storage.set( 'Diagnostic requests trigger', true );
};
