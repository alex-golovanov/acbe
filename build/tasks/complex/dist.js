// @flow
const gulp = require( 'gulp' );
const { createTask } = require( '../../taskFunctions' );


createTask( 'dist:v2:chrome', gulp.series( 'chrome', 'zip:chrome' ) );

createTask( 'dist:v2:edge', gulp.series( 'edge', 'zip:edge' ) );

createTask( 'dist:v2:firefox', gulp.series( 'firefox', 'zip:xpi' ) );

createTask( 'dist:v2:opera', gulp.series( 'opera', 'zip:opera' ) );

createTask( 'dist:v2', gulp.series(
  'dist:v2:chrome',
  'dist:v2:edge',
  'dist:v2:firefox',
  'dist:v2:opera'
) );


createTask( 'dist:v3:chrome', gulp.series( 'v3:chrome', 'zip:v3:chrome' ) );

createTask( 'dist:v3:edge', gulp.series( 'v3:edge', 'zip:v3:edge' ) );

createTask( 'dist:v3:firefox', gulp.series( 'v3:firefox', 'zip:v3:firefox' ) );

createTask( 'dist:v3:opera', gulp.series( 'v3:opera', 'zip:v3:opera' ) );

createTask( 'dist:v3', gulp.series(
  'dist:v3:chrome',
  'dist:v3:edge',
  'dist:v3:firefox',
  'dist:v3:opera'
) );


createTask( 'dist', gulp.series(
  'dist:v2',
  'dist:v3'
) );
