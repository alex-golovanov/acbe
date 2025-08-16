import alarms from 'alarms';
import Browser from 'crossbrowser-webextension';
import storage from 'storage';


type TimeOptions = {
  'name': string,
  'startDelayInMs'?: number,
  'repeatInMinutes'?: integer
};

const manifestVersion = chrome.runtime.getManifest().manifest_version;

/** @function */
const onStartAction = ( action: ( ...args: any[] ) => any ) => {
  if( manifestVersion === 2 ) action();
  else {
    Browser.runtime.onInstalled.addListener( action );
    Browser.runtime.onStartup.addListener( action );
  }
};


let started: boolean = false;
setTimeout( () => { started = true; }, 0 );

const names: Set<string> = new Set();


/** @function */
const onMark = async(
  { name, repeatInMinutes }: {
    'name': string,
    'repeatInMinutes': integer
  },
  action: ( ...args: any[] ) => any
) => {
  if( started ) throw new Error( 'time.onMark called after first event loop' );

  if( names.has( name ) ) {
    throw new Error( `time.onMark: duplicate entry with name "${name}"` );
  }
  names.add( name );


  alarms.on( ( alarmInfo ) => {
    if( alarmInfo.name === name ) action();
  });

  onStartAction( async() => {
    const mark: integer | undefined = await storage.get( 'timemark: ' + name );

    if( !mark ) {
      action();
      storage.set( 'timemark: ' + name, Date.now() );
        
      alarms.createCycle( name, { 'periodInMinutes': repeatInMinutes });
      return;
    }

    const timePassed: integer | void = Date.now() - mark;

    if( timePassed < 0 || timePassed >= repeatInMinutes * 60 * 1000 ) {
      action();
      storage.set( 'timemark: ' + name, Date.now() );
      
      alarms.createCycle( name, { 'periodInMinutes': repeatInMinutes });
    }
    else {
      alarms.createCycle( name, {
        'delay': repeatInMinutes * 60 * 1000 - timePassed,
        'periodInMinutes': repeatInMinutes
      });
    }
  });
};


/** @function */
const onStart = (
  options: TimeOptions,
  action: ( ...args: any[] ) => any
) => {
  if( started ) throw new Error( 'time.onStart called after first event loop' );

  const { name, repeatInMinutes } = options;
  if( names.has( name ) ) {
    throw new Error( `time.onStart: duplicate entry with name "${name}"` );
  }
  names.add( name );

  let { startDelayInMs } = options;

  if( typeof startDelayInMs !== 'number' && !repeatInMinutes ) {
    throw new Error(
      'Both startDelayInMs and repeatInMinutes are not specified'
    );
  }

  if( typeof startDelayInMs !== 'number' ) {
    startDelayInMs = ( repeatInMinutes as number ) * 60 * 1000;
  }
  if( startDelayInMs === 0 ) {
    onStartAction( action );

    if( !repeatInMinutes ) return;
    
    startDelayInMs = repeatInMinutes * 60 * 1000;
  }

  if( repeatInMinutes ) {
    alarms.createCycle(
      name,
      {
        'delay': startDelayInMs,
        'periodInMinutes': repeatInMinutes
      }
    );
  }
  else {
    alarms.createOneTime( name, { 'delay': startDelayInMs });
  }


  alarms.on( ( alarmInfo ) => {
    if( alarmInfo.name === name ) action();
  });
};

/*
/ @function /
const add = (
  { name, startDelayInMs, repeatInMinutes }: {
    'name'?: string,
    'startDelayInMs'?: number,
    'repeatInMinutes'?: integer
  },
  action
) => {
  if( !startDelayInMs && !repeatInMinutes ){
    throw new Error( 'Both startDelayInMs and repeatInMinutes are not specified' );
  }
  

};


/ @function /
const remove = ( listener ) => {

};*/


export default { onMark, onStart };
