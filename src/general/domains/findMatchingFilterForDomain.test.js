
import { describe, test, expect } from '@jest/globals';
import findMatchingFilterForDomain from '../tools/findMatchingFilterForDomain';

// checks list of filters (first argument) for domain (second argument)
describe( 'Domain Dependency: findMatchingFilterForDomain() specification test', () => {
  test( 'Browsing to: www.abc.com with empty dependency', () => {
    const currentDomain = 'www.abc.com';
    const domainArray = [ ];
    const filter = findMatchingFilterForDomain( domainArray, currentDomain );
    console.log( 'Domain: ', currentDomain );
    console.log( 'filter:', filter );
    expect( filter ).not.toBeDefined();
  });
  
  test( 'Browsing to: www.abc.com with dependency: [domain (subdomain)] openai.com', () => {
    const currentDomain = 'www.abc.com';
    const domainArray = [ { 'format': 'domain', 'value': 'openai.com' } ];
    const filter = findMatchingFilterForDomain( domainArray, currentDomain );
    console.log( 'Domain: ', currentDomain );
    console.log( 'filter:', filter );
    expect( filter ).not.toBeDefined();
  });

  test( 'Browsing to: openai.com with dependency: [domain (subdomain)] openai.com', () => {
    const currentDomain = 'openai.com';
    const domainArray = [ { 'format': 'domain', 'value': 'openai.com' } ];
    const filter = findMatchingFilterForDomain( domainArray, currentDomain );
    console.log( 'Domain: ', currentDomain );
    console.log( 'filter:', filter );
    expect( filter ).toBeDefined();
    expect( filter ).toBeInstanceOf( Object );
  });

  test( 'Browsing to: openai.com with dependency: [full domain] openai.com', () => {
    const currentDomain = 'openai.com';
    const domainArray = [ { 'format': 'full domain', 'value': 'openai.com' } ];
    const filter = findMatchingFilterForDomain( domainArray, currentDomain );
    console.log( 'Domain: ', currentDomain );
    console.log( 'filter:', filter );
    expect( filter ).toBeDefined();
    expect( filter ).toBeInstanceOf( Object );
  });

  test( 'Browsing to: chat.openai.com with dependency: [domain (subdomain)] openai.com', () => {
    const currentDomain = 'chat.openai.com';
    const domainArray = [ { 'format': 'domain', 'value': 'openai.com' } ];
    const filter = findMatchingFilterForDomain( domainArray, currentDomain );
    console.log( 'Domain: ', currentDomain );
    console.log( 'filter:', filter );
    expect( filter ).toBeDefined();
    expect( filter ).toBeInstanceOf( Object );
  });

  test( 'Browsing to: openai.com with dependency: [domain (subdomain)] chat.openai.com', () => {
    const currentDomain = 'openai.com';
    const domainArray = [ { 'format': 'domain', 'value': 'chat.openai.com' } ];
    const filter = findMatchingFilterForDomain( domainArray, currentDomain );
    console.log( 'Domain: ', currentDomain );
    console.log( 'filter:', filter );
    expect( filter ).not.toBeDefined();
  });

  test( 'Browsing to: chat.openai.com with dependency: [domain (subdomain)] chat.openai.com', () => {
    const currentDomain = 'chat.openai.com';
    const domainArray = [ { 'format': 'domain', 'value': 'chat.openai.com' } ];
    const filter = findMatchingFilterForDomain( domainArray, currentDomain );
    console.log( 'Domain: ', currentDomain );
    console.log( 'filter:', filter );
    expect( filter ).toBeDefined();
    expect( filter ).toBeInstanceOf( Object );
  });

  test( 'Browsing to: chat.openai.com with dependency: [full domain] openai.com', () => {
    const currentDomain = 'chat.openai.com';
    const domainArray = [ { 'format': 'full domain', 'value': 'openai.com' } ];
    const filter = findMatchingFilterForDomain( domainArray, currentDomain );
    console.log( 'Domain: ', currentDomain );
    console.log( 'filter:', filter );
    expect( filter ).not.toBeDefined();
  });
});
