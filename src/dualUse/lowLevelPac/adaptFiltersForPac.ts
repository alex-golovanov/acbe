/* global PacSiteFilter, SiteFilter */
import _ from 'lodash';
import dependencies from './domainDependencies';
import filtersSorting from 'tools/filtersSorting';
import config from 'config';

type PriorityFilter = {
  format: 'domain' | 'full domain' | 'regex';
  value: string;
  country: string | undefined; // country or undefined
  priority: integer;
};

/** @function helper function */
const getFakeDomain = (country: string) => {
  const fakeDomainTemplate = config.smartSettings.fakeDomainTemplate;
  return country + '.' + fakeDomainTemplate;
};

/** @function */
export default ({
  countries,
  defaultCountry,
  filters,
}: {
  countries: string[];
  defaultCountry: string;
  filters: SiteFilter[];
}): PacSiteFilter[] => {
  // User's own filters (SmartSettings)
  const siteFilters = [];
  for (const { disabled, country, format, proxyMode, value } of filters) {
    if (disabled) continue; // No disabled rules

    siteFilters.push({
      format,
      value: value instanceof RegExp ? value.toString().slice(1, -1) : value,
      country: proxyMode
        ? countries.includes(country)
          ? country
          : defaultCountry
        : undefined,
    });
  }

  // adding smartSettings fake servers
  const smartSettingsCountries: string[] = siteFilters
    .filter(({ format }) => format === 'domain')
    .map(({ country }) => country);

  const smartSettingsUniqueCountries = Array.from(
    new Set(smartSettingsCountries),
  );
  for (const country of smartSettingsUniqueCountries) {
    if (country === undefined) continue;
    const fakeDomain = getFakeDomain(country);
    // eslint-disable-next-line
    siteFilters.push({
      format: 'domain' as 'domain' | 'full domain' | 'regex',
      value: fakeDomain,
      country,
    });
  }

  // Filters including dependencies
  const priorityFilters: PriorityFilter[] = siteFilters.map(
    ({ format, value, country }): PriorityFilter => ({
      format,
      value,
      country,
      priority: 1,
    }),
  );

  for (const { value: domain, country } of siteFilters) {
    if (typeof domain !== 'string') continue;

    for (const { domain: domainArray, fullDomain, regex } of dependencies) {
      // check for domain, full domain and subdomain (without regex check)
      const condition =
        domainArray.includes(domain) ||
        fullDomain.includes(domain) ||
        domainArray.includes(domain.split('.').slice(-2).join('.'));
      if (!condition) continue;

      for (const value of domainArray) {
        if (value === domain) continue;
        priorityFilters.push({
          format: 'domain',
          value,
          country,
          priority: 0,
        });
      }
      for (const value of fullDomain) {
        if (value === domain) continue;
        priorityFilters.push({
          format: 'full domain',
          value,
          country,
          priority: 0,
        });
      }
      for (const value of regex) {
        priorityFilters.push({
          format: 'regex',
          value: value.toString().slice(1, -1),
          country,
          priority: 0,
        });
      }
    }
  }

  priorityFilters.sort((a, b) => b.priority - a.priority);

  // Removing doubles (intersection between original rules and
  // dependecies rules will be cleared in priority of original user rules)
  const output: PacSiteFilter[] = _.uniqBy(
    priorityFilters,
    ({ value }) => value,
  ).sort(filtersSorting); // Sorting with priority of level of domain

  // @ts-ignore
  for (const item of output) delete item.priority;

  return output;
};
