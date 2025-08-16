// @flow
const _ = require( 'lodash' );
const autoprefixer = require( 'gulp-autoprefixer' );
const gulp = require( 'gulp' );

const assets = require( '../../assets' );
const directory = require( '../../outputDirectory' );
const getFileListByPattern = require( '../../getFileListByPattern' );
const { createTask } = require( '../../taskFunctions' );


createTask( 'assets', gulp.parallel(
  // Most of files
  async() => {
    const lists/*: string[][]*/ = await Promise.all(
      assets.map( magicPath => getFileListByPattern( magicPath ) )
    );
    const list/*: Array<string>*/ =
      _.flatten( lists ).filter( url => !url.includes( '/(o)' ) ); // Remove originals of images

    await Promise.all(
      list.map( ( filePath/*: string*/ )/*: Promise<void>*/ => {
        const type/*: string*/ = filePath.split( '.' ).pop();

        const stream = ( () => {
          if( type === 'css' ) {
            return (
              gulp.src( filePath, { 'base': 'src' })
                .pipe( autoprefixer({
                  'remove': false,
                  'overrideBrowserslist': [ 'last 5 versions', 'not ie <= 11' ]
                }) )
                .pipe( gulp.dest( directory ) )
            );
          }

          return (
            gulp.src( filePath, { 'base': 'src', 'encoding': false }).pipe( gulp.dest( directory ) )
          );
        })();

        return new Promise( resolve => { stream.on( 'end', resolve ); });
      })
    );
  },

  // Popup CSS
  () => (
    gulp.src( 'src/popup/styles/popup.css', { 'base': 'src' })
      .pipe( autoprefixer({
        'remove': false,
        'overrideBrowserslist': [ 'last 5 versions', 'not ie <= 11' ]
      }) )
      .pipe( gulp.dest( directory ) )
  )
) );
