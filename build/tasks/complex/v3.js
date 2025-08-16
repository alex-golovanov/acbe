// @flow
const gulp = require( 'gulp' );
const { createTask } = require( '../../taskFunctions' );


function createV3Task( browserName ) {
  createTask( `v3:${browserName}`, gulp.series(
    'check_environment',
    'clean',
    'create_directories',
    gulp.parallel(
      'assets',
      'bundles:v3',
      'libraries',
      `locales:${browserName}`,
      'manifest:v3',
      'pages', // 'pages:v3',
      'polyfills:v3'
    )
  ) );
}

createV3Task( 'chrome' );
createV3Task( 'edge' );
createV3Task( 'firefox' );
createV3Task( 'opera' );

