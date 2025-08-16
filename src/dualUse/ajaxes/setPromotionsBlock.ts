/* global Credentials */
import apiRequest from 'tools/apiRequest';
import availableServer from 'availableServer';
import sendMessage from 'tools/sendMessage';


const bgRequest: boolean = location.href.includes( 'background' );


/** Set new promotions blocking state
@function */
export default async(
  { credentials, promotionsBlock }:
  { 'credentials': Credentials, 'promotionsBlock': boolean }
): Promise<any> => {
  if( !bgRequest ) {
    return sendMessage({
      credentials, promotionsBlock, 'type': 'ajaxes.setPromotionsBlock'
    });
  }


  const baseUrl: string = await availableServer.getServer();

  try {
    return await apiRequest( baseUrl + '/properties/promotionsBlock', {
      'body': JSON.stringify({ 'data': promotionsBlock }),
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
