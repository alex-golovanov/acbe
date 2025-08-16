import timeout from './timeout';


/** Separate function especially for unit testing
@function
@param promises - just promises without any data in resolved state */
export default (
  promises: Array<Promise<void>>
): Promise<integer> => new Promise( resolve => {
  const respondedServers: integer[] = [];

  promises.forEach( async( promise, index ) => {
    try {
      await promise;
      respondedServers.push( index );
    }
    catch ( x ) {}
  });

  // in 5 seconds and first server
  ( async() => {
    try {
      await new Promise( ( resolve, reject ) => {
        promises[ 0 ].then( resolve );
        setTimeout(
          () => { reject( new Error( 'Too big timeout for first request' ) ); },
          timeout
        );
      });

      resolve( 0 );
    }
    catch ( error ) {}
  })();

  
  ( async() => {
    await new Promise( resolve => { setTimeout( resolve, timeout ); });

    // in 5 seconds and at least one server responded
    if( respondedServers.length ) {
      const lowestIndex: integer = Math.min.apply( null, respondedServers );

      resolve( lowestIndex );
    }

    // After 5 seconds and no response
    else {
      promises.forEach( async( promise, index ) => {
        await promise;
        resolve( index );
      });
    }
  })();

  // Total rejection
  ( async() => {
    try {
      await Promise.all( promises.map( promise => promise.then(
        () => { throw new Error( 'Some error' ); },
        () => undefined
      ) ) );

      resolve( 0 );
    }
    catch ( x ) {}
  })();
});
