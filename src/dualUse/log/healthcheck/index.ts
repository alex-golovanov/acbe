import type { PacSiteFilter } from 'types/PacSiteFilter';
import type { LowLevelPac } from 'types/LowLevelPac';
import { isDev, isProd } from 'utils';

export type LogItem = [string, Date, string, string, string, ...any[]];
export type HealthcheckEvent = {
  type: string;
  country?: string;
  smartSettings?: string;
  pacTextString?: string;
  host?: string;
  args?: string[];
};

// logs
const healthcheckLog = {
  globalLog: { defaultCountry: [] } as Record<string, LogItem[]>,
  pacChangesLog: [] as any[],
  onAuthRequiredLog: {} as Record<string, LogItem[]>,
  proxyErrorRequestsLog: {} as Record<string, LogItem[]>,
  pingRequestsLog: {} as Record<string, LogItem[]>,
  smartCountries: {} as Record<string, string>,
  smartsPingRequestsLog: [] as any[],
  isDevelopment: isDev,
  isProduction: isProd,
  logProxyErrorEvent({ type, country, host, args }: HealthcheckEvent) {
    const logCountry = country || 'defaultCountry';
    const timestamp = new Date();
    const time = timestamp.toLocaleTimeString();
    const logEvent = [type, timestamp, logCountry, host, time, args] as LogItem;
    // proxyErrorRequestsLog
    if (isDev) {
      console.log('DEV HEALTHCHECK: logProxyErrorEvent', logEvent);
      this._saveToProxyErrorLog(logCountry, logEvent);
      this._saveToGlobalLog(logCountry, logEvent);
    }
  },
  _saveToProxyErrorLog(country: string, logEvent: LogItem) {
    if (this.proxyErrorRequestsLog.hasOwnProperty(country))
      this.proxyErrorRequestsLog[country].push(logEvent);
    else this.proxyErrorRequestsLog[country] = [logEvent];
  },
  logOnAuthRequiredEvent({ type, country, host, args }: HealthcheckEvent) {
    const logCountry = country || 'defaultCountry';
    const timestamp = new Date();
    const time = timestamp.toLocaleTimeString();
    const logEvent = [type, timestamp, logCountry, host, time, args] as LogItem;
    // onAuthRequiredLog
    if (isDev) {
      console.log('DEV HEALTHCHECK: logOnAuthRequiredEvent', logEvent);
      this._saveToOnAuthRequiredLog(logCountry, logEvent);
      this._saveToGlobalLog(logCountry, logEvent);
    }
  },
  _saveToOnAuthRequiredLog(country: string, logEvent: LogItem) {
    if (this.onAuthRequiredLog.hasOwnProperty(country))
      this.onAuthRequiredLog[country].push(logEvent);
    else this.onAuthRequiredLog[country] = [logEvent];
  },
  logSmartSettingPingEvent({ type, country, host, args }: HealthcheckEvent) {
    const logCountry = country || 'defaultCountry';
    const timestamp = new Date();
    const time = timestamp.toLocaleTimeString();
    const logEvent = [type, timestamp, logCountry, host, time, args] as LogItem;
    // smartsPingRequestsLog
    if (isDev) {
      console.log('DEV HEALTHCHECK: logSmartSettingPingEvent', logEvent);
      this.smartsPingRequestsLog.push(logEvent);
      this._saveToGlobalLog(logCountry, logEvent);
    }
  },
  _saveToGlobalLog(country: string, logEvent: LogItem) {
    if (this.globalLog.hasOwnProperty(country))
      this.globalLog[country].push(logEvent);
    else this.globalLog[country] = [logEvent];
  },

  logPacChangeEvent({
    type,
    smartSettings,
    pacTextString,
    args,
  }: HealthcheckEvent) {
    const timestamp = new Date();
    const time = timestamp.toLocaleTimeString();
    const logEvent = [
      type,
      timestamp,
      'defaultCountry',
      'no domain',
      time,
      smartSettings,
      'initiator: extension',
      pacTextString,
      args,
    ] as LogItem;
    // pacChangesLog
    if (isDev) {
      console.log('DEV HEALTHCHECK: logPacChangeEvent', logEvent);
      this.pacChangesLog.push(logEvent);
      this.globalLog.defaultCountry.push(logEvent);
    }
  },
  consoleLogHealthcheck() {
    if (!isDev) return;
    console.log('_'.repeat(80));
    console.log('smartsPingRequestsLog:', this.smartsPingRequestsLog);
    console.log('_'.repeat(80));
    console.log('pacChanges log:', this.pacChangesLog);
    console.log('_'.repeat(80));
    console.log('proxyErrorRequestsLog:', this.proxyErrorRequestsLog);
    console.log('_'.repeat(80));
    console.log('onAuthRequired log:', this.onAuthRequiredLog);
    console.log('_'.repeat(80));
    console.log('Global log:', this.globalLog);
    console.log('_'.repeat(80));
  },
};

// helpers
export function compareArrays(newArray: string[], oldArray: string[]) {
  const diff = [] as any;
  const minLen = Math.min(newArray.length, oldArray.length);
  for (let i = 0; i < minLen; i++) {
    if (newArray[i] !== oldArray[i]) {
      diff.push(newArray[i]);
    }
  }
  const longestArray = newArray.length > oldArray.length ? newArray : oldArray;
  for (let i = minLen; i < longestArray.length; i++) {
    diff.push(longestArray[i]);
  }
  return diff;
}

export function comparePacs(newPac: LowLevelPac, oldPac: LowLevelPac) {
  const diff = {
    browsecCountry: {} as { newPac: string; oldPac: string },
    countries: {} as { [key: string]: string[] },
    premiumCountries: {} as { [key: string]: string[] },
    ignoredDomains: [] as string[],
    globalReturn: {} as { newPac: string; oldPac: string },
    siteFilters: [] as string[],
  } as any;
  // 1. browsecCountry
  if (newPac.browsecCountry !== oldPac.browsecCountry) {
    diff.browsecCountry = {
      newPac: newPac.browsecCountry,
      oldPac: oldPac.browsecCountry,
    };
  } else delete diff.browsecCountry;
  // 2. countries (may be different array keys for new and old pacs)
  const allCountries = new Set([
    ...Object.keys(oldPac.countries),
    ...Object.keys(newPac.countries),
  ]);
  for (let country of allCountries) {
    const newPacArray = newPac.countries.hasOwnProperty(country)
      ? newPac.countries[country]
      : [];
    const oldPacArray = oldPac.countries.hasOwnProperty(country)
      ? oldPac.countries[country]
      : [];
    diff.countries[country] = compareArrays(newPacArray, oldPacArray);
  }
  if (Object.keys(diff.countries).length === 0) delete diff.countries;
  // 3. globalReturn
  if (newPac.globalReturn !== oldPac.globalReturn) {
    diff.globalReturn = {
      newPac: newPac.globalReturn,
      oldPac: oldPac.globalReturn,
    };
  } else delete diff.globalReturn;
  // 4. ignoredDomains
  diff.ignoredDomains = compareArrays(
    newPac.ignoredDomains,
    oldPac.ignoredDomains,
  );
  if (diff.ignoredDomains.length === 0) delete diff.ignoredDomains;

  // 5. premiumCountries
  const allPremiumCountries = new Set([
    ...Object.keys(oldPac.premiumCountries),
    ...Object.keys(newPac.premiumCountries),
  ]);
  for (let country of allPremiumCountries) {
    const newPacArray = newPac.premiumCountries.hasOwnProperty(country)
      ? newPac.premiumCountries[country]
      : [];
    const oldPacArray = oldPac.premiumCountries.hasOwnProperty(country)
      ? oldPac.premiumCountries[country]
      : [];
    diff.premiumCountries[country] = compareArrays(newPacArray, oldPacArray);
  }
  if (Object.keys(diff.premiumCountries).length === 0)
    delete diff.premiumCountries;

  // 6. siteFilters
  const siteFilterToString = (filter: PacSiteFilter) =>
    `${filter.value} = ${filter.country} (${filter.format})`;
  diff.siteFilters = compareArrays(
    newPac.siteFilters.map(siteFilterToString),
    oldPac.siteFilters.map(siteFilterToString),
  );
  if (diff.siteFilters.length === 0) delete diff.siteFilters;

  return diff;
}

export default healthcheckLog;
