/* global HostPing, PacHost */
import adaptFiltersForPac from './adaptFiltersForPac';
import config from 'config';
import getIgnoredDomains from './getIgnoredDomains';
import { getServersArray } from './getServersArray';
import proxy from 'proxy';
import storage from 'storage';
import store from 'store';

const { _ } = self;


// const bgRequest: boolean = location.href.includes( 'background' );

export default () => {
  // High level change leads to low level change
  store.onChange(
    ({ proxyServers, userPac, dynamicConfig }) => ({
      proxyServers, userPac, dynamicConfig
    }),
    async( x, xx, storeState ) => {
      const { proxyServers, user, userPac } = storeState;

      const globalReturn = userPac.mode === 'proxy' ? userPac.country : null;

      const availableServerUrls =
        await storage.get( 'availableServerList' )
        || config.apiServerUrls.map( item => item + 'v1' );
      const rawPings: HostPing[] = await storage.get( 'pingsRaw' ) || [];

      const servers: Map<string, PacHost[]> = new Map();
      const premiumCountries: { [ country: string ]: string[] } = {};

      for( const [ country, value ] of proxyServers ) {
        if( value.premium ) {
          const hosts: PacHost[] = [];

          for( const { host, port } of value.premium ) {
            hosts.push({ host, port });
          }

          premiumCountries[ country ] = getServersArray( hosts, rawPings );
        }

        const countryPrefixPorts = user.premium ? value.premium : value.free;

        if( !countryPrefixPorts ) continue;

        const hosts: PacHost[] = [];

        for( const { host, port } of countryPrefixPorts ) {
          hosts.push({ host, port });
        }

        servers.set( country, hosts );
      }

      const ignoredDomains = getIgnoredDomains({
        availableServerUrls,
        'hosts': Array.from( servers.values() ).flat().map( ({ host }) => host ),
      });

      const countries: { [ country: string ]: string[] } = {};
      for( const [ country, server ] of servers ) {
        countries[ country ] = getServersArray( server, rawPings ); // getServerString( server, rawPings );
      }

      const siteFilters = adaptFiltersForPac({
        'countries': Object.keys( countries ),
        'defaultCountry': 'fi',
        'filters': userPac.filters
      });

      store.dispatch({
        'type': 'Low level PAC: update',
        'data': {
          countries,
          globalReturn,
          ignoredDomains,
          premiumCountries,
          siteFilters
        }
      });
    }
  );


  // Low level change affects everything
  store.onChange(
    ({ lowLevelPac }) => lowLevelPac,
    ( lowLevelPac ) => {
      proxy.set( lowLevelPac );
    }
  );


  // Change of availableServerList leads to change of ignored domains
  storage.onChange({
    'for': [ 'availableServerList' ],
    'do': async( storageData: Record<string, any> ) => {
      const storeState = await store.getStateAsync();

      const availableServerUrls = storageData.availableServerList;

      const hosts: string[] = [];

      for( const [ , value ] of storeState.proxyServers ) {
        const countryPrefixPorts = storeState.user.premium ? value.premium : value.free;

        if( !countryPrefixPorts ) continue;

        for( const { host } of countryPrefixPorts ) {
          hosts.push( host );
        }
      }

      const ignoredDomains = getIgnoredDomains({
        availableServerUrls,
        hosts,
      });

      if( _.isEqual( storeState.lowLevelPac.ignoredDomains, ignoredDomains ) ) return;

      store.dispatch({
        'type': 'Low level PAC: update',
        'data': { ignoredDomains }
      });
    }
  });
};
