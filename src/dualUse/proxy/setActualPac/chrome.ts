/* global LowLevelPac */
import Browser from 'crossbrowser-webextension'; // @ts-ignore
import originalPacScript from 'pacScript.js';
import healthcheck from 'log/healthcheck';
import store from 'store';
import log from 'log';

const pacScript: string = originalPacScript
  .replace(/\/\/.*/g, '') // Remove comments
  .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
  .replace(/\r/g, '')
  .replace(/\n/g, ' ') // Remove new line symbols
  .replace(/\s{2,}/g, ' ')
  .trim(); // Less spaces

export default async (pacConfig: LowLevelPac) => {
  log( 'setActualPac/chrome: start' );

  const {
    countries,
    globalReturn,
    ignoredDomains,
    premiumCountries,
    siteFilters,
  } = pacConfig;
  const isClearCondition = Object.keys(countries).length === 0;

  if (isClearCondition) {
    healthcheck.logPacChangeEvent({
      type: 'pac-update-in-chrome-clear-start (no countries)',
      smartSettings: '',
      pacTextString: '',
    });

    log('setActualPac/chrome: exit');

    return await Browser.proxy.settings.clear({ scope: 'regular' });
  }

  const jsonCountries = Object.fromEntries(
    Object.entries(Object.assign({}, premiumCountries, countries)).map(
      ([key, value]) => [key, value.join('; ')],
    ),
  );

  const filters = siteFilters.slice();

  const { dynamicConfig } = await store.getStateAsync();

  filters.push({
    format: 'domain',
    country: ( dynamicConfig.browsecCountry || 'fi' ),
    value: 'browsec.com',
  });

  const pacScriptText = pacScript
    .replace(/__Countries__/g, JSON.stringify(jsonCountries))
    .replace(/__IgnoreDomains__/g, JSON.stringify(ignoredDomains))
    .replace(/__GlobalReturn__/g, JSON.stringify(globalReturn))
    .replace(/__SiteFilters__/g, JSON.stringify(filters));

  // logging pac update
  const pacTextString = JSON.stringify(pacScriptText);
  const smartSettings = `smartSettings: ${JSON.stringify(filters)}`;

  healthcheck.logPacChangeEvent({
    type: 'pac-update-in-chrome-started',
    smartSettings,
    pacTextString,
  });

  // setting new pac script to browser
  await Browser.proxy.settings.set({
    scope: 'regular',
    value: {
      mode: 'pac_script',
      pacScript: { data: pacScriptText },
    },
  });

  log( 'setActualPac/chrome: PAC script updated' );

  healthcheck.logPacChangeEvent({
    type: 'pac-update-in-chrome-completed',
    smartSettings,
    pacTextString,
  });
};
