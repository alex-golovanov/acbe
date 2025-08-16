import Browser from 'crossbrowser-webextension';
import ga from 'ga';
import store from 'store';
import smartSettingsHelpers from 'bg/pingSmartSettings/helpers';
import healthcheck from '../../dualUse/log/healthcheck';

export default () => {
  if (typeof browser !== 'undefined') return; // Only for Chrome

  const version: string = Browser.runtime.getManifest().version;
  const sentDomains: Array<{
    domain: string;
    timestamp: number;
  }> = [];

  Browser.webRequest.onHeadersReceived.addListener(
    async (details) => {
      const domain = (() => {
        try {
          return new URL(details.url).hostname;
        } catch (x) {}
      })();
      if (!domain) return;

      const { user } = await store.getStateAsync();

      // Proxy error GA requests
      if (!user.premium) return;

      if (details.statusCode !== 407) return;

      // log event
      const host = domain;
      // either fake domain country, or smart settings country, or default country
      const nonFakeCountry = healthcheck.smartCountries.hasOwnProperty(host)
        ? healthcheck.smartCountries[host]
        : 'defaultCountry';
      const country = smartSettingsHelpers.isFakeDomain(host)
        ? smartSettingsHelpers.getCountryFromHostForFakeDomain(host)
        : nonFakeCountry;

      healthcheck.logProxyErrorEvent({
        type: 'proxy-auth-407-error',
        country,
        host,
        args: [details?.method || '', details?.port || ''],
      });

      const headerValue = details.responseHeaders.find(
        ({ name }) => name === 'proxy-authenticate',
      )?.value;
      if (headerValue !== 'Basic realm="Browsec"') return;

      const sameDomainEntry = sentDomains.find(
        (item) => item.domain === domain,
      );
      const currentStamp = performance.now();
      const makeRequest =
        !sameDomainEntry ||
        sameDomainEntry.timestamp + 3600 * 1000 < currentStamp;
      if (!makeRequest) return;

      if (sameDomainEntry) sameDomainEntry.timestamp = currentStamp;
      else sentDomains.push({ domain, timestamp: currentStamp });

      ga.full({
        category: 'extension',
        action: 'proxyAuthError',
        label: `${domain} | ${version}`,
      });
    },
    { urls: ['<all_urls>'] },
    ['extraHeaders', 'responseHeaders'],
  );
};
