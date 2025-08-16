// @flow
const gulp = require( 'gulp' );
const { createTask } = require( '../../taskFunctions' );


createTask( 'chrome', gulp.series(
  'check_environment',
  'clean',
  'create_directories',
  gulp.parallel(
    'assets',
    'bundles',
    'libraries',
    'locales:chrome',
    'manifest:chrome',
    'pages',
    'polyfills'
  )
) );
