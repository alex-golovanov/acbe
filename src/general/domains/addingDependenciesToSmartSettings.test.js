import {
  describe,
  test,
  expect,
} from '@jest/globals';
import dependencies from '../../dualUse/lowLevelPac/domainDependencies';
import findMatchingFilterForDomain from '../tools/findMatchingFilterForDomain';

import domainsHelpers from './index';

//  // Filters -> direct domain intersection
//  let filter: SiteFilter | void = findMatchingFilterForDomain(
//   filters, domain
// );

// 1) We check dependencies for the domain only if we could not find a direct filter for it.
// // Filters -> domain dependency
// if( !filter ) {
//   ( () => {
//     const domainDependenciesBlock: DomainDependency | void =
//       findMatchingDependencyForDomain( dependencies, domain );
//     if( !domainDependenciesBlock ) return;

//     const {
//       'domain': domainArray, fullDomain, regex
//     } = domainDependenciesBlock;
//     filter = filters.find( ({ value }) => (
//       typeof value === 'string' && (
//         findMatchingFilterForDomain(
//           domainArray.map( value => ({ value, 'format': 'domain' }) ),
//           value
//         )
//         || findMatchingFilterForDomain(
//           fullDomain.map( value => ({ value, 'format': 'full domain' }) ),
//           value
//         )
//         || findMatchingFilterForDomain(
//           regex.map( value => ({ value, 'format': 'regex' }) ),
//           value
//         )
//       )
//     ) );
//   })();
// }

// if( filter ) {
//   if( !filter.proxyMode ) return null; // Direct filter

//   let { country } = filter;
//   return countries.includes( country ) ? country : defaultCountry; // Proxy filter
// }

describe( ' Adding dependencies to SmartSettings: Filters (SmartSettings) to Filters with dependencies algorithm test -> Direct & Indirect domain intersection', () => {
  test( '1.1 Filters -> DIRECT domain intersection: Browsing to: chat.openai.com with dependency: [domain(subdomain)] openai.com', () => {
    const currentDomain = 'chat.openai.com';
    const filters = [
      { 'format': 'domain', 'value': 'openai.com', 'country': 'nl', 'proxyMode': true },
    ];
    //  // Filters -> direct domain intersection
    let filter = findMatchingFilterForDomain( filters, currentDomain );
    console.log( 'Domain: ', currentDomain );
    console.log( 'filter:', filter );
    expect( filter ).toBeDefined();
    expect( filter ).toBeInstanceOf( Object );

    if( filter ) {
      expect( filter.proxyMode ).toBe( true );
      if( !filter.proxyMode ) return null; // Direct filter
      let { country } = filter;
      expect( country ).toBe( 'nl' );
      //return countries.includes( country ) ? country : defaultCountry; // Proxy filter
    }
  });

  test( '2.1 Filters -> DIRECT domain intersection: Browsing to: chat.openai.com with dependency: [domain(subdomain)] chat.openai.com', () => {
    const currentDomain = 'chat.openai.com';
    const filters = [
      {
        'format': 'domain',
        'value': 'chat.openai.com',
        'country': 'nl',
        'proxyMode': true,
      },
    ];
    //  // Filters -> direct domain intersection
    let filter = findMatchingFilterForDomain( filters, currentDomain );
    console.log( 'Domain: ', currentDomain );
    console.log( 'filter:', filter );
    expect( filter ).toBeDefined();
    expect( filter ).toBeInstanceOf( Object );

    if( filter ) {
      expect( filter.proxyMode ).toBe( true );
      if( !filter.proxyMode ) return null; // Direct filter
      let { country } = filter;
      expect( country ).toBe( 'nl' );
      //return countries.includes( country ) ? country : defaultCountry; // Proxy filter
    }
  });

  test( '3.1 Filters -> NON direct domain intersection: Browsing to: cdn.oaistatic.com with dependency: [domain(subdomain)] chat.openai.com', () => {
    const currentDomain = 'cdn.oaistatic.com';
    const filters = [
      {
        'format': 'domain',
        'value': 'chat.openai.com',
        'country': 'nl',
        'proxyMode': true,
      },
    ];
    //  // Filters -> direct domain intersection
    let filter = findMatchingFilterForDomain( filters, currentDomain );
    console.log( 'Domain: ', currentDomain );
    console.log( 'Direct filter:', filter );
    expect( filter ).not.toBeDefined();

    if( !filter ) {
      filter = domainsHelpers.loadDependenciesToFilters( currentDomain, filters, dependencies );
      console.log( 'Domain: ', currentDomain );
      console.log( 'filter:', filter );
      expect( filter ).toBeDefined();
      expect( filter ).toBeInstanceOf( Object );
    }

    if( filter ) {
      expect( filter.proxyMode ).toBe( true );
      if( !filter.proxyMode ) return null; // Direct filter
      let { country } = filter;
      expect( country ).toBe( 'nl' );
      //return countries.includes( country ) ? country : defaultCountry; // Proxy filter
    }
  });

  test( '3.2 Filters -> NON direct domain intersection: Browsing to: oaistatic.com with dependency: [domain(subdomain)] openai.com', () => {
    const currentDomain = 'oaistatic.com';
    const filters = [
      {
        'format': 'domain',
        'value': 'chat.openai.com',
        'country': 'nl',
        'proxyMode': true,
      },
    ];
    let filter = findMatchingFilterForDomain( filters, currentDomain );
    console.log( 'Domain: ', currentDomain );
    console.log( 'filter:', filter );
    expect( filter ).not.toBeDefined();

    if( !filter ) {
      filter = domainsHelpers.loadDependenciesToFilters( currentDomain, filters, dependencies );
      console.log( 'Domain: ', currentDomain );
      console.log( 'filter:', filter );
      expect( filter ).toBeDefined();
    }
  });

  test( '4.1 Filters -> NON direct domain intersection: Browsing to: openaicomproductionae4b.blob.core.windows.net with dependency: [domain(subdomain)] openai.com', () => {
    const currentDomain = 'openaicomproductionae4b.blob.core.windows.net';
    const filters = [
      {
        'format': 'domain',
        'value': 'chat.openai.com',
        'country': 'nl',
        'proxyMode': true,
      },
    ];
    const filter = domainsHelpers.loadDependenciesToFilters(
      currentDomain,
      filters,
      dependencies
    );
    console.log( 'Domain: ', currentDomain );
    console.log( 'filter:', filter );
    expect( filter ).toBeDefined();
    expect( filter ).toBeInstanceOf( Object );
  });

  test( '5.1 Filters -> NON direct domain intersection: Browsing to: chat.openai.com with dependency: [domain(subdomain)] oaistatic.com', () => {
    const currentDomain = 'chat.openai.com';
    const filters = [
      {
        'format': 'domain',
        'value': 'oaistatic.com',
        'country': 'nl',
        'proxyMode': true,
      },
    ];
    let filter = findMatchingFilterForDomain( filters, currentDomain );
    console.log( 'Domain: ', currentDomain );
    console.log( 'filter:', filter );
    expect( filter ).not.toBeDefined();

    if( !filter ) {
      filter = domainsHelpers.loadDependenciesToFilters( currentDomain, filters, dependencies );
      console.log( 'Domain: ', currentDomain );
      console.log( 'filter:', filter );
      expect( filter ).toBeDefined();
    }
  });
});

