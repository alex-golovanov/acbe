// @flow
const fs = require( 'fs' ).promises;
const path = require( 'path' );


/** @function */
const removeDirectory = async( dir/*: string*/ )/*: Promise<void>*/ => {
  let list/*: string[]*/ = await fs.readdir( dir );
  list = list
    .map( filename => path.join( dir, filename ) )
    .filter( filename => ![ '.', '..' ].includes( filename ) );
  
  await Promise.all( list.map( async( filename ) => {
    const stat = await fs.stat( filename );

    if( stat.isDirectory() ) {
      await removeDirectory( filename ); // rmdir recursively
    }
    else await fs.unlink( filename ); // rm fiilename
  }) );
  
  await fs.rmdir( dir );
};


module.exports = removeDirectory;
