/* global Credentials, SiteFilter */
import storage from 'storage';
import store from 'store';
import userProperties from 'userProperties';

const { _ } = self;


/** @function */
export default async(
  {
    credentials,
    'properties': {
      favorites, filters, promotionsBlock, timezoneChange, webrtcBlock
    }
  }: {
    'credentials': Credentials,
    'properties': {
      'favorites': string[],
      'filters': SiteFilter[],
      'promotionsBlock': boolean,
      'timezoneChange': boolean,
      'webrtcBlock': boolean | null
    }
  }
) => {
  // Migration and validation
  let condition = filters.some( // @ts-ignore
    item => typeof item?.domain === 'string'
  );
  if( condition ) { // Migration
    // @ts-ignore
    filters = filters
      .filter( item => _.isObject( item ) ) // @ts-ignore
      .map( ({ country, domain, format, value, proxyMode }) => {
        if( typeof domain === 'string' ) {
          return {
            country,
            'format': 'domain',
            'value': domain,
            proxyMode
          };
        }
        
        return { country, format, value, proxyMode };
      });
  };

  // Filters validation
  filters = filters
    .filter( item => (
      _.isObject( item )
      && typeof item.country === 'string'
      && [ 'domain', 'full domain', 'regex' ].includes( item.format )
      && typeof item.proxyMode === 'boolean'
      && typeof item.value === 'string'
    ) )
    .map( item => {
      if( item.format === 'regex' ) item.value = new RegExp( item.value );

      return item;
    });

  let state = store.getStateSync();

  if( typeof promotionsBlock !== 'boolean' ) {
    promotionsBlock = ( storage as any ).promotionsBlock || false;
    userProperties.savePromotionsBlock({ credentials, promotionsBlock });
  }

  let oldFavorites/*: string[]*/ = state.favorites;
  let oldFilters/*: SiteFilter[]*/ = state.userPac.filters;
  let oldPromotionsBlock/*: boolean*/ = state.promotionsBlock;
  let oldTimezoneChange/*: boolean*/ = state.timezoneChange;
  let oldWebrtcBlock/*: boolean | null*/ = state.webrtcBlock;

  // Update favorites
  if( !_.isEqual( oldFavorites, favorites ) ) {
    store.dispatch({ 'type': 'Favorites: set', 'data': favorites });
  }

  // Update promotions blocking
  if( oldPromotionsBlock !== promotionsBlock ) {
    store.dispatch({ 'type': 'Promotions block: set', 'data': promotionsBlock });
  }

  // Update timezone change
  if( oldTimezoneChange !== timezoneChange ) {
    store.dispatch({ 'type': 'Timezone change: set', 'data': timezoneChange });
  }

  // Update WebRTC blocking
  if( webrtcBlock !== null && oldWebrtcBlock !== webrtcBlock ) {
    store.dispatch({ 'type': 'WebRTC blocking: set', 'data': webrtcBlock });
  }

  // Update site filters
  if( _.isEqual( oldFilters, filters ) ) return; // No changes

  store.dispatch({
    'type': 'User PAC: update',
    'data': { filters }
  });
};
