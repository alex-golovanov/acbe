// @flow
const gulp = require( 'gulp' );
const { createTask } = require( '../../taskFunctions' );


createTask( 'opera', gulp.series(
  'check_environment',
  'clean',
  'create_directories',
  gulp.parallel(
    'assets',
    'bundles:no-uglify',
    'libraries',
    'locales:opera',
    'manifest:opera',
    'pages:no-uglify',
    'polyfills'
  )
) );
