/* global RuntimePort, StoreAction, StoreState */
import sendMessage from 'tools/sendMessage';

const _ = self._;
const _browser = typeof browser !== 'undefined' ? browser : chrome;


interface StoreCallback<T> {
  'property': ( state: StoreState ) => T,
  'compare': ( newState: T, oldState: T ) => any
};


/** @function */
export default new class {
  _callbacks: Array<StoreCallback<any>>; // @ts-ignore
  _state: StoreState;
  _subscribeCallbacks: Array<() => any>;

  constructor() {
    this._callbacks = [];
    this._subscribeCallbacks = [];
  }

  /** @method */
  activate( baseState: StoreState ): void {
    this._state = baseState;

    let port: RuntimePort = _browser.runtime.connect({ 'name': 'store' });

    port.onMessage.addListener( ( newState: StoreState ) => {
      let actions: Array<{
        'compare': ( newState: any, oldState: any ) => any,
        'values': [ any, any ]
      }> = this._callbacks
        .map( ({ property, compare }: StoreCallback<any> ) => { // @ts-ignore
          let values: [ any, any ] =
            [ newState, this._state ].map( value => property( value ) );

          return { compare, values };
        })
        .filter( ({ values }) => !_.isEqual( values[ 0 ], values[ 1 ] ) );

      this._state = newState;

      this._subscribeCallbacks.forEach( callback => { callback(); });
      actions.forEach(
        ({ compare, values }/*: { 'compare': Function, 'values': Array<any> }*/ ) => {
          compare.apply({}, values );
        }
      );
    });
  }

  /** Subscribe to changes like in React-Redux
  @method
  @param property - used to get changes only from specific property
  @param compare - callback
  @return unsubscribe function */
  compare<T>(
    property: ( state: StoreState ) => T,
    compare: ( newState: T, oldState: T ) => any
  ): () => void {
    let object = { property, compare };
    this._callbacks.push( object );

    return () => {
      this._callbacks = this._callbacks.filter( item => item !== object );
    };
  }

  /** @method */
  dispatch( data: StoreAction ): Promise<StoreState> {
    return sendMessage({ 'type': 'store.dispatch', data });
  }

  /** @method */
  getState(): StoreState {
    if( !this._state ) {
      throw new Error( "Popup's store.getState() called too early" );
    }

    return this._state;
  }

  /** @method */
  subscribe( callback: () => any ): () => void {
    this._subscribeCallbacks.push( callback );

    return () => {
      this._subscribeCallbacks =
        this._subscribeCallbacks.filter( item => item !== callback );
    };
  }
}();
