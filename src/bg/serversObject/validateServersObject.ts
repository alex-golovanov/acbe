/* global RawServersObject */


/** ! Partially mutates initial object
@function */
export default ( object: RawServersObject ): RawServersObject => {
  if( !object || typeof object !== 'object' ) {
    throw new Error( 'Servers object should be an object' );
  }

  /// Countries
  const { countries, version, recommended_countries } = object;

  if( !countries || typeof countries !== 'object' ) {
    throw new Error( 'Servers.countries should be an object' );
  }
  const keys = Object.keys( countries );
  if( keys.length === 0 ) {
    throw new Error( 'Servers.countries should have at least one country' );
  }
  for( const key of keys ) {
    const value = countries[ key ];

    // Country value is not an object
    if( !value || typeof value !== 'object' ) {
      delete countries[ key ];
      continue;
    }

    let freeExist = true;
    if( !Array.isArray( value.servers ) ) {
      freeExist = false;
    }
    else {
      value.servers = value.servers.filter( server => (
        typeof server?.host === 'string' && typeof server?.port === 'number'
      ) );
      if( !value.servers.length ) {
        freeExist = false;
        delete value.servers;
      }
    }


    let premiumExist = true;
    if( !Array.isArray( value.premium_servers ) ) {
      premiumExist = false;
    }
    else {
      // @ts-ignore
      value.premium_servers = value.premium_servers.filter( server => (
        typeof server?.host === 'string' && typeof server?.port === 'number'
      ) );
      if( !value.premium_servers.length ) {
        premiumExist = false;
        delete value.premium_servers;
      }
    }


    if( !freeExist && !premiumExist ) {
      delete countries[ key ];
      continue;
    }

    if( Array.isArray( value.fast_servers ) ) {
      value.fast_servers = value.fast_servers.filter( server => (
        typeof server?.host === 'string' && typeof server?.port === 'number'
      ) );

      if( !value.fast_servers.length ) delete value.fast_servers;
    }

    if( 'timezoneOffset' in value && typeof value.timezoneOffset !== 'number' ) {
      delete value.timezoneOffset;
    }
  }
  if( Object.keys( countries ).length === 0 ) {
    throw new Error(
      'Servers.countries should have at least one valid country'
    );
  }

  const domains: RawServersObject['domains'] = { 'free': [], 'premium': [] };

  for( const { 'servers': free, 'premium_servers': premium } of Object.values( countries ) ) {
    const hostToDomain = (host: string): string => {
      return host.split('.').slice(-2).join('.')
    };

    for( const sType of [ 'free', 'premium' ] ) {
      const servers = sType === 'free' ? free : premium;

      if( servers ) {
        for( const { host } of servers ) {
          if( typeof host === 'string' ) {
            const domain = hostToDomain( host );

            if (!domains.premium.includes(domain)) {
              domains[sType].push( domain );
            }
          }
        }
      }
    }
  }

  if( !domains.free.length || !domains.premium.length ) {
    throw new Error(
      'Servers.domains[free|premium] should be not empty array of strings'
    );
  }

  return { countries, domains, version, recommended_countries };
};
