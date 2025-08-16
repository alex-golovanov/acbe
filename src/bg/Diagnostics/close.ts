import Browser from 'crossbrowser-webextension';


const desiredPage: string =
  Browser.runtime.getURL( '/pages/diagnostics/diagnostics.html' );


/** @method */
export default async function() {
  if( typeof browser !== 'undefined' ) {
    let tabs = await Browser.tabs.query();
    let ids = tabs
      .filter( ({ url }) => url === desiredPage )
      .map( ({ id }) => id );
    if( ids.length ) Browser.tabs.remove( ids );
    return;
  }

  // Chrome
  let tabs = Browser.extension.getViews({ 'type': 'tab' });
  tabs
    .filter( ({ location }) => location.href === desiredPage )
    .forEach( tab => { tab.close(); });
};
