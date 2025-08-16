import storage from 'storage';


/** List of activated promotions
@class singleton */
export default new class {
  /** @method */
  async add( id: string ): Promise<void> {
    let promotionsActivation =
      await storage.get( 'promotionsActivation' ) || [];

    let list: Set<string> = new Set( promotionsActivation );
    list.add( id );

    await storage.set( 'promotionsActivation', Array.from( list ) );
  }

  /** @method */
  async get(): Promise<string[]> {
    let promotionsActivation =
      await storage.get( 'promotionsActivation' ) || [];

    return promotionsActivation;
  }
}();
