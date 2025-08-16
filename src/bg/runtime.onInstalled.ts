/* global Tab */
import alarms from 'alarms';
import Browser from 'crossbrowser-webextension';
import config from 'config';
import ga from 'ga';
import gaInititator from './gaInititator';
import jitsu from 'jitsu';
import log from 'log';
import proxy from 'proxy';
import Statistics from 'bg/Statistics';
import storage from 'storage';
import timemarks from 'bg/timemarks';
import versionCompare from 'tools/versionCompare';
import lowLevelPac from 'lowLevelPac';
import { STORAGE } from 'constants/storageKeys';

type Listener = {
  'type': string,
  'callback': ( version?: string ) => any
};


/** @class singleton */
const onInstalled = new class {
  listeners: Listener[];

  constructor() {
    this.listeners = [];

    Browser.runtime.onInstalled.addListener( details => {
      if( details.reason === 'install' ) {
        for( const { type, callback } of this.listeners ) {
          if( type === 'install' ) callback();
        }
      }
      else if( details.reason === 'update' ) {
        for( const { type, callback } of this.listeners ) {
          if( type === 'update' ) callback( details.previousVersion );
        }
      }
    });
  }

  /** @method */
  addListener(
    type: 'install' | 'update',
    callback: ( ...args: any[] ) => any
  ) {
    this.listeners.push({ type, callback });
  }

  /** @method */
  removeListener( params: string | ( ( ...args: any[] ) => any ) ) {
    if( typeof params === 'string' ) {
      this.listeners =
        this.listeners.filter( ({ type }) => type !== params );
    }
    else if( typeof params === 'function' ) {
      this.listeners =
        this.listeners.filter( ({ callback }) => callback !== params );
    }
  }
}();


const ourExtensionIds = // Only chrome ids (to ignore Edge / Opera)
  config.type.startsWith( 'qa' )
    ? [ 'ikjnacbhmajnfdhilmdcjdggbcjiimkm', 'nmnhopbcmfpjkmkdalcdakkppkaegoof' ]
    : [ 'omghfjlpggmjjaagoclmmobgdodcjboh' ];


/** Runs when user has just installed the plugin OR updated
@function */
export default (): void => {
  // New installation
  onInstalled.addListener( 'install', async() => {
    // Show congratulations tab
    ( async() => {
      const isFirefox = typeof browser !== 'undefined';

      if (isFirefox) {
        await storage.set( STORAGE.firefoxPolicyTabOpenedSource, 'auto' );

        await Browser.tabs.create({
          url: '/pages/firefoxAgreeConditions/firefoxAgreeConditions.html'
        });

        return;
      }

      const systemCondition =
        navigator.userAgent.includes( '(Windows' )
        || navigator.userAgent.includes( 'Mac OS' );
      if( !systemCondition ) return; // Only Windows / MacOS

      if( !ourExtensionIds.includes( Browser.runtime.id ) ) return; // Only real extensions

      // Get tab with chrome store page
      const tabs: Tab[] = await Browser.tabs.query();
      const tabId: integer | undefined = tabs.find( ({ url }) => (
        url
        && url.startsWith( 'https://chromewebstore.google.com/detail/' )
        && ourExtensionIds.some(
          extensionId => url.includes( extensionId )
        )
      ) )?.id;

      jitsu.track(
        tabId ? 'store_tab_opened' : 'store_tab_closed'
      );

      if( tabId ) {
        ga.full({
          'category': 'onboarding',
          'action': 'congratsOpen',
          'label': 'chromeWebStore'
        });
      }

      const url = '/pages/congratulations/congratulations.html';
      if( tabId ) { // Tab exist
        // Change Chrome Webstore tab
        await Browser.tabs.update( tabId, { url });
      }
      // else do nothing


      // Open congratulations tab again
      ( async() => {
        if( !tabId ) return;
        if( typeof browser !== 'undefined' ) return; // Only Chrome
        if( !/Windows|Macintosh|Mac OS X/.test( navigator.userAgent ) ) return; // Only Windows and Mac OS

        await ga.full.userIdPromise;

        const newUser: boolean = await storage.get( 'gaRareUserIsNew' ) ?? true;
        if( !newUser ) return;

        // Wait 10 minutes
        await new Promise( resolve => { setTimeout( resolve, 10 * 60 * 1000 ); });
      })();
    })();


    const manifestVersion: string = Browser.runtime.getManifest().version;

    log( 'browser.runtime.onInstalled', 'install' );

    ga.partial({
      'category': 'extension', 'action': 'install', 'label': manifestVersion
    });
    ga.full({ 'category': 'onboarding', 'action': 'install' });

    jitsu.track( 'install' );

    storage.set({
      'installVersion': manifestVersion,
      'First start tips: phase': 0
    });

    storage.set( 'Promotion tab after first connection: phase', 0 );

    // First Proxy ON after install
    storage.set( 'onboarding firstStart', false );


    Statistics.set( 'installDate', Date.now() );
    storage.set( 'firstPopupOpen', 'installed' );
    storage.set( 'acceptTermsConditions', 'installed' );

    /** Congratulations for all first users
    congratulations tab id for changaing tab url in future (237 experiment) */
    ( async() => {
      const experimentVersion =
        typeof browser === 'undefined'
        && !self.navigator.appVersion.includes( 'OPR/' );
      if( !experimentVersion ) return;

      const tabs: Tab[] = await Browser.tabs.query();

      const tabId/*: integer | void*/ = tabs.find( ({ url }) => (
        url
        && url.startsWith( 'https://chromewebstore.google.com/detail/' )
        && (
          url.includes( 'omghfjlpggmjjaagoclmmobgdodcjboh' )
          || url.includes( 'ikjnacbhmajnfdhilmdcjdggbcjiimkm' )
          || url.includes( 'nmnhopbcmfpjkmkdalcdakkppkaegoof' )
        )
      ) )?.id;

      // If Chrome Webstore tab open -> change it's tab
      if( tabId ) {
        return;
      }

      // Otherwise - with delay 10 seconds show separate congratulations tab
      alarms.createOneTime( 'runtime.onInstalled: congratulations', {
        'delay': 10 * 1000
      });
    })();
  });


  // Update of installed extention
  onInstalled.addListener( 'update', async( previousVersion: string ) => {
    // Each like '2.2.99'
    const version = {
      'previous': previousVersion,
      'current': Browser.runtime.getManifest().version
    };

    log( 'browser.runtime.onInstalled', 'update', version.previous );

    ga.partial({
      'category': 'extension', 'action': 'update', 'label': version.current
    });

    jitsu.track( 'update' );

    const installDate = await Statistics.get( 'installDate' );
    if( !installDate ) Statistics.set( 'installDate', Date.now() );

    // Get experiments
    gaInititator();

    await lowLevelPac.shuffle();
    proxy.setFromStore();
  });
};


