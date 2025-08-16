/* global PopupBanner, SiteFilter */
import './components/active-country';
import './components/context-menu';
import './components/first-start-tips-country-select';
import './components/first-start-tips-start-vpn';
import './components/first-start-agree-terms-conditions';
import './components/general-tooltip';
import './components/head';
import './components/index/filters/country-list';
import './components/page-switch';
import './components/popups/description';
import './components/popups/help';
import './components/popups/locations-information';
import './components/popups/premium-onerule';
import './components/popups/premium';
import './components/popups/proxy-blocked';
import './components/popups/proxyBlockedByAntivirus';
import './components/tooltip-error';

import './tools/permissions';
import activeBanner from './objects/activeBanner';
import addCountrySelectMask from './includes/addMask/countrySelect';
import addStartVpnMask from './includes/addMask/startVpn';
import addStartAcceptTermsConditions from './includes/addMask/acceptTermsConditions';
import Browser from 'crossbrowser-webextension';
import Deferred from 'tools/Deferred';
import ga from 'ga';
import getUserLanguage from 'tools/getUserLanguage';
import jitsu from 'jitsu';
import LocalDelayRecord from 'LocalDelayRecord';
import lowLevelPac from 'lowLevelPac';
import proxy from 'proxy';
import storage from 'storage';
import store from 'store';
import sendMessage from 'tools/sendMessage';
import versionCompare from 'tools/versionCompare';
import { checkShowingAntivirusModal, showModal } from './tools';
import { STORAGE } from 'constants/storageKeys';

// @ts-ignore
window.addCountrySelectMask = addCountrySelectMask;

const language = getUserLanguage();

// @ts-ignore
window.language = language;

document.documentElement.setAttribute( 'lang', language );
document.documentElement.lang = language;


// Correct zoomed popup
// @ts-ignore
window.zoomRatio = 1;

if( typeof browser === 'undefined' ) { // Only chrome
  if( window.devicePixelRatio > 1 && document.documentElement.offsetWidth < 402 ) {
    const widthZoomRatio = ( document.documentElement.offsetWidth - 17 ) / 402; // 17 - scrollbar
    const heightZoomRatio = ( () => {
      const div = document.createElement( 'div' );
      div.style.cssText = 'height: 100vh;';

      document.body.append( div );

      const height = div.offsetHeight;

      div.remove();

      return height / 415;
    })();

    const zoomRatio = Math.min( widthZoomRatio, heightZoomRatio ); // @ts-ignore
    window.zoomRatio = zoomRatio;

    const element = document.querySelector( '.MainContainer' ) as ( HTMLElement | null );
    if( element ) {
      element.style.cssText = 'zoom:' + zoomRatio;
    }
  }
}


/** @function */
const triggerPersonalBannerView = async( activeBanner: PopupBanner ) => {
  if( activeBanner?.type !== 'custom' ) return;

  await new Promise( resolve => { setTimeout( resolve, 2000 ); });

  // Remove dot from browserAction icon
  sendMessage({
    'type': 'personal banner view',
    'id': activeBanner.promotionId
  });
};


jitsu.track( 'popup_open' );


const mobileView: boolean = ( () => {
  const hasTouch =
    'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const mobileOs =
    /android [0-9]/i.test( navigator.userAgent )
    || /iphone;/i.test( navigator.userAgent )
    || /ipad;/i.test( navigator.userAgent )
    || /ipod;/i.test( navigator.userAgent );

  return hasTouch && mobileOs;
})();

if( mobileView ) {
  const element =
    document.querySelector( '.MainContainer' ) as ( HTMLElement | null );

  document.body.classList.add( 'fullScreen' );

  if( element ) {
    if( typeof browser !== 'undefined' ) { // Firefox for Android
      element.classList.add( 'fullScreen' );
    }
    else { // Ya bro mobile
      let borderWidth = window.screen.width * 0.1;

      const physicalBorderSize = window.screen.width * window.devicePixelRatio * 0.1;
      if( physicalBorderSize <= 80 ) {
        borderWidth = Math.max( borderWidth, 80 / window.devicePixelRatio );
      }

      const screenWidth = window.screen.width - borderWidth;

      element.style.cssText = `width:${screenWidth}px;`;
    }
  }
}


{ // Connection with background
  const id = String( Math.floor( Math.random() * 1000000000 ) );

  const port = Browser.runtime.connect({
    'name': 'popup connection ' + id
  });
  port.onMessage.addListener( ( message ) => {
    if( message !== 'close' ) return;

    window.close();
  });
}


( async() => {
  const pageLoadTimer = new LocalDelayRecord( 'Popup: page load' );

  const deferreds = {
    'domainZoneList': new Deferred() as Deferred<string[]>,
    'storeState': store.ready
  };

  {
    const record = new LocalDelayRecord( 'Popup: domainZoneList' );
    deferreds.domainZoneList.then( () => { record.end(); });
  }
  {
    const record = new LocalDelayRecord( 'Popup: store.ready' );
    deferreds.storeState.then( () => { record.end(); });
  }

  // Storage based load (to resolve FF sendMessage bug)
  let storageValue: any | undefined;
  ( async() => {
    const value = await Browser.storage.local.get( null );
    storageValue = value;

    if( Array.isArray( value.domainZoneList ) ) {
      deferreds.domainZoneList.resolve( value.domainZoneList );
    }

    store.initiate({ 'type': 'storage', value });
  })();

  // Message based load (to resolve Chrome slow load bug)
  ( async() => {
    const output = await sendMessage({ 'type': 'domain zone list' });

    deferreds.domainZoneList.resolve( output );
  })();
  ( async() => {
    const value = await sendMessage({ 'type': 'store: get state' });

    store.initiate({ 'type': 'store state', value });
  })();

  const domainZoneList = await deferreds.domainZoneList;
  const storeState = await deferreds.storeState;

  Object.assign( self, { domainZoneList });

  const firstPopupOpenRecord = new LocalDelayRecord( 'Popup: firstPopupOpen' );
  const firstPopupOpen: string | undefined = storageValue
    ? storageValue.firstPopupOpen
    : await storage.get( 'firstPopupOpen' );
  firstPopupOpenRecord.end();

  const acceptTermsShownRecord = new LocalDelayRecord( 'Popup: acceptTermsShown' );
  const acceptTermsShown: string | undefined = storageValue
    ? storageValue.acceptTermsShown
    : await storage.get( 'startup terms and conditions accepted shown' );
  acceptTermsShownRecord.end();

  const controlStateTimer = new LocalDelayRecord( 'Popup: get control state' );

  // Do we have control over proxy? If true -> we do
  const controlState: boolean = await ( async() => {
    // Firefox OR no problems
    if( typeof browser !== 'undefined' || !storeState.proxyIsBroken ) {
      return true;
    }

    const isControlled: boolean = await proxy.isControlled();
    if( !isControlled ) return false;

    await lowLevelPac.shuffle();
    await proxy.setFromStore();

    return true;
  })();

  controlStateTimer.end();

  sendMessage({ 'type': 'popup open' });

  {
    const { page } = storeState;

    const storageValue = await storage.get( 'reanimator: in progress' );
    if( storageValue === true && page !== 'index:reanimator' ) {
      store.dispatch({ 'type': 'Page: set', 'page': 'index:reanimator' });
    }
    else if( page !== 'index:home' ) {
      store.dispatch({ 'type': 'Page: set', 'page': 'index:home' }); // NOTE critical
    }
  }

  if( firstPopupOpen === 'installed' ) {
    ga.partial({ 'category': 'extension', 'action': 'first_popup_open' });

    const installVersion = storageValue
      ? storageValue.installVersion
      : await storage.get( 'installVersion' );

    const condition =
      typeof installVersion === 'string'
      && versionCompare( installVersion, '>=', '3.28.6' );
    if( condition ) {
      ga.full({
        'category': 'onboarding',
        'action': 'first_popup_open',
        'label': Browser.runtime.getManifest().version
      });
      jitsu.track( 'first_popup_open' );

      ( async() => {
        const phase = await storage.get( 'Reopen congratulations: phase' );
        if( typeof phase !== 'number' ) return;

        storage.set( 'Reopen congratulations: first_popup_open triggered', true );
      })();

      // First start tips
      ( async() => {
        const phase = await storage.get( 'First start tips: phase' );
        if( phase !== 0 ) return;

        storage.set( 'First start tips: phase', 1 );
      })();
    }

    storage.set( 'firstPopupOpen', 'fulfilled' );
  }

  ( () => {
    const parent: HTMLElement | null =
      document.querySelector( 'div.MainContainer' );
    if( !parent ) return;

    const appendElementsTimer = new LocalDelayRecord( 'Popup: append elements' );
    const elements: string[] = [ 'main-head', 'page-switch' ];

    elements.forEach( element => {
      parent.append( document.createElement( element ) );
    });

    if( !controlState ) showModal( 'popup-proxy-blocked' );

    checkShowingAntivirusModal();

    // Add Terms and Conditions screen
    ( async() => {
      const phase = await storage.get( 'First start accept terms and conditions: phase' );
      const newUser = !(typeof phase === 'number');
      const isFirefox = typeof browser !== 'undefined'


      const startupTermsConditionsAccepted = await storage.get( 'startup terms and conditions accepted shown' );
      const acceptTermsConditionsInstalled = await storage.get( 'acceptTermsConditions' ) as any | undefined;
      const showConditions = !startupTermsConditionsAccepted && newUser && !acceptTermsShown && acceptTermsConditionsInstalled === 'installed';

      if (isFirefox) {
        if (!startupTermsConditionsAccepted && newUser && !acceptTermsShown) {
          await storage.set( STORAGE.firefoxPolicyTabOpenedSource, 'panel-icon' );

          await Browser.tabs.create({
            url: '/pages/firefoxAgreeConditions/firefoxAgreeConditions.html',
          });

          window.close();
        }
      }

      if (showConditions && !isFirefox) {
        await addStartAcceptTermsConditions();
      }

      // Add mask with onboarding tips after accepting terms and conditions
      if (!controlState) {
        return false;
      }
      const tipPhase = await storage.get('First start tips: phase');
      const isNewUser = typeof tipPhase === 'number';
      const startupTipsShown = await storage.get('startup tips shown');
      // we don't check this condition (firstPopupOpen === 'installed') as onboarding can be shown not at the first popup open only (but e.g. after the click on Terms & Conditions)
      if (!startupTipsShown && isNewUser) {
        addStartVpnMask();
      }
    })();

    appendElementsTimer.end();
    pageLoadTimer.end();
  })();
})();


self.onerror = ( message, fileName, lineNumber ) => {
  sendMessage({
    'type': 'popup error',
    'data': { message, fileName, lineNumber }
  });

  return false;
};

// Subscribe to user logined <--> unlogined
activeBanner.addListener( ( activeBanner ) => {
  triggerPersonalBannerView( activeBanner );
});
