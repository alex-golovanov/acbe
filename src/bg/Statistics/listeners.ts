import alarms from 'alarms';
import Browser from 'crossbrowser-webextension';
import Counters from 'bg/Counters';
import store from 'store';
import { Statistics } from './index';
import onStartAction from 'bg/onStartAction';


export default ( Statistics: Statistics ) => {
  // Setup of language
  Statistics.set(
    'language', Browser.i18n.getUILanguage().slice( 0, 2 ).toLowerCase()
  );

  // Save location country changes
  Counters.addListener( 'country changes', ( value: integer ) => {
    Statistics.set( 'countryChanges', value );
  });

  // Number of clicks on browser icon
  Counters.addListener( 'icon clicks', ( value: integer ) => {
    Statistics.set( 'iconClicks', value );
  });

  // Count of transitions to locations page
  Counters.addListener( 'popup: location page shows', ( value: integer ) => {
    Statistics.set( 'locationPageShows', value );
  });

  // Count of Proxy OFF to ON
  Counters.addListener( 'popup: proxy on', ( value: integer ) => {
    Statistics.set( 'proxyOn', value );
  });

  // Count of successfully loaded proxied pages.
  Counters.addListener( 'proxied pages', ( value: integer ) => {
    Statistics.set( 'proxiedPages', value );
  });

  // Count of proxy.onError errors
  Counters.addListener( 'proxy errors', ( value: integer ) => {
    Statistics.set( 'proxyErrors', value );
  });

  // How much times user successfully logined
  Counters.addListener( 'user login', ( value: integer ) => {
    Statistics.set( 'userLoginCount', value );
  });


  // Integer count of full days from installation to removal
  /** @function */
  const loop = async() => {
    const installDate = await Statistics.get( 'installDate' );
    if( !installDate ) return;

    let days = Math.floor(
      ( Date.now() - installDate ) / ( 24 * 3600 * 1000 )
    );
    if( days < 0 ) days = 0;

    Statistics.set( 'daysLive', days );
  };


  onStartAction( () => {
    alarms.createCycle( 'Statistics', {
      'delay': 30 * 1000,
      'periodInMinutes': 60
    });
  });


  alarms.on( ({ name }) => {
    if( name === 'Statistics' ) loop();
  });


  // Is user logined?
  store.onChange(
    ({ 'user': { email } }) => Boolean( email ),
    logined => {
      Statistics.set( 'userLogined', logined );
    }
  );
};
