/* global DiagnosticsStepState */
import getIgnoredDomains from './getIgnoredDomains';
import getUtcDateInSqlFormat from 'tools/getUtcDateInSqlFormat';
import proxy from 'proxy';
import store from 'store';
import { domainsRequest } from 'bg/utils';
import { getDefaultCountry } from 'tools/getDefaultCountry';


const domains = Object.freeze( [
  'https://example.com', 'https://www.iana.org/favicon.ico',
  'https://www.ripe.net/favicon.ico', 'https://www.mozilla.org/favicon.ico'
] );

/** Check HTTPS connection under proxy
@function */
export default async(): Promise<DiagnosticsStepState> => {
  if( typeof browser !== 'undefined' ) {
    return { 'name': 'httpsProxyConnection', 'state': 'skip' };
  }

  // Save old proxy state
  const storeState = await store.getStateAsync();
  const { lowLevelPac, userPac } = storeState;
  const defaultCountry = await getDefaultCountry();

  const country = userPac.country || defaultCountry;

  const servers = lowLevelPac.countries[ country ].map(
    item => item.split( ' ' )[ 1 ]
  );

  const ignoredDomains = await getIgnoredDomains( storeState );

  // Change proxy state to full proxy mode
  await proxy.set({
    'browsecCountry': null,
    'countries': lowLevelPac.countries,
    'globalReturn': country,
    ignoredDomains,
    'premiumCountries': {},
    'siteFilters': []
  });

  const utcTime = getUtcDateInSqlFormat();

  // Make ajax requests
  const state = await domainsRequest( domains.slice() );

  // Set old proxy state
  await proxy.set( lowLevelPac );

  // Return test result
  return Object.assign(
    state,
    { 'name': 'httpsProxyConnection', servers, utcTime }
  );
};
