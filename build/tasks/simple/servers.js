// @flow
const beautify = require( 'js-beautify' ).js_beautify;
const fs = require( 'fs' ).promises;
const { createTask } = require( '../../taskFunctions' );


const url/*: string*/ = 'https://a703.l461.r761.fastcloudcdn.net/api/v1/servers?uc=ru&stdomains=1';


createTask( 'servers', async() => {
  // https://developer.mozilla.org/en-US/docs/Web/API/Response
  const response/*: Response*/ = await fetch(
    url,
    {
      'dataType': 'json',
      'headers': {
        'Content-Type': 'application/x-www-form-urlencoded',
        // special premium account extension@browsec.com
        'Authorization': 'Token token="HPWG328jVqAWJYDLD7MM"'
      },
      'method': 'GET'
    }
  );

  if( !response.ok ) {
    throw new Error(
      `Fetch request error ${response.status}: ${response.statusText}`
    );
  }

  /** @type {Object} */
  const servers = await response.json();

  const jsonText/*: string*/ = beautify( JSON.stringify( servers ), {
    'brace-style': 'collapse',
    'indent_size': 2
  });

  await fs.writeFile( 'src/servers.json', jsonText );
});
