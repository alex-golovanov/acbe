/* global DiagnosticsStepState */
import proxy from 'proxy';
import store from 'store';
import { domainsRequest } from 'bg/utils';


const domains = Object.freeze( [
  'https://example.com', 'https://www.iana.org/favicon.ico',
  'https://www.ripe.net/favicon.ico', 'https://www.mozilla.org/favicon.ico'
] );

/** Check HTTPS connection without proxy
@function */
export default async(): Promise<DiagnosticsStepState> => {
  // Save old proxy state
  const { lowLevelPac } = await store.getStateAsync();

  // Change proxy state to full direct mode
  await proxy.set({
    'browsecCountry': null,
    'countries': {},
    'globalReturn': null,
    'ignoredDomains': [],
    'premiumCountries': {},
    'siteFilters': []
  });

  // Make ajax requests
  const domainsRequestState = await domainsRequest( domains.slice() );

  // Set old proxy state and
  await proxy.set( lowLevelPac );

  // Return test result
  return Object.assign({ 'name': 'httpsConnection' }, domainsRequestState );
};
