const { exec } = require( 'child_process' );


/** @type {(String|undefined)} */
const extraArgument = process.argv[ 2 ] || undefined;


/** @type {String} */
const command = ( () => {
  switch( extraArgument ) {
    case 'firefox': return 'gulp dist:firefox';
    case 'opera': return 'gulp dist:opera';
    default: return 'gulp dist';
  }
})();

( async() => {
  try {
    /** @type {String} */
    const execReturn = await new Promise( ( resolve, reject ) => {
      exec( command, ( error, stdout, stderr ) => {
        if( !error ) {
          resolve( stdout );
          return;
        }

        error.text = stderr;
        reject( error );
      });
    });

    console.log( execReturn );
    console.log( '\x1b[32m%s\x1b[0m', 'Build successful!' );
  }
  catch ( error ) {
    console.log(
      '\x1b[31m%s\x1b[0m', `Building error: ${error}\n\n${error.text}`
    );
  }
})();
