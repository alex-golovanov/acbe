import Browser from 'crossbrowser-webextension';
import onAuthRequired from './onAuthRequired';
import onBeforeSendHeaders from './onBeforeSendHeaders';
import onCompleted from './onCompleted';
import onHeadersReceived from './onHeadersReceived';


/** @function */
export default (): void => {
  if( !Browser.webRequest ) return;

  // Count of proxied pages
  /*Browser.webRequest.onBeforeSendHeaders.addListener(
    ({ url }) => {
      if( !store.getStateSync().proxy.connected ) return;
      Counters.increase( 'proxied pages' );
    },
    { 'urls': [ '<all_urls>' ], 'types': [ 'main_frame' ] }
  );*/

  onAuthRequired();
  onBeforeSendHeaders();
  onCompleted();
  onHeadersReceived();
};
