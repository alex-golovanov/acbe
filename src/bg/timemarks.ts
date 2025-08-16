import storage from 'storage';
import log from 'log';

export default new class {
  _ready: Promise<any>; // @ts-ignore
  _state: { [ key: string ]: integer };
  _timeoutIds: { [ key: string ]: number };
  _cachedTimemarks: { [ key: string ]: number }; // Новый кэш для меток времени

  constructor() {
    this._timeoutIds = {};
    this._cachedTimemarks = {}; // Инициализация кэша
    this._ready = ( async() => {
      this._state = await storage.get( 'timemarks' ) || {};
    })();
  }

  /** @method */
  async get( property: string ): Promise<integer | undefined> {
    await this._ready;

    if( typeof this._state !== 'object' ) {
      throw new Error(
        `Timemark for ${property} called before storage initialization`
      );
    }
    return this._state[ property ];
  }

  /** @method */
  async getAsync( property: string ): Promise<integer | undefined> {
    const state = await storage.get( 'timemarks' ) || {};
    return state[ property ];
  }

  /** @method */
  async set( property: string, value: integer = Date.now() ): Promise<void> {
    await this._ready;

    this._state[ property ] = value;
    storage.set( 'timemarks', this._state );
  }

  /** @method */
  async getCached( property: string ): Promise<number | undefined> {
    if ( this._cachedTimemarks[ property ] !== undefined ) {
      return this._cachedTimemarks[ property ];
    }

    const mark = await this.get( property );
    if ( mark !== undefined ) {
      this._cachedTimemarks[ property ] = mark;
    }
    return mark;
  }

  /** @method */
  setCached(property: string, value: number = Date.now()): void {
    this._cachedTimemarks[property] = value;
    this.set(property, value);
  }

  /**
  @method
  @return - if true -> start immediately */
  async start(
    { action, delay, getOldMark = () => {}, name }: {
      'action': ( ...args: any[] ) => any,
      'delay': integer,
      'getOldMark'?: () => ( integer | void ),
      'name': string
    }
  ): Promise<{
    'startImmediately': boolean,
    'actionPromise'?: Promise<any>
  }> {
    await this._ready;

    const mark: integer | void = await this.get( name ) || getOldMark();

    const timePassed: integer | void = mark
      ? Date.now() - mark
      : undefined;

    let condition: boolean = !mark || (
      typeof timePassed === 'number'
      && ( timePassed < 0 || timePassed >= delay )
    );

    if( condition ) {
      return {
        'startImmediately': true,
        'actionPromise': action() // Execution here
      };
    }

    if( typeof timePassed === 'number' ) { // Type crap
      if( this._timeoutIds[ name ] !== undefined ) {
        clearTimeout( this._timeoutIds[ name ] );
      }
      this._timeoutIds[ name ] = setTimeout( action, delay - timePassed );
    }
    return { 'startImmediately': false };
  }

  /** Like start, but with set of mark in storage and eternal re-using
  @method */
  async loop({ action, delay, name }: {
    'action': ( ...args: any[] ) => any,
    'delay': integer,
    'name': string
  }): Promise<void> {
    let output = await this.start({ action, delay, name });

    if( output.startImmediately ) this.set( name );
  }

  async waitTimestamp(
    name: string,
    timeout: integer = 15000,
    interval: integer = 100
  ): Promise<number | undefined> {
    await this._ready;

    const mark: integer | void = await this.get( name );

    if( mark ) {
      log( `waitTimestamp: \"${name}\" is already set` );
      return mark;
    }

    return new Promise( resolve => {
      log( `waitTimestamp: wait \"${name}\"` );

      const id = setInterval( async() => {
        const mark: integer | void = await this.get( name );

        if( mark ) {
          log( `waitTimestamp: \"${name}\" got` );
          clearInterval( id );
          resolve( mark );
        }
      }, interval );

      setTimeout( () => {
        log( `waitTimestamp: \"${name}\" timeout` );
        clearInterval( id );
        resolve( undefined );
      }, timeout );
    });
  }
}();
