import storage from 'storage';


/** List of activated notifications
@class singleton */
export default new class {
  /** @method */
  async get(): Promise<string[]> {
    let storageValue = await storage.get( 'promotionsNotifications' );

    return storageValue || [];
  }

  /** @method */
  async add( id: string ): Promise<void> {
    let storageValue = await storage.get( 'promotionsNotifications' );

    let list = new Set( storageValue || [] );
    list.add( id );

    await storage.set( 'promotionsNotifications', Array.from( list ) );
  }
}();
