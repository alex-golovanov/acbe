/* global ProxyServerCountryData, RawServersObject */
import makeProxyServersMap from 'tools/makeProxyServersMap';
import { pacHostsToCountryPrefixPorts } from 'tools/index';
import { StoreClass } from 'store';


/** @function */
export default ({
  noStorage = false,
  object,
  store
}: {
  'noStorage'?: boolean,
  'object': RawServersObject,
  'store': StoreClass
}) => {
  const proxyServers: Map<string, ProxyServerCountryData> = new Map();
  const timezones: Map<string, integer> = new Map();

  for( const country of Object.keys( object.countries ) ) {
    const item = object.countries[ country ];

    const countryData: ProxyServerCountryData = {};
    if( item.fast_servers ) {
      countryData.fast = pacHostsToCountryPrefixPorts( item.fast_servers );
    }
    if( item.premium_servers ) {
      countryData.premium = pacHostsToCountryPrefixPorts( item.premium_servers );
    }
    if( item.servers ) {
      countryData.free = pacHostsToCountryPrefixPorts( item.servers );
    }

    proxyServers.set( country, countryData );

    const offset = item.timezoneOffset;
    if( typeof offset === 'number' ) timezones.set( country, offset );
  }

  store.dispatch({
    'type': 'Proxy servers: set',
    'data': makeProxyServersMap( proxyServers ),
    noStorage
  });

  store.dispatch({
    'type': 'Proxy domains: set',
    'data': {
      'free': object.domains.free,
      'premium': object.domains.premium
    }
  });

  store.dispatch({
    'type': 'Timezones: set',
    'data': timezones,
    noStorage
  });

  store.dispatch({
    'type': 'Recommended countries: set',
    'data': object.recommended_countries,
    noStorage
  });
};
