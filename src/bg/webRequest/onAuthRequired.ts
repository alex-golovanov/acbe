/* global OnAuthRequiredDetails */
import Browser from 'crossbrowser-webextension';
import checkAuthLimitExceeded from './checkAuthLimitExceeded';
import chromeVersion from 'bg/chromeVersion';
import config from 'config';
import ga from 'ga';
import internationalize from 'tools/internationalize';
import smartAlert from 'tools/smartAlert';
import jitsu from 'jitsu';
import log from 'log';
import storage from 'storage';
import store from 'store';
import highLevelPac from 'highLevelPac';
import lowLevelPac from 'lowLevelPac';
import proxy from '../../dualUse/proxy';
import healthcheck from '../../dualUse/log/healthcheck';
import smartSettingsHelpers from 'bg/pingSmartSettings/helpers';

const { _ } = self;

let onAuthRequiredCount = 0;

/** @function */
export default (): void => {
  log( 'onAuthRequired.addListener' );

  Browser.webRequest.onAuthRequired.addListener(
    async (
      details: OnAuthRequiredDetails,
    ): Promise<{
      authCredentials: { username: string; password: string };
    } | void> => {
      onAuthRequiredCount++;
      // log event
      const host = details.challenger.host;
      const port = details.challenger.port;
      const country =
        smartSettingsHelpers.getCountryFromHostForFakeDomain(host);

      const initiator = `initiator: ${details.initiator}`;
      const url = `url: ${details.url}`;
      const globalCount = `onAuthRequiredCount: ${onAuthRequiredCount}`;
      healthcheck.logOnAuthRequiredEvent({
        type: 'onAuth-triggered',
        country,
        host,
        args: [details.method, port.toString(), initiator, url, globalCount],
      });

      const secondLevelDomains: string[] | undefined = await storage.get( 'onAuthRequired domains' );

      {
        const logDetails: any = _.cloneDeep( details );

        if (config.type !== 'development') {
          delete logDetails.ip;
        }

        log('onAuthRequired. Details', logDetails);
      }

      const { challenger } = details;
      const ourProxy: boolean = (() => {
        if (!secondLevelDomains || !secondLevelDomains.length) return false;

        return secondLevelDomains.some(
          (domain) => {
            return challenger.host === domain || challenger.host.endsWith( '.' + domain )
          }
        );
      })();

      // If auth request is not from browsec proxy, do not handle it.
      if (!details.isProxy || details.realm !== 'Browsec' || !ourProxy) {
        return Promise.resolve();
      }

      const { user } = store.getStateSync();

      return new Promise(async (resolve) => {
        if (user.type === 'guest') {
          // TS crap
          healthcheck.logOnAuthRequiredEvent({
            type: 'onAuth-triggered-for-guest-user-cancel-auth',
            country,
            host,
            args: [
              details.method,
              port.toString(),
              initiator,
              url,
              globalCount,
            ],
          });
          highLevelPac.disable();
          jitsu.track('vpnOff', { source: 'onAuthRequired error' });

          ga.partial({ category: 'extension', action: 'auth_error' });
          log( internationalize( 'cant_authenticate_please_contact_browsec_support' ) );

          smartAlert( internationalize( 'cant_authenticate_please_contact_browsec_support' ));
          return;
        }

        let email = user.email;
        let password = user.loginData.credentials.access_token;

        const { shouldBreak, shouldSwitchServer } = await checkAuthLimitExceeded(details);
        
        if (shouldSwitchServer) {
          // Try to rotate to next server in the same location
          const country = smartSettingsHelpers.getCountryFromHostForFakeDomain(host);
          
          healthcheck.logOnAuthRequiredEvent({
            type: 'onAuth-triggered-switching-server',
            country,
            host,
            args: [
              details.method,
              port.toString(),
              initiator,
              url,
              globalCount,
            ],
          });
          
          const rotated = await lowLevelPac.rotateServerInCountry(country, host);
          
          if (rotated) {
            // Update PAC script with new server order
            await proxy.setFromStore();
            log(`Server rotated in country ${country}, failed server ${host} moved to end`);
          }
          
          // Continue with authentication on the new server
          resolve({ authCredentials: { username: email, password } });
          
        } else if (shouldBreak) {
          // Limit reached - disable proxy
          healthcheck.logOnAuthRequiredEvent({
            type: 'onAuth-triggered-limit-exceeded-cancel-auth',
            country,
            host,
            args: [
              details.method,
              port.toString(),
              initiator,
              url,
              globalCount,
            ],
          });
          highLevelPac.disable();
          jitsu.track('vpnOff', { source: 'onAuthRequired error' });

          ga.partial({ category: 'extension', action: 'auth_limit_error' });
          log( internationalize( 'premium_server_authentication_error' ) );

          smartAlert( internationalize( 'premium_server_authentication_error' ));
        } else {
          // Normal authentication - limit not reached
          healthcheck.logOnAuthRequiredEvent({
            type: 'onAuth-triggered-within-limit-authenticate-with-email',
            country,
            host,
            args: [
              details.method,
              port.toString(),
              initiator,
              url,
              globalCount,
            ],
          });
          if (config.type !== 'development') {
            log('Authenticate on proxy with email');
          } else {
            log('Authenticate on proxy with email: ', email);
          }

          resolve({ authCredentials: { username: email, password } });
        }
      });
    },
    '<all_urls>',
    chromeVersion && chromeVersion >= 73
      ? ['asyncBlocking', 'extraHeaders']
      : ['asyncBlocking'],
  );
};
