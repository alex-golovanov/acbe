/* global Credentials */
import apiRequest from 'tools/apiRequest';
import availableServer from 'availableServer';
import sendMessage from 'tools/sendMessage';


const bgRequest: boolean = location.href.includes( 'background' );


/** Set new smart settings
@function */
export default async(
  { credentials, favorites }:
  { 'credentials': Credentials, 'favorites': string[] }
): Promise<any> => {
  if( !bgRequest ) {
    return sendMessage({
      credentials, favorites, 'type': 'ajaxes.setFavorites'
    });
  }


  const baseUrl: string = await availableServer.getServer();

  try {
    return await apiRequest( baseUrl + '/properties/favorites', {
      'body': JSON.stringify({ 'data': favorites }),
      'dataType': 'json',
      'headers': { 'Content-Type': 'application/json' },
      'method': 'PUT',
      'tokenCredentials': credentials
    });
  }
  catch ( error ) {
    availableServer.restart();
    throw error;
  }
};
