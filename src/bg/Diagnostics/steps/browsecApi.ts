/* global DiagnosticsStepState */
import config from 'config';
import proxy from 'proxy';
import storage from 'storage';
import store from 'store';
import { domainsRequest } from 'bg/utils';


type BrowsecApiExtra = {
  'error'?: string,
  'state': 'error' | 'skip' | 'success' | 'warning',
  'url': string,
};


/** Check Browsec API availability without proxy
@function */
export default async(): Promise<DiagnosticsStepState> /* if true -> all is good */ => {
  const testUrls: string[] =
    await storage.get( 'availableServerList' )
    || config.apiServerUrls.map( item => item + 'v1' );
  if( !testUrls.some( url => url.includes( '/browsec.com/' ) ) ) {
    testUrls.push( 'https://browsec.com/api/v1' );
  }

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

  const requests = { 'success': 0, 'total': 0 };

  // Make ajax requests
  let errors: string[] = [];
  const states: BrowsecApiExtra[] = [];
  let success = false;
  
  for( const testUrl of testUrls ) {
    const state = await domainsRequest( [ testUrl + '/servers' ] );

    {
      const { errors } = state;

      const output: BrowsecApiExtra = {
        'state': state.state,
        'url': testUrl,
      };
      if( errors && errors.length ) {
        output.error = errors[ 0 ];
      }

      states.push( output );
    }

    if( state.requests?.success ) success = true;

    requests.success += state.requests?.success || 0;
    requests.total += state.requests?.total || 0; // @ts-ignore
    Array.prototype.push.apply( errors, state.errors );
  }
  errors = Array.from( new Set( errors ) );
  

  // Set old proxy state
  await proxy.set( lowLevelPac );

  // Return test result
  const state = success ? 'success' : 'error';
  const output: DiagnosticsStepState = {
    'name': 'browsecApi',
    errors,
    'extra': states,
    requests,
    state,
  };

  return output;
};
