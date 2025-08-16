/* global PopupBanner, StoreState */
import computeActiveBanner from './computeActiveBanner';
import store from 'store';

const { _ } = self;


export default new class {
  _activeBanner: PopupBanner;
  _listeners: Array<( current: PopupBanner, old: PopupBanner ) => any>;
  _ready: Promise<void>; // @ts-ignore
  _showSpeedPromo: boolean;
  
  constructor() {
    this._activeBanner = undefined;
    this._listeners = [];

    // Initial
    this._ready = ( async() => {
      const storeState = await store.getStateAsync();

      const showSpeedPromo = storeState.userPac.mode === 'proxy';
      this._showSpeedPromo = showSpeedPromo;

      let forceEmpty = false;

      // There must be some action to make forceEmptry = true

      const old = this._activeBanner;
      const current = await computeActiveBanner(
        Object.assign({ forceEmpty, showSpeedPromo }, storeState )
      );
      if( _.isEqual( old, current ) ) return;
      
      this._activeBanner = current; // @ts-ignore
      for( const listener of this._listeners ) listener( current, old );
    })();

    // Subscribe to user logined <--> unlogined
    store.onChange(
      ({ promotions, user }: StoreState ) => (
        { 'user': Boolean( user.email ), promotions }
      ),
      () => { this.refresh(); }
    );
  }
  
  /** @method */
  addListener( listener: ( current: PopupBanner, old: PopupBanner ) => any ) {
    this._listeners.push( listener );
  }

  /** @method */
  get(): PopupBanner {
    return this._activeBanner;
  }

  /** @method */
  async getAsync(): Promise<PopupBanner> {
    await this._ready;

    return this._activeBanner;
  }

  /** @method */
  async refresh() {
    const storeState = await store.getStateAsync();

    const old = this._activeBanner;
    const forceEmpty = false;

    const current = await computeActiveBanner(
      Object.assign({ forceEmpty, 'showSpeedPromo': this._showSpeedPromo }, storeState )
    );
    if( _.isEqual( old, current ) ) return;
    
    this._activeBanner = current;
    for( const listener of this._listeners ) listener( current, old );
  }
  
  /** @method */
  removeListener( listener: ( current: PopupBanner, old: PopupBanner ) => any ) {
    this._listeners = this._listeners.filter( item => item !== listener );
  }
}();
