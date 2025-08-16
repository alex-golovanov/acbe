import Browser from 'crossbrowser-webextension';
import { Diagnostics } from './index';


const desiredPage: string =
  Browser.runtime.getURL( '/pages/diagnostics/diagnostics.html' );

const manifestVersion = chrome.runtime.getManifest().manifest_version;


/** @method */
export default async function( this: Diagnostics ): Promise<void> {
  const existenceCheck = await ( async() => {
    if( manifestVersion === 2 ) {
      const tabs = Browser.extension.getViews({ 'type': 'tab' });
      
      return tabs.some( ({ location }) => location.href === desiredPage );
    }
    else {
      const existenceCheck: true | void = await Browser.runtime.sendMessage({
        'type': 'Diagnostics page existence check'
      });
      return existenceCheck;
    }
  })();

  if( existenceCheck ) { // Focus tab
    // Browser.tabs.query does not work in Chrome due to lack of 'tabs' permission
    if( typeof browser !== 'undefined' || manifestVersion === 3 ) {
      const tabs = await Browser.tabs.query({ 'url': desiredPage });

      if( tabs.length ) {
        Browser.tabs.update(
          tabs[ 0 ].id, { 'active': true, 'highlighted': true }
        );
      }
    }
    else {
      const pseudoTabs =
        Browser.extension.getViews({ 'type': 'tab' })
          .filter( ({ location }) => location.href === desiredPage );
      if( pseudoTabs.length ) pseudoTabs[ 0 ].focus();
    }

    return;
  }
  
  this.terminate();
  Browser.tabs.create( '/pages/diagnostics/diagnostics.html' );
};
