import Browser from 'crossbrowser-webextension';
import config from 'config';
import ga from 'ga';


const trackerId = config.type.startsWith( 'qa' )
  ? 'G-WKQJ3BZN1Z' // qa
  : 'G-J9001B3EEV'; // production
const optimizeId = config.type.startsWith( 'qa' )
  ? 'OPT-T7HXR72' // qa
  : 'OPT-PTBVFMF'; // production

const gtagUniqueKey1 = config.type.startsWith( 'qa' )
  ? 'GT-TWD2G3H'
  : 'GT-MKTPLVZ';
const gtagUniqueKey2 = config.type.startsWith( 'qa' )
  ? '101005377'
  : '101005412';

// @ts-ignore
self.optyaGtagId = trackerId; // @ts-ignore
self.optyaId = optimizeId; // @ts-ignore
self.gtagUniqueKey1 = gtagUniqueKey1; // @ts-ignore
self.gtagUniqueKey2 = gtagUniqueKey2;

const manifestVersion: integer =
  Browser.runtime.getManifest().manifest_version;


/** @method */
export default async(
  reason?: 'install'
): Promise<Array<{ 'name': string, 'value': string }> | void> => {
  if( typeof browser !== 'undefined' ) return; // Only for Chrome
  if( manifestVersion === 3 ) return; // Only for Manifest V2

  const clientId: string = await ga.full.userIdPromise;

  // @ts-ignore
  self.dataLayer = self.dataLayer || [];
  const gtag = function( ...args: any[] ) { // @ts-ignore
    self.dataLayer.push( arguments );
  };

  gtag( 'js', new Date() );
  gtag( 'config', trackerId, {
    'send_page_view': true, // Includes pageview
    'client_storage': 'none', // not documented feature -> cookie still exist
    //'user_id': clientId, // documented feature -> it's NOT working
    'client_id': clientId, // not documented feature -> it's working
    'transport_type': 'xhr' // No image sending
  });

  // @ts-ignore
  self.optyaGtagCliendId = 'ChAI8LTvpAYQ2eTwkoLhqNJ0EiUAYqO6cpFMMyA4oODEgVHcK/GRt02LHIhXOzY5/j4V8frRaB6SGgLWwA\x3d\x3d';
};
