import config from 'config';
import type { SiteFilter } from 'types/SiteFilter.d.ts';
// SmartSettings helpers

const smartSettingsHelpers = {
  isFakeDomain(domain: string) {
    const template = config.smartSettings.fakeDomainTemplate;
    return domain.includes(template);
  },
  generateFakeHostForSmartSettings(country: string) {
    if (!config.smartSettings.fakeDomainTemplate ) {
      throw new Error('config.smartSettings.fakeDomainTemplate is not defined');
    }

    const template = `${country}.${config.smartSettings.fakeDomainTemplate}`;
    return template;
  },
  getCountryFromHostForFakeDomain(host: any) {
    if (!host) return 'Unknown';
    const vpnNumberedDomain = host.split('.')[0];
    let country = vpnNumberedDomain.match(/[a-zA-Z]+/)[0];
    return country;
  },
  // helper function (userPac.filters, userPac.mode, userPac.country)
  getSmartSettingsFakeHosts(
    userFilters: SiteFilter[],
    userMode: string,
    userCountry: string | null,
  ) {
    const smartSettingsFakeHosts = [];
    // getting active countries from user's SmartSettings settings
    const smartSettingsCountries: string[] = userFilters
      .filter(({ proxyMode }) => proxyMode === true)
      .map(({ country }) => country);

    // adding fake domain for current country from user's pac settings if it's active
    const currentCountry = userMode === 'proxy' ? userCountry : undefined;
    if (currentCountry) smartSettingsCountries.push(currentCountry);

    // ping unique countries only
    const smartSettingsUniqueCountries = Array.from(
      new Set(smartSettingsCountries),
    );
    for (const country of smartSettingsUniqueCountries) {
      if (country === undefined) continue; // skip undefined country / disabled smart settings

      const fakeDomain =
        smartSettingsHelpers.generateFakeHostForSmartSettings(country);
      // eslint-disable-next-line
      smartSettingsFakeHosts.push({
        format: 'domain' as 'domain' | 'full domain' | 'regex',
        value: fakeDomain,
        country: country,
      });
    }
    return smartSettingsFakeHosts;
  },
};
export default smartSettingsHelpers;
