/*global dnsDomainIs, isPlainHostName, isInNet, isInNetEx, __Countries__, __IgnoreDomains__, __SiteFilters__, __GlobalReturn__ */
/**
NOTE Never use dnsResolve!*/
const countries = __Countries__;
const globalReturn = __GlobalReturn__;

const siteFilters = __SiteFilters__.map(
  ({ format, value, country }) => {
    if( format === 'regex' ) value = new RegExp( value );

    return { format, value, country };
  }
);

const ipRanges = [
  [ '0.0.0.0', '255.0.0.0' ],
  [ '10.0.0.0', '255.0.0.0' ],
  [ '127.0.0.0', '255.0.0.0' ],
  [ '169.254.0.0', '255.255.0.0' ],
  [ '172.16.0.0', '255.240.0.0' ],
  [ '192.0.2.0', '255.255.255.0' ],
  [ '192.88.99.0', '255.255.255.0' ],
  [ '192.168.0.0', '255.255.0.0' ],
  [ '198.18.0.0', '255.254.0.0' ],
  [ '224.0.0.0', '240.0.0.0' ],
  [ '240.0.0.0', '240.0.0.0' ]
];


function FindProxyForURL( url, host ) { // eslint-disable-line
  host = host.toLowerCase();

  /** @type {string} */
  const domain = host.split( ':' )[ 0 ]; // By docs it could contain port, in FF does not contain port

  const domainIs = function( host, domain ) {
    return host === domain || dnsDomainIs( host, '.' + domain );
  };

  const directCondition/*: boolean*/ = ( () => {
    if( isPlainHostName( host ) ) return true;

    if( typeof isInNetEx !== 'undefined' ) {
      if( isInNetEx( host, 'fc00::/7' ) || isInNetEx( host, 'fe80::/10' ) ) {
        return true;
      }
    }

    if( !/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test( host ) ) {
      return false;
    }

    // Don't proxy non-routable addresses (RFC 3330)
    return ipRanges.some(
      ( [ start, end ] ) => isInNet( host, start, end )
    );
  })();
  if( directCondition ) return 'DIRECT';

  if( __IgnoreDomains__.some( item => domainIs( host, item ) ) ) {
    return 'DIRECT';
  }
  
  // Site filters looping
  const siteFilter = siteFilters.find( filter => {
    switch( filter.format ) {
      case 'domain':
        return (
          domain === filter.value || domain.endsWith( '.' + filter.value )
        );
      case 'full domain':
        return domain === filter.value;
      case 'regex':
        return filter.value.test( domain );
      default:
        return false;
    }
  });

  if( !siteFilter ) {
    return globalReturn ? countries[ globalReturn ] : 'DIRECT';
  }

  return siteFilter.country ? countries[ siteFilter.country ] : 'DIRECT';
}
