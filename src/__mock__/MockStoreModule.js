class MockStoreModule {
  initial_state = { 'internal_experiments': [] };

  constructor() {
    this.state = JSON.parse( JSON.stringify( this.initial_state ) );
    this.listeners = {};
  }

  setItem( key, value ) {
    this.state[ key ] = value;
    this.notifyListeners( key, value );
  }

  getItem( key ) {
    return this.state[ key ];
  }

  getState() {
    return this.state;
  }

  clear() {
    this.state = JSON.parse( JSON.stringify( this.initial_state ) );
  }

  dispatch( payload ) {
  }

  // Add onChange listener for a specific key
  onChange( key, callback ) {
    if( !this.listeners[ key ] ) {
      this.listeners[ key ] = [];
    }
    this.listeners[ key ].push( callback );
  }

  // Notify all listeners for a specific key
  notifyListeners( key, value ) {
    const keyListeners = this.listeners[ key ];
    if( keyListeners ) {
      keyListeners.forEach( callback => callback( value ) );
    }
  }
}

export default new MockStoreModule();
