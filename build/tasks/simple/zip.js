// @flow
const env = require( '../../env' );
const fs = require( 'fs' );
const getFileListByPattern = require( '../../getFileListByPattern' );
const version = require( '../../version' );
const path = require( 'path' );
const yazl = require( 'yazl' );

const { createTask } = require( '../../taskFunctions' );


// ZIP64 has problems with Mac OS
const forceZip64Format/*: boolean*/ = false;

/** @function */
let generateZip = async( zipFilePath/*: string*/ ) => {
  let list = await getFileListByPattern( 'target/**' );
  list = list.filter( item => item.includes( '.' ) );

  let outputFile/*: string*/ = path.resolve( zipFilePath );

  let zip = new yazl.ZipFile();
  list.forEach( file => {
    zip.addFile(
      file,
      file.split( '/' ).slice( 1 ).join( '/' ),
      { forceZip64Format }
    );
  });
  zip.end({ forceZip64Format });

  await new Promise( resolve => {
    zip.outputStream
      .pipe( fs.createWriteStream( outputFile ) )
      .on( 'close', resolve );
  });
};

// V2

createTask( 'zip:chrome', async() => {
  await generateZip( `browsec-chrome-v2_${env}-${version}.zip` );
});

createTask( 'zip:edge', async() => {
  await generateZip( `browsec-edge-v2_${env}-${version}.zip` );
});

createTask( 'zip:firefox', async() => { // Not used
  await generateZip( `browsec-firefox-v2_${env}-${version}.zip` );
});

createTask( 'zip:opera', async() => {
  await generateZip( `browsec-opera-v2_${env}-${version}.zip` );
});

createTask( 'zip:xpi', async() => {
  await generateZip( `browsec-firefox-v2_${env}-${version}.xpi` );
});


// V3

createTask( 'zip:v3:chrome', async() => {
  await generateZip( `browsec-chrome-v3_${env}-${version}.zip` );
});

createTask( 'zip:v3:edge', async() => {
  await generateZip( `browsec-edge-v3_${env}-${version}.zip` );
});

createTask( 'zip:v3:firefox', async() => {
  await generateZip( `browsec-firefox-v3_${env}-${version}.xpi` );
});

createTask( 'zip:v3:opera', async() => {
  await generateZip( `browsec-opera-v3_${env}-${version}.zip` );
});
