/* global DiagnosticsStepState */
import proxy from 'proxy';
import store from 'store';
import { domainsRequest } from 'bg/utils';


const domains = Object.freeze(
  [ 'http://example.com', 'http://www.root-servers.org/' ]
);

/** Check HTTP connection without proxy
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

  // Set old proxy state
  await proxy.set( lowLevelPac );

  // Return test result
  return Object.assign({ 'name': 'httpConnection' }, domainsRequestState );
};
