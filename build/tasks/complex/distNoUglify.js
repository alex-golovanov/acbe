// @flow
const gulp = require( 'gulp' );
const { createTask } = require( '../../taskFunctions' );


createTask( 'dist:no-uglify', gulp.series(
  'clean',
  gulp.parallel(
    'bundles:no-uglify', 'manifest', 'assets', 'polymer', 'pages', 'locales'
  ),
  'zip'
) );
