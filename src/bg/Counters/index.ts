/** System of counters saved globally in stirage for statistics */
import config from 'config';
import getDefaultState from './getDefaultState';
import applyListeners from './listeners';
import log from 'log';
import storage from 'storage';


const bgRequest: boolean = location.href.includes( 'background' );


export class Counters {
  _listeners: Array<{ 'listener': Function, 'property': string }>;
  _ready: Promise<void>; // @ts-ignore
  state: { [ key: string ]: integer };
  
  constructor() {
    this._ready = ( async() => {
      let storageState = await storage.get( 'counters' );
      if( storageState ) {
        this.state = storageState;
        return;
      }

      this.state = await getDefaultState();
    })();

    this._listeners = [];

    if( bgRequest ) applyListeners( this );
  }

  /** @method */
  addListener(
    property: string,
    listener: ( value: integer ) => any
  )/*: void*/ {
    this._listeners.push({ listener, property });
  }
  
  /** @method */
  removeListener( params: string | ( ( value: integer ) => any ) )/*: void*/ {
    // Remove by property
    if( typeof params === 'string' ) {
      this._listeners =
        this._listeners.filter( ({ property }) => property !== params );
      return;
    }

    // Remove by callback function
    this._listeners =
      this._listeners.filter( ({ listener }) => listener !== params );
  }

  /** Get property value
  @method
  @return - property value in state */
  async get( property: string ): Promise<integer> {
    await this._ready;
    return this.state[ property ] || 0;
  }

  /** Increase some counter property
  @method
  @return - new value */
  async increase( property: string ): Promise<integer> {
    await this._ready;

    if( !this.state[ property ] ) this.state[ property ] = 0;
    this.state[ property ]++;

    if( config.type === 'development' ) {
      log(
        `Counters. Increase ${property}. New value: `, this.state[ property ]
      );
    }
    storage.set( 'counters', this.state );

    this._listeners.forEach(
      ({ listener, 'property': listenerProperty }) => {
        if( listenerProperty !== property ) return;

        listener( this.state[ property ] );
      }
    );

    return this.state[ property ];
  }
}


/** @class singleton */
export default new Counters();
