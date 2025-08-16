/* global NodeJS */

let firstEventLoopTask: boolean = true;

setTimeout( () => {
  firstEventLoopTask = false;
}, 0 );

export default (
  alarmsObject?: any
) => {
  const alarmsPermission = Boolean( alarmsObject );

  let alarms: Array<{
    'name': string,
    'periodInMinutes'?: number,
    'timeoutId'?: NodeJS.Timeout,
    'when'?: number
  }> = [];
  let listeners: Array<( arg: { 'name': string }) => any> = [];


  /** @function */
  const callListeners = ( name: string ) => {
    listeners.forEach( listener => { listener({ name }); });
  };

  /** @function */
  const create = (
    name: string,
    { when, periodInMinutes }: { 'when'?: number, 'periodInMinutes'?: number }
  ) => {
    if( alarmsPermission ) {
      return alarmsObject.create( name, { when, periodInMinutes });
    }

    const object: {
      'name': string,
      'periodInMinutes'?: number,
      'timeoutId'?: NodeJS.Timeout,
      'when'?: number
    } = { name, when, periodInMinutes };

    const startDelay = ( () => {
      if( typeof when === 'number' ) return when - Date.now();
      if( typeof periodInMinutes === 'number' ) {
        return periodInMinutes * 60 * 1000;
      }
      
      throw new Error( 'Both "when" and "periodInMinutes" are not specified' );
    })();

    object.timeoutId = setTimeout( () => {
      callListeners( name );
      if( !periodInMinutes ) return;

      /** @function */
      const loop = () => {
        callListeners( name );
        object.timeoutId = setTimeout( loop, periodInMinutes * 60 * 1000 );
      };
      object.timeoutId = setTimeout( loop, periodInMinutes * 60 * 1000 );
    }, startDelay );

    // Remove alarm with same name (as in specification of original alarm https://developer.chrome.com/docs/extensions/reference/alarms/#method-create )
    const index = alarms.findIndex( item => item.name === name );
    if( index !== -1 ) alarms.splice( index, 1 );

    alarms.push( object );
  };


  return {
    /** @method */
    'clear': async( name: string ): Promise<boolean> => {
      if( alarmsPermission ) return alarmsObject.clear( name );

      // Clear timeouts
      for( const { 'name': alarmName, timeoutId } of alarms ) {
        if( alarmName === name && timeoutId ) clearTimeout( timeoutId );
      }

      // Remove alarm itself
      const oldArray = alarms.slice();
      alarms = alarms.filter( item => item.name !== name );

      return oldArray.length !== alarms.length;
    },

    /** @method */
    'createOneTime': (
      name: string,
      { delay }: { 'delay': number }
    ): void => {
      create( name, { 'when': Date.now() + delay });
    },

    /** @method */
    'createCycle': (
      name: string,
      {
        delay,
        periodInMinutes
      }: {
        'delay'?: number, // in ms
        'periodInMinutes': number
      }
    ): void => {
      create(
        name,
        typeof delay === 'number'
          ? { 'when': Date.now() + delay, periodInMinutes }
          : { periodInMinutes }
      );
    },

    /** @method */
    'hasAlarm': async( name: string ): Promise<boolean> => {
      if( alarmsPermission ) {
        const alarm = await alarmsObject.get( name );
        return Boolean( alarm );
      }

      return alarms.some( item => item.name === name );
    },

    /** @method */
    'on': ( listener: ( arg: { 'name': string }) => any ) => {
      if( !firstEventLoopTask ) {
        throw new Error( 'Alarms.on called after first event loop task' );
      }

      if( alarmsPermission ) {
        alarmsObject.onAlarm.addListener( listener );
        return;
      }

      listeners.push( listener );
    },

    /** @method */
    'off': ( listener: ( arg: { 'name': string }) => any ) => {
      if( alarmsPermission ) {
        alarmsObject.onAlarm.removeListener( listener );
        return;
      }
      
      listeners = listeners.filter( item => item !== listener );
    },

    /** @method */
    'hasListener': ( listener: ( arg: { 'name': string }) => any ): boolean => {
      if( alarmsPermission ) {
        return alarmsObject.onAlarm.hasListener( listener );
      }
      
      return listeners.includes( listener );
    }
  };
};
