// @flow
const gulp = require( 'gulp' );
const { createTask } = require( '../../taskFunctions' );


createTask( 'edge', gulp.series(
  'check_environment',
  'clean',
  'create_directories',
  gulp.parallel(
    'assets',
    'bundles',
    'libraries',
    'locales:edge',
    'manifest:edge',
    'pages',
    'polyfills'
  )
) );
