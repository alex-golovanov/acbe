/* global Credentials, SiteFilter, UserPac */
import alarms from 'alarms';
import affectAjaxUserProperties from './affectAjaxUserProperties';
import config from 'config';
import log from 'log';
import onStartAction from 'bg/onStartAction';
import removeWrongFilters from './removeWrongFilters';
import storage from 'storage';
import store from 'store';
import userProperties from 'userProperties';

const { _ } = self;


const delay: integer = 10 * 60 * 1000;


/** @function */
const logFilters = ( pre?: string ) => {
  if( ![ 'qa', 'development' ].includes( config.type ) ) return;

  const filters: string = JSON.stringify( store.getStateSync().userPac.filters );

  if( pre ) log( '371: ' + pre, filters );
  else log( filters );
};


/** @class singleton */
const UserPropertiesObserver = new class {
  /** @method */
  async directUpdate(): Promise<void> {
    const { user } = await store.getStateAsync();
    const credentials: Credentials | undefined = user.loginData?.credentials;
    if( !credentials ) return;

    if( config.type === 'development' ) log( 'AJAX: get user properties' );
    const {
      favorites,
      promotionsBlock,
      'smartSettings': filters,
      timezoneChange,
      webrtcBlock
    } = await userProperties.get( credentials );
    if( !store.getStateSync().user.email ) return; // If user not logined -> ignore

    await affectAjaxUserProperties({
      credentials,
      'properties': {
        favorites, filters, promotionsBlock, timezoneChange, webrtcBlock
      }
    });
  }

  /** Activate observer
  @method */
  async enable(): Promise<any> {
    await storage.set( 'user properties observer', true );

    return loop();
  }

  /** Deactivate observer
  @method */
  disable(): void {
    alarms.clear( 'user properties observer' );
    storage.set( 'user properties observer', false );
  }
}();


/** @function */
const loop = async() => {
  const { user } = await store.getStateAsync();
  const credentials: Credentials | undefined = user.loginData?.credentials;
  if( !credentials ) return;

  // Not blocked
  if( config.type === 'development' ) log( 'AJAX: get user properties' );

  try {
    const {
      favorites,
      promotionsBlock,
      'smartSettings': filters,
      timezoneChange,
      webrtcBlock
    } = await userProperties.get( credentials );

    const storageValue = await storage.get( 'user properties observer' );
    if( !storageValue ) return;

    if( !store.getStateSync().user.email ) return; // If user not logined -> ignore

    return affectAjaxUserProperties({
      credentials,
      'properties': {
        favorites, filters, promotionsBlock, timezoneChange, webrtcBlock
      }
    });
  }
  finally {
    const storageValue = await storage.get( 'user properties observer' );
    if( storageValue ) {
      // Every 10 minutes fetch data from server
      alarms.createOneTime( 'user properties observer', { delay });
    }
  }
};


alarms.on( ({ name }) => {
  if( name === 'user properties observer' ) loop();
});


// On login / logout
store.onChange(
  ({ 'user': { email } }) => Boolean( email ),
  async( userLogined: boolean, oldvalue, storeState ) => {
    // Enabled only if user logined
    const promise: Promise<any> | void = userLogined
      ? UserPropertiesObserver.enable()
      : UserPropertiesObserver.disable();

    // Logout
    if( !userLogined ) {
      store.dispatch({ 'type': 'Favorites: set', 'data': [] });
      if( storeState.timezoneChange ) {
        store.dispatch({ 'type': 'Timezone change: set', 'data': false });
      }
      store.dispatch({
        'type': 'User PAC: update',
        'data': { 'filters': [] }
      });

      logFilters( 'User not logined: ' );
      // proxy.setState({ 'filters': [], 'refresh': true }).finally( () => {
      //  logFilters( 'User not logined: ' );
      // });
      return;
    }

    try {
      await promise;
    }
    catch ( error ) {}

    storeState = await store.getStateAsync();
    logFilters( 'User logined, before removing wrong filters: ' );

    removeWrongFilters({
      'filters': storeState.userPac.filters,
      'premiumUser': storeState.user.premium,
      'setProxyState': ( data: Partial<UserPac> ) => {
        store.dispatch({ 'type': 'User PAC: update', data });
      }
    });
  }
);


// On premium loose OR gain event
store.onChange(
  ({ 'user': { email, premium } }) => ({
    'logined': Boolean( email ), premium
  }),
  ( newState, oldState, storeState ) => {
    if( !newState.logined || !oldState.logined ) return; // Must be no changes in login state

    let filters: SiteFilter[] =
      _.cloneDeep( storeState.userPac.filters );

    // Premium gain
    if( newState.premium ) {
      log( 'Premium gain' );

      if( !filters.find( ({ disabled }) => disabled ) ) return;

      filters.forEach( filter => {
        if( filter.disabled ) delete filter.disabled;
      });

      store.dispatch({
        'type': 'User PAC: update',
        'data': { filters }
      });

      logFilters( 'Premium gain: ' );
      //proxy.setState({ filters }).finally( () => {
      //  logFilters( 'Premium gain: ' );
      //});
      return;
    }

    // Premium loose
    log( 'Premium loose' );

    if( filters.length <= 1 ) return;

    // For all filters except first -> set 'disabled' property to true
    filters.slice( 1 ).forEach( filter => { filter.disabled = true; });

    store.dispatch({
      'type': 'User PAC: update',
      'data': { filters }
    });
    logFilters( 'Premium loose: ' );
    // proxy.setState({ filters }).finally( () => {
    //  logFilters( 'Premium loose: ' );
    //});
  }
);


onStartAction( async() => {
  storage.set( 'user properties observer', false );

  const { 'userPac': pac, user } = await store.getStateAsync();

  if( !user.email ) return; // Not logined

  try {
    await UserPropertiesObserver.enable();
  }
  catch ( error ) {
    console.error( error );
  }

  removeWrongFilters({
    'filters': pac.filters,
    'premiumUser': user.premium,
    'setProxyState': ( data: Partial<UserPac> ) => {
      store.dispatch({ 'type': 'User PAC: update', data });
    }
  });
});


export default UserPropertiesObserver;
