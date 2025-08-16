import Browser from 'crossbrowser-webextension';
import config from 'config';
import Deferred from 'tools/Deferred';
import proxy from 'proxy';
import storage from 'storage';
import store from 'store';
import time from 'time';
import urlToDomain from 'tools/urlToDomain';


time.onMark(
  {
    'name': 'browsec.com mark',
    'repeatInMinutes': 12 * 60
  },
  async() => {
    const storeState = await store.getStateAsync();

    // Disable browsec country in PAC
    const lowLevelPac = Object.assign({}, storeState.lowLevelPac );
    lowLevelPac.browsecCountry = null;

    store.dispatch({
      'type': 'Browsec.com available: set',
      'data': 'checking'
    });

    await new Promise( resolve => { setTimeout( resolve, 50 ); });

    await proxy.set( lowLevelPac );

    let available = false;
    try {
      const json = await new Promise<any>( async( resolve, reject ) => {
        setTimeout( () => {
          reject( new Error( 'Browsec.com available: timeout reached' ) );
        }, 15 * 1000 );

        try {
          const response = await fetch( 'https://browsec.com/api/v1/test', { 'method': 'GET' });
          const json = await response.json();

          resolve( json );
        }
        catch ( error ) {
          reject( error );
        }
      });

      if( json && typeof json === 'object' && json.ok === true ) available = true;
    }
    catch ( x ) {}

    store.dispatch({
      'type': 'Browsec.com available: set',
      'data': available ? 'yes' : 'no'
    });
  }
);


Browser.runtime.onStartup.addListener( () => {
  storage.set( 'browsec.com availability matrix', [] );
});


const domain = urlToDomain( config.baseUrl );


const matrix = new class {
  addStack: Array<{ data: { 'id': string, 'stamp': number }, deferred: Deferred<void> }>;
  isProcessing: boolean;
  readStack: Array<Deferred<Array<{ 'id': string, 'stamp': number }>>>;
  removeStack: Array<{ id: string, deferred: Deferred<void> }>;

  constructor() {
    this.addStack = [];
    this.readStack = [];
    this.removeStack = [];

    this.isProcessing = false;
  }

  /** @method */
  async add( data: { 'id': string, 'stamp': number }) {
    const deferred = new Deferred<void>();

    this.addStack.push({ data, deferred });

    if( !this.isProcessing ) this.process();

    return deferred;
  }

  /** @method */
  async read(): Promise<Array<{ 'id': string, 'stamp': number }>> {
    const deferred = new Deferred<Array<{ 'id': string, 'stamp': number }>>();

    this.readStack.push( deferred );

    if( !this.isProcessing ) this.process();

    return deferred;
  }

  /** @method */
  async remove( id: string ) {
    const deferred = new Deferred<void>();

    this.removeStack.push({ deferred, id });

    if( !this.isProcessing ) this.process();

    return deferred;
  }

  /** @method */
  async process() {
    if( this.removeStack.length === 0 && this.addStack.length === 0 && this.readStack.length === 0 ) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;

    while( true ) {
      if( this.addStack.length > 0 ) {
        const { data, deferred } = this.addStack.shift()!;

        const matrix: Array<{ 'id': string, 'stamp': number }> =
          await storage.get( 'browsec.com availability matrix' ) || [];
        matrix.push( data );
        await storage.set( 'browsec.com availability matrix', matrix );

        deferred.resolve();
        continue;
      }

      if( this.removeStack.length > 0 ) {
        const { 'id': requestId, deferred } = this.removeStack.shift()!;

        const matrix: Array<{ 'id': string, 'stamp': number }> =
          await storage.get( 'browsec.com availability matrix' ) || [];
        await storage.set(
          'browsec.com availability matrix',
          matrix.filter( ({ id }) => id !== requestId )
        );

        deferred.resolve();
        continue;
      }

      if( this.readStack.length > 0 ) {
        const deferred = this.readStack.shift()!;

        const matrix: Array<{ 'id': string, 'stamp': number }> =
          await storage.get( 'browsec.com availability matrix' ) || [];

        deferred.resolve( matrix );
        continue;
      }

      break;
    }

    this.isProcessing = false;
  }
}();


/** @function */
const errorCase = async( requestId: string, url?: string ) => {
  if( url && new URL( url ).pathname === '/site.webmanifest' ) return;

  const matrixState = await matrix.read();
  if( !matrixState.some( ({ id }) => id === requestId ) ) return;

  await matrix.remove( requestId );

  const { browsecComAvailable } = await store.getStateAsync();
  if( browsecComAvailable !== 'yes' ) return;

  store.dispatch({
    'type': 'Browsec.com available: set',
    'data': 'no'
  });
};


Browser.webRequest.onBeforeSendHeaders.addListener(
  async( details ) => {
    const { requestId, url } = details;

    /*const base = await storage.get( 'browsec.com onBeforeSendHeaders' ) || [];
    base.push( details );
    storage.set( 'browsec.com onBeforeSendHeaders', base );*/

    const { lowLevelPac } = await store.getStateAsync();
    if( lowLevelPac.browsecCountry ) return;

    const stamp = Date.now();

    matrix.add({ 'id': requestId, stamp });

    setTimeout( () => {
      errorCase( requestId, url );
    }, 15 * 1000 );
  },
  {
    'urls': [ `https://${domain}/*` ],
    'types': [ 'main_frame', 'ping', 'sub_frame', 'xmlhttprequest', 'other' ]
  }
);

Browser.webRequest.onCompleted.addListener(
  async( details ) => {
    const { requestId } = details;

    /*const base = await storage.get( 'browsec.com onCompleted' ) || [];
    base.push( details );
    storage.set( 'browsec.com onCompleted', base );*/

    matrix.remove( requestId );
  },
  {
    'urls': [ `https://${domain}/*` ],
    'types': [ 'main_frame', 'ping', 'sub_frame', 'xmlhttprequest', 'other' ]
  }
);

const possibleErrors = [
  'net::ERR_ABORTED',
  'net::ERR_CACHE_MISS',
  'NS_BINDING_ABORTED',
  'NS_ERROR_ABORT',
  'NS_ERROR_NOT_AVAILABLE'
];

Browser.webRequest.onErrorOccurred.addListener(
  async({ 'error': text, requestId, url }) => {
    if( possibleErrors.includes( text ) ) {
      matrix.remove( requestId );
      return;
    }

    errorCase( requestId, url );
  },
  {
    'urls': [ `https://${domain}/*` ],
    'types': [ 'main_frame', 'ping', 'sub_frame', 'xmlhttprequest', 'other' ]
  }
);


// Change of browsecComAvailable leads to actual proxy change
store.onChange(
  ({ browsecComAvailable }) => browsecComAvailable,
  ( browsecComAvailable, x, storeState ) => {
    const available = browsecComAvailable === 'yes';
    const loweLevelPacAvailable = !storeState.lowLevelPac.browsecCountry;
    if( available === loweLevelPacAvailable ) return;

    store.dispatch({
      'type': 'Low level PAC: update',
      'data': {
        'browsecCountry': !available ? ( storeState.dynamicConfig.browsecCountry || 'fi' ) : null
      }
    });
  }
);
