/* global WebRequestHttpHeader */
import Browser from 'crossbrowser-webextension';
import config from 'config';
import encodeTokenCredentials from 'tools/encodeTokenCredentials';
import store from 'store';


const manifestVersion = chrome.runtime.getManifest().manifest_version;

export default async() => {
  if( manifestVersion === 3 ) return;

  await store.ready;

  /** Especially for site browsec.com -> modify headers to know user installed
  extension and credentials for automatic login */
  Browser.webRequest.onBeforeSendHeaders.addListener(
    ({ url, requestHeaders }): { 'requestHeaders': WebRequestHttpHeader[] } => {
      if( !url.includes( '/api/' ) && !url.includes( '/assets/' ) ) {
        requestHeaders.push({ 'name': 'X-Browsec-Installed', 'value': '1' });

        const credentials = store.getStateSync().user.loginData?.credentials;
        if( credentials ) {
          requestHeaders.push({
            'name': 'Authorization',
            'value': encodeTokenCredentials( credentials )
          });
        }
      }

      return { requestHeaders };
    },
    {
      'urls': config.siteAuthorizationDomains.map(
        domain => `https://${domain}/*`
      )
    },
    [ 'blocking', 'requestHeaders' ]
  );
};
