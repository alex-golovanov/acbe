/* global AjaxAccount, Credentials, OnErrorOccurredDetails, RuntimePort, RuntimeMessageSender, StoreState */
import 'bg/lodashImport'; // must be top level

// Polyfills
import 'polyfills/Array.flat';
import 'polyfills/Array.flatMap';
import 'polyfills/Object.fromEntries';
import 'polyfills/Promise.prototype.finally';
import 'polyfills/String.prototype.padEnd';
import 'polyfills/String.prototype.padStart';

// Libraries
import Browser from 'crossbrowser-webextension';

// Code parts
import account from 'bg/account';
import actions from 'bg/actions';
import ajax from 'tools/ajax';
import ajaxes from 'ajaxes';
import availableServer, { getAndSaveApiDomainsList } from 'availableServer';
import config from 'config';
import Counters from 'bg/Counters';
import createElement from 'tools/createElement';
import Deferred from 'tools/Deferred';
import DelayRecord from 'DelayRecord';
import Diagnostics from 'bg/Diagnostics';
import diagnosticRequests from 'bg/diagnosticRequests';
import domainZoneList from 'bg/domainZoneList';
import ga from 'ga';
import gaInititator from 'bg/gaInititator';
import highLevelPacStoreListeners from 'highLevelPac/storeListeners';
import internationalize from 'tools/internationalize';
import jitsu from 'jitsu';
import log from 'log';
import lowLevelPac from 'lowLevelPac';
import lowLevelPacStoreListeners from 'lowLevelPac/storeListeners';
import onInstalled from 'bg/runtime.onInstalled';
import onMessage from 'bg/runtime.onMessage';
import onStartAction from 'bg/onStartAction';
import permissions from 'bg/permissions';
import promotions from 'bg/promotions';
import proxy from 'proxy';
// @ts-ignore
import punycode from 'punycode'; // eslint-disable-line
import ShowedOffers from 'bg/ShowedOffers';
import Statistics from 'bg/Statistics';
import store from 'store';
import storage from 'storage';
import timemarks from 'bg/timemarks';
import timezoneChange from 'bg/contentScripts/timezoneChange';
import trySendDailyRetention from 'bg/trySendDailyRetention';
import urlModifyParameters from 'tools/urlModifyParameters';
import urlToDomain from 'tools/urlToDomain';
import smartAlert from 'tools/smartAlert';
import UserPropertiesObserver from 'bg/UserPropertiesObserver';
import webRequest from 'bg/webRequest';
import webrtc from 'bg/webrtc';
import KeepAliveWorker from 'bg/keepAliveWorker';
import { weightedRandom, getDefaultCountry } from 'tools/index';
import { getDataAndUpdateServers } from 'bg/serversObject';
import { onGlobalRequestError } from 'bg/antivirusBlock/checkAntivirusBlock';
import highLevelPac from 'highLevelPac';
import { updateDynamicConfig, runAndScheduleDynamicConfigUpdate } from 'bg/dynamicConfig';
import { experimentsHelper } from 'experiments';

import {
  instantPingSmartSettingsServers,
  throttledPingSmartSettingsServers,
  scheduleSmartSettingsPingAlarms,
} from 'bg/pingSmartSettings';

import 'bg/browsecComAvailable';
import 'bg/browserIcon';
import 'bg/contentScripts';
import 'bg/reanimator';
import 'bg/daysAfterInstall';
import 'bg/declarativeNetRequest';
import 'bg/ping';
import 'bg/popupListeners';
import 'bg/proxyErrors';
import 'bg/proxyIsBroken';
import 'bg/runtime.onConnect';
import 'bg/urlListener';
import 'bg/contentScripts/notification/messageSystem';
import 'bg/contentScripts/promoPageExecutor/messageSystem';
import 'bg/contentScripts/timezoneChange/messageSystem';
import 'time';

log('Background script start');

const manifestVersion = Browser.runtime.getManifest().manifest_version;

/**
@function
@return - true if account valid */
const validateAccount = (account: AjaxAccount): boolean => {
  if (account.type === 'guest') return true;

  const token = account.credentials.access_token;

  return Boolean(token && token.match(/^[a-zA-Z0-9]{20}$/));
};


/** @function */
const reloadFullServersChain = async () => {
  try {
    await getAndSaveApiDomainsList();
  }
  catch (x) { }

  await availableServer.restart();

  try {
    await getDataAndUpdateServers();
  }
  catch (x) { }

  await proxy.setFromStore();
};


// Global assigments (needed for access from other pages / content script)
Object.assign(self, {
  account,
  actions,
  ajaxes,
  availableServer,
  Browser,
  config,
  Diagnostics,
  diagnosticRequests,
  domainZoneList,
  gaInititator,
  permissions,
  promotions,
  proxy,
  punycode,
  reloadFullServersChain,
  ShowedOffers,
  UserPropertiesObserver,
  Statistics,
  storage,
  store,
  timezoneChange,
  highLevelPac,
  timemarks,
  experimentsHelper,
  tools: {
    createElement,
    Deferred,
    internationalize,
    urlModifyParameters,
    urlToDomain,
    weightedRandom,
    smartAlert,
    throttledPingSmartSettingsServers,
    instantPingSmartSettingsServers,
    updateDynamicConfig,
    getDefaultCountry,
  },
  webrtc
});

// @ts-ignore
self.getFirstServerByCountry = async () => {
  const { lowLevelPac } = await store.getStateAsync();

  return Object.fromEntries(
    Object.entries(lowLevelPac.countries).map(
      ([country, servers]) => {
        return [country, servers[0]];
      }
    )
  );
};


Browser.proxy.onError.addListener(async details => {
  log('proxy.onError', details);
  Counters.increase('proxy errors');
  throttledPingSmartSettingsServers();

  if( details.error === 'net::ERR_PAC_SCRIPT_FAILED' ) {
    jitsu.track('error', {
      'type': 'runtime_error',
      'code': details.error,
      'text': details.details
    });
  }
});


store.initiate();


onInstalled();


Browser.runtime.onStartup.addListener(() => {
  log('browser.runtime.onStartup');

  ga.partial({
    'category': 'extension',
    'action': 'start',
    'label': Browser.runtime.getManifest().version
  });
});


webRequest(); // NOTE very critical


// First user premium gain
store.onChange(
  ({ user }) => user.premium,
  async (userIsPremium) => {
    if (!userIsPremium) return;

    const value: true | undefined =
      await storage.get('User premium first gain');
    if (value) return;

    storage.set('User premium first gain', true);
    jitsu.track('premium');
  }
);


{ // Startup tips shown (ensuring not showing startup tips on user data changes)
  /** @function */
  const listener = async () => {
    const startupTipsShown = await storage.get('startup tips shown');
    if (startupTipsShown === true) return;

    storage.set('startup tips shown', true);
  };

  store.onChange(
    ({ userPac }) => userPac,
    listener
  );

  store.onChange(
    ({ user }) => Boolean(user.email),
    listener
  );
}


// First Proxy ON after install
(() => {
  store.onChange(
    ({ userPac }) => userPac.mode,
    async () => {
      const storageValue: boolean | undefined =
        await storage.get('onboarding firstStart');
      if (storageValue !== false) return;

      ga.full({ 'category': 'onboarding', 'action': 'firstStart' });
      jitsu.track('firstStart');

      storage.set('onboarding firstStart', true);
    }
  );
})();


onStartAction(() => {
  log(
    (manifestVersion === 3 ? 'Service worker' : 'Background') + ' start'
  );

  // File system state
  (async () => {
    try {
      await Browser.storage.local.set({ 'file_system_state': true });
      await Browser.storage.local.get('file_system_state');
      log('File system OK');
    }
    catch (error) {
      log.error('File system broken');
    }
  })();
});

if( manifestVersion === 3 ) {
  const keepAliveWorker = new KeepAliveWorker();
  keepAliveWorker.start();
}

onStartAction( () => {
  if( manifestVersion === 3 ) {
    scheduleSmartSettingsPingAlarms();
  }
});

onStartAction( () => {
  runAndScheduleDynamicConfigUpdate();
});

onStartAction(async () => {
  await storage.set('User data promise', 0);

  /** Initial load of account data (especially for FF proxy check)
  @type {Promise} - with user data */
  (async () => {
    await storage.set('User data promise', 1);

    const user = await (async () => {
      try {
        return await account.load();
      }
      catch (error) {
        availableServer.initialRequestComplete.then(() => { account.load(); });
        const { user } = await store.getStateAsync();

        return user; // No broken chain
      }
    })();
    await lowLevelPac.shuffle(); // Set initial proxy state

    await storage.set('User data promise', 2);

    return user;
  })();
});


/** Change of premium status leads to high level PAC country change */
store.onChange(
  ({ 'user': { email, 'premium': premiumUser } }) => ({
    'logined': Boolean(email), premiumUser
  }),
  async (
    { 'logined': loginedNew, 'premiumUser': premiumNew },
    { 'logined': loginedOld, 'premiumUser': premiumOld },
    storeState
  ) => {
    if (premiumOld !== premiumNew) { // Premium status change
      const userDataPromiseValue =
        await storage.get('User data promise');
      if (userDataPromiseValue !== 2) return;

      const action: string = !premiumOld && premiumNew
        ? 'from free to premium'
        : 'from premium to free';
      const name: string = `Proxy: switching ${action} servers`;

      if (!loginedNew) log(name);

      let timer: DelayRecord | undefined;

      if (loginedNew) { // Only on login
        timer = new DelayRecord(name);
      }

      if (premiumNew) { // From free to premium -> just re-shuffle
        lowLevelPac.shuffle();
      }
      else { // From premium to free
        const freeCountries = Array.from(storeState.proxyServers.freeCountries()); // @ts-ignore
        const defaultCountry = await getDefaultCountry();

        if (!freeCountries.includes(storeState.userPac.country)) {
          store.dispatch({
            'type': 'User PAC: update',
            'data': { 'country': freeCountries.includes(defaultCountry) ? defaultCountry : freeCountries[0] }
          });
        }
        else {
          lowLevelPac.shuffle();
        }
      }

      timer?.end?.();
    }

    // Login changed, but premium status same
    // -> Do nothing
  }
);


// browser.runtime.onMessage
// Change authentication data from site login
onMessage.addListener({
  'type': 'auth',
  'callback': (
    { account, env }: { 'account': unknown, 'env': string },
    sender: RuntimeMessageSender
  ) => {
    const accountData = account;
    const senderUrl = sender.url;

    if (typeof senderUrl !== 'string') return;
    if (!senderUrl.startsWith('https://')) return;

    if (typeof accountData !== 'object' || !accountData) return;

    if (config.type !== env) {
      log('Site auth from different environment', config.type, env);
      return;
    }

    // @ts-ignore
    accountData.type = accountData.email ? 'logined' : 'guest';

    // @ts-ignore
    if (!validateAccount(accountData)) {
      throw new Error('invalid credentials: ' + JSON.stringify(accountData));
    }

    store.dispatch({
      'type': 'User: set',
      'data': (accountData as AjaxAccount)
    });
  }
});

/** Reload account */
onMessage.addListener({
  'type': 'reload',
  'callback': (x: any, sender: RuntimeMessageSender) => {
    const senderUrl = sender.url;
    if (typeof senderUrl !== 'string') return;

    let urls: Array<string> = [senderUrl, config.baseUrl].map(
      item => (new URL(item)).origin
    );
    if (urls[0] !== urls[1]) {
      log.warn('Message from an untrusted sender: ' + sender);
      return;
    }

    account.reload();
  }
});


Browser.tabs.onUpdated.addListener(async (tabId, { status }, tab) => {
  if (status !== 'complete') return;
  const url = tab.url?.split?.('?')?.[0];
  if (url !== config.baseUrl + '/en/accounts/index') return;

  const storageValue = await storage.get('account suspended restore');
  if (storageValue !== 'initiated') return;

  storage.set('account suspended restore', 'fullfilled');

  Browser.tabs.sendMessage(tabId, { 'show update payment info': true });
});


{
  /** @function */
  const action = async (storeState: StoreState) => {
    const hasSmartSetting = storeState.userPac.filters.some(
      ({ value }) => (
        typeof value === 'string' && (
          value === 'firefox.com' || value.endsWith('.firefox.com')
        )
      )
    );
    if (hasSmartSetting) return;

    await new Promise(resolve => { setTimeout(resolve, 50); });

    const { lowLevelPac } = await store.getStateAsync();
    const { countries, globalReturn } = lowLevelPac;
    if (!globalReturn) return;

    const requestResult = await new Promise<boolean>(
      async (resolve, reject) => {
        setTimeout(() => {
          resolve(false);
        }, 10000);

        try {
          const output = await ajax(
            'http://detectportal.firefox.com/success.txt',
            { 'method': 'GET' }
          );

          resolve(output.trim() === 'success');
        }
        catch (error) {
          resolve(false);
        }
      }
    );

    const [domain, port] =
      countries[globalReturn][0].split(' ')[1].split(':');

    jitsu.track('connection_attempt', {
      'success': String(requestResult ? 1 : 0),
      'server_domain': domain,
      'server_port': port
    });
  };

  store.onChange(
    ({ userPac }) => userPac.mode === 'direct' ? null : userPac.country,
    async (pacCountry, x, storeState) => {
      if (!pacCountry) return; // Only with country

      action(storeState);
    }
  );
}


// dailyRetention section
store.onChange(
  ({ 'userPac': pac }) => ({ 'filters': pac.filters, 'mode': pac.mode }),
  () => {
    trySendDailyRetention();
  }
);


{ // onAuth cache removal feature
  const listener = async ({ url, error }: OnErrorOccurredDetails) => {
    onGlobalRequestError(error);

    if (error !== 'net::ERR_TUNNEL_CONNECTION_FAILED') return;

    const domain = urlToDomain(url);
    if (!domain) return;

    const { cacheRemoval } = await store.getStateAsync();
    if (!cacheRemoval) return;

    Browser.browsingData.remove(
      {
        'origins': [`http://${domain}`, `https://${domain}`]
      },
      {
        'appcache': true,
        'cache': true,
        'cacheStorage': true,
        'serviceWorkers': true,
      }
    );
  };

  Browser.webRequest.onErrorOccurred.addListener(
    listener,
    { 'urls': ['<all_urls>'] }
  );

  store.onChange(
    ({ cacheRemoval }) => cacheRemoval,
    (cacheRemoval) => {
      if (cacheRemoval) Browser.resetAPI('browsingData');
    }
  );
}


lowLevelPacStoreListeners();
highLevelPacStoreListeners();


store.onChange(
  ({ userPac }) => userPac.mode,
  (newState, oldState) => {
    if (newState === 'proxy') jitsu.track('vpnOn');
  }
);

store.onChange(
  ({ userPac }) => userPac.filters,
  (newState, oldState) => {
    if (newState.length !== oldState.length + 1) return;

    ga.full({ 'action': 'smartSettingsAdd', 'category': 'smartSettings' });
    jitsu.track('smartSettingsAdd');
  }
);


{
  const channels: { [id: string]: RuntimePort } = {};
  Browser.runtime.onConnect.addListener((runtimePort) => {
    if (!runtimePort.name.startsWith('popup connection ')) return;

    const id = runtimePort.name.split('popup connection ')[1];

    const openedPopups = Object.keys(channels);
    if (openedPopups.length) {
      for (const id of openedPopups) {
        try {
          channels[id].postMessage('close');
        }
        catch (x) { }

        delete channels[id];
      }
    }

    channels[id] = runtimePort;

    runtimePort.onDisconnect.addListener(() => {
      delete channels[id];

      jitsu.track('popup_close');
    });
  });
}


// First proxy on
store.onChange(
  ({ userPac }) => userPac.mode,
  async (proxyMode) => {
    if (proxyMode === 'direct') return;

    const value = await storage.get('First proxy on');
    if (value) return;

    storage.set('First proxy on', true);
  }
);


