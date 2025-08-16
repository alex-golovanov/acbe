/* global Credentials, SiteFilter */
import ajaxes from 'ajaxes';
import Deferred from 'tools/Deferred';
import store from 'store';


type SmartSettingAction = {
  'type': 'get',
  'credentials': Credentials,
} | {
  'type': 'save smart settings',
  'credentials': Credentials,
  'filters': SiteFilter[],
} | {
  'type': 'save promotions block',
  'credentials': Credentials,
  'promotionsBlock': boolean,
};

type SmartSettingDeferred = SmartSettingAction & {
  'break'?: () => any,
  'complete'?: true,
  'deferred': Deferred<any>
};


const bgRequest: boolean = location.href.includes( 'background' );
let inAction = false;
const queue: SmartSettingDeferred[] = [];


if( bgRequest ) { // Only logout
  setTimeout( () => {
    store.onChange(
      ({ user }) => Boolean( user.email ),
      ( userIsLogined, x, storeState ) => {
        if( userIsLogined ) return;
    
        // Break every active ajax
        for( const action of queue ) {
          if( action.complete ) continue;
          action.break?.();
        }
    
        // Clear queue
        queue.splice( 0, queue.length );
      }
    );
  }, 0 );
}


/** @function */
const makeAjax = ( action: SmartSettingDeferred ) => {
  const { credentials } = action;
  
  /** @function */
  const request = () => {
    if( action.type === 'get' ) {
      return ajaxes.getUserProperties( credentials );
    }
    else if( action.type === 'save promotions block' ) {
      return ajaxes.setPromotionsBlock({
        credentials, 'promotionsBlock': action.promotionsBlock
      });
    }
    else if( action.type === 'save smart settings' ) {
      return ajaxes.setSmartSettings({
        credentials, 'filters': action.filters
      });
    }
  };

  let tryCount: integer = 0;
  let broken = false;

  const promise = new Promise( ( resolve, reject ) => {
    const loop = async() => {
      if( broken ) return;

      try {
        const output = await request();
        resolve( output );
      }
      catch ( error ) {
        if( error.message === 'Unathorized user' ) {
          reject( error );
          return;
        }

        tryCount++;
        if( tryCount > 20 ) {
          reject( error );
          return;
        }

        const timeout = ( () => {
          if( tryCount <= 5 ) return 10000;

          return ( tryCount - 4 ) * 10000;
        })();
        await new Promise( resolve => { setTimeout( resolve, timeout ); });

        loop();
      }
    };
    loop(); // Initial
  });

  return {
    'break': () => { broken = true; },
    promise
  };
};

/** @function */
const activateLoop = async() => {
  inAction = true;

  for( const action of queue ) {
    const { promise, 'break': breakFunction } =
      makeAjax( action );
    action.break = breakFunction;

    try {
      const output = await promise;
      action.deferred.resolve( output );
    }
    catch ( error ) {
      action.deferred.reject( error );
    }
    action.complete = true;
  };

  // Clear queue
  queue.splice( 0, queue.length );

  inAction = false;
};

/** @function */
const makeAction = ( action: SmartSettingAction ) => {
  const deferred = new Deferred();

  queue.push( Object.assign({}, action, { deferred }) );

  if( !inAction ) activateLoop();

  return deferred;
};


export default {
  /** @method */
  get( credentials: Credentials ) {
    return makeAction({ 'type': 'get', credentials }) as Deferred<{
      'favorites': string[],
      'promotionsBlock': boolean,
      'smartSettings': SiteFilter[],
      'timezoneChange': boolean,
      'webrtcBlock': boolean | null
    }>;
  },

  /** @method */
  savePromotionsBlock({ credentials, promotionsBlock }: {
    'credentials': Credentials, 'promotionsBlock': boolean
  }) {
    return makeAction({
      'type': 'save promotions block', credentials, promotionsBlock
    }) as Deferred<undefined>;
  },

  /** @method */
  saveSmartSettings({ credentials, filters }: {
    'credentials': Credentials, 'filters': SiteFilter[]
  }) {
    return makeAction({
      'type': 'save smart settings', credentials, filters
    }) as Deferred<undefined>;
  }
};
