/* global LowLevelPac, PacSiteFilter, ProxyProxyinfo */
import Browser from 'crossbrowser-webextension';
import config from 'config';
import database from 'bg/diagnosticRequests/database';
import findMatchingFilterForDomain from 'tools/findMatchingFilterForDomain';
import storage from 'storage';
import store from 'store';

const { _ } = self;


const directValue: ProxyProxyinfo = { 'type': 'direct' };

/** @function */
const convertAddr = ( ipchars: string ): number => {
  const bytes: number[] = ipchars.split( '.' ).map( item => Number( item ) );

  return (
    ( ( bytes[ 0 ] & 0xff ) << 24 ) |
    ( ( bytes[ 1 ] & 0xff ) << 16 ) |
    ( ( bytes[ 2 ] & 0xff ) << 8 ) |
    ( bytes[ 3 ] & 0xff )
  );
};

/** @function */
const dnsDomainIs = ( host: string, domain: string ): boolean => (
  host.length >= domain.length
  && host.substring( host.length - domain.length ) === domain
);

/** @function */
const domainIs = ( host: string, domain: string ): boolean => (
  host === domain || dnsDomainIs( host, '.' + domain )
);

/** @function */
const isIpv6 = ( address: string ): boolean => {
  if( !/^[0-9a-f:]+$/.test( address ) ) return false;
  const matches = address.match( /::/g );
  if( matches && matches.length >= 2 ) return false; // Not correct IPv6 address

  const parts: string[] = address
    .replace( /^::/, '' ).replace( /::$/, '' ).replace( '::', ':' )
    .split( ':' );

  return !parts.some( part => !/^[0-9a-f]{1,4}$/.test( part ) );
};

/** @function */
const isInNet = (
  ipaddr: string, pattern: string, maskstr: string
): boolean => {
  let preTest/*: string[] | null*/ =
    /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec( ipaddr );
  if( preTest === null ) return false;

  let test: number[] = preTest.map( item => Number( item ) );

  const condition =
    test[ 1 ] > 255 || test[ 2 ] > 255 || test[ 3 ] > 255 || test[ 4 ] > 255;
  if( condition ) return false; // not an IP address

  const host = convertAddr( ipaddr );
  const pat = convertAddr( pattern );
  const mask = convertAddr( maskstr );

  return ( host & mask ) === ( pat & mask );
};

/**
@function
@param ipAddress - IP6 address
@param ipPrefix - A string containing colon delimited IP prefix with top n bits specified
  in the bit field (i.e. 3ffe:8311:ffff::/48 or 123.112.0.0/16)
@return - true if the host is in the given subnet, else false */
const isInNetEx = ( ipAddress: string, ipPrefix: string ): boolean => {
  // 1. Testing ipAddress is correct IPv6 address
  if( !isIpv6( ipAddress ) ) return false;

  // 2. Testing ipPrefix is correct IPv6 + correct limitation
  if( !ipPrefix.includes( '/' ) ) return false;
  let [ ipPrefixHost, ipPrefixLimitString ] = ipPrefix.split( '/' );
  if( !isIpv6( ipPrefixHost ) ) return false;

  let ipPrefixLimit = Number( ipPrefixLimitString );
  if( !ipPrefixLimit || ipPrefixLimit < 0 || ipPrefixLimit > 128 ) return false;

  // Converting :: to full zeros
  ipAddress = ipv6ToBinaryString( ipAddress ).slice( 0, ipPrefixLimit );
  ipPrefixHost = ipv6ToBinaryString( ipPrefixHost ).slice( 0, ipPrefixLimit );

  return ipAddress === ipPrefixHost; // If all correct -> return true
};

/** Convert IPv6 address to view like 10010100
@function */
const ipv6ToBinaryString = ( address: string ): string => {
  /**
  @function
  @param part - with length 4
  @return with length 4 */
  let convertPartToBinary = ( part: string ): string => (
    parseInt( part, 16 ).toString( 2 ).padStart( 16, '0' )
  );

  // No double colon
  if( !address.includes( '::' ) ) {
    return (
      address.split( ':' ).map( part => convertPartToBinary( part ) ).join( '' )
    );
  }

  // Double colon at end
  if( address.endsWith( '::' ) ) {
    let parts/*: Array<string>*/ = address.replace( /::$/, '' ).split( ':' )
      .map( part => convertPartToBinary( part ) );

    const zeroParts: string[] =
      Array( 8 - parts.length ).fill( '0000000000000000' );

    return parts.concat( zeroParts ).join( '' );
  }

  // Double colon in middle
  let sections/*: string[][]*/ = address.split( '::' ).map(
    section => section.split( ':' ).map( part => convertPartToBinary( part ) )
  );

  const length: integer = sections.reduce(
    ( carry, section ) => carry + section.length, 0
  );

  // Insert zero parts in middle
  sections.splice( 1, 0, Array( 8 - length ).fill( '0000000000000000' ) );

  const parts: string[] = sections.flat();

  return parts.join( '' );
};


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


let ignoredDomains: string[] = [];
let countries: {
  [ country: string ]: ProxyProxyinfo | ProxyProxyinfo[]
} = {};
let globalReturn: ProxyProxyinfo | ProxyProxyinfo[] = directValue;
let siteFilters: PacSiteFilter[] = [];


/** @function */
const setDataFromLowLevelPac = ( lowLevelPac: LowLevelPac ) => {
  ignoredDomains = lowLevelPac.ignoredDomains;

  countries = Object.fromEntries(
    Object.entries(
      Object.assign({}, lowLevelPac.premiumCountries, lowLevelPac.countries )
    ).map(
      ( [ country, value ] ) => {
        const proxyEntries: ProxyProxyinfo[] = [];

        for( const entry of value ) {
          let [ typeUppercase, other ] = entry.split( ' ' );
          const type = typeUppercase.toLowerCase();

          if( type !== 'https' && type !== 'proxy' && type !== 'socks' ) continue;

          const [ host, port ] = other.split( ':' );
          proxyEntries.push({ type, host, port, 'failoverTimeout': 15 });
        }

        return [ country, proxyEntries ];
      }
    )
  );

  const { dynamicConfig } = store.getState();

  siteFilters = lowLevelPac.siteFilters.slice();
  siteFilters.push({
    'format': 'domain',
    'country': ( dynamicConfig.browsecCountry || 'fi' ),
    'value': 'browsec.com'
  });

  globalReturn = ( () => {
    if( !lowLevelPac.globalReturn ) return directValue;

    return countries[ lowLevelPac.globalReturn ];
  })();
};


let firstStart = true;


if( typeof browser !== 'undefined' ) {
  Browser.proxy.onRequest.addListener(
    async( details ) => {
      const { fromCache, requestId, timeStamp, url } = details;
      if( firstStart ) {
        const { lowLevelPac } = await store.getStateAsync();

        setDataFromLowLevelPac( lowLevelPac );
      }

      let urlObject: URL;
      try {
        urlObject = new URL( url );
      }
      catch ( error ) {
        return directValue;
      }
      let { 'hostname': host, protocol } = urlObject;

      if( ![ 'ftp:', 'http:', 'https:', 'wss:' ].includes( protocol ) ) {
        return directValue;
      }
      const directCondition: boolean = ( () => {
        if( !host.includes( '.' ) ) return true;

        if( isInNetEx( host, 'fc00::/7' ) || isInNetEx( host, 'fe80::/10' ) ) return true;

        if( !/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test( host ) ) {
          return false;
        }

        // Don't proxy non-routable addresses (RFC 3330)
        return ipRanges.some(
          ( [ start, end ] ) => isInNet( host, start, end )
        );
      })();

      const returnValue = ( () => {
        if( directCondition ) return directValue;
        if( fromCache ) return directValue;
        if( ignoredDomains.some( item => domainIs( host, item ) ) ) return directValue;
        if( url.startsWith( config.rootUrl ) ) return directValue;

        // Site filters looping
        // @ts-ignore
        const filter: PacSiteFilter = findMatchingFilterForDomain(
          siteFilters, host
        );

        if( !filter ) return globalReturn;

        if( !filter.country ) return directValue;

        return countries[ filter.country ];
      })();

      // Diagnostic requests
      ( async() => {
        const value = await storage.get( 'Diagnostic requests trigger' );
        if( value !== true ) return;

        // Only our servers
        const servers: string[] =
          await storage.get( 'availableServerList' )
          || config.apiServerUrls.map( item => item + 'v1' );
        if( servers.every( server => !url.startsWith( server ) ) ) return;

        database.add({
          'cached': fromCache,
          'hasProxy': !_.isEqual( returnValue, directValue ),
          requestId,
          timeStamp,
          url
        });
      })();

      return returnValue;
    },
    { 'urls': [ '<all_urls>' ] }
  );
}


/** @function */
export default ( () => {
  if( typeof browser === 'undefined' ) { // Chrome
    return ( lowLevelPac: LowLevelPac ) => {};
  }

  // Firefox
  /*let onRequestFilters: Array<{
    'value': string,
    'format': 'domain',
    'pacReturn': ProxyProxyinfo | ProxyProxyinfo[]
  } | {
    'value': string,
    'format': 'full domain',
    'pacReturn': ProxyProxyinfo | ProxyProxyinfo[]
  } | {
    'value': RegExp,
    'format': 'regex',
    'pacReturn': ProxyProxyinfo | ProxyProxyinfo[]
  }> = [];*/

  return ( lowLevelPac: LowLevelPac ) => {
    if( firstStart ) firstStart = false;

    setDataFromLowLevelPac( lowLevelPac );
  };
})();
