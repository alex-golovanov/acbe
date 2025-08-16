/* global CountryPrefixPort, LowLevelPac, ProxyServerCountryData */
import Browser from 'crossbrowser-webextension';
import makeProxyServersMap from 'tools/makeProxyServersMap';
import setActualPac from './setActualPac';
import storage from 'storage';
import store from 'store';
import throttledPingSmartSettingsServers from 'bg/pingSmartSettings';
import healthcheck from 'log/healthcheck';
import { getDefaultCountry } from 'tools/getDefaultCountry';

const { _ } = self;
let proxyChangesCount = 0;

const controlledStates: readonly string[] = Object.freeze([
  'controllable_by_this_extension',
  'controlled_by_this_extension',
]);

/** @function */
const isControlled = async () => {
  if (typeof browser !== 'undefined') return true; // FF always true

  const { levelOfControl } = await Browser.proxy.settings.get({
    incognito: false,
  });

  return controlledStates.includes(levelOfControl);
};

/** @function */
const set = async (lowLevelPac: LowLevelPac) => {
  await setActualPac(lowLevelPac);
  proxyChangesCount++;
  healthcheck.logPacChangeEvent({
    type: 'pac-update-set-actual-pac-completed',
    smartSettings: '',
    pacTextString: '',
    args: [`proxyChangesCount: ${proxyChangesCount}`],
  });

  await throttledPingSmartSettingsServers();
};

/** @function */
const setFromStore = async () => {
  const { lowLevelPac } = await store.getStateAsync();

  await setActualPac(lowLevelPac);
  proxyChangesCount++;
  await throttledPingSmartSettingsServers();
};

/** @function */
const changePort = async (port: number) => {
  const { proxyServers } = await store.getStateAsync();

  const newProxyServers: Map<string, ProxyServerCountryData> = new Map();

  for (const [country, data] of proxyServers) {
    const modifiedData = _.cloneDeep(data);
    for (const key of Object.keys(modifiedData)) {
      // @ts-ignore
      const value = modifiedData[key] as CountryPrefixPort[];
      for (const pair of value) pair.port = port;
    }

    newProxyServers.set(country, modifiedData);
  }

  store.dispatch({
    type: 'Proxy servers: set',
    data: makeProxyServersMap(newProxyServers),
  });
};

/** @function */
const getPac = async (): Promise<string> => {
  if (typeof browser !== 'undefined') return '';

  const data = await Browser.proxy.settings.get({});

  return data.value?.pacScript?.data || '';
};

/** @function */
const setSingleServer = async (serverString: string) => {
  if (typeof serverString !== 'string') {
    throw new Error('Input format must be like "zu1.lunrac.com:433"');
  }

  serverString = serverString.trim();

  let protocol = 'HTTPS';
  let domainPort: string;
  if (serverString.includes(' ')) {
    [protocol, domainPort] = serverString.split(' ');
  } else {
    domainPort = serverString;
  }

  if (!domainPort.includes(':')) {
    throw new Error('Input format must be like "zu1.lunrac.com:433"');
  }

  const [domain, port] = domainPort.split(':');
  if (!/^[0-9]+$/.test(port)) {
    throw new Error('Input format must be like "zu1.lunrac.com:433"');
  }
  if (!domain.includes('.')) {
    throw new Error('Input format must be like "zu1.lunrac.com:433"');
  }

  const secondLevelDomain = domain.split('.').slice(-2).join('.');

  const storageValue: string[] =
    (await storage.get('onAuthRequired domains')) || [];
  const set = new Set(storageValue);
  set.add(secondLevelDomain);

  // Add extra onAuthRequired domain
  storage.set('onAuthRequired domains', Array.from(set));

  const defaultCountry = await getDefaultCountry();

  const countries = {
    [defaultCountry]: [protocol + ' ' + domain + ':' + port],
  };
  const premiumCountries = {
    [defaultCountry]: [protocol + ' ' + domain + ':' + port],
  };

  setActualPac({
    browsecCountry: null,
    countries,
    globalReturn: defaultCountry,
    ignoredDomains: [],
    premiumCountries,
    siteFilters: [],
  });
  proxyChangesCount++;
  await throttledPingSmartSettingsServers();
};

export default {
  changePort,
  getPac,
  isControlled,
  set,
  setFromStore,
  setSingleServer,
};
