/* global AjaxAccount, Credentials */
import apiRequest from 'tools/apiRequest';
import availableServer from 'availableServer';
import sendMessage from 'tools/sendMessage';


const bgRequest: boolean = location.href.includes( 'background' );


/** Get user data from server
@function */
export default async( credentials?: Credentials ): Promise<AjaxAccount> => {
  if( !bgRequest ) {
    return sendMessage({ 'type': 'ajaxes.account', credentials });
  }
  

  const baseUrl: string = await availableServer.getServer();

  try {
    let preData: any = await apiRequest( baseUrl + '/account', {
      'method': 'GET',
      'dataType': 'json',
      'tokenCredentials': credentials
    });
    let data: AjaxAccount = Object.assign( preData, {
      'type': preData.guest ? 'guest' : 'logined'
    });
    
    return data;
  }
  catch ( error ) { // Network level error
    availableServer.restart();
    throw error;
  }
};
