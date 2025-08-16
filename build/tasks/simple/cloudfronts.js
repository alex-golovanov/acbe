// @flow
const beautify = require( 'js-beautify' ).js_beautify;
const fs = require( 'fs' ).promises;
const { createTask } = require( '../../taskFunctions' );


createTask( 'cloudfronts', async() => {
  const response/*: Response*/ = await fetch(
    'https://gist.githubusercontent.com/brwinfo/0d4c6d2ebbe6fd716a43f0ac9d37ce22/raw?' + Math.floor( Math.random() * 10 ** 12 ),
    {
      'dataType': 'json',
      'headers': { 'Content-Type': 'application/x-www-form-urlencoded' },
      'method': 'GET'
    }
  );

  if( !response.ok ) {
    throw new Error(
      `Fetch request error ${response.status}: ${response.statusText}`
    );
  }

  const list/*: string[]*/ = await response.json();

  const jsonText/*: string*/ = beautify( JSON.stringify( list ), {
    'brace-style': 'collapse',
    'indent_size': 2,
  });

  await fs.writeFile( 'config/productionApiServerUrls.json', jsonText );
});
