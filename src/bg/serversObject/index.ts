/* global RawServersObject, Credentials */
import ajaxes from 'ajaxes';
import alarms from 'alarms';
import availableServer from 'availableServer';
import DelayRecord from 'DelayRecord';
import dispatchChanges from 'tools/proxyServersDispatchChanges';
import ga from 'ga';
import log from 'log';
import lowLevelPac from 'lowLevelPac';
import onStartAction from 'bg/onStartAction';
import proxy from 'proxy';
import serversList from 'servers.json';
import storage from 'storage';
import store from 'store';
import timemarks from 'bg/timemarks';
import validateServersObject from './validateServersObject';

const { _ } = self;


const timeout = Object.freeze({
  'retry': 5 * 60 * 1000,
  'refreshFree': 6 * 3600 * 1000,
  'refreshPremium': 3600 * 1000
});
const disableUpdate: boolean = false; // NOTE Used only for developer purposes
const alarmName = 'server list update';


/** @function */
const getDataAndUpdateServers = async() => {
  const oldServers = await storage.get( 'serversObject' ) || serversList;

  // Not validated object
  let servers: RawServersObject = await new Promise( async( resolve, reject ) => {
    setTimeout( () => {
      reject( new Error( 'ajaxes.servers: timeout 15 seconds reached' ) );
    }, 15 * 1000 );

    const { user } = await store.getStateAsync();
    const credentials: Credentials | undefined = user.loginData?.credentials;

    ajaxes.servers({ credentials }).then(
      servers => { resolve( servers ); },
      error => { reject( error ); }
    );
  });

  // Validate servers object
  servers = validateServersObject( servers );

  log( '[serversObject] servers received and validated' )

  { // Store authorization domains
    const storageDomains: string[] =
      await storage.get( 'onAuthRequired domains' ) || [];

    const domains = new Set( storageDomains );

    for( const domain of servers.domains.premium ) {
      domains.add( domain );
    }

    storage.set( 'onAuthRequired domains', Array.from( domains ) );
  }

  storage.set( 'serversObject', servers );

  timemarks.set( 'servers' );

  dispatchChanges({ 'object': servers, store });

  // Update proxy settings if server list changed
  if( !_.isEqual( servers, oldServers ) ) {
    try {
      await proxy.setFromStore();
    }
    catch ( x ) {
      throw new Error(
        'Server list update: failed to update proxy settings'
      );
    }
  }
};


/** @function */
const loopAction = async(): Promise<void> => {
  log( '[serversObject] loopAction' );

  try {
    const oldServers = await storage.get( 'serversObject' ) || serversList;
    // let { 'servers': oldServers } = await store.getStateAsync();

    let servers: RawServersObject;
    const timer = new DelayRecord( 'Server list' );

    const { user } = await store.getStateAsync();
    const credentials: Credentials | undefined = user.loginData?.credentials;

    await availableServer.initialRequestComplete;

    try {
      // Not validated object
      servers = await ajaxes.servers({ credentials });
    }
    catch ( originalError ) {
      let { message, status } = originalError;

      let error: Object = { status, 'error': message };

      log.error( 'ajaxes.servers', error );
      ga.partial({
        'category': 'error',
        'action': 'browsec.servers',
        'label': JSON.stringify( error )
      });

      throw originalError;
    }
    finally {
      timer.end();
    }

    // Validate servers object
    servers = validateServersObject( servers );

    { // Store authorization domains
      const storageDomains: string[] =
        await storage.get( 'onAuthRequired domains' ) || [];

      const domains = new Set( storageDomains );

      for( const domain of servers.domains.premium ) {
        domains.add( domain );
      }

      storage.set( 'onAuthRequired domains', Array.from( domains ) );
    }

    storage.set( 'serversObject', servers );

    timemarks.set( 'servers' );

    dispatchChanges({ 'object': servers, store });


    // Update proxy settings if server list changed
    if( !_.isEqual( servers, oldServers ) ) {
      try {
        await lowLevelPac.shuffle();
        await proxy.setFromStore();
      }
      catch ( x ) {
        throw new Error(
          'Server list update: failed to update proxy settings'
        );
      }
    }

    alarms.clear( alarmName );
    alarms.createOneTime( alarmName, {
      'delay': store.getStateSync().user.premium
        ? timeout.refreshPremium
        : timeout.refreshFree
    });
  }
  catch ( error ) {
    const minutes/*: number*/ = timeout.retry / ( 60 * 1000 );

    log.warn(
      `Server list update. Error, retrying in ${minutes} minutes`, error
    );

    alarms.clear( alarmName );
    alarms.createOneTime( alarmName, { 'delay': timeout.retry });
  }
};

store.onChange(
  ({ 'user': { premium } }) => premium,
  (premium) => {
    log( '[serversObject] premium status changed', premium )

    alarms.clear(alarmName);
    alarms.createOneTime(alarmName, {
      // instant refresh premium BC-1376 / BWS-3230
      'delay': premium ? 500 : timeout.refreshFree
    });
  }
);

onStartAction( async() => {
  if( disableUpdate ) return;

  // import from import intersection bugfix
  await new Promise( resolve => { setTimeout( resolve, 0 ); });

  const { user } = await store.getStateAsync();

  const delay = user.premium ? timeout.refreshPremium : timeout.refreshFree;
  const mark = await timemarks.get( 'servers' );
  if( !mark ) {
    loopAction();
    return;
  }

  const timePassed: integer = Date.now() - mark;
  if( timePassed < 0 || timePassed >= delay ) {
    loopAction();
    return;
  }

  alarms.createOneTime( alarmName, { 'delay': delay - timePassed });
});


alarms.on( ({ name }) => {
  if( name === alarmName ) loopAction();
});


export { getDataAndUpdateServers };
