/* This statistics used only during extension removal. */
import Browser from 'crossbrowser-webextension';
import config from 'config';
import ga from 'ga';
import getInitialState from './getInitialState';
import listeners from './listeners';
import log from 'log';
import setUninstallURL from 'bg/runtime.setUninstallURL';
import storage from 'storage';
import urlModifyParameters from 'tools/urlModifyParameters';


const uninstallURL: string = ( () => {
  if( config.type.startsWith( 'qa' ) ) {
    return 'https://browsec-uninstall.s3.eu-central-1.amazonaws.com/test/main.html';
  }
  
  return 'http://browsec-uninstall.s3-website.eu-central-1.amazonaws.com/';
})();

export class Statistics {
  ready: Promise<void>; // @ts-ignore
  state: { [ key: string ]: string | integer | null | boolean };
  
  constructor() {
    this.ready = ( async() => {
      // Set current state
      this.state = await getInitialState();

      // Initial set of uninstall URL
      this.setUninstallUrl();
    })();
  }

  /** Set uninstall URL */
  /** @method */
  async setUninstallUrl(): Promise<void> {
    const userId = await ga.full.userIdPromise;

    let data: { [ key: string ]: integer | string } = Object.fromEntries(
      Object.entries( this.state )
        .map( ( [ property, value ] ): [ string, any ] | void => { // eslint-disable-line array-callback-return
          switch( property ) {
            case 'countryChanges':
              return [ 'cl', value ];
            case 'daysLive':
              if( value === null ) return;
              return [ 'dbu', value ];
            case 'iconClicks':
              return [ 'bac', value ];
            case 'installDate': {
              if( !value ) return;
              return [
                'id',
                ( date => (
                  date.getUTCFullYear() +
                  String( date.getUTCMonth() + 1 ).padStart( 2, '0' ) +
                  String( date.getUTCDate() ).padStart( 2, '0' ) +
                  String( date.getUTCHours() ).padStart( 2, '0' ) +
                  String( date.getUTCMinutes() ).padStart( 2, '0' ) // $FlowExpectedError[incompatible-call]
                ) )( new Date( value as number ) )
              ];
            }
            case 'language':
              if( !value ) return;
              return [ 'l', value ];
            case 'locationPageShows':
              return [ 'clo', value ];
            case 'userLoginCount':
              return [ 'lit', value ];
            case 'userLogined':
              return [ 'li', value ? '1' : '0' ];
            case 'proxiedPages':
              return [ 's', value ];
            case 'proxyErrors':
              return [ 'pe', value ];
            case 'proxyOn':
              return [ 'to', value ];
          }
        })
        .filter( ( item ): item is [ string, any ] => Boolean( item ) )
    );
    data.du = userId;

    {
      const installVersion: string | undefined =
        await storage.get( 'installVersion' );
      if( installVersion ) data.aiv = installVersion;
    }
    data.av = Browser.runtime.getManifest().version;
    
    setUninstallURL( urlModifyParameters(
      uninstallURL,
      search => Object.assign( search, data )
    ) );
  }

  /** Get proeprty value
  @method
  @return property value in state */
  async get( property: string ): Promise<any> {
    await this.ready;
    return this.state[ property ];
  }

  /** Set some property
  @method */
  async set(
    property: string, value: string | integer | null | boolean
  )/*: Promise<void>*/ {
    await this.ready;
    

    this.state[ property ] = value;
    if( config.type === 'development' ) {
      log( `Statistics. Set ${property}. New value: `, value );
    }
    storage.set( 'statistics', this.state );
    this.setUninstallUrl();
  }

  /** Increase counter property
  @method */
  increase( property: string ): void {
    if( typeof this.state[ property ] !== 'number' ) return;

    // @ts-ignore
    this.state[ property ]++;
    if( config.type === 'development' ) {
      log(
        `Statistics. Increase ${property}. New value: `, this.state[ property ]
      );
    }
    storage.set( 'statistics', this.state );
    this.setUninstallUrl();
  }
};


const object = new Statistics();

listeners( object );


export default object;
