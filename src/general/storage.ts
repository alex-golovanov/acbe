/* global StorageChange */
import Browser from 'crossbrowser-webextension';

const { _ } = self;


let listeners: Array<( changes: StorageChange ) => any> = [];

/** @class singleton */
const storage = new class {
  _data: { [ key: string ]: any };
  ready: Promise<void>;

  constructor() {
    this._data = {};

    /** @type {Promise} */
    this.ready = Browser.storage.local.get().then( data => {
      this._data = data;
    });

    this.get = this.get.bind( this );
    this.set = this.set.bind( this );
    this.remove = this.remove.bind( this );
  }

  /** @function */
  addListener( listener: ( changes: StorageChange ) => any ): void {
    listeners.push( listener );
  }

  /** @function */
  removeListener( listner: ( changes: StorageChange ) => any ): void {
    listeners = listeners.filter( item => item !== listner );
  }

  /** Read async
  @method */
  get( key: string ): Promise<any>; // eslint-disable-line no-dupe-class-members
  get<K extends string>( key: K[] ): Promise<Record<K, any> & Record<string, undefined>>; // eslint-disable-line no-dupe-class-members
  async get( key: string | string[] ): Promise<any> { // eslint-disable-line no-dupe-class-members
    let data = await Browser.storage.local.get( key );
    if( typeof key === 'string' ) return data[ key ];

    return data;
  }

  /** Read sync
  @method */
  getSync( key: string ): any {
    return _.cloneDeep( this._data[ key ] );
  }

  /** Write async
  @method */
  set( properties: { [ key: string ]: any }): Promise<void>; // eslint-disable-line no-dupe-class-members
  set( key: string, value: any ): Promise<void>; // eslint-disable-line no-dupe-class-members
  set( ...args: any[] ): Promise<void> { // eslint-disable-line no-dupe-class-members
    // Two argument syntax
    if( args.length === 2 ) {
      let [ key, value ] = args as [ string, any ];

      value = _.cloneDeep( value );
      this._data[ key ] = value;

      return Browser.storage.local.set({ [ key ]: value });
    }
    
    // One argument syntax
    const properties = args[ 0 ] as { [ key: string ]: any };

    return Browser.storage.local.set( properties );
  }

  /** Write sync
  @method */
  setSync( key: string, value: any ): void {
    value = _.cloneDeep( value );
    this._data[ key ] = value;

    Browser.storage.local.set({ [ key ]: value });
  }

  /** Remove async
  @method */
  async remove( ...args: string[] ): Promise<void>; // eslint-disable-line no-dupe-class-members
  async remove( arg: string | string[] ): Promise<void>; // eslint-disable-line no-dupe-class-members
  async remove( ...args: Array<string | string[]> ): Promise<void> { // eslint-disable-line no-dupe-class-members
    const keys: string[] = args.flat();

    keys.forEach( key => { delete this._data[ key ]; });

    return Browser.storage.local.remove( keys );
  }
  
  /** Remove sync
  @method */
  removeSync( ...args: Array<string | string[]> ) {
    let keys: string[] = args.flat();

    keys.forEach( key => { delete this._data[ key ]; });

    Browser.storage.local.remove( keys );
  }

  /** @method */
  onChange<const B, A extends string = string>(
    options: {
      // for properties
      'for': A[],

      // ignore changes with this property+value in old value state
      'ignore'?: Array<{ 'property': A, 'value': any }>
    } & (
      { // Simple syntax
        'do': ( storageData: Record<string, any> ) => any,
      } | { // Convert and get this convertsion
        // convert from initial object to something compiled then compare
        'compile': ( object: Record<string, any> ) => B,
  
        // action to do
        'do': ( compilationResult: B, storageData: Record<string, any> ) => any,
      } | { // More complex comparison between old and new
        // compare old and new object then decide do (true) or do not (false)
        'changeCompilation': (
          currentStoregeData: Record<string, any>,
          oldStoregeData: Record<string, any>
        ) => boolean,
  
        'do': ( storageData: Record<string, any> ) => any,
      }
    )
  ): ( () => any ) {
    const ignoreList = options.ignore;

    /** @function */
    const listener = (
      changes: StorageChange,
      state: Record<string, any>,
      oldState: Record<string, any>
    ) => {
      const keys = Object.keys( changes );
      if( !options.for.some( key => keys.includes( key ) ) ) return;

      // Remove ignored pairs key => value
      if( ignoreList ) {
        for( const { property, value } of ignoreList ) {
          if( !keys.includes( property ) ) continue;
          if( changes[ property ].oldValue !== value ) continue;

          delete changes[ property ];
        }
      }
      if( !Object.keys( changes ).length ) return;

      if( 'compile' in options ) {
        const { compile, 'do': action } = options;

        const newCompiled = compile( state );
        const oldCompiled = compile( oldState );
        if( _.isEqual( newCompiled, oldCompiled ) ) return;
        
        action( newCompiled, state );
      }
      else if( 'changeCompilation' in options ) {
        const value = options.changeCompilation( state, oldState );
        if( !value ) return;

        options.do( state );
      }
      else {
        options.do( state );
      }
    };

    onChangeListeners.push( listener );

    return () => {
      onChangeListeners = onChangeListeners.filter( item => item !== listener );
    };
  }
}();

let onChangeListeners: Array<(
  changes: StorageChange,
  state: { [ key: string ]: any },
  oldState: { [ key: string ]: any }
) => any> = [];

Browser.storage.onChanged.addListener( ( changes, area ) => {
  if( area !== 'local' ) return;

  listeners.forEach( listener => { listener( changes ); });

  ( async() => {
    const state = await Browser.storage.local.get( null );
    const oldChanges = Object.fromEntries(
      Object.entries( changes ).map(
        ( [ key, { oldValue } ] ) => [ key, oldValue ]
      )
    );

    const oldState = Object.assign({}, state, oldChanges );
    if( _.isEqual( state, oldState ) ) return;

    for( const listener of onChangeListeners ) {
      listener( Object.assign({}, changes ), state, oldState );
    }
  })();
});


export default new Proxy(
  storage,
  {
    get( target, key ) {
      if( typeof key === 'string' ) {
        switch( key ) {
          case 'addListener': return storage.addListener;
          case 'get': return storage.get;
          case 'onChange': return storage.onChange;
          case 'remove': return storage.remove;
          case 'removeListener': return storage.removeListener;
          case 'ready': return storage.ready;
          case 'set': return storage.set;
          default: return storage.getSync( key );
        }
      }
      if( typeof key === 'number' ) return storage.getSync( String( key ) );

      throw new Error( 'storage called with not string method' );
    },

    set( target, key, value ) {
      if( typeof key === 'string' ) {
        storage.setSync( key, value );
        return true;
      }
      if( typeof key === 'number' ) {
        storage.setSync( String( key ), value );
        return true;
      }

      return false;
    },

    deleteProperty( target, key ) {
      if( typeof key === 'string' ) {
        storage.removeSync( key );
        return true;
      }
      if( typeof key === 'number' ) {
        storage.removeSync( String( key ) );
        return true;
      }
      
      return false;
    }
  }
);
