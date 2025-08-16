/* global Credentials, SiteFilter */
import apiRequest from 'tools/apiRequest';
import availableServer from 'availableServer';
import sendMessage from 'tools/sendMessage';


const bgRequest: boolean = location.href.includes( 'background' );


/** Get list of smart settings from server
@function */
export default async(
  credentials: Credentials
): Promise<{
  'favorites': string[],
  'promotionsBlock': boolean,
  'smartSettings': SiteFilter[],
  'timezoneChange': boolean,
  'webrtcBlock': boolean | null
}> => {
  if( !credentials ) {
    throw new Error( 'ajaxes.getUserProperties called without credentials' );
  }

  if( !bgRequest ) {
    return sendMessage({ credentials, 'type': 'ajaxes.getUserProperties' });
  }
  

  const baseUrl: string = await availableServer.getServer();

  let ajaxReturn;
  try {
    ajaxReturn = await apiRequest( baseUrl + '/properties', {
      'dataType': 'json',
      'method': 'GET',
      'tokenCredentials': credentials
    });
  }
  catch ( error ) { // Network level error
    if( error.status === 401 ) throw new Error( 'Not authorized user' );

    availableServer.restart();
    throw error;
  }

  // Wrong AJAX format
  if( typeof ajaxReturn?.ok !== 'boolean' ) {
    throw new Error( 'Get user properties: incorrect ajax format' );
  }

  let { properties, ok }: { 'properties': Object, 'ok': boolean } =
    ajaxReturn;

  if( !ok ) throw new Error( 'Unathorized user' );

  let output: any = Object.assign({}, properties );
  Object.entries( output ).forEach( ( [ property/*: string*/, value ] ) => {
    if( value === null ) delete output[ property ];
  });

  output.smartSettings = output.smart_settings || [];
  delete output.smart_settings;

  output.favorites = output.favorites || [];
  
  output.timezoneChange = output.timezoneChange ?? false;
  output.webrtcBlock = output.webrtcBlock !== undefined
    ? output.webrtcBlock
    : null;

  return output;
};
