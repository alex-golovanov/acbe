/* global SiteFilter */
import runtimeOnMessage from 'bg/runtime.onMessage';
import store from 'store';

const { _ } = self;


runtimeOnMessage.addListener({
  'callback': async({ 'value': domain }: { 'value': string }) => {
    const storeState = await store.getStateAsync();

    const filters: SiteFilter[] =
      _.cloneDeep( storeState.userPac.filters );

    // First disable currently enabled filter
    let filter: SiteFilter | undefined =
      filters.find( ({ disabled }) => !disabled );
    if( filter ) filter.disabled = true;

    { // Enable clicked one
      let filter: SiteFilter | undefined = filters.find(
        ({ format, value }) => format !== 'regex' && domain === value
      );
      if( filter ) delete filter.disabled; // Flow crap
    }

    store.dispatch({
      'type': 'User PAC: update',
      'data': { filters }
    });
  },
  'type': 'select disabled site filter',
  'popupOnly': true
});
