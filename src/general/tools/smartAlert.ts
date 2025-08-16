/* global Tab */
import Browser from 'crossbrowser-webextension';

export default async( msg: string ) : Promise<any> => {
  if( typeof alert === 'function' ) {
    return alert( msg );
  }

  try {
    let tabs: Tab[] = await Browser.tabs.query({ 'active': true });

    if( !tabs.length ) {
      console.error( '[smartAlert]: No active tab found;', { msg });
      return;
    }

    const targetBrowser = typeof chrome !== 'undefined' ? chrome : browser;

    return await targetBrowser.scripting.executeScript({
      'target': { 'tabId': tabs[ 0 ].id },
      'args': [ msg ],
      'func': ( msg: string ) => { alert( `Browsec VPN: ${msg}` ); },
    });
  }
  catch ( error ) {
    console.error( error, { msg });
  }
};
