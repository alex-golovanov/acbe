import { describe, test, expect } from '@jest/globals';
import domainsHelpers from './index';

describe( ' Adding dependencies to SmartSettings: Filters (SmartSettings) to Filters with dependencies algorithm test -> helper function specification', () => {
  test( 'Function defined', () => {
    expect( domainsHelpers.getRelevantSmartSettingWithDomainDependency ).toBeDefined();
    expect( domainsHelpers.getRelevantSmartSettingWithDomainDependency ).toBeInstanceOf( Function );
  })

  test( 'Empty SmartSettings test', () => {
    const currentDomain = 'chat.openai.com';
    const smartSettings = [ ];
    let filter = domainsHelpers.getRelevantSmartSettingWithDomainDependency( smartSettings, currentDomain );
    console.log( 'Domain: ', currentDomain );
    console.log( 'filter:', filter );
    expect( filter ).not.toBeDefined();
  });

  test( '1.1 Filters -> DIRECT domain intersection: Browsing to: chat.openai.com with dependency: [domain(subdomain)] openai.com', () => {
    const currentDomain = 'chat.openai.com';
    const smartSettings = [
      { 'format': 'domain', 'value': 'openai.com', 'country': 'nl', 'proxyMode': true },
    ];
    let filter = domainsHelpers.getRelevantSmartSettingWithDomainDependency( smartSettings, currentDomain );
    console.log( 'Domain: ', currentDomain );
    console.log( 'filter:', filter );
    expect( filter ).toBeDefined();
    expect( filter ).toBeInstanceOf( Object );
    expect( filter.proxyMode ).toBe( true )
    let { country } = filter;
    expect( country ).toBe( 'nl' );
  });

  test( '1.2 Filters -> DIRECT domain intersection: Browsing to: chat.openai.com with dependency: [domain(subdomain)] openai.com with proxy Turned off', () => {
    const currentDomain = 'chat.openai.com';
    const smartSettings = [
      { 'format': 'domain', 'value': 'openai.com', 'country': 'nl', 'proxyMode': false },
    ];
    let filter = domainsHelpers.getRelevantSmartSettingWithDomainDependency( smartSettings, currentDomain );
    console.log( 'Domain: ', currentDomain );
    console.log( 'filter:', filter );
    expect( filter ).toBeDefined();
    expect( filter ).toBeInstanceOf( Object );
    expect( filter.proxyMode ).toBe( false )
    let { country } = filter;
    expect( country ).toBe( 'nl' );
  });

  test( '2.1 Filters -> DIRECT domain intersection: Browsing to: chat.openai.com with dependency: [domain(subdomain)] chat.openai.com', () => {
    const currentDomain = 'chat.openai.com';
    const smartSettings = [
      {
        'format': 'domain',
        'value': 'chat.openai.com',
        'country': 'nl',
        'proxyMode': true,
      },
    ];
    let filter = domainsHelpers.getRelevantSmartSettingWithDomainDependency( smartSettings, currentDomain );
    console.log( 'Domain: ', currentDomain );
    console.log( 'filter:', filter );
    expect( filter ).toBeDefined();
    expect( filter ).toBeInstanceOf( Object );
    expect( filter.proxyMode ).toBe( true );
    let { country } = filter;
    expect( country ).toBe( 'nl' );
  });

  test( '3.1 Filters -> NON direct domain intersection: Browsing to: cdn.oaistatic.com with dependency: [domain(subdomain)] chat.openai.com', () => {
    const currentDomain = 'cdn.oaistatic.com';
    const smartSettings = [
      {
        'format': 'domain',
        'value': 'chat.openai.com',
        'country': 'nl',
        'proxyMode': true,
      },
    ];
    let filter = domainsHelpers.getRelevantSmartSettingWithDomainDependency( smartSettings, currentDomain );
    console.log( 'Domain: ', currentDomain );
    console.log( 'Direct filter:', filter );
    expect( filter ).toBeDefined();
    expect( filter ).toBeInstanceOf( Object );
    expect( filter.country ).toBe( 'nl' );
    expect( filter.proxyMode ).toBe( true );
  });

  test( '3.2 Filters -> NON direct domain intersection: Browsing to: oaistatic.com with dependency: [domain(subdomain)] openai.com', () => {
    const currentDomain = 'oaistatic.com';
    const smartSettings = [
      {
        'format': 'domain',
        'value': 'chat.openai.com',
        'country': 'nl',
        'proxyMode': true,
      },
    ];
    let filter = domainsHelpers.getRelevantSmartSettingWithDomainDependency( smartSettings, currentDomain );
    console.log( 'Domain: ', currentDomain );
    console.log( 'filter:', filter );
    expect( filter ).toBeDefined();
    expect( filter ).toBeInstanceOf( Object );
    expect( filter.country ).toBe( 'nl' );
    expect( filter.proxyMode ).toBe( true );
  });

  test( '4.1 Filters -> NON direct domain intersection: Browsing to: openaicomproductionae4b.blob.core.windows.net with dependency: [domain(subdomain)] openai.com', () => {
    const currentDomain = 'openaicomproductionae4b.blob.core.windows.net';
    const smartSettings = [
      {
        'format': 'domain',
        'value': 'chat.openai.com',
        'country': 'nl',
        'proxyMode': true,
      },
    ];
    let filter = domainsHelpers.getRelevantSmartSettingWithDomainDependency( smartSettings, currentDomain );
    console.log( 'Domain: ', currentDomain );
    console.log( 'filter:', filter );
    expect( filter ).toBeDefined();
    expect( filter ).toBeInstanceOf( Object );
    expect( filter.country ).toBe( 'nl' );
    expect( filter.proxyMode ).toBe( true );
  });

  test( '5.1 Filters -> NON direct domain intersection: Browsing to: chat.openai.com with dependency: [domain(subdomain)] oaistatic.com', () => {
    const currentDomain = 'chat.openai.com';
    const smartSettings = [
      {
        'format': 'domain',
        'value': 'oaistatic.com',
        'country': 'nl',
        'proxyMode': true,
      },
    ];
    let filter = domainsHelpers.getRelevantSmartSettingWithDomainDependency( smartSettings, currentDomain );
    console.log( 'Domain: ', currentDomain );
    console.log( 'filter:', filter );
    expect( filter ).toBeDefined();
    expect( filter.country ).toBe( 'nl' );
    expect( filter.proxyMode ).toBe( true );
  });
});
