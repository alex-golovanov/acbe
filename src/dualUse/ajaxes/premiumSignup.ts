import apiRequest from 'tools/apiRequest';
import availableServer from 'availableServer';
import sendMessage from 'tools/sendMessage';


const bgRequest: boolean = location.href.includes( 'background' );


/** NOT USED
@function */
export default async( email: string, token: string ): Promise<any> => {
  if( !bgRequest ) {
    return sendMessage({ email, token, 'type': 'ajaxes.premiumSignup' });
  }


  const baseUrl: string = await availableServer.getServer();

  try {
    return await apiRequest( baseUrl + '/en/users.json', {
      'data': {
        'user': {
          email,
          'create_password_after_activation': true,
          'trial_premium_token': token
        }
      },
      'dataType': 'json',
      'headers': { 'Content-Type': 'application/json' },
      'method': 'POST'
    });
  }
  catch ( error ) {
    availableServer.restart();
    throw error;
  }
};
