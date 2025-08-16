// @flow
const directory = require( '../../outputDirectory' );
const fs = require( 'fs' );
const removeDirectory = require( '../../removeDirectory' );
const { createTask } = require( '../../taskFunctions' );


// Clean all = require( directory
createTask( 'clean', async() => {
  let exist;
  try {
    await fs.promises.access( directory, fs.constants.F_OK );
    exist = true;
  }
  catch {
    exist = false;
  }

  if( exist ) await removeDirectory( directory );

  // To avoid ` Error: EPERM: operation not permitted, mkdir 'target`
  await new Promise( resolve => { setTimeout( resolve, 0 ); });
});
