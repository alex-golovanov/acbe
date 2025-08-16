/* global AjaxAccount, LowLevelPac, PingRating, Price, Promotion, ProxyServers, StoreAccount, StoreGuestAccount, StoreLoginedInAccount, StoreState, StoreAction, UserPac, DynamicConfig */
import config from 'config';
import hideAccountData from 'tools/hideStoreAccountData';
import log from 'log';
import storage from 'storage';
import healthcheck, { comparePacs } from 'log/healthcheck';

import {
  ADD_WARNING_ACTION,
  REMOVE_WARNING_ACTION,
  SET_WARNING_ACTION,
} from './actions';
import {
  addWarningReducer,
  removeWarningReducer,
  setWarningsReducer,
} from './reducers';

const { _ } = self;

const showLogs: boolean = location.href.includes('background');

const makeAction = {
  'pacChangesCount': 0,
  /** @method */
  'Cache removal: set': ({
    noStorage,
    action,
    state,
  }: {
    noStorage: boolean;
    action: {
      type: 'Cache removal: set';
      data: boolean;
      noStorage?: boolean;
    };
    state: StoreState;
  }): StoreState => {
    let { data } = action;

    if (showLogs) {
      log(
        'Store: cache removal update. New: ',
        data,
        '. Old: ',
        state.cacheRemoval,
      );
    }

    if (!noStorage) storage.set('cacheRemoval', data);

    return Object.assign({}, state, { cacheRemoval: data });
  },

  /** @method */
  'Days after install: set': ({
    noStorage,
    action,
    state,
  }: {
    noStorage: boolean;
    action: {
      type: 'Days after install: set';
      days: integer;
      noStorage?: boolean;
    };
    state: StoreState;
  }): StoreState => {
    let { days } = action;

    if (showLogs) {
      log(
        'Store: days after install update. New: ',
        days,
        '. Old: ',
        state.daysAfterInstall,
      );
    }

    return Object.assign({}, state, { daysAfterInstall: days });
  },

  /** @method */
  'Domain: set': ({
    noStorage,
    action,
    state,
  }: {
    noStorage: boolean;
    action: {
      type: 'Domain: set';
      domain: string | null;
      noStorage?: boolean;
    };
    state: StoreState;
  }): StoreState => {
    let { domain } = action;

    if (config.type === 'development' && showLogs) {
      log('Store: domain update. New: ', domain, '. Old: ', state.domain);
    }

    if (!noStorage) storage.set('domain', domain);

    return Object.assign({}, state, { domain });
  },

  /** @method */
  'Favorites: set': ({
    noStorage,
    action,
    state,
  }: {
    noStorage: boolean;
    action: {
      type: 'Favorites: set';
      data: string[];
      noStorage?: boolean;
    };
    state: StoreState;
  }): StoreState => {
    let favorites: string[] = action.data.slice();

    if (!noStorage) storage.set('favorites', favorites);

    if (showLogs) {
      log(
        'Store: favorites update. New: ',
        favorites,
        '. Old: ',
        state.favorites,
      );
    }

    return Object.assign({}, state, { favorites });
  },

  /** @method */
  'Low level PAC: set': ({
    noStorage,
    action,
    state,
  }: {
    noStorage: boolean;
    action: {
      type: 'Low level PAC: set';
      data: LowLevelPac;
      noStorage?: boolean;
    };
    state: StoreState;
  }) => {
    const lowLevelPac: LowLevelPac = _.cloneDeep(action.data);

    if (!noStorage) storage.set('lowLevelPac', lowLevelPac);

    if (showLogs) {
      log('[Low level PAC: set]: Store low level PAC');
    }

    return Object.assign({}, state, { lowLevelPac });
  },

  /** @method */
  'Low level PAC: update': ({
    noStorage,
    action,
    state,
  }: {
    noStorage: boolean;
    action: {
      type: 'Low level PAC: update';
      data: Partial<LowLevelPac>;
      noStorage?: boolean;
    };
    state: StoreState;
  }) => {
    const lowLevelPac: LowLevelPac = _.cloneDeep(
      Object.assign({}, state.lowLevelPac, action.data),
    );
    const newPac = lowLevelPac;
    const oldPac = state.lowLevelPac;

    // log changes
    makeAction.pacChangesCount++;
    const changeLog = {
      pacChangesCount: makeAction.pacChangesCount,
      payload: action.data,
      changes: comparePacs(newPac, oldPac),
    };
    healthcheck.logPacChangeEvent({
      type: 'pac-update-changes-comparision',
      smartSettings: '',
      pacTextString: '',
      args: [
        JSON.stringify(changeLog),
        `pacChangesCount: ${makeAction.pacChangesCount}`,
      ],
    });

    if (!noStorage) storage.set('lowLevelPac', lowLevelPac);

    if (showLogs) {
      log('[Low level PAC: update]: Store low level PAC');
    }

    return Object.assign({}, state, { newPac });
  },

  /** @method */
  'Page: set': ({
    noStorage,
    action,
    state,
  }: {
    noStorage: boolean;
    action: {
      type: 'Page: set';
      page: string;
      noStorage?: boolean;
    };
    state: StoreState;
  }): StoreState => {
    let oldPage: string = state.page;
    let newState = Object.assign({}, state);
    newState.page = action.page;

    if (showLogs) {
      log('Store: page change. New: ', newState.page, 'Old: ', oldPage);
    }

    return newState;
  },

  /** @method */
  'Ping: set': ({
    noStorage,
    action,
    state,
  }: {
    noStorage: boolean;
    action: {
      type: 'Ping: set';
      data: PingRating[];
      noStorage?: boolean;
    };
    state: StoreState;
  }): StoreState => {
    /** @type {Object<Number>} */
    let ping = _.cloneDeep(action.data);

    if (!noStorage) storage.set('ping', ping);

    if (showLogs) {
      log('Store: ping data update.');
    }

    return Object.assign({}, state, { ping });
  },

  /** @method */
  'PingInProcess: set': ({
    noStorage,
    action,
    state,
  }: {
    noStorage: boolean;
    action: {
      type: 'PingInProcess: set';
      data: boolean;
      noStorage?: boolean;
    };
    state: StoreState;
  }): StoreState => {
    if (!noStorage) storage.set('pingInProcess', action.data);

    if (showLogs) {
      log('Store: PingInProcess update.', action.data);
    }

    return Object.assign({}, state, { 'pingInProcess': action.data });
  },

  /** @method */
  'Prices: set': ({
    noStorage,
    action,
    state,
  }: {
    noStorage: boolean;
    action: {
      type: 'Prices: set';
      prices: Price[];
      noStorage?: boolean;
    };
    state: StoreState;
  }): StoreState => {
    let { prices } = action;

    if (!noStorage) storage.set('prices', prices);

    if (showLogs) {
      log('Store: prices update. New: ', prices, '. Old: ', state.prices);
    }

    return Object.assign({}, state, { prices });
  },

  /** @method */
  'Price trial: set': ({
    noStorage,
    action,
    state,
  }: {
    noStorage: boolean;
    action: {
      type: 'Price trial: set';
      priceTrial: integer | void;
      noStorage?: boolean;
    };
    state: StoreState;
  }): StoreState => {
    let { priceTrial } = action;

    if (!noStorage) storage.set('priceTrial', priceTrial);

    if (showLogs) {
      log(
        'Store: price trial update. New: ',
        priceTrial,
        '. Old: ',
        state.priceTrial,
      );
    }

    return Object.assign({}, state, { priceTrial });
  },

  /** @method */
  'Promotions block: set': ({
    noStorage,
    action,
    state,
  }: {
    noStorage: boolean;
    action: {
      type: 'Promotions block: set';
      data: boolean;
      noStorage?: boolean;
    };
    state: StoreState;
  }): StoreState => {
    let oldValue = state.promotionsBlock;
    let value: boolean = action.data;

    if (!noStorage) storage.set('promotionsBlock', value);

    if (showLogs) {
      log('Store: Promotions block update. New: ', value, '. Old: ', oldValue);
    }

    return Object.assign({}, state, { promotionsBlock: value });
  },

  /** @method */
  'Promotions: set': ({
    noStorage,
    action,
    state,
  }: {
    noStorage: boolean;
    action: {
      type: 'Promotions: set';
      data: Promotion[];
      noStorage?: boolean;
    };
    state: StoreState;
  }): StoreState => {
    let promotions = _.cloneDeep(action.data);

    if (!noStorage) storage.set('promotions', promotions);

    if (showLogs) {
      log(
        'Store: promotions set',
        `New: ${promotions?.map((item) => item?.id).join(', ')}`,
        `Old: ${state.promotions?.map((item) => item?.id).join(', ')}`,
      );
    }

    return Object.assign({}, state, { promotions });
  },

  /** @method */
  'Proxy servers: set': ({
    noStorage,
    action,
    state,
  }: {
    noStorage: boolean;
    action: {
      type: 'Proxy servers: set';
      data: ProxyServers;
      noStorage?: boolean;
    };
    state: StoreState;
  }): StoreState => {
    const servers = action.data;

    if( showLogs ) {
      log('Store: proxy servers set', servers.size);
    }

    return Object.assign({}, state, { proxyServers: servers });
  },

  /** @method */
  'Recommended countries: set': ({
    noStorage,
    action,
    state,
  }: {
    noStorage: boolean;
    action: {
      type: 'Recommended countries: set';
      data: { free: string[], premium: string[] };
      noStorage?: boolean;
    };
    state: StoreState;
  }): StoreState => {
    if( showLogs ) log( 'Store: recommended countries update. ', action.data );

    if( !noStorage ) storage.set( 'recommendedCountries', action.data );

    return Object.assign({}, state, { 'recommendedCountries': action.data });
  },

  /** @method */
  'Timezone change: set': ({
    noStorage,
    action,
    state,
  }: {
    noStorage: boolean;
    action: {
      type: 'Timezone change: set';
      data: boolean;
      noStorage?: boolean;
    };
    state: StoreState;
  }): StoreState => {
    let oldValue: boolean = state.timezoneChange;
    let value: boolean = action.data;

    if (!noStorage) storage.set('timezoneChange', value);

    if (showLogs) {
      log('Store: timezone change update. New: ', value, '. Old: ', oldValue);
    }

    return Object.assign({}, state, { timezoneChange: value });
  },

  /** @method */
  'Timezones: set': ({
    noStorage,
    action,
    state,
  }: {
    noStorage: boolean;
    action: {
      type: 'Timezones: set';
      data: Map<string, integer>;
      noStorage?: boolean;
    };
    state: StoreState;
  }): StoreState => {
    let oldValue: Map<string, integer> = state.timezones;
    let value: Map<string, integer> = action.data;

    if (showLogs) {
      log('Store: timezones update. New: ', value, '. Old: ', oldValue);
    }

    return Object.assign({}, state, { timezones: value });
  },

  /** @method */
  'User: set': ({
    noStorage,
    action,
    state,
  }: {
    noStorage: boolean;
    action: {
      type: 'User: set';
      data: AjaxAccount;
      noStorage?: boolean;
    };
    state: StoreState;
  }): StoreState => {
    const oldAccount: StoreAccount = state.user;
    const account: StoreAccount = (() => {
      const timestamp = {
        validUntil: Date.now() + 5 * 60 * 1000, // TODO make Refresh time separate constant
        version: Date.now(),
      };

      // Guest
      // @ts-ignore
      if (typeof action.data.email !== 'string') {
        return {
          premium: false,
          timestamp,
          type: 'guest',
        } as StoreGuestAccount;
      }

      // Logined
      return {
        // @ts-ignore
        email: action.data.email,
        loginData: {
          // @ts-ignore
          id: action.data.id, // @ts-ignore
          credentials: action.data.credentials, // @ts-ignore
          subscription: action.data.subscription,
        }, // @ts-ignore
        premium: action.data.premium,
        timestamp,
        type: 'logined',
      } as StoreLoginedInAccount;
    })();

    if (!noStorage) storage.set('account', account);

    {
      let oldState = _.cloneDeep(oldAccount);
      let newState = _.cloneDeep(account);

      if (config.type !== 'development') {
        delete oldState.email;
        if (oldState.type === 'logined') {
          // @ts-ignore
          delete oldState.loginData.credentials.email;
        }

        delete newState.email;
        if (newState.type === 'logined') {
          // @ts-ignore
          delete newState.loginData.credentials.email;
        }
      }

      log('Store: account update', hideAccountData(newState));
    }

    return Object.assign({}, state, { user: account });
  },

  /** @method */
  'User PAC: set': ({
    noStorage,
    action,
    state,
  }: {
    noStorage: boolean;
    action: {
      type: 'PAC: set';
      data: UserPac;
      noStorage?: boolean;
    };
    state: StoreState;
  }): StoreState => {
    const pac = _.cloneDeep(action.data);

    if (!noStorage) {
      // Convert RegEx to string for JSON
      let filters = pac.filters.map((filter) => {
        filter = _.cloneDeep(filter);
        if (filter.value instanceof RegExp) {
          filter.value = filter.value.toString();
        }

        return filter;
      });
      storage.set('userPac', Object.assign({}, pac, { filters }));
    }

    if (showLogs) {
      log('[User PAC: set] Store: PAC', pac);
    }

    return Object.assign({}, state, { userPac: pac });
  },

  /** @method */
  'User PAC: update': ({
    noStorage,
    action,
    state,
  }: {
    noStorage: boolean;
    action: {
      type: 'PAC: update';
      data: Partial<UserPac>;
      noStorage?: boolean;
    };
    state: StoreState;
  }): StoreState => {
    const pac = Object.assign({}, state.userPac, _.cloneDeep(action.data));

    if (!noStorage) {
      // Convert RegEx to string for JSON
      let filters = pac.filters.map((filter) => {
        filter = _.cloneDeep(filter);
        if (filter.value instanceof RegExp) {
          filter.value = filter.value.toString();
        }

        return filter;
      });
      storage.set('userPac', Object.assign({}, pac, { filters }));
    }

    if (showLogs) {
      log('[User PAC: update] Store: PAC', pac);
    }

    return Object.assign({}, state, { userPac: pac });
  },

  /** @method */
  'Viewed personal banners: add': ({
    noStorage,
    action,
    state,
  }: {
    noStorage: boolean;
    action: {
      type: 'Viewed personal banners: add';
      banner: string;
      noStorage?: boolean;
    };
    state: StoreState;
  }): StoreState => {
    let { banner } = action;

    let viewedPersonalBanners = Array.from(
      new Set(state.viewedPersonalBanners.concat([banner])),
    ).sort();

    if (!noStorage) {
      storage.set('viewed personal banners', viewedPersonalBanners);
    }

    if (showLogs) {
      log(
        'Store: viewed personal banners update. New: ',
        viewedPersonalBanners,
        '. Old: ',
        state.viewedPersonalBanners,
      );
    }

    return Object.assign({}, state, { viewedPersonalBanners });
  },

  /** @method */
  'Viewed personal banners: set': ({
    noStorage,
    action,
    state,
  }: {
    noStorage: boolean;
    action: {
      type: 'Viewed personal banners: set';
      banners: string[];
      noStorage?: boolean;
    };
    state: StoreState;
  }): StoreState => {
    let { banners } = action;

    if (!noStorage) storage.set('viewed personal banners', banners);

    if (showLogs) {
      log(
        'Store: viewed personal banners update. New: ',
        banners,
        '. Old: ',
        state.viewedPersonalBanners,
      );
    }

    return Object.assign({}, state, { viewedPersonalBanners: banners });
  },

  /** @method */
  'WebRTC blocking: set': ({
    noStorage,
    action,
    state,
  }: {
    noStorage: boolean;
    action: {
      type: 'WebRTC blocking: set';
      data: boolean;
      noStorage?: boolean;
    };
    state: StoreState;
  }): StoreState => {
    let oldValue = state.webrtcBlock;
    let value: boolean = action.data;

    if (!noStorage) storage.set('webrtcBlock', value);

    if (showLogs) {
      log('Store: WebRTC blocking update. New: ', value, '. Old: ', oldValue);
    }

    return Object.assign({}, state, { webrtcBlock: value });
  },

  /** @method */
  'Proxy is broken: set': ({
    noStorage,
    action,
    state,
  }: {
    noStorage: boolean;
    action: {
      type: 'Proxy is broken: set';
      data: boolean;
      noStorage?: boolean;
    };
    state: StoreState;
  }): StoreState => {
    let oldValue = state.proxyIsBroken;
    let value: boolean = action.data;

    if (!noStorage) storage.set('proxyIsBroken', value);

    if (showLogs) {
      log('Store: proxyIsBroken update. New:', value, 'Old:', oldValue);
    }

    return Object.assign({}, state, { proxyIsBroken: value });
  },

  /** @method */
  'Dynamic config: update': ({
    noStorage,
    action,
    state,
  }: {
    noStorage: boolean;
    action: {
      type: 'Dynamic config: update';
      data: { dynamicConfig: DynamicConfig };
      noStorage?: boolean;
    };
    state: StoreState;
  }): StoreState => {
    let oldValue = state.dynamicConfig;
    let { dynamicConfig } = action.data;

    if (!noStorage) storage.set('dynamicConfig', dynamicConfig);

    if (showLogs) {
      log('Store: dynamic config update. New: ', dynamicConfig, '. Old: ', oldValue);
    }

    return Object.assign({}, state, { dynamicConfig });
  },

  [ADD_WARNING_ACTION]: addWarningReducer,
  [REMOVE_WARNING_ACTION]: removeWarningReducer,
  [SET_WARNING_ACTION]: setWarningsReducer,
};

/** @function */
export default (
  initialState: StoreState,
): ((state: StoreState, action: StoreAction) => StoreState) => {
  return (state: StoreState = initialState, action: StoreAction) => {
    let noStorage: boolean = Boolean(action.noStorage);
    let type = action.type;

    delete action.noStorage;

    // Wrong type
    if (!(type in makeAction)) return state;

    // Existing type
    // @ts-ignore
    return makeAction[type]({ noStorage, action, state });
  };
};
