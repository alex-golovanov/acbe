// @flow
const gulp = require( 'gulp' );
const { createTask } = require( '../../taskFunctions' );


createTask( 'default', gulp.series(
  // 'dist:v2:chrome',
  // 'dist:v2:edge',
  'dist:v2:firefox',
  // 'dist:v2:opera',

  'dist:v3:chrome',
  'dist:v3:edge',
  // 'dist:v3:firefox',
  'dist:v3:opera'
) );
