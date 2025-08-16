// @flow
// Libraries
const fs = require( 'fs' );
const gulp = require( 'gulp' );
const path = require( 'path' );
const rename = require( 'gulp-rename' );
const TerserPlugin = require( 'terser-webpack-plugin' );
const webpack = require( 'webpack' );
const webpackStream = require( 'webpack-stream' );

// Code parts
const babelSettings = require( '../../babelSettings' );
const bundles = require( '../../bundles' );
const directory = require( '../../outputDirectory' );
const env = require( '../../env' );
const getDomainDependencies = require( './includes/getDomainDependencies' );
const getFileListByPattern = require( '../../getFileListByPattern' );


const projectVersion/*: string*/ = require( '../../../package.json' ).version;


/** @function */
const task = ( taskName/*: string*/ ) => {
  gulp.task( taskName, async() => {
    const firefox = taskName.endsWith( ':ff' );
    const v3 = taskName.endsWith( ':v3' );

    let nestedList/*: string[][] */ =
      await Promise.all( bundles.map( getFileListByPattern ) );
    let list/*: string[]*/ = nestedList.flat();
    
    let entry/*: { [string] : string }*/ = Object.fromEntries(
      list.map( ( filePath, index ) => [ 'page' + index, './' + filePath ] )
    );
    
    let exclusions/*: string[]*/ = await ( async() => {
      if( !taskName.endsWith( ':ff' ) ) {
        return [
          'src/dualUse/ga/partial/firefox.js',
          'src/dualUse/ga/full/firefox.js',
          'src/dualUse/pac/firefox/index.js',
          'src/dualUse/pac/firefox/onRequest.js',
          'src/dualUse/pac/firefox/proxyRegister.js'
        ];
      }

      let files/*: string[]*/ =
        await fs.promises.readdir( 'src/dualUse/ga/partial/chrome' );
      files = files
        .filter( name => name.endsWith( '.js' ) )
        .map( name => `src/dualUse/ga/partial/chrome/${name}` );

      return files.concat( [
        'src/dualUse/ga/full/chrome.js',
        'src/dualUse/pac/chrome/index.js',
        'src/dualUse/pac/chrome/buildPacScript.js'
      ] );
    })();
    exclusions = exclusions.map( exclusion => path.resolve(
      __dirname, '../../../' + exclusion
    ) );

    let domainDependencies = await getDomainDependencies();
    
    const ownJsonExist/*: boolean*/ = await ( async() => {
      try {
        await fs.promises.access( './config/own.json', fs.constants.F_OK );
        return true;
      }
      catch {
        return false;
      }
    })();
    
    const plugins = [
      new webpack.DefinePlugin({
        'DOMAIN_DEPENDENCIES': JSON.stringify( domainDependencies ),
        'LODASH_IMPORT': v3
          ? 'self.importScripts(\'/lodash.js\')'
          : JSON.stringify( '' ),
        'PROJECT_VERSION': JSON.stringify( projectVersion ),
        'V3': JSON.stringify( v3 )
      }),

      new webpack.IgnorePlugin({
        'checkResource': ( resource, context ) => {
          let condition =
            !resource.endsWith( '.ts' )
            && !resource.endsWith( '.js' )
            && !resource.endsWith( '.json' );
          if( condition ) resource += '.js';

          return exclusions.includes( path.resolve( context, resource ) );
        }
      })
    ];

    const minimizer = [];

    if( taskName.endsWith( ':no-uglify' ) ) {
      minimizer.push( new TerserPlugin({
        'test': /\.[jt]s(\?.*)?$/i,
        'parallel': true,
        minify( file, sourceMap ) {
          const code =
            require( 'js-beautify' ).js( file[ Object.keys( file )[ 0 ] ] );

          return { code };
        }
      }) );
    }
    else if( env === 'production' ) {
      minimizer.push( new TerserPlugin({
        'test': /\.[jt]s(\?.*)?$/i,
        'parallel': true,
        'terserOptions': {
          'compress': {
            'arrows': true,
            'arguments': false,
            'booleans': true,
            'booleans_as_integers': false,
            'collapse_vars': true,
            'comparisons': true,
            'computed_props': true,

            // Critical (breaks Chrome 53-56) !!!
            'conditionals': false,

            'dead_code': true,
            'defaults': true,
            'directives': true,
            'drop_console': false,
            'drop_debugger': true,
            'ecma': 5,
            'evaluate': true,
            'expression': false,
            'global_defs': {},
            'hoist_funs': false,
            'hoist_props': true,
            'hoist_vars': false,
            'if_return': true,
            'inline': true,
            'join_vars': true,
            'keep_classnames': false,
            'keep_fargs': true,
            'keep_fnames': false,
            'keep_infinity': false,
            'loops': true,
            'module': false,
            'negate_iife': true,
            'passes': 1,
            'properties': true,
            'pure_funcs': null,
            'pure_getters': 'strict',
            'reduce_vars': true,
            'sequences': true,
            'side_effects': true,
            'switches': true,
            'toplevel': false,
            'top_retain': false,
            'typeofs': true,
            'unsafe': false,
            'unsafe_arrows': false,
            'unsafe_comps': false,
            'unsafe_Function': false,
            'unsafe_math': false,
            'unsafe_methods': false,
            'unsafe_proto': false,
            'unsafe_regexp': false,
            'unsafe_undefined': false,
            'unused': true,
            'warnings': false
          },
          'mangle': false
        }
      }) );
    }

    const webpackConfig/*: Object*/ = {
      'mode': 'production',
      entry,
      'output': {
        'filename': ( pathData, assetInfo ) => {
          const rawRequest = (
            pathData.chunk.entryModule.rawRequest
            || pathData.chunk.entryModule.rootModule.rawRequest
          ).replace( /\\/g, '/' );
          
          return rawRequest.split( '/' ).slice( 2 ).join( '/' );
        }
      },
      'module': {
        'rules': [
          {
            'test': /src(\\|\/)pacScript\.js$/i,
            'use': 'raw-loader'
          },
          {
            'test': /notification(\\|\/)notification\.css$/i,
            'use': 'raw-loader'
          },
          {
            'test': /timezoneChange(\\|\/)dateCodeChange\.js$/i,
            'use': [
              
              { 'loader': 'raw-loader' },
              {
                'loader': 'string-replace-loader',
                'options': {
                  'search': 'export default dateCodeChange',
                  'replace': '',
                  'flags': 'g'
                }
              }
            ]
          },
          {
            'test': [ /\.tsx?$/, /\.m?js$/ ],
            'exclude': [
              /node_modules/,
              /contentScipts\/(?!.*\/).*/
            ],
            'use': [
              {
                'loader': 'babel-loader',
                'options': {
                  'babelrc': false,
                  'plugins': babelSettings( taskName ).plugins || []
                }
              }
            ]
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
            `../../../src/browserConfig/${firefox ? 'firefox' : 'chrome'}.js`
          ),
          'core/ga/full': path.resolve(
            __dirname,
            `../../../src/core/ga/full/${firefox ? 'firefox' : 'chrome/index'}.ts`
          ),
          'core/ga/partial': path.resolve(
            __dirname,
            `../../../src/core/ga/partial/${firefox ? 'firefox' : 'chrome/index'}.ts`
          ),
          'config': path.resolve(
            __dirname, `../../../config/${ownJsonExist ? 'own' : env}.js`
          )
        }
      },
      'performance': {
        'hints': false
      },
      plugins,
      'optimization': {
        'minimize': true,
        minimizer,
        'usedExports': true,
      }
    };
    if( env === 'development' ) {
      webpackConfig.devtool = 'inline-source-map';
    }
    
    const stream = gulp.src( 'src/background.ts' )
      .pipe( webpackStream({ 'config': webpackConfig }, webpack ) )
      .on( 'error', function( err ) {
        console.error( err );
        this.emit( 'end' ); // Don't stop the rest of the task
      })
      .pipe( rename( function( path ) {
        if( path.extname === '.ts' ) path.extname = '.js';
        if( path.dirname === 'contentScripts' ) path.dirname = '.';
      }) )
      .pipe( gulp.dest( directory + '/' ) );
    
    await new Promise( resolve => {
      stream.on( 'end', resolve );
    });
  });
};

task( 'bundles' );
task( 'bundles:ff' );
task( 'bundles:no-uglify' );
task( 'bundles:v3' );

