import generateRfc4122Id from 'tools/generateRfc4122Id';
import mainConfig from 'config';
import storage from 'storage';
import availableServer from 'availableServer';


const bgRequest = location.href.includes( 'background' );


export default ( async(): Promise<string> => {
  let id = await storage.get( 'gaRareUserId' );
  if( id ) return id;

  // From popup
  if( !bgRequest ) {
    return new Promise( resolve => {
      const unsubscribe = storage.onChange({
        'for': [ 'gaRareUserId' ],
        'do': ( storageData: Record<string, any> ) => {
          const value = storageData.gaRareUserId;

          if( value !== undefined ) {
            resolve( value );
            unsubscribe();
          }
        }
      });
    });
  }

  // From background
  let timeReason = false;
  try {
    await new Promise( async( resolve, reject ) => {
      setTimeout( () => {
        timeReason = true;
        reject( new Error( 'Initial GA request timeout reached' ) );
      }, 15000 );

      await availableServer.initialRequestComplete;

      const response = await fetch(
        mainConfig.baseUrl + '/api/v1/attributes/extintid',
        {
          'credentials': 'include',
          'headers': {
            'Content-Type': 'application/json'
          },
          'method': 'GET'
        }
      );
      const json: {
        'created': boolean,
        'extintid': string
      } = await response.json();

      if( typeof json?.extintid === 'string' ) id = json.extintid;
      if( typeof json?.created === 'boolean' ) {
        await storage.set( 'gaRareUserIsNew', json.created );
      }
    });
  }
  catch ( x ) {}

  if( id ) {
    storage.set( 'gaRareUserId', id );
    return id;
  }

  // No response from fetch
  id = generateRfc4122Id();
  storage.set( 'gaRareUserId', id );

  if( timeReason ) {
    fetch(
      mainConfig.baseUrl + '/api/v1/attributes',
      {
        'body': JSON.stringify({
          'data': { 'extintid': id }
        }),
        'credentials': 'include',
        'headers': {
          'Content-Type': 'application/json'
        },
        'method': 'POST'
      }
    );
  }

  return id;
})();
