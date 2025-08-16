/* global DiagnosticsStepState */
import getIgnoredDomains from './getIgnoredDomains';
import getUtcDateInSqlFormat from 'tools/getUtcDateInSqlFormat';
import proxy from 'proxy';
import store from 'store';
import { domainsRequest } from 'bg/utils';
import { getDefaultCountry } from 'tools/getDefaultCountry';


const domains = Object.freeze(
  [ 'http://example.com', 'http://www.root-servers.org/' ]
);

/** Check HTTP connection under proxy
@function */
export default async(): Promise<DiagnosticsStepState> => {
  if( typeof browser !== 'undefined' ) {
    return {
      'name': 'httpProxyConnection',
      'state': 'skip'
    };
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

  // Simulate mock - antivirus error
  // const state = {"errors":["Browser external error |499| for domain http://example.com?_=496454195: Request has been forbidden by antivirus","Browser external error |499| for domain http://www.root-servers.org/?_=250537243: Request has been forbidden by antivirus"],"requests":{"total":2,"success":0},"state":"error","name":"httpProxyConnection","servers":["fi14.prmsrvs.com:471","fi5.prmsrvs.com:471","fi11.prmsrvs.com:471","fi2.prmsrvs.com:471","fi3.prmsrvs.com:471","fi10.prmsrvs.com:471","fi1.prmsrvs.com:471","fi13.prmsrvs.com:471","fi4.prmsrvs.com:471","fi6.prmsrvs.com:471"],"utcTime":"2024-06-03 08:42:33"}

  // Set old proxy state
  await proxy.set( lowLevelPac );

  // Return test result
  return Object.assign(
    state,
    { 'name': 'httpProxyConnection', servers, utcTime }
  );
};
