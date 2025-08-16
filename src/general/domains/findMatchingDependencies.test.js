import { describe, test, expect } from '@jest/globals';
import dependencies from '../../dualUse/lowLevelPac/domainDependencies';
import findMatchingDependencyForDomain from '../tools/findMatchingDependencyForDomain';

// Usage example:

// const domainDependenciesBlock: DomainDependency | void =
//   findMatchingDependencyForDomain(dependencies, domain);
// if (!domainDependenciesBlock) return;

// const { domain: domainArray, fullDomain, regex } = domainDependenciesBlock;
// filter = filters.find(
//   ({ value }) =>
//     typeof value === "string" &&
//     (findMatchingFilterForDomain(
//       domainArray.map((value) => ({ value, format: "domain" })),
//       value
//     ) ||
//       findMatchingFilterForDomain(
//         fullDomain.map((value) => ({ value, format: "full domain" })),
//         value
//       ) ||
//       findMatchingFilterForDomain(
//         regex.map((value) => ({ value, format: "regex" })),
//         value
//       ))
// );
describe( 'Domain Dependency: findMatchingDependencyForDomain() specification test', () => {
  test( 'Domain (non-existing): www.abc.com with empty dependencies', () => {
    const currentDomain = 'www.abc.com';
    const dependencies = [{}];
    const domainDependenciesBlock = findMatchingDependencyForDomain( dependencies, currentDomain );
    console.log( 'Domain: ', currentDomain );
    console.log( 'domainDependenciesBlock:', domainDependenciesBlock );
    expect( domainDependenciesBlock ).not.toBeDefined();
    expect( domainDependenciesBlock ).not.toBeInstanceOf( Object );
  });

  test( 'Domain (non-existing): www.abc.com', () => {
    const currentDomain = 'www.abc.com';
    const domainDependenciesBlock = findMatchingDependencyForDomain( dependencies, currentDomain );
    console.log( 'Domain: ', currentDomain );
    console.log( 'domainDependenciesBlock:', domainDependenciesBlock );
    expect( domainDependenciesBlock ).not.toBeDefined();
    expect( domainDependenciesBlock ).not.toBeInstanceOf( Object );
  });

  test( 'Domain (existing): www.openai.com', () => {
    const currentDomain = 'www.openai.com';
    const domainDependenciesBlock = findMatchingDependencyForDomain( dependencies, currentDomain );
    console.log( 'Domain: ', currentDomain );
    console.log( 'domainDependenciesBlock:', domainDependenciesBlock );
    expect( domainDependenciesBlock ).toBeDefined();
    expect( domainDependenciesBlock ).toBeInstanceOf( Object );
    expect( domainDependenciesBlock ).toHaveProperty( 'domain' );
  });

  test( 'Domain (existing, without www): openai.com', () => {
    const currentDomain = 'openai.com';
    const domainDependenciesBlock = findMatchingDependencyForDomain( dependencies, currentDomain );
    console.log( 'Domain: ', currentDomain );
    console.log( 'domainDependenciesBlock:', domainDependenciesBlock );
    expect( domainDependenciesBlock ).toBeDefined();
    expect( domainDependenciesBlock ).toBeInstanceOf( Object );
    expect( domainDependenciesBlock ).toHaveProperty( 'domain' );
  });

  test( 'Domain (existing, on subdomain): chat.openai.com', () => {
    const currentDomain = 'chat.openai.com';
    const domainDependenciesBlock = findMatchingDependencyForDomain( dependencies, currentDomain );
    console.log( 'Domain: ', currentDomain );
    console.log( 'domainDependenciesBlock:', domainDependenciesBlock );
    expect( domainDependenciesBlock ).toBeDefined();
    expect( domainDependenciesBlock ).toBeInstanceOf( Object );
    expect( domainDependenciesBlock ).toHaveProperty( 'domain' );
  });
});


