/** @function */
export default (
  url: string,
  delay: number // in ms
): {
  'cancel': () => void,
  'promise': Promise<number>
} => {
  const controller = typeof AbortController !== 'undefined'
    ? new AbortController()
    : undefined;
  const signal = controller?.signal;

  const promise = ( async() => {
    const stamp: number = performance.now();

    const response: Response = await new Promise( ( resolve, reject ) => {
      const options: any = { 'method': 'GET' };
      if( signal ) Object.assign( options, { signal });

      fetch( url, options ).then( resolve, reject );
  
      if( !controller ) {
        setTimeout( () => {
          reject( new Error(
            `Test server request for ${url}: timeout reached`
          ) );
        }, delay );
      }
    });
  
    if( !response.ok ) throw new Error( response.statusText );
  
    let data;
    try {
      data = await response.json();
    }
    catch ( error ) {
      if( signal?.aborted ) return 0; // Nothing to do, request aborted
      
      throw new Error(
        `Test server request for ${url}: not correct response data`
      );
    }
    if( data?.ok !== true ) {
      throw new Error(
        `Test server request for ${url}: not correct response data`
      );
    }
  
    return performance.now() - stamp;
  })();

  if( controller ) setTimeout( () => { controller.abort(); }, delay );


  return {
    'cancel': () => { controller?.abort?.(); },
    promise
  };
};
