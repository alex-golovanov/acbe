if( typeof Promise.any !== 'function' ) {
  Promise.any = function( promises ) {
    try {
      if( promises === null || promises === undefined ) throw new Error( 'x' );
      promises = Array.from( promises );
    }
    catch ( x ) {
      return Promise.reject( new TypeError(
        'object is not iterable (cannot read property Symbol(Symbol.iterator))'
      ) );
    }

    if( !promises.length ) {
      return Promise.reject( new Error(
        'AggregateError: All promises were rejected'
      ) );
    }

    return new Promise( ( resolve, reject ) => {
      const specialOutput = {};

      // First resolved to success
      promises.forEach( promise => { promise.then( resolve ); });

      Promise.all(
        promises.map( promise => promise.catch( () => specialOutput ) )
      ).then( result => {
        if( !result.every( item => item === specialOutput ) ) return;
        reject( new Error( 'AggregateError: All promises were rejected' ) );
      });
    });
  };
}
