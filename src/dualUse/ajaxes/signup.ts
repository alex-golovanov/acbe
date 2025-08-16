import apiRequest from 'tools/apiRequest';
import availableServer from 'availableServer';
import sendMessage from 'tools/sendMessage';


const bgRequest: boolean = location.href.includes( 'background' );


/** NOT USED: Sign up new user
@function */
export default async(): Promise<any> => {
  if( !bgRequest ) {
    return sendMessage({ 'type': 'ajaxes.signup' });
  }

  
  const baseUrl: string = await availableServer.getServer();

  try {
    return await apiRequest( baseUrl + '/signup', { 'method': 'POST' });
  }
  catch ( error ) { // Network level error
    availableServer.restart();

    throw error;
  }
};
