// 'track': async(
//   eventName: string,
//   data: { [ key: string ]: string } = {}
// )

class MockJitsuModule {
  constructor() {
    this.data = [];
    this.listeners = {};
  }

  track( event_name, data ) {
    this.data.push({ event_name, data });
    this.notifyListeners( event_name, data );
  }

  getTracked() {
    return this.data;
  }

  clear() {
    this.data = [];
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

export default new MockJitsuModule();
