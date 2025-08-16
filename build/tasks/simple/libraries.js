// @flow
const _ = require( 'lodash' );
const babel = require( 'gulp-babel' );
const babelSettings = require( '../../babelSettings' );
const directory = require( '../../outputDirectory' );
const fs = require( 'fs' );
const gulp = require( 'gulp' );
const source = require( 'vinyl-source-stream' );
const { createMultifileTask } = require( '../../taskFunctions' );


/** @function */
const task = ( name/*: string*/ ) => {
  const firefox/*: boolean*/ = name.endsWith( ':ff' );

  createMultifileTask(
    name,
    'src/libraries/*',
    files => _.transform( files, ( carry, file ) => {
      const contents/*: string*/ = fs.readFileSync( file, 'utf8' );

      /** @type {Stream} */
      const stream/*: stream$Duplex*/ = ( () => {
        const stream = source( file.split( '/' ).pop() );

        if( !contents.includes( 'import ' ) ) {
          stream.end( contents );
          if( !firefox ) {
            return gulp.src( file ).pipe( babel( babelSettings( name ) ) );
          }
        }
        else {
          const importFile/*: string*/ = contents.split( 'import' )[ 1 ]
            .trim()
            .replace( /'/g, '' )
            .replace( /\;/g, '' );

          stream.end( fs.readFileSync( 'node_modules/' + importFile, 'utf8' ) );
        }

        return stream;
      })();

      carry.push( stream.pipe( gulp.dest( directory ) ) );
    }, [] )
  );
};

task( 'libraries' );
task( 'libraries:ff' );
