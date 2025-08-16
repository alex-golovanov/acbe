// const storage = {
//   hash: {} as {[key: string]: number},
//   get: function ( key: string ) { const value: number | undefined = this.hash[key] || undefined; return new Promise<number|undefined>( ( resolve, reject ) => { resolve(value); } ) },
//   set: function ( key: string, value: number ) { this.hash[key] = value; return new Promise<number>( ( resolve, reject ) => { resolve(value); } ) },
//   onChange: ( a: any ) => () => {},
// };


class MockStorageModule {
  initial_state = {};

  constructor() {
    this._data = JSON.parse( JSON.stringify( this.initial_state ) );
    this.listeners = {};
  }

  setItem( key, value ) {
    this._data[ key ] = value;
    this.notifyListeners( key, value );
  }
  set( key, value ) {
    this._data[ key ] = value;
    this.notifyListeners( key, value );
    return value;
  }

  async get( key ) {
    return Promise.resolve( this._data[ key ] ?? undefined );
  }

  getItem( key ) {
    return this._data[ key ];
  }

  getState() {
    return this._data;
  }

  async getStateAsync() {
    return Promise.resolve( this._data );
  }

  clear() {
    this._data = JSON.parse( JSON.stringify( this.initial_state ) );
  }

  dispatch( payload ) {
    
  }

  // Add onChange listener for a specific key
  // onChange( key, callback ) {
  //   if( !this.listeners[ key ] ) {
  //     this.listeners[ key ] = [];
  //   }
  //   this.listeners[ key ].push( callback );
  // }

  // type Options = {
  //   for: string;
  //   do: ( storageData: Record<string, any> ) => void;
  // }
  onChange( options ) {
    const { 'for': key, 'do': callback } = options;
    if( !this.listeners[ key ] ) {
      this.listeners[ key ] = [];
    }
    this.listeners[ key ].push( callback );
    return () => {
      console.log( 'Unsubscribing event listener for key', key );
      console.log( 'Listeners count (before)', this.listeners[ key ].length );
      this.listeners[ key ] = this.listeners[ key ].filter( action => action !== callback );
      console.log( 'Listeners count (after)', this.listeners[ key ].length );
    };
  }

  // Notify all listeners for a specific key
  notifyListeners( key, value ) {
    const keyListeners = this.listeners[ key ];
    if( keyListeners ) {
      keyListeners.forEach( callback => callback( this._data ) );
    }
  }
}

export default new MockStorageModule();
