import dependencies from '../../dualUse/lowLevelPac/domainDependencies';
import findMatchingDependencyForDomain from '../tools/findMatchingDependencyForDomain';
import findMatchingFilterForDomain from '../tools/findMatchingFilterForDomain';
import type SiteFilter from '../../../types/SiteFilter';
import type DomainDependency from '../../../types/DomainDependency';

type ComboFormatType = {
  disabled?: boolean,
  value: string,
  format: 'domain'
} | {
  disabled?: boolean,
  value: string,
  format: 'full domain'
} | {
  disabled?: boolean,
  value: RegExp,
  format: 'regex'
};

export default {
  /**
   * Check if domain is in SmartSettings (filters), including SmartSettings dependencies
   * @param filters smart settings
   * @param domain current domain
   * @returns filter object or undefined
   */
  getRelevantSmartSettingWithDomainDependency(filters: SiteFilter[], domain: string) {
    // Filters -> check inside SmartSettings
    let filter: SiteFilter | void = findMatchingFilterForDomain(
      filters, domain
    );
    // Filters -> check inside dependencies of SmartSettings
    if( !filter ) {
      filter = this.loadDependenciesToFilters( domain, filters, dependencies );
    }
    return filter;
  },
  loadDependenciesToFilters( currentDomain: string, smartSettings: SiteFilter[], dependencies: DomainDependency[] ) {
    // load dependencies to filters from our domain dependencies database
    const domainDependenciesBlock = findMatchingDependencyForDomain(
      dependencies,
      currentDomain
    );
    if( !domainDependenciesBlock ) return;
  
    const { 'domain': domainArray, fullDomain, regex } = domainDependenciesBlock;
  
    const domainsFromDependenciesBlock = domainArray.map( ( value ) => ({
      value,
      'format': 'domain',
    }) ) as ComboFormatType[];
   
    const fullDomainFromDependenciesBlock = fullDomain.map( ( value ) => ({
      value,
      'format': 'full domain',
    }) ) as ComboFormatType[];
    
    const regexFromDependenciesBlock = regex.map( ( value ) => ({
      value,
      'format': 'regex',
    }) ) as ComboFormatType[];
  
    return smartSettings.find(
      ({ value }) =>
        typeof value === 'string'
        && ( findMatchingFilterForDomain( domainsFromDependenciesBlock, value )
          || findMatchingFilterForDomain( fullDomainFromDependenciesBlock, value )
          || findMatchingFilterForDomain( regexFromDependenciesBlock, value ) )
    );
  }
};
