// @flow
const decompress = require( 'decompress' );
const decompressUnzip = require( 'decompress-unzip' );
const fs = require( 'fs' );
const removeDirectory = require( '../../removeDirectory' );
const { createTask } = require( '../../taskFunctions' );


const libraryFolder = 'domainDependencies/raw';
const zipTempFile = 'domainDependencies/temp.zip';


/** @function */
const downloadFile = async( url/*: string*/, filePath/*: string*/ ) => {
  try {
    await fs.promises.unlink( filePath );
  }
  catch {}
  // $FlowExpectedError
  let response = await fetch( url );

  await new Promise( async( resolve, reject ) => {
    try {
      const dest = fs.createWriteStream( filePath );

      const reader = response.body.getReader();
      while( true ) {
        const { done, value } = await reader.read();
        if( done ) {
          dest.end( resolve );
          break;
        }
        
        dest.write( value );
      }

      dest.on( 'error', reject );
    }
    catch ( error ) {
      console.error( error );
      reject( error );
    }
  });
};


createTask( 'downloaddomaindependencies', async() => {
  await Promise.all( [
    ( async() => {
      let folderExist = await ( async() => {
        try {
          await fs.promises.access( libraryFolder, fs.constants.F_OK );
          return true;
        }
        catch {
          return false;
        }
      })();

      if( folderExist ) await removeDirectory( libraryFolder );
    })(),

    await downloadFile(
      'https://api.github.com/repos/v2fly/domain-list-community/zipball/master',
      zipTempFile
    )
  ] );

  //await new Promise( resolve => { setTimeout( resolve, 0 ); });

  await decompress(
    zipTempFile,
    libraryFolder,
    {
      'filter': file => {
        return file.path.startsWith( 'data/' ) || file.path.startsWith( 'data\\' );
      },
      'map': file => {
        file.path = file.path.replace( /^data(\/|\\)/, '' );
        return file;
      },
      'plugins': [ decompressUnzip() ],
      'strip': 1
    }
  );

  await fs.promises.unlink( zipTempFile );
});
