/* global Credentials */

import apiRequest from 'tools/apiRequest';
import availableServer from 'availableServer';
import sendMessage from 'tools/sendMessage';
import ga from 'ga';

const bgRequest: boolean = location.href.includes( 'background' );

/** Get list of all servers
@function */
export default async(
  { credentials }:
  { credentials?: Credentials }
): Promise<any> => {
  if (!bgRequest) return sendMessage({ credentials, 'type': 'ajaxes.servers' });

  const clientId: string = await ga.full.userIdPromise;
  const baseUrl: string = await availableServer.getServer();

  try {
    return await apiRequest(baseUrl + '/servers?stdomains=1&cid=' + clientId, {
      'dataType': 'json',
      'method': 'GET',
      'tokenCredentials': credentials
    });
  }
  catch ( error ) { // Network level error
    availableServer.restart();
    throw error;
  }
};
