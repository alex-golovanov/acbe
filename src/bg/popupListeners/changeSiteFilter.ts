/* global SiteFilter */
import filtersSorting from 'tools/filtersSorting';
import ga from 'ga';
import jitsu from 'jitsu';
import runtimeOnMessage from 'bg/runtime.onMessage';
import store from 'store';

const { _ } = self;


runtimeOnMessage.addListener({
  'callback': async(
    { 'country': newCountry, domain, selectedDomain }:
    { 'country': string, 'domain': string, 'selectedDomain': string }
  ) => {
    const { userPac } = await store.getStateAsync();

    const filters: SiteFilter[] = _.cloneDeep( userPac.filters );

    ga.full({ 'action': 'smartSettingsEdit', 'category': 'smartSettings' });
    jitsu.track( 'smartSettingsEdit' );

    // Remove same domain
    let [ { country } ] = _.remove(
      filters, ({ format, value }) => selectedDomain === value
    );

    // Add new entity
    filters.push({
      'country': newCountry || country,
      'format': 'domain',
      'proxyMode': Boolean( newCountry ),
      'value': domain
    });
    filters.sort( filtersSorting );

    store.dispatch({
      'type': 'User PAC: update',
      'data': { filters }
    });
  },
  'type': 'change site filter',
  'popupOnly': true
});
