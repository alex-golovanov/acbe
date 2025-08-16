/* global Credentials */
import QueueRequest from 'tools/QueueRequest';
import request from 'ajaxes/setFavorites';
import store from 'store';


const queueRequest = new QueueRequest({
  'request': async( favorites: string[] ): Promise<any> => {
    const { user } = await store.getStateAsync();
    const credentials: Credentials | undefined = user.loginData?.credentials;
    if( !credentials ) return;

    try {
      return await request({ credentials, favorites });
    }
    catch ( error ) {}
  },
  'syncAction': ( favorites: string[] ): void => {
    store.dispatch({ 'type': 'Favorites: set', 'data': favorites });
  }
});


/** @function */
const set = queueRequest.set.bind( queueRequest );

/** @function */
const add = async( country: string ): Promise<any> => {
  const storeState = await store.getStateAsync();
  const favorites: Set<string> = new Set( storeState.favorites.slice() );

  favorites.add( country );

  return set( Array.from( favorites ).sort() );
};

/** @function */
const remove = async( country: string ): Promise<any> => {
  const { favorites } = await store.getStateAsync();

  return set( favorites.filter( item => item !== country ) );
};


export default { add, remove, set };
