/* global Price, Promotion */
import alarms from 'alarms';
import availableServer from 'availableServer';
import Browser from 'crossbrowser-webextension';
import defaultPrices from 'bg/defaultPrices';
import ga from 'ga';
import jitsu from 'jitsu';
import notificationsActivation from './notifications';
import onStartAction from 'bg/onStartAction';
import promotionsActivation from './activation';
import request from './request';
import storage from 'storage';
import store from 'store';
import timemarks from 'bg/timemarks';

const { _ } = self;


const manifestVersion = Browser.runtime.getManifest().manifest_version;
const refreshDelay: integer = 24 * 3600 * 1000;


let newInstallation = false;

Browser.runtime.onInstalled.addListener( details => {
  if( details.reason === 'install' ) {
    newInstallation = true;
  }
});


/** @function */
const setPrices = async(): Promise<void> => {
  const now: integer = Date.now();
  const storeState = await store.getStateAsync();

  const activePromotionWithTariff: Promotion | undefined =
    storeState.promotions.find( ({ from, till, tariffs }) => (
      from <= now && now <= till && tariffs
    ) );

  const prices: Price[] = ( () => {
    if( !activePromotionWithTariff?.tariffs ) return defaultPrices;
    
    return activePromotionWithTariff.tariffs.flatMap(
      tariff => tariff.prices.map( ({ currency, value, oldValue }) => ({
        currency,
        value,
        oldValue,
        'duration': tariff.duration
      }) )
    );
  })();
  const priceTrial: integer | void = activePromotionWithTariff?.trialDays;

  
  if( !_.isEqual( storeState.prices, prices ) ) {
    store.dispatch({ 'type': 'Prices: set', prices });
  }
  if( storeState.priceTrial !== priceTrial ) {
    store.dispatch({ 'type': 'Price trial: set', priceTrial });
  }
};


/** @function */
const putData = async(): Promise<void> => {
  await availableServer.initialRequestComplete;
  
  const { user } = await store.getStateAsync();
  const clientId: string = await ga.full.userIdPromise;

  const promotions: Promotion[] = await request({
    clientId,
    'credentials': user.loginData?.credentials
  });

  store.dispatch({ 'type': 'Promotions: set', 'data': promotions });
  setPrices();

  timemarks.set( 'promotions' );
};


const contentScriptUrl = '/promoPageExecutor.js';

/** @function */
const showPromotions = async(): Promise<void> => {
  const state = await store.getStateAsync();

  const premiumUser: boolean = state.user.premium;
  const promotionsBlock: boolean = state.promotionsBlock;
  const usedPromotions: string[] = await promotionsActivation.get();
  const now: integer = Date.now();

  // Not activated promotions in time of need
  let activePromotions: Promotion[] = [];
  
  if( !promotionsBlock ) {
    activePromotions = state.promotions
      .filter( ({ id, from, till, page }) => (
        page && !usedPromotions.includes( id ) && from <= now && now <= till
      ) )
      .filter(
        ({ kind }) => kind === 'personal' || !premiumUser
      ); // For free all, for premium -> only personal
    
    if( !newInstallation ) {
      activePromotions =
        activePromotions.filter( ({ pageScope }) => pageScope !== 'new' );
    }
  }

  const executeContentScript = typeof browser === 'undefined'; // Only for Chrome

  activePromotions.forEach( async({ id, page, pageActive, pageScope }) => {
    promotionsActivation.add( id );

    jitsu.track( 'promo_tab', {
      'campaign': id,
      'pageActive': pageActive ? '1' : '0',
      'scope': pageScope || 'all'
    });

    const { 'id': tabId } = await Browser.tabs.create({
      'active': Boolean( pageActive ),
      'url': page
    }) || {};

    if( executeContentScript && tabId ) { // Chrome only
      if( manifestVersion === 3 ) {
        chrome.scripting.executeScript({
          'target': { tabId },
          'files': [ contentScriptUrl ],
        });
      }
      else {
        Browser.tabs.executeScript( tabId, { 'file': contentScriptUrl });
      }
    }
  });

  setPrices();
};


/** @function */
const showNotifications = async() => {
  const state = await store.getStateAsync();
  const premiumUser: boolean = state.user.premium;
  const now: integer = Date.now();

  if( !premiumUser ) {
    const usedPromotions/*: string[]*/ = await notificationsActivation.get();
    const activePromotions/*: Promotion[]*/ = state.promotions.filter(
      ({ id, from, till, notifications }) => (
        notifications
        && notifications.length
        && !usedPromotions.includes( id )
        && from <= now
        && now <= till
      )
    );
    const activePromotion = activePromotions[ 0 ];

    if( activePromotion ) {
      storage.remove( 'notificationHidden' );
      notificationsActivation.add( activePromotion.id );
    }
  }
};


onStartAction( async() => {
  alarms.createCycle(
    'promotions/notifications', { 'periodInMinutes': 3 }
  );
  alarms.createCycle(
    'promotions/promotions', { 'periodInMinutes': 60 }
  );

  // Initial show
  showPromotions(); // Due to 2 promos for first installation -> too much for first time
  showNotifications();

  // Initial AJAX
  const periodInMinutes = refreshDelay / 60000;
  const mark = await timemarks.get( 'promotions' );
  if( !mark ) {
    putData();
    alarms.createCycle( 'promotions/putData', { periodInMinutes });
    return;
  }

  const timePassed = Date.now() - mark;
  if( timePassed < 0 || timePassed >= refreshDelay ) {
    putData();
    alarms.createCycle( 'promotions/putData', { periodInMinutes });
    return;
  }

  alarms.createCycle( 'promotions/putData', {
    'delay': refreshDelay - timePassed,
    periodInMinutes
  });
});


alarms.on( ({ name }) => {
  switch( name ) {
    case 'promotions/notifications':
      showNotifications();
      return;
    case 'promotions/promotions':
      showPromotions();
      return;
    case 'promotions/putData':
      putData();
  }
});


// Subscribe to account changes: registered -> unregistered OR premium -> not premium
store.onChange(
  ({ 'user': { loginData, email, 'premium': premiumUser } }) => {
    const registeredUser = Boolean( email );

    return {
      'credentials': loginData?.credentials,
      premiumUser,
      registeredUser,
      'subscription': loginData?.subscription
    };
  },
  putData
);


// Promotion tab after first connection
{
  const setPhaseTo1 = () => { // Phase 0 -> 1: runtime.onInstalled event
    storage.set( 'Promotion tab after first connection: phase', 1 );
  };

  ( async() => {
    const phase =
      await storage.get( 'Promotion tab after first connection: phase' );
    if( phase === 0 ) setPhaseTo1();
  })();

  storage.onChange({
    'for': [ 'Promotion tab after first connection: phase' ],
    'do': ( storageData: Record<string, any> ) => {
      const value =
        storageData[ 'Promotion tab after first connection: phase' ];

      if( value === 0 ) setPhaseTo1();
    }
  });
}
{
  const triggerShowPromotions = () => {
    showPromotions();
    
    storage.set( 'Promotion tab after first connection: phase', 2 );
  };

  ( async() => {
    const firstConnection = await storage.get( 'first connection' );
    const phase =
      await storage.get( 'Promotion tab after first connection: phase' );
    if( firstConnection === true && phase === 1 ) triggerShowPromotions();
  })();

  storage.onChange({
    'for': [ 'first connection' ],
    'do': async( storageData: Record<string, any> ) => {
      const firstConnection = storageData[ 'first connection' ];
      if( firstConnection !== true ) return;

      const phase =
        await storage.get( 'Promotion tab after first connection: phase' );
      if( phase === 1 ) triggerShowPromotions();
    }
  });
}


export default {
  'clear': () => {
    storage.set( 'promotionsActivation', [] );
    store.dispatch({ 'type': 'Promotions: set', 'data': [] });
  },
  'request': putData,
  setPrices,
  'show': showPromotions
};
