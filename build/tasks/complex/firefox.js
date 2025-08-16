// @flow
const gulp = require( 'gulp' );
const { createTask } = require( '../../taskFunctions' );


createTask( 'firefox', gulp.series(
  'check_environment',
  'clean',
  'create_directories',
  gulp.parallel(
    'assets',
    'bundles:ff',
    'libraries:ff',
    'locales:firefox',
    'manifest:firefox',
    'pages:ff',
    'polyfills:ff'
  )
) );
