// @flow
const environment = require( '../../env' );
const fs = require( 'fs' );
const gulp = require( 'gulp' );


gulp.task( 'check_environment', async() => {
  const fileUrl/*: string*/ = `./config/${environment}.js`;
  let fileExist = await ( async() => {
    try {
      await fs.promises.access( fileUrl, fs.constants.F_OK );
      return true;
    }
    catch {
      return false;
    }
  })();
  if( !fileExist ) throw new Error( `Wrong environment "${environment}"!` );
});
