import storage from 'storage';
import store from 'store';
import time from 'time';


/** @function */
const loop = async() => {
  let timestamp: integer | undefined = await storage.get( 'daysAfterInstall' );
  if( typeof timestamp !== 'number' ) {
    const now = Date.now();
    storage.set( 'daysAfterInstall', now );

    timestamp = now;
  }

  const days: integer = Math.floor(
    ( Date.now() - timestamp ) / ( 24 * 3600 * 1000 )
  );

  const { 'daysAfterInstall': oldValue } = await store.getStateAsync();
  if( days !== oldValue ) {
    store.dispatch({ 'type': 'Days after install: set', days });
  }
};


time.onStart({
  'name': 'days after install',
  'startDelayInMs': 0,
  'repeatInMinutes': 60 // Delay between calculations of day count
}, loop );
