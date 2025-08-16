import config, { type as configType } from 'config';
import alarms from 'alarms';
import store from 'store';
import log from 'log';
import healthcheck from '../../dualUse/log/healthcheck';
import smartSettingsHelpers from './helpers';

const { _ } = self;

let pingRequestsCount = 0;

/** @function */
const request = async ({
  domain,
  protocol,
  smartSettingsCountry,
}: {
  domain: string;
  protocol: string;
  smartSettingsCountry: string;
}) => {
  const method = 'GET';
  const cacheMode = 'no-store';
  const maxRetries = 2;
  const retryDelay = 500;

  const makeRequest = async( retryCount: number ): Promise<Response> => {
    try {
      const isoTimestamp = new Date().toLocaleTimeString();
      const headers = new Headers();
      headers.append('Timestamp', isoTimestamp);

      const response = await fetch( `${protocol}//${domain}/200`, {
        method,
        cache: cacheMode,
        priority: 'high',
        headers,
      });

      if ( !response.ok && response.status !== 503 && retryCount < maxRetries ) {
        throw new Error( `HTTP error! status: ${response.status}` );
      }

      return response;
    } catch ( error ) {
      if ( retryCount < maxRetries ) {
        log( `Attempt ${retryCount + 1} failed, retrying in ${retryDelay}ms... (${protocol}//${domain})` );
        await new Promise( resolve => setTimeout( resolve, retryDelay ) );
        return makeRequest( retryCount + 1 );
      }
      throw error;
    }
  };

  try {
    await makeRequest(1);
  } catch (x) {
    const error = `error: ${x}`;
    log( `Ping of SmartSettings server failed (${protocol}//${domain})`, error );

    healthcheck.logSmartSettingPingEvent({
      type: 'smart-settings-proxy-ping-request-end-[failed]',
      country: smartSettingsCountry,
      host: domain,
      args: [error, method],
    });
  }
};

/** @function ping function */
export async function instantPingSmartSettingsServers() {
  healthcheck.logSmartSettingPingEvent({
    type: 'smart-settings-proxy-ping-function-invoked',
    args: [`pingRequestsCount: ${pingRequestsCount}`],
  });

  const { userPac, user } = await store.getStateAsync();
  // if user is not premium, no need to ping SmartSettings servers & current country as they use free servers without authorization
  if (!user?.premium) {
    return;
  }

  let smartSettingsFakeHosts = smartSettingsHelpers.getSmartSettingsFakeHosts(
    userPac.filters,
    userPac.mode,
    userPac.country,
  );
  // if there is nothing to ping, return
  if (!smartSettingsFakeHosts.length) return;

  const httpProxies = smartSettingsFakeHosts.map((server) => ({
    'domain': server.value,
    'port': '80',
    'protocol': 'http:',
    'country': server.country || '',
  }));

  const smartSettingsProxies = httpProxies;

  healthcheck.logSmartSettingPingEvent({
    type: 'smart-settings-proxy-ping-servers-list',
    args: [
      `(${smartSettingsProxies.length} servers)`,
      JSON.stringify(smartSettingsProxies),
    ],
  });

  if (!smartSettingsProxies.length) return;

  let logs = [
    [
      'Ping of SmartSettings servers start for ' +
        smartSettingsProxies.length +
        ' domains (countries)',
    ],
  ];
  for (const { domain, protocol, port, country } of smartSettingsProxies) {
    const timestamp = new Date();
    let time = timestamp.toLocaleTimeString();
    const method = 'GET';

    healthcheck.logSmartSettingPingEvent({
      type: 'smart-settings-proxy-ping-request-start',
      country,
      host: domain,
      args: [method, `pingRequestsCount: ${pingRequestsCount}`],
    });

    request({ domain, protocol, smartSettingsCountry: country });
    time = new Date().toLocaleTimeString();
    logs.push([domain + ' pinged at ' + time]);
  }
  log.group('Ping of SmartSettings servers', logs);
}

export const throttledPingSmartSettingsServers = _.throttle(
  instantPingSmartSettingsServers,
  3000
);

export default throttledPingSmartSettingsServers;

export const ALARM_ID = 'ping-smart-settings';

export function scheduleSmartSettingsPingAlarms() {
  log( 'ping-smart-settings alarm scheduled' );

  alarms.createCycle( ALARM_ID, {
    // 'delay': 1000,
    // 'periodInMinutes': 1,
    'delay': 5 * 60 * 1000,
    'periodInMinutes': 5,
  });
};

alarms.on(async ({ name }) => {
  if( name === ALARM_ID ) {
    log( 'ping-smart-settings alarm fired' );
    await throttledPingSmartSettingsServers();
  }
});
