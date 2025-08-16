/* global Credentials */
import apiRequest from 'tools/apiRequest';
import availableServer from 'availableServer';
import DelayRecord from 'DelayRecord';
import ga from 'ga';
import log from 'log';
import store from 'store';


/** @function */
const storeAction = (): void => {
  store.dispatch({
    'type': 'User: set',
    'data': { 'guest': true, 'type': 'guest' }
  });
};


/** Un-registers current set of credentials with the server.
@function */
export default async(): Promise<any> => {
  log( 'Logout' );

  const { user } = await store.getStateAsync();
  const credentials: Credentials | undefined = user.loginData?.credentials;

  // Clear account data
  if( !credentials ) {
    storeAction();
    return;
  }

  const baseUrl: string = await availableServer.getServer();

  // Remove token from server
  try {
    const timer = new DelayRecord( 'Logout' );

    // Ensure that tokens/sessions have been deleted on the server, otherwise ignore
    let ajaxReturn = await apiRequest( baseUrl + '/authentication', {
      'method': 'DELETE',
      'tokenCredentials': credentials
    });
    timer.end();

    storeAction();

    return ajaxReturn;
  }
  catch ( originalError ) {
    storeAction();

    const { message, status }: { 'message': string, 'status': integer | void } =
      originalError;

    const error = {
      'error': status === 401 ? 'unauthorized' : message,
      status
    };

    availableServer.restart();

    log.error( 'Logout error', error );
    ga.partial({
      'category': 'error',
      'action': 'browsec.deauthenticate',
      'label': JSON.stringify( error )
    });
  }
};
