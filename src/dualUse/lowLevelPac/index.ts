/* global HostPing, PacHost */
import adaptFiltersForPac from './adaptFiltersForPac';
import getIgnoredDomains from './getIgnoredDomains';
import { getServersArray } from './getServersArray';
import storage from 'storage';
import store from 'store';


/** @function */
const shuffle = async() => {
  const storeState = await store.getStateAsync();

  const { proxyServers, user, userPac } = storeState;

  const globalReturn = userPac.mode === 'proxy' ? userPac.country : null;

  const availableServerUrls = await storage.get( 'availableServerList' );
  const rawPings: HostPing[] = await storage.get( 'pingsRaw' ) || [];

  const premiumCountries: { [ country: string ]: string[] } = {};
  const countries: { [country: string]: string[] } = {};
  const hosts: Set<string> = new Set();

  for( const [ country, value ] of proxyServers ) {
    if (value.premium) {
      premiumCountries[country] = getServersArray(value.premium, rawPings);
    }

    const countryPrefixPorts = user.premium ? value.premium : value.free;

    if (countryPrefixPorts) {
      countries[country] = getServersArray(countryPrefixPorts, rawPings);
    }

    for (const sType of ['free', 'premium']) {
      if (value[sType]) {
        for (const { host } of value[sType]) {
          hosts.add(host);
        }
      }
    }
  }

  const ignoredDomains = getIgnoredDomains({
    availableServerUrls,
    'hosts': Array.from(hosts),
  });

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
};


export default { shuffle };
