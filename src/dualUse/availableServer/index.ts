import ajax from 'tools/ajax';
import alarms from 'alarms';
import algorithm from './algorithm';
import Browser from 'crossbrowser-webextension';
import config from 'config';
import jitsu from 'jitsu';
import log from 'log';
import proxy from 'proxy';
import requestServersList from './serverList/request';
import storage from 'storage';
import store from 'store';
import timemarks from 'bg/timemarks';
import urlToDomain from 'tools/urlToDomain';

const { _ } = self;


const refreshDelay: integer = 24 * 3600 * 1000; // 1 day
const testUrl: string = '/test';


const bgRequest: boolean = location.href.includes( 'background' );
const manifestVersion = chrome.runtime.getManifest().manifest_version;


/** @function */
const onStartAction = ( action: ( ...args: any[] ) => any ) => {
  if( manifestVersion === 2 ) {
    action();
    return;
  }

  Browser.runtime.onInstalled.addListener( action );
  Browser.runtime.onStartup.addListener( action );
};


type LoopFunction =
  ( () => Promise<string[]> ) &
  {
    '_activePromise'?: Promise<string[]>
  };

/** @function */
const loop: LoopFunction = async() => {
  if( loop._activePromise ) return loop._activePromise;

  const storeState = await store.getStateAsync();

  // Set PAC to ignore root domain
  const lowLevelPac = _.cloneDeep( storeState.lowLevelPac );
  lowLevelPac.ignoredDomains.push( urlToDomain( config.rootUrl ) as string );

  proxy.set( lowLevelPac );

  const promise = ( async() => {
    const newServers: string[] = await requestServersList();
    const oldServers: string[] | undefined =
      await storage.get( 'availableServerList' );

    if( !_.isEqual( oldServers, newServers ) ) {
      await storage.set( 'availableServerList', newServers );
    }

    return newServers;
  })();
  loop._activePromise = promise;

  try {
    const newServers = await promise;

    // Restore PAC
    proxy.setFromStore();

    delete loop._activePromise;

    return newServers;
  }
  catch ( error ) {
    // Restore PAC
    proxy.setFromStore();

    delete loop._activePromise;

    throw error;
  }
};


if( bgRequest ) {
  onStartAction( () => {
    loop(); // Initial

    alarms.createCycle( 'available server: list', { 'periodInMinutes': 4 * 60 });
  });

  alarms.on( ({ name }) => {
    if( name === 'available server: list' ) loop( );
  });
}


class AvailableServerClass { // @ts-ignore
  _activePromise: Promise<string>; // used to block 2 parallel requests
  _processed: boolean;
  initialRequestComplete: Promise<void>;

  // Called during first event task loop
  constructor() {
    this._generatePromise = this._generatePromise.bind( this );

    alarms.on( ({ name }) => {
      if( name !== 'available server: generate promise' ) return;
      this._generatePromise({ 'looped': true });
    });


    this._processed = false;

    this.initialRequestComplete = ( async() => {
      const mark = await timemarks.get( 'available server' );

      // on install
      if( !mark ) {
        await new Promise<void>( async( resolve ) => {
          setTimeout( () => { resolve(); }, 15000 );

          try {
            await loop();
          }
          catch ( x ) {}

          resolve();
        });

        try {
          await loop();
        }
        catch ( x ) {}

        await this._generatePromise({ 'looped': true });
        return;
      }

      const timePassed: integer = Date.now() - mark;
      if( timePassed < 0 || timePassed >= refreshDelay ) {
        await this._generatePromise({ 'looped': true });
        return;
      }

      alarms.createOneTime( 'available server: generate promise', {
        'delay': refreshDelay - timePassed
      });
    })();
  }

  /** @method */
  async _generatePromise(
    { looped = false }: { 'looped'?: boolean } = {}
  ): Promise<string> {
    if( config.type === 'development' ) {
      log( 'AJAX: /test' );
    }

    this._processed = true;

    const servers: string[] =
      await storage.get( 'availableServerList' )
      || config.apiServerUrls.map( item => item + 'v1' );

    //const controller = typeof AbortController === 'function'
    //  ? new AbortController()
    //  : undefined;

    const ajaxesData = servers.map( async( server ) => {
      const url = server + testUrl;

      const options: any = {
        'dataType': 'json',
        'headers': {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        },
        'method': 'GET'
      };
      //if( controller ) options.signal = controller.signal;

      const ajaxPromise = ajax( url, options );

      // Check API is alive
      ( async() => {
        const success = await new Promise( async( resolve, reject ) => {
          setTimeout( () => {
            reject( new Error( 'Timeout reached' ) );
          }, 15 * 1000 );

          ajaxPromise.then(
            data => {
              if( data?.ok !== true ) {
                reject(
                  new Error( 'Server test request: incorrect request return' )
                );
                return;
              }

              resolve( data );
            },
            ( error ) => {
              reject( error );
            }
          );
        }).then( () => '1', () => '0' );

        const checkUrl = ( () => {
          const urlObject = new URL( url );
          return `${urlObject.protocol}//${urlObject.hostname}/`;
        })();

        if( looped ) {
          jitsu.track( 'api_test', { 'base_url': checkUrl, success });
        }
      })();

      const data: any = await ajaxPromise;

      if( data?.ok === true ) return;
      throw new Error( 'Server test request: incorrect request return' );
    });

    const activePromise = ( async() => {
      const index: integer = await algorithm( ajaxesData );
      await storage.set( 'available server current server', servers[ index ] );

      return servers[ index ];
    })();
    this._activePromise = activePromise;

    activePromise.then( () => {
      timemarks.set( 'available server' );
      this._processed = false;

      //controller?.abort?.();

      alarms.createOneTime( 'available server: generate promise', {
        'delay': refreshDelay
      });
    });

    return activePromise;
  }

  /** @method */
  async getServer(): Promise<string> {
    const { browsecComAvailable } = await store.getStateAsync();
    if( browsecComAvailable === 'yes' ) return config.baseUrl + '/api/v1/';

    const {
      'availableServerList': list,
      'available server current server': currentServer
    } = await Browser.storage.local.get(
      [ 'availableServerList', 'available server current server' ]
    );

    const servers: string[] =
      list || config.apiServerUrls.map( item => item + 'v1' );

    return currentServer || servers[ 0 ];
  }

  /** @method */
  refreshList(): Promise<string[]> {
    return loop();
  }

  /** @method */
  restart(): Promise<string> {
    if( this._processed ) return this._activePromise;

    return this._generatePromise();
  }
};


export default ( (
  bgRequest ? new AvailableServerClass() : {}
) as AvailableServerClass );

export { loop as getAndSaveApiDomainsList };
