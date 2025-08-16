/* global AjaxAccount, StoreAccount */
import _ from 'lodash';
import proxyServersDispatchChanges from 'tools/proxyServersDispatchChanges';
import storage from 'storage';
import { StoreClass } from './index';
import { SET_WARNING_ACTION } from './actions';
import log from 'log';

export default (store: StoreClass) => {
  storage.addListener(async (changes) => {
    if (changes.account) {
      const {
        oldValue,
        newValue,
      }: {
        oldValue: StoreAccount;
        newValue: StoreAccount;
      } = changes.account;

      if (!_.isEqual(oldValue, newValue)) {
        const data = (
          newValue.type === 'logined'
            ? {
                credentials: newValue.loginData.credentials,
                email: newValue.email,
                id: newValue.loginData.id,
                premium: newValue.premium,
                subscription: newValue.loginData.subscription,
                type: 'logined',
              }
            : {
                guest: true,
                type: 'guest',
              }
        ) as AjaxAccount;

        store.dispatch({
          type: 'User: set',
          data,
          noStorage: true,
        });
      }
    }

    if (changes['browsec.com available']) {
      let { oldValue, newValue } = changes['browsec.com available'];

      if (oldValue !== newValue) {
        store.dispatch({
          type: 'Browsec.com available: set',
          data: newValue,
          noStorage: true,
        });
      }
    }

    if (changes.cacheRemoval) {
      let { oldValue, newValue } = changes.cacheRemoval;

      if (oldValue !== newValue) {
        store.dispatch({
          type: 'Cache removal: set',
          data: newValue,
          noStorage: true,
        });
      }
    }

    if (changes.domain) {
      let { oldValue, newValue } = changes.domain;

      if (!_.isEqual(oldValue, newValue)) {
        store.dispatch({
          type: 'Domain: set',
          domain: newValue,
          noStorage: true,
        });
      }
    }

    if (changes.favorites) {
      let { oldValue, newValue } = changes.favorites;

      if (!_.isEqual(oldValue, newValue)) {
        store.dispatch({
          type: 'Favorites: set',
          data: newValue,
          noStorage: true,
        });
      }
    }

    if (changes.lowLevelPac) {
      let { oldValue, newValue } = changes.lowLevelPac;

      if (!_.isEqual(oldValue, newValue)) {
        store.dispatch({
          type: 'Low level PAC: set',
          data: newValue,
          noStorage: true,
        });
      }
    }

    if (changes.userPac) {
      let { oldValue, newValue } = changes.userPac;

      log('[storageListener] userPac');

      if (!_.isEqual(oldValue, newValue)) {
        store.dispatch({
          type: 'User PAC: set',
          data: newValue,
          noStorage: true,
        });
      }
    }

    if (changes.ping) {
      let { oldValue, newValue } = changes.ping;

      if (!_.isEqual(oldValue, newValue)) {
        store.dispatch({
          type: 'Ping: set',
          data: newValue,
          noStorage: true,
        });
      }
    }

    if (changes.pingInProcess) {
      let { oldValue, newValue } = changes.pingInProcess;

      if (!_.isEqual(oldValue, newValue)) {
        store.dispatch({
          type: 'PingInProcess: set',
          data: newValue,
          noStorage: true,
        });
      }
    }

    if (changes.recommendedCountries) {
      let { oldValue, newValue } = changes.recommendedCountries;

      if (!_.isEqual(oldValue, newValue)) {
        store.dispatch({
          type: 'Recommended countries: set',
          data: newValue,
          noStorage: true,
        });
      }
    }

    if (changes.prices) {
      let { oldValue, newValue } = changes.prices;

      if (!_.isEqual(oldValue, newValue)) {
        store.dispatch({
          type: 'Prices: set',
          prices: newValue,
          noStorage: true,
        });
      }
    }

    if (changes.priceTrial) {
      let { oldValue, newValue } = changes.priceTrial;

      if (!_.isEqual(oldValue, newValue)) {
        store.dispatch({
          type: 'Price trial: set',
          priceTrial: newValue,
          noStorage: true,
        });
      }
    }

    if (changes.promotionsBlock) {
      let { oldValue, newValue } = changes.promotionsBlock;

      if (!_.isEqual(oldValue, newValue)) {
        store.dispatch({
          type: 'Promotions block: set',
          data: newValue,
          noStorage: true,
        });
      }
    }

    if (changes.promotions) {
      let { oldValue, newValue } = changes.promotions;

      if (!_.isEqual(oldValue, newValue)) {
        store.dispatch({
          type: 'Promotions: set',
          data: newValue,
          noStorage: true,
        });
      }
    }

    if (changes.serversObject) {
      const { oldValue, newValue } = changes.serversObject;

      if (!_.isEqual(oldValue, newValue)) {
        proxyServersDispatchChanges({
          object: newValue,
          noStorage: true,
          store,
        });
      }
    }

    if (changes.timezoneChange) {
      let { oldValue, newValue } = changes.timezoneChange;

      if (!_.isEqual(oldValue, newValue)) {
        store.dispatch({
          type: 'Timezone change: set',
          data: newValue,
          noStorage: true,
        });
      }
    }

    if (changes['viewed personal banners']) {
      let { oldValue, newValue } = changes['viewed personal banners'];
      if (!_.isEqual(oldValue, newValue)) {
        store.dispatch({
          type: 'Viewed personal banners: set',
          banners: newValue,
          noStorage: true,
        });
      }
    }

    if (changes.webrtcBlock) {
      let { oldValue, newValue } = changes.webrtcBlock;

      if (!_.isEqual(oldValue, newValue)) {
        store.dispatch({
          type: 'WebRTC blocking: set',
          data: newValue,
          noStorage: true,
        });
      }
    }

    if (changes.warnings) {
      let { oldValue, newValue } = changes.warnings;

      if (!_.isEqual(oldValue, newValue)) {
        store.dispatch({
          type: SET_WARNING_ACTION,
          data: newValue,
          noStorage: true,
        });
      }
    }
  });
};
