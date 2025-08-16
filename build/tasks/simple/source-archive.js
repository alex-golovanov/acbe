// @flow
const { glob } = require( 'glob' );
const gulp = require( 'gulp' );
const version = require( '../../version' );
const zip = require( 'gulp-zip' );
const { createTask } = require( '../../taskFunctions' );


createTask( 'source-archive', async() => {
  const pattern = [
    '**/.eslintrc.js',
    '**/.eslintignore',
    '**/*',
  ];

  const list/*: Array<string>*/ = await glob(
    pattern,
    {
      'ignore': [
        'node_modules',
        'node_modules/**/*',
        'target',
        'target/**/*',
        '**/*.zip',
        '**/*.xpi',
        '**/*.languagebabel',
        '**/*.gitignore',
        '.git',
        '.git/**/*'
      ]
    }
  );

  const stream = gulp.src( list, { 'base': './' })
    .pipe( zip( `browsec-extension-src-${version}.zip` ) )
    .pipe( gulp.dest( '.' ) );

  await new Promise( resolve => {
    stream.on( 'end', resolve );
  });
});
