import config from 'config';
import globalIgnoredDomains from 'globalIgnoredDomains';
import urlToDomain from 'tools/urlToDomain';


export default (
  {
    'availableServerUrls': preAvailableServerUrls,
    hosts,
  }: {
    'availableServerUrls': string[] | undefined,
    'hosts': string[],
  }
): string[] => {
  const availableServerUrls =
    preAvailableServerUrls || config.apiServerUrls.map( item => item + 'v1' );

  const availableServerDomains =
    availableServerUrls.map( url => urlToDomain( url ) as string );

  const domains: Set<string> = new Set();

  // unique second level domains
  for( const host of hosts ) { // Getting 2nd domain level only
    domains.add( host.split( '.' ).slice( -2 ).join( '.' ) );
  }

  for( const domain of availableServerDomains ) {
    if( domain !== 'browsec.com' ) domains.add( domain );
  }

  return globalIgnoredDomains.concat( Array.from( domains ) );
};
