// @flow
const directory = require( '../../outputDirectory' );
const fs = require( 'fs' );
const { createTask } = require( '../../taskFunctions' );


createTask( 'create_directories', async() => {
  await fs.promises.mkdir( directory );
  await fs.promises.mkdir( directory + '/pages' );
  await fs.promises.mkdir( directory + '/popup' );
});

