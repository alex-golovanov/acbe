import { createStore } from './mock_redux_realStore';

const _ = {
  'isEqual': function( value, other ) {
  // Get the type of both values
    const typeValue = Object.prototype.toString.call( value );
    const typeOther = Object.prototype.toString.call( other );

    // If types are different, they are not equal
    if( typeValue !== typeOther ) {
      return false;
    }

    // If types are primitive types or null/undefined, compare directly
    if( [ '[object Number]', '[object String]', '[object Boolean]', '[object Null]', '[object Undefined]' ].includes( typeValue ) ) {
      return value === other;
    }

    // If types are dates, compare them
    if( typeValue === '[object Date]' ) {
      return value.getTime() === other.getTime();
    }

    // If types are arrays, compare their elements recursively
    if( typeValue === '[object Array]' ) {
      if( value.length !== other.length ) {
        return false;
      }
      for( let i = 0; i < value.length; i++ ) {
        if( !_.isEqual( value[ i ], other[ i ] ) ) {
          return false;
        }
      }
      return true;
    }

    // If types are objects, compare their properties recursively
    if( typeValue === '[object Object]' ) {
      const keysValue = Object.keys( value );
      const keysOther = Object.keys( other );
      if( keysValue.length !== keysOther.length ) {
        return false;
      }
      for( const key of keysValue ) {
        if( !keysOther.includes( key ) || !_.isEqual( value[ key ], other[ key ] ) ) {
          return false;
        }
      }
      return true;
    }

    // If types are functions, compare their string representations
    if( typeValue === '[object Function]' ) {
      return value.toString() === other.toString();
    }

    // For all other types, consider them equal if their string representations match
    return String( value ) === String( other );
  },
};


function browsecReducer( state, action ) {
  if( action?.type === 'setDomain' ) {
    return {
      ...state,
      'domain': action.payload
    };
  }
  if( action?.type === 'counter/incremented' ) {
    return {
      ...state,
      'value': state.value + 1
    };
  }
  if( action?.type === 'counter/step' ) {
    return {
      ...state,
      'value': state.value + action.payload
    };
  }
  // otherwise return the existing state unchanged
  return state;
}


class MockStoreModule {
  initial_state = { 'userPac': { 'mode': 'proxy' } };

  constructor() {
    this.state = JSON.parse( JSON.stringify( this.initial_state ) );
    this.listeners = {};
    this._callbacks = [];
    this.initiate();
  }

  setItem( key, value ) {
    this.state[ key ] = value;
    this.notifyListeners( key, value );
    return value;
  }

  getItem( key ) {
    return this.state[ key ];
  }

  getState() {
    return this.state;
  }

  async getStateAsync() {
    return Promise.resolve( this.state );
  }

  clear() {
    this.state = JSON.parse( JSON.stringify( this.initial_state ) );
  }

  dispatch( payload ) {
    console.log( 'Dispatching payload to Redux store', payload );
    if( payload.type === 'setDomain' ) {
      console.log( 'Setting domain', payload.payload );
      this.state.domain = payload.payload;
      this.notifyListeners( 'domain', this.state.domain );
      console.log( 'Domain set', this.state.domain );
    }
    if( this._realStore ) {
      this._realStore.dispatch( payload );
    }
  }

  initiate() {
    console.log( 'Initiating real store' );
    const realStore = createStore( browsecReducer, this.state );
    this._realStore = realStore;

    let state = realStore.getState();

    // subscribe to changes in the real store
    console.log( 'Subscribing to changes in the real store' );

    realStore.subscribe( () => {
      const newState = realStore.getState();

      // actions: Array<>
      // {
      //   'compare': (
      //     newState: any, oldState: any, storeState: StoreState
      //   ) => any,
      //   'values': [ any, any ]
      // }
      const actions = [];

      // walking through all listeners (callbacks)
      console.log( 'Real Store Listeners count', this._callbacks.length );
      console.log( 'Walking through all listeners (callbacks)' );
      for( const { property, compare } of this._callbacks ) {
        console.log( 'property', property.toString() );
        // calls property() function that returns value of the subscribed property/properties, e.g. ({prop}) => prop
        const value0 = property( newState ); // new state destructuring
        const value1 = property( state ); // old state destructuring
        console.log( 'New value:', value0 );
        console.log( 'Old value:', value1 );

        // checking if the property has changed
        const haveChanges = ( () => {
          if( value0 instanceof Map && value1 instanceof Map ) {
            if( value0 === value1 ) return false;
            if( value0.size !== value1.size ) return true;
            for( const [ key0, val0 ] of value0 ) {
              if( !_.isEqual( value1.get( key0 ), val0 ) ) return true;
            }
            return false;
          }

          return !_.isEqual( value0, value1 );
        })();

        if( !haveChanges ) { continue; }
        else { actions.push({ compare, 'values': [ value0, value1 ] }); }
      }

      state = newState;

      for( const { compare, values } of actions ) {
        compare( values[ 0 ], values[ 1 ], newState );
      }
    });
  }

  // Add onChange listener for a specific key
  // onChange( key, callback ) {
  //   if( !this.listeners[ key ] ) {
  //     this.listeners[ key ] = [];
  //   }
  //   this.listeners[ key ].push( callback );
  // }

  /** Subscribe to changes like in React-Redux
  @method
  @param property - used to get changes only from specific property
  @param compare - callback
  @return unsubscribe function */
  // onChange<T>(
  //   property: ( state: StoreState ) => T,
  //   compare: (
  //     newPropertyValue: T, oldPropertyValue: T, newStoreState: StoreState
  //   ) => any
  // ): () => void {
  onChange( property, compare ) {
    console.log( 'Subscribing event listener for property ()', property.toString() );
    const object = { property, compare };
    this._callbacks.push( object );
    return () => {
      console.log( 'Unsubscribing event listener for property ()', property.toString() );
      console.log( 'Listeners count (before)', this._callbacks.length );
      this._callbacks = this._callbacks.filter( cb => cb !== object );
      console.log( 'Listeners count (after)', this._callbacks.length );
    };
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
