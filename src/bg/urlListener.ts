/* global Tab */
/** Part of background.js */
import Browser from 'crossbrowser-webextension';
import findMatchingFilterForDomain from 'tools/findMatchingFilterForDomain';
import ga from 'ga';
import jitsu from 'jitsu';
import onStartAction from 'bg/onStartAction';
import store from 'store';
import storage from 'storage';
import timemarks from './timemarks';
import urlToDomain from 'tools/urlToDomain';


const state: {
  'id': integer | null,
  'url': string | null,
  'domain': string | null
} = { 'id': null, 'url': null, 'domain': null };

let firstConnectionGaSent: boolean = false;


/** @function */
const dispatch = async( url: string | null = null ): Promise<void> => {
  // URL level
  if( state.url === url ) return;
  state.url = url;

  // Domain level
  const domain: string | null = urlToDomain( url );
  if( state.domain === domain ) return;
  state.domain = domain;

  store.dispatch({ 'type': 'Domain: set', domain });
  if( !domain ) return;

  const { 'userPac': pac } = await store.getStateAsync();
  const matchedSmartSettingsDomain = findMatchingFilterForDomain(
    pac.filters, domain
  );

  const { firstPopupOpen, 'first connection': firstConnection } =
    await Browser.storage.local.get( [ 'firstPopupOpen', 'first connection' ] );
  const condition =
    firstPopupOpen === 'fulfilled'
    && firstConnection !== true
    && !firstConnectionGaSent
    && Boolean( pac.mode === 'proxy' || matchedSmartSettingsDomain );
  if( condition ) {
    firstConnectionGaSent = true;
    await storage.set( 'first connection', true );

    ga.full({
      'category': 'onboarding',
      'action': 'first_connection',
      'label': Browser.runtime.getManifest().version
    });
    jitsu.track( 'first_connection' );
  }

  if( matchedSmartSettingsDomain ) {
    // Only once per 24 hours
    const mark = await timemarks.get( 'GA Rare smartSettingsUseDaily' );

    if( !mark || Date.now() >= mark + 24 * 3600 * 1000 ) {
      timemarks.set( 'GA Rare smartSettingsUseDaily' );

      ga.full({
        'category': 'smartSettings',
        'action': 'smartSettingsUseDaily'
      });
      jitsu.track( 'smartSettingsUseDaily' );
    }
  }
};


Browser.tabs.onActivated?.addListener?.( async({ tabId }) => {
  const { id, url } = await Browser.tabs.get( tabId );
  state.id = id;
  dispatch( url );
});

Browser.tabs.onUpdated?.addListener?.( ( tabId, x, { url }) => {
  if( state.id !== tabId ) return;

  dispatch( url );
});

// Firefox for Android has no browser.windows API at all
Browser.windows?.onFocusChanged?.addListener?.( async windowId => {
  if( windowId === -1 ) return;

  const [ data ]: Tab[] =
    await Browser.tabs.query({ windowId, 'active': true });
  if( !data ) {
    state.id = null;
    dispatch();
    return;
  }

  let { id, url } = data;
  state.id = id;
  dispatch( url );
});


// Initial URL
onStartAction( async() => {
  let tabs: Tab[] =
    await Browser.tabs.query({ 'active': true, 'currentWindow': true });
  if( !tabs.length ) tabs = await Browser.tabs.query({ 'active': true }); // For strange popups like google proxy permission
  
  const tab = tabs[ 0 ];
  if( !tab ) { // Impossible, but https://bugs.chromium.org/p/chromium/issues/detail?id=298114
    dispatch();
    return;
  }

  const { id, url } = tab;
  state.id = id;

  dispatch( url );
});
