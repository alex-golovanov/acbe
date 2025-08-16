import Browser from 'crossbrowser-webextension';


const manifestVersion = Browser.runtime.getManifest().manifest_version;

/** @function */
export default ( action: ( ...args: any[] ) => any ): void => {
  if( manifestVersion === 2 ) {
    action();
    return;
  }

  Browser.runtime.onInstalled.addListener( action );
  Browser.runtime.onStartup.addListener( action );
};
