import { describe, test, expect } from '@jest/globals';
const getRawDomainDependencies = require( '../../../build/tasks/simple/includes/getRawDomainDependencies' );
const getDomainDependencies = require( '../../../build/tasks/simple/includes/getDomainDependencies' );

// Example of data file:
// # comments
// include:another-file
// domain:google.com @attr1 @attr2
// keyword:google
// regexp:www\.google\.com$
// full:www.google.com

// – Comment begins with #. It may begin anywhere in the file. The content in the line after # is treated as comment and ignored in production.
// – Inclusion begins with include:, followed by the file name of an existing file in the same directory.
// – Subdomain begins with domain:, followed by a valid domain name. The prefix domain: may be omitted.
// – Keyword begins with keyword:, followed by a string.
// – Regular expression begins with regexp:, followed by a valid regular expression (per Golang's standard).
// – Full domain begins with full:, followed by a complete and valid domain name.
// – Domains (including domain, keyword, regexp and full) may have one or more attributes. Each attribute begins with @ and followed by the name of the attribute.


// file path: browsec-extension/build/domainDependencies/raw/openai

// Example of OpenAI data file:
// # Main domain
// chatgpt.com
// oaistatic.com
// oaiusercontent.com
// openai.com

// # CDN & API
// full:chat.openai.com.cdn.cloudflare.net
// full:openaiapi-site.azureedge.net
// full:openaicom-api-bdcpf8c6d2e9atf6.z01.azurefd.net
// full:openaicomproductionae4b.blob.core.windows.net
// full:production-openaicom-storage.azureedge.net

// # tracking
// full:o33249.ingest.sentry.io @ads
// full:openaicom.imgix.net @ads

// saving to package by Webpack to DOMAIN_DEPENDENCIES variable
// const getDomainDependencies = require( './includes/getDomainDependencies' );
// let domainDependencies = await getDomainDependencies();

// usage in Extension loading DOMAIN_DEPENDENCIES variable
// using tool from /src/dualUse/lowLevelPac/domainDependencies.ts


// getWebpackDependencies() test helper function that mocks Webpack loading of domain dependenciess
async function getWebpackDependencies() {
  console.log( 'getWebpackDependencies() called... Emulating loadig domain dependencies from Webpack package...' );
  const DOMAIN_DEPENDENCIES = await getDomainDependencies();
  //console.log( 'DOMAIN_DEPENDENCIES:', DOMAIN_DEPENDENCIES );
  
  DOMAIN_DEPENDENCIES.map(
    ( block ) => {
      const domain = [];
      const fullDomain = [];
      const regex = [];

      for( const { format, value } of block ) {
        switch( format ) {
          case 'domain':
            domain.push( value );
            break;
          case 'full domain':
            fullDomain.push( value );
            break;
          case 'regex':
            regex.push( new RegExp( value ) );
            break;
        }
      }
      return { domain, fullDomain, regex };
    }
  );
  return DOMAIN_DEPENDENCIES;
};

// const getRawDomainDependencies = require( './getRawDomainDependencies' );
// const rawDomainDependencies/*: string[][]*/ = await getRawDomainDependencies();

describe( 'Domain Dependency: getRawDomainDependencies() - loading raw data from /raw folder specification test', () => {
  test( 'Raw domain dependency list should be loaded and should have length > 0', async() => {
    const rawDomainDependencies/*: string[][]*/ = await getRawDomainDependencies();
    expect( rawDomainDependencies ).toBeDefined();
    expect( rawDomainDependencies ).toBeInstanceOf( Array );
    expect( rawDomainDependencies.length ).toBeGreaterThan( 0 );
  });

  test( 'OpenAI data should be loaded', async() => {
    const rawDomainDependencies/*: string[][]*/ = await getRawDomainDependencies();
    // console.log(rawDomainDependencies);
    const filteredList = rawDomainDependencies.map(
      ( oldBlock/*: string[]*/ ) => oldBlock.map( entry => {
        if( entry.includes( 'openai' ) ) {
          return entry;
        }
        else {
          return undefined;
        }
      }).filter( entry => entry !== undefined ) ).filter( entry => entry.length > 0 );
    console.log( 'filteredList:', filteredList );
    expect( filteredList ).toBeDefined();
    expect( filteredList ).toBeInstanceOf( Array );
    expect( filteredList.length ).toBeGreaterThan( 0 );
  });
});

describe( 'Domain Dependency: getDomainDependencies() - restructuring raw data of domain dependencies specification test', () => {
  test( 'Domain dependency list should be loaded and should have length > 0', async() => {
    const domainDependencies = await getDomainDependencies();
    expect( domainDependencies ).toBeDefined();
    expect( domainDependencies ).toBeInstanceOf( Array );
    expect( domainDependencies.length ).toBeGreaterThan( 0 );
  });

  test( 'Domain dependency list should include OpenAI', async() => {
    const domainDependencies = await getDomainDependencies();
    const filteredList = domainDependencies.map(
      ( oldBlock/*: string[]*/ ) => oldBlock.map( entry => {
        if( entry.value.includes( 'openai' ) ) {
          return entry;
        }
        else {
          return undefined;
        }
      }).filter( entry => entry !== undefined ) ).filter( entry => entry.length > 0 );
    console.log( 'filteredList:', filteredList );
    expect( filteredList ).toBeDefined();
    expect( filteredList ).toBeInstanceOf( Array );
    expect( filteredList.length ).toBeGreaterThan( 0 );
  });
});

describe( 'Domain dependency: runtime loading of domain dependencies from WebPack DOMAIN_DEPENDENCIES global variable', () => {
  test( 'Domain dependency list should be loaded and should have length > 0', async() => {
    const domainDependencies = await getWebpackDependencies();
    expect( domainDependencies ).toBeDefined();
    expect( domainDependencies ).toBeInstanceOf( Array );
    expect( domainDependencies.length ).toBeGreaterThan( 0 );
  });

  test( 'Domain dependency list should include OpenAI', async() => {
    const domainDependencies = await getWebpackDependencies();
    const filteredList = domainDependencies.map(
      ( oldBlock/*: string[]*/ ) => oldBlock.map( entry => {
        if( entry.value.includes( 'openai' ) ) {
          return entry;
        }
        else {
          return undefined;
        }
      }).filter( entry => entry !== undefined ) ).filter( entry => entry.length > 0 );
    console.log( 'filteredList:', filteredList );
    expect( filteredList ).toBeDefined();
    expect( filteredList ).toBeInstanceOf( Array );
    expect( filteredList.length ).toBeGreaterThan( 0 );
  });
});
