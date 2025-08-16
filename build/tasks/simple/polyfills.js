// @flow
const directory = require( '../../outputDirectory' );
const fs = require( 'fs' );
const gulp = require( 'gulp' );


const polyfills = {
  'chrome': [
    'polyfills/Array.flat',
    'polyfills/Array.flatMap',
    'polyfills/globalThis',
    'polyfills/Object.fromEntries',
    'polyfills/Promise.prototype.finally',
    'polyfills/String.prototype.padEnd',
    'polyfills/String.prototype.padStart'
  ],
  'firefox': []
};


const createTask = ( taskName/*: string */ ) => {
  const mode = ( () => {
    switch( taskName ) {
      case 'polyfills:ff': return 'firefox';
      case 'polyfills:v3': return 'v3';
      default: return 'chrome';
    }
  })();
  
  gulp.task( taskName, async() => {
    const polyfillFiles = ( () => {
      switch( mode ) {
        case 'chrome': return polyfills.chrome;
        case 'firefox': return polyfills.firefox;
        case 'v3': return [];
      }
    })();

    const code/*: string*/ = await ( async() => {
      if( !polyfillFiles.length ) return '';

      const texts = await Promise.all( polyfillFiles.map(
        path => fs.promises.readFile( `src/${path}.js`, 'utf8' )
      ) );

      return texts.reduce( ( carry, code ) => carry + code + '\n\n', '' );
    })();


    await fs.promises.writeFile( directory + '/polyfills.js', code );
  });
};

createTask( 'polyfills' );
createTask( 'polyfills:ff' );
createTask( 'polyfills:v3' );
