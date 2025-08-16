import apiRequest from 'tools/apiRequest';
import availableServer from 'availableServer';
import sendMessage from 'tools/sendMessage';


const _browser = typeof browser !== 'undefined' ? browser : chrome;
const bgRequest: boolean = location.href.includes( 'background' );


/** (temporary not used) Request about location
@function */
export default async(): Promise<any> => {
  if( !bgRequest ) return sendMessage({ 'type': 'ajaxes.ipInfo' });


  const baseUrl: string = await availableServer.getServer();
  const url: string =
    baseUrl + '/location?locale=' +
    _browser.runtime.getManifest().current_locale;

  return apiRequest( url, { 'method': 'GET' });
};
