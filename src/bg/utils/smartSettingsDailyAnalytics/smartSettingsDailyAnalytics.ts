import timemarks from 'bg/timemarks';
import ga from 'ga';
import jitsu from 'jitsu';
import findMatchingFilterForDomain from 'tools/findMatchingFilterForDomain';
import urlToDomain from 'tools/urlToDomain';
import type { UserPac } from 'types/UserPac';

// Only once per 24 hours
const ANALYTICS_TIMEOUT = 24 * 3600 * 1000;

/**
 * Sends smartSettingsUseDaily analytics event if the user is using a website
 * that matches one of the smart settings domains
 *
 * @param {string} url - The URL of the current tab
 * @param {UserPac} pac - User's PAC settings
 */
export const smartSettingsDailyAnalytics = async (
  url: string,
  pac: UserPac,
) => {
  const mark = await timemarks.getCached('GA Rare smartSettingsUseDaily');

  if (mark && Date.now() < mark + ANALYTICS_TIMEOUT) {
    return;
  }

  if (!url) return;

  const domain: string | null = urlToDomain(url);

  if (!domain) return;

  const matchedSmartSettingsDomain = findMatchingFilterForDomain(
    pac.filters,
    domain,
  );

  if (matchedSmartSettingsDomain) {
    timemarks.setCached('GA Rare smartSettingsUseDaily');

    ga.full({
      category: 'smartSettings',
      action: 'smartSettingsUseDaily',
    });
    jitsu.track('smartSettingsUseDaily');
  }
};
