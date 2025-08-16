import storage from 'storage';


/** Array-like object directly associated with storage
@class singleton */
export default new class {
  state?: Set<string>;

  constructor() {
    ( async() => {
      let showedOffers = await storage.get( 'showedOffers' );
      this.state = ( ( new Set( showedOffers || [] ) )/*: Set<string>*/ );
    })();
  }

  /** Add
  @method */
  push( ...args: string[] ): integer {
    const state = this.state;
    if( !state ) throw new Error( 'ShowedOffers.push called too early' );

    args.forEach( offerName => { state.add( offerName ); });

    storage.set( 'showedOffers', Array.from( state ) );

    return state.size;
  }

  /** Remove
  @method */
  pull( ...args: string[] ): void {
    const state = this.state;
    if( !state ) throw new Error( 'ShowedOffers.pull called too early' );

    args.forEach( offerName => {
      state.delete( offerName );
    });

    storage.set( 'showedOffers', Array.from( state ) );
  }

  /** Check value in array
  @method */
  includes( value: string ): boolean {
    if( !this.state ) {
      throw new Error( 'ShowedOffers.includes called too early' );
    }

    return this.state.has( value );
  }
}();
