import apiRequest from 'tools/apiRequest';
import availableServer from 'availableServer';
import DelayRecord from 'DelayRecord';
import ga from 'ga';
import log from 'log';
import store from 'store';


/** @function */
const oneCall = (
  { baseUrl, email, password }:
  { 'baseUrl': string, 'email': string, 'password': string }
) => apiRequest( baseUrl + '/authentication', {
  'data': { email, password },
  'dataType': 'json',
  'method': 'POST'
});


// Authenticate user and obtain access credentials
/** @function */
export default async(
  { email, password }: { 'email': string, 'password': string }
): Promise<any> => {
  let baseUrl: string = await availableServer.getServer();

  try {
    let timer = new DelayRecord( 'Login' );
    let account = await ( async() => {
      try { // 2 attempts
        return await oneCall({ baseUrl, email, password });
      }
      catch ( error ) {
        return oneCall({ baseUrl, email, password });
      }
    })();

    timer.end();
    store.dispatch({ 'type': 'User: set', 'data': account });

    return account;
  }
  catch ( error ) {
    let { message, status } = error;

    let errorOutput/*: Object*/ = {
      'error': status === 401 ? 'unauthorized' : message, status
    };

    if( status !== 401 ) availableServer.restart();

    log( 'browsec.authenticate', 'ERROR', errorOutput );
    ga.partial({
      'category': 'error',
      'action': 'browsec.authenticate',
      'label': JSON.stringify( errorOutput )
    });

    throw error;
  }
};
