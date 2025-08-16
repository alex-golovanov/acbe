/* global Credentials */
import apiRequest from 'tools/apiRequest';
import availableServer from 'availableServer';
import sendMessage from 'tools/sendMessage';


const bgRequest: boolean = location.href.includes( 'background' );


/** Set new WebRTC blocking state
@function */
export default async(
  { credentials, webrtcBlock }:
  { 'credentials': Credentials, 'webrtcBlock': boolean }
): Promise<any> => {
  if( !bgRequest ) {
    return sendMessage({
      credentials, 'type': 'ajaxes.setWebrtcBlock', webrtcBlock
    });
  }


  const baseUrl: string = await availableServer.getServer();

  try {
    return await apiRequest( baseUrl + '/properties/webrtcBlock', {
      'body': JSON.stringify({ 'data': webrtcBlock }),
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
