import alarms from 'alarms';
import availableServer from 'availableServer';
import getRatings from './getRatings';
import lowLevelPac from 'lowLevelPac';
import onStartAction from 'bg/onStartAction';
import proxy from 'proxy';
import store from 'store';
import timemarks from 'bg/timemarks';
import { type as configType } from 'config';


const refreshTimeout/*: integer*/ = [ 'qa', 'qa2' ].includes( configType )
  ? 5 * 60 * 1000 // 5 minutes
  : 48 * 3600 * 1000; // 2 days


/** @function */
const loop = async () => {
  await getRatings();

  timemarks.set( 'ping' );

  alarms.clear( 'ping' );
  alarms.createOneTime( 'ping', { 'delay': refreshTimeout });
};


onStartAction( async() => {
  await availableServer.initialRequestComplete;
  await timemarks.waitTimestamp( 'servers' );

  const mark: integer | undefined = await timemarks.get( 'ping' );

  if( !mark ) {
    loop();
    return;
  }

  const timePassed: number =
    Date.now() - mark + ( 2 * Math.random() - 1 ) * 0.125 * refreshTimeout;
  if( timePassed < 0 || timePassed >= refreshTimeout ) {
    loop();
    return;
  }

  alarms.createOneTime( 'ping', { 'delay': refreshTimeout - timePassed });
});


alarms.on( ({ name }) => {
  if( name === 'ping' ) loop();
});


// Change proxy at each ping update
store.onChange(
  ({ ping }) => ping,
  async() => {
    await lowLevelPac.shuffle();
    await proxy.setFromStore();
  }
);
