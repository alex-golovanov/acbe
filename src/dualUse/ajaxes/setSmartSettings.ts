/* global Credentials, SiteFilter */
import apiRequest from 'tools/apiRequest';
import availableServer from 'availableServer';
import sendMessage from 'tools/sendMessage';


const bgRequest: boolean = location.href.includes( 'background' );


/** Set new smart settings
@function */
export default async(
  { credentials, filters }:
  { 'credentials': Credentials, 'filters': SiteFilter[] }
): Promise<any> => {
  if( !bgRequest ) {
    return sendMessage({
      'type': 'ajaxes.setSmartSettings', credentials, filters
    });
  }


  const baseUrl: string = await availableServer.getServer();

  try {
    return await apiRequest( baseUrl + '/properties/smart_settings', {
      'body': JSON.stringify({ 'data': filters }),
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
