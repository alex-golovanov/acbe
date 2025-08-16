/* global PacHost, StoreState */
import config from 'config';
import globalIgnoredDomains from 'globalIgnoredDomains';
import storage from 'storage';
import urlToDomain from 'tools/urlToDomain';


/** @function */
export default async( storeState: StoreState ): Promise<string[]> => {
  const availableServerUrls: string[] =
    await storage.get( 'availableServerList' )
    || config.apiServerUrls.map( item => item + 'v1' );

  const availableServerDomains =
    availableServerUrls.map( url => urlToDomain( url ) as string );

  const servers: PacHost[] = [];

  for( const [ , value ] of storeState.proxyServers ) {
    for( const sType of ['free', 'premium'] ) {
      if( value[sType] ) {
        for( const { host, port } of value[ sType ] ) {
          servers.push({ host, port });
        }
      }
    }
  }

  const domains: Set<string> = new Set();

  // unique second level domains
  for( const { host } of servers ) { // Getting 2nd domain level only
    domains.add( host.split( '.' ).slice( -2 ).join( '.' ) );
  }

  for( const domain of availableServerDomains ) {
    if( domain !== 'browsec.com' ) domains.add( domain );
  }

  return globalIgnoredDomains.concat( Array.from( domains ) );
};
