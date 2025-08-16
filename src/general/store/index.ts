/* global StoreState, StoreAction */
import { createStore } from 'redux';
import createReducer from './createReducer';
import Deferred from 'tools/Deferred';
import getInitialState from './getInitialState';
import makeProxyServersMap from 'tools/makeProxyServersMap';
import storageListener from './storageListener';

const { _ } = self;


interface StoreCallback<T> {
  'property': ( state: StoreState ) => T,
  'compare': ( newState: T, oldState: T, storeState: StoreState ) => any
};


export class StoreClass {
  initiated: boolean;
  ready: Deferred<StoreState>;
  _callbacks: Array<StoreCallback<any>>;
  _dispatchDelayedData: StoreAction[];
  _realStore: any;
  
  constructor() {
    this._callbacks = [];
    this._dispatchDelayedData = [];

    this.initiated = false;
    this.ready = new Deferred();

    this.ready.then( () => {
      this._dispatchDelayedData.forEach( data => {
        this.dispatch( data );
      });
    });
  }

  /** @method */
  dispatch( data: StoreAction ): void {
    if( typeof this._realStore?.dispatch === 'function' ) {
      this._realStore.dispatch( data );
      return;
    }
    
    this._dispatchDelayedData.push( data );
  }

  /** @method */
  getState(): StoreState {
    return this.getStateSync();
  }

  /** @method */
  async getStateAsync(): Promise<StoreState> {
    await this.ready;
    return this._realStore.getState();
  }

  /** @method */
  getStateSync(): StoreState {
    if( typeof this._realStore?.getState !== 'function' ) {
      throw new Error( 'store.getStateSync called too early' );
    }
    
    return this._realStore.getState();
  }

  /** @method */
  initiate( arg: { 'type': 'store state', 'value': StoreState }): Promise<StoreState>;
  initiate( arg: { 'type': 'storage', 'value': any }): Promise<StoreState>; // eslint-disable-line no-dupe-class-members
  initiate(): Promise<StoreState>; // eslint-disable-line no-dupe-class-members
  async initiate( arg?: any ) { // eslint-disable-line no-dupe-class-members
    if( this.initiated ) return store.ready;

    this.initiated = true;
    const initialState: StoreState = await ( () => {
      if( arg?.type === 'store state' ) {
        const { value } = arg;

        value.proxyServers = makeProxyServersMap(
          new Map( Object.entries( value.proxyServers ) )
        );
        value.timezones = new Map( Object.entries( value.timezones ) );

        return value;
      }

      if( arg === undefined ) return getInitialState();
      return getInitialState( arg.value as any );
    })();

    // @ts-ignore
    const realStore = createStore( createReducer( initialState ) );
    this._realStore = realStore;

    let state: StoreState = realStore.getState();

    realStore.subscribe( () => {
      const newState: StoreState = realStore.getState();

      const actions: Array<{
        'compare': (
          newState: any, oldState: any, storeState: StoreState
        ) => any,
        'values': [ any, any ]
      }> = [];

      for( const { property, compare } of this._callbacks ) {
        const value0 = property( newState );
        const value1 = property( state );

        const haveChanges: boolean = ( () => {
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
        if( !haveChanges ) continue;

        actions.push({ compare, 'values': [ value0, value1 ] });
      }
      
      state = newState;

      for( const { compare, values } of actions ) {
        compare( values[ 0 ], values[ 1 ], newState );
      }
    });

    this.ready.resolve( state );

    return state;
  }

  /** Subscribe to changes like in React-Redux
  @method
  @param property - used to get changes only from specific property
  @param compare - callback
  @return unsubscribe function */
  onChange<T>(
    property: ( state: StoreState ) => T,
    compare: (
      newState: T, oldState: T, storeState: StoreState
    ) => any
  ): () => void {
    const object = { property, compare };
    this._callbacks.push( object );

    return () => {
      this._callbacks = this._callbacks.filter( item => item !== object );
    };
  }

  /** @method */
  onOneChange<T>(
    property: ( state: StoreState ) => T,
    compare?: (
      newState: T, oldState: T, storeState: StoreState
    ) => true | undefined | Promise<true> | Promise<undefined> | Promise<void>
  ): Promise<T> {
    if( typeof compare !== 'function' ) {
      return new Promise( resolve => {
        const unsubscribe = this.onChange( property, ( newState ) => {
          unsubscribe();
          resolve( newState );
        });
      });
    }
    
    return new Promise( resolve => {
      const unsubscribe = this.onChange(
        property,
        async( newState, oldState, storeState ) => {
          const output = await compare( newState, oldState, storeState );
          if( !output ) return;
  
          unsubscribe();
          resolve( newState );
        }
      );
    });
  }

  /** @method */
  subscribe( listener: () => any ): () => void {
    if( typeof this._realStore?.subscribe !== 'function' ) {
      throw new Error( 'store.subscribe called too early' );
    }
    
    return this._realStore.subscribe( listener );
  }
};
const store = new StoreClass();


storageListener( store );


export default store;
