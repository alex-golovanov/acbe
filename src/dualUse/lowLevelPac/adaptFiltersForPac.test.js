import { describe, test, expect } from '@jest/globals';
import dependencies from './domainDependencies';
import adaptFiltersForPac from './adaptFiltersForPac';
import domainsHelpers from '../../general/domains/index';

describe('adaptFiltersForPac specification test: [1] browsing to + [2] SmartSetting (filter) (4 possible combinations)', () => {
  test('[1] Full domain + [2] Full domain: browsing to: oaistatic.com with SmartSetting: [full domain] openai.com', async () => {
    const expectedFilters = [
      {
        format: 'full domain',
        value: 'chat.openai.com.cdn.cloudflare.net',
        country: 'nl',
      },
      {
        format: 'full domain',
        value: 'openaicomproductionae4b.blob.core.windows.net',
        country: 'nl',
      },
      {
        format: 'full domain',
        value: 'openaicom-api-bdcpf8c6d2e9atf6.z01.azurefd.net',
        country: 'nl',
      },
      {
        format: 'full domain',
        value: 'openaiapi-site.azureedge.net',
        country: 'nl',
      },
      {
        format: 'full domain',
        value: 'openaicom.imgix.net',
        country: 'nl',
      },
      {
        format: 'full domain',
        value: 'production-openaicom-storage.azureedge.net',
        country: 'nl',
      },
      {
        format: 'domain',
        value: 'nl.httpstat.us',
        country: 'nl',
      },
      { format: 'domain', value: 'oaistatic.com', country: 'nl' },
      { format: 'domain', value: 'openai.com', country: 'nl' },
    ];

    const currentDomain = 'oaistatic.com';
    const filters = [
      {
        format: 'domain',
        value: 'openai.com',
        country: 'nl',
        proxyMode: true,
        disabled: false,
      },
    ];
    // dependencies is a global variable, loaded from Test Setup (jest.setup.js)
    const domainDependencies = dependencies;
    const userPac_filters = [
      domainsHelpers.loadDependenciesToFilters(
        currentDomain,
        filters,
        domainDependencies,
      ),
    ];
    console.log('current domain:', currentDomain);
    console.log('domainDependencies:', domainDependencies);
    console.log('userPac_filters (result):', userPac_filters);
    const countries = { fi: 'Finland', nl: 'Netherlands' };
    const siteFilters = adaptFiltersForPac({
      countries: Object.keys(countries),
      defaultCountry: 'fi',
      filters: userPac_filters,
    });
    console.log('siteFilters:', siteFilters);
    expect(siteFilters).toBeDefined();
    expect(siteFilters).toEqual(expectedFilters);
  });

  test('[1] Full domain + [2] Subdomain: browsing to: oaistatic.com with SmartSetting: [domain(subdomain)] chat.openai.com', async () => {
    const expectedFilters = [
      {
        format: 'full domain',
        value: 'chat.openai.com.cdn.cloudflare.net',
        country: 'nl',
      },
      {
        format: 'full domain',
        value: 'openaicomproductionae4b.blob.core.windows.net',
        country: 'nl',
      },
      {
        format: 'full domain',
        value: 'openaicom-api-bdcpf8c6d2e9atf6.z01.azurefd.net',
        country: 'nl',
      },
      {
        format: 'full domain',
        value: 'openaiapi-site.azureedge.net',
        country: 'nl',
      },
      {
        format: 'full domain',
        value: 'openaicom.imgix.net',
        country: 'nl',
      },
      {
        format: 'full domain',
        value: 'production-openaicom-storage.azureedge.net',
        country: 'nl',
      },
      { format: 'domain', value: 'chat.openai.com', country: 'nl' },
      {
        format: 'domain',
        value: 'nl.httpstat.us',
        country: 'nl',
      },
      { format: 'domain', value: 'oaistatic.com', country: 'nl' },
      { format: 'domain', value: 'openai.com', country: 'nl' },
    ];

    const currentDomain = 'oaistatic.com';
    const filters = [
      {
        format: 'domain',
        value: 'chat.openai.com',
        country: 'nl',
        proxyMode: true,
        disabled: false,
      },
    ];
    // dependencies is a global variable, loaded from Test Setup (jest.setup.js)
    const domainDependencies = dependencies;
    const userPac_filters = [
      domainsHelpers.loadDependenciesToFilters(
        currentDomain,
        filters,
        domainDependencies,
      ),
    ];
    console.log('current domain:', currentDomain);
    console.log('domainDependencies:', domainDependencies);
    console.log('userPac_filters (result):', userPac_filters);
    const countries = { fi: 'Finland', nl: 'Netherlands' };
    const siteFilters = adaptFiltersForPac({
      countries: Object.keys(countries),
      defaultCountry: 'fi',
      filters: userPac_filters,
    });
    console.log('siteFilters:', siteFilters);
    expect(siteFilters).toBeDefined();
    expect(siteFilters).toEqual(expectedFilters);
  });

  test('[1] Subdomain + [2] Full domain: browsing to: cdn.oaistatic.com with SmartSetting: [full domain] openai.com', async () => {
    const expectedFilters = [
      {
        format: 'full domain',
        value: 'chat.openai.com.cdn.cloudflare.net',
        country: 'nl',
      },
      {
        format: 'full domain',
        value: 'openaicomproductionae4b.blob.core.windows.net',
        country: 'nl',
      },
      {
        format: 'full domain',
        value: 'openaicom-api-bdcpf8c6d2e9atf6.z01.azurefd.net',
        country: 'nl',
      },
      {
        format: 'full domain',
        value: 'openaiapi-site.azureedge.net',
        country: 'nl',
      },
      {
        format: 'full domain',
        value: 'openaicom.imgix.net',
        country: 'nl',
      },
      {
        format: 'full domain',
        value: 'production-openaicom-storage.azureedge.net',
        country: 'nl',
      },
      {
        format: 'domain',
        value: 'nl.httpstat.us',
        country: 'nl',
      },
      { format: 'domain', value: 'oaistatic.com', country: 'nl' },
      { format: 'domain', value: 'openai.com', country: 'nl' },
    ];

    const currentDomain = 'cdn.oaistatic.com';
    const filters = [
      {
        format: 'domain',
        value: 'openai.com',
        country: 'nl',
        proxyMode: true,
        disabled: false,
      },
    ];
    // dependencies is a global variable, loaded from Test Setup (jest.setup.js)
    const domainDependencies = dependencies;
    const userPac_filters = [
      domainsHelpers.loadDependenciesToFilters(
        currentDomain,
        filters,
        domainDependencies,
      ),
    ];
    console.log('current domain:', currentDomain);
    console.log('domainDependencies:', domainDependencies);
    console.log('userPac_filters (result):', userPac_filters);
    const countries = { fi: 'Finland', nl: 'Netherlands' };
    const siteFilters = adaptFiltersForPac({
      countries: Object.keys(countries),
      defaultCountry: 'fi',
      filters: userPac_filters,
    });
    console.log('siteFilters:', siteFilters);
    expect(siteFilters).toBeDefined();
    expect(siteFilters).toEqual(expectedFilters);
  });

  test('[1] Subdomain + [2] Subdomain: browsing to: cdn.oaistatic.com with SmartSetting: [domain(subdomain)] chat.openai.com', async () => {
    const expectedFilters = [
      {
        format: 'full domain',
        value: 'chat.openai.com.cdn.cloudflare.net',
        country: 'nl',
      },
      {
        format: 'full domain',
        value: 'openaicomproductionae4b.blob.core.windows.net',
        country: 'nl',
      },
      {
        format: 'full domain',
        value: 'openaicom-api-bdcpf8c6d2e9atf6.z01.azurefd.net',
        country: 'nl',
      },
      {
        format: 'full domain',
        value: 'openaiapi-site.azureedge.net',
        country: 'nl',
      },
      {
        format: 'full domain',
        value: 'openaicom.imgix.net',
        country: 'nl',
      },
      {
        format: 'full domain',
        value: 'production-openaicom-storage.azureedge.net',
        country: 'nl',
      },
      { format: 'domain', value: 'chat.openai.com', country: 'nl' },
      {
        format: 'domain',
        value: 'nl.httpstat.us',
        country: 'nl',
      },
      { format: 'domain', value: 'oaistatic.com', country: 'nl' },
      { format: 'domain', value: 'openai.com', country: 'nl' },
    ];

    const currentDomain = 'cdn.oaistatic.com';
    const filters = [
      {
        format: 'domain',
        value: 'chat.openai.com',
        country: 'nl',
        proxyMode: true,
        disabled: false,
      },
    ];
    // dependencies is a global variable, loaded from Test Setup (jest.setup.js)
    const domainDependencies = dependencies;
    const userPac_filters = [
      domainsHelpers.loadDependenciesToFilters(
        currentDomain,
        filters,
        domainDependencies,
      ),
    ];
    console.log('current domain:', currentDomain);
    console.log('domainDependencies:', domainDependencies);
    console.log('userPac_filters (result):', userPac_filters);

    const countries = { fi: 'Finland', nl: 'Netherlands' };
    const siteFilters = adaptFiltersForPac({
      countries: Object.keys(countries),
      defaultCountry: 'fi',
      filters: userPac_filters,
    });
    console.log('siteFilters:', siteFilters);
    expect(siteFilters).toBeDefined();
    expect(siteFilters).toEqual(expectedFilters);
  });
});
