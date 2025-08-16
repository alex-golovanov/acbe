/* global Credentials */
import apiRequest from 'tools/apiRequest';
import availableServer from 'availableServer';
import sendMessage from 'tools/sendMessage';


const bgRequest: boolean = location.href.includes( 'background' );


/** Set new timezone change state
@function */
export default async(
  { credentials, timezoneChange }:
  { 'credentials': Credentials, 'timezoneChange': boolean }
): Promise<any> => {
  if( !bgRequest ) {
    return sendMessage({
      credentials, timezoneChange, 'type': 'ajaxes.setTimezoneChange'
    });
  }


  const baseUrl: string = await availableServer.getServer();

  try {
    return await apiRequest( baseUrl + '/properties/timezoneChange', {
      'body': JSON.stringify({ 'data': timezoneChange }),
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
