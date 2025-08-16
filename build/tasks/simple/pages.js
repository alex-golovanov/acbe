// @flow
const babelSettings = require( '../../babelSettings' );
const env = require( '../../env' );
const fs = require( 'fs' );
const getDomainDependencies = require( './includes/getDomainDependencies' );
const gulp = require( 'gulp' );
const outputDirectory = require( '../../outputDirectory' );
const path = require( 'path' );

const webpack = require( 'webpack' );
const webpackStream = require( 'webpack-stream' );
const TerserPlugin = require( 'terser-webpack-plugin' );


const projectVersion/*: string*/ = require( '../../../package.json' ).version;


const createTask = ( taskName/*: string*/ ) => {
  const firefox/*: boolean */ = taskName.endsWith( ':ff' );

  gulp.task( taskName, async() => {
    let directories = await fs.promises.readdir( 'src/pages' );
    directories = directories.filter( item => item !== 'components' );

    if( firefox ) {
      directories = directories.filter(
        item => item !== 'unblock_proxy' && item !== 'management'
      );
    }

    const ownJsonExist/*: boolean*/ = await ( async() => {
      try {
        await fs.promises.access( './config/own.json', fs.constants.F_OK );
        return true;
      }
      catch {
        return false;
      }
    })();

    const domainDependencies = await getDomainDependencies();

    const promises = [];

    // Generate .js bundle files
    promises.push( new Promise( ( resolve, reject ) => {
      const stream = gulp.src(
        'src/pages/congratulations/congratulations.html'
      )
        .pipe( webpackStream({
          'config': {
            'mode': 'production',
            'entry': Object.fromEntries( ( () => {
              const entries = directories.map( ( section/*: string*/ ) => [
                section,
                path.resolve( `src/pages/${section}/${section}.ts` )
              ] );
              entries.push(
                [ 'popup', path.resolve( 'src/popup/popup.ts' ) ]
              );

              return entries;
            })() ),
            'output': {
              'filename': ( pathData, assetInfo ) => {
                const name = pathData.chunk.name;
                if( name === 'popup' ) return 'popup/popup.js';
                if( name === 'common' ) return 'common.js';

                return `pages/${name}/${name}.js`;
              }
            },
            'module': {
              'rules': [
                {
                  'test': /src(\\|\/)pacScript\.js$/i,
                  'use': 'raw-loader'
                },
                {
                  'test': [ /\.tsx?$/, /\.m?js$/ ],
                  'use': {
                    'loader': 'babel-loader',
                    'options': {
                      'babelrc': false,
                      'plugins': babelSettings( taskName ).plugins || []
                    }
                  }
                }
              ]
            },
            'resolve': {
              'extensions': [ '.ts', '.js', '.json' ],
              'modules': [
                path.resolve( __dirname, '../../../src' ),
                path.resolve( __dirname, '../../../src/general' ),
                path.resolve( __dirname, '../../../src/dualUse' ),
                'node_modules'
              ],
              'alias': {
                'browserConfig': path.resolve(
                  __dirname,
                  `../../../src/browserConfig/${taskName.endsWith( ':ff' ) ? 'firefox' : 'chrome'}.js`
                ),
                'config': path.resolve(
                  __dirname, `../../../config/${ownJsonExist ? 'own' : env}.js`
                )
              }
            },
            'performance': {
              'hints': false
            },
            'plugins': [
              new webpack.DefinePlugin({
                'DOMAIN_DEPENDENCIES': JSON.stringify( domainDependencies ),
                'PROJECT_VERSION': JSON.stringify( projectVersion )
              })
            ],
            'optimization': {
              'minimizer': [ new TerserPlugin({ 'extractComments': false }) ],
              'splitChunks': {
                'chunks': 'all',
                'name': 'common'
              }
            }
          }
        }, webpack ) )
        .pipe( gulp.dest( outputDirectory ) );

      stream.on( 'end', resolve );
      stream.on( 'error', reject );
    }) );

    { // Change and copy HTML
      const fileObjects = directories.map( ( section ) => {
        const directory/*: string*/ = `${outputDirectory}/pages/${section}`;

        return {
          directory,
          'input': `src/pages/${section}/${section}.html`,
          'output': path.resolve( directory, `${section}.html` )
        };
      });
      fileObjects.push({
        'directory': outputDirectory + '/popup',
        'input': 'src/popup/index.html',
        'output': path.resolve( outputDirectory + '/popup', 'popup.html' )
      });

      for( const { directory, input, output } of fileObjects ) {
        promises.push( ( async() => {
          const text =
            await fs.promises.readFile( input, { 'encoding': 'utf-8' });

          try {
            await fs.promises.access( directory );
          }
          catch ( error ) {
            if( error.code !== 'ENOENT' ) throw error;
            await fs.promises.mkdir( directory );
          }

          await fs.promises.writeFile( output, text, 'utf8' );
        })() );
      }
    }

    // // GA scripts for popup in not-FF
    // if( !firefox ) {
    //   const stream = gulp.src( 'src/scripts/**/*', { 'base': 'src' })
    //     .pipe( gulp.dest( outputDirectory ) );

    //   promises.push( new Promise( ( resolve, reject ) => {
    //     stream.on( 'end', resolve );
    //     stream.on( 'error', reject );
    //   }) );
    // }

    await Promise.all( promises );
  });
};

createTask( 'pages' );
createTask( 'pages:ff' );
createTask( 'pages:no-uglify' );
