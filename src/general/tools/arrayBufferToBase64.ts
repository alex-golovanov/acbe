/** @function */
export default ( buffer: ArrayBuffer ) => {
  let binary = '';
  const bytes = new Uint8Array( buffer );
  const length = bytes.byteLength;
  for( let i = 0; i < length; i++ ) {
    binary += String.fromCharCode( bytes[ i ] );
  }

  if( typeof btoa === 'function' ) {
    return btoa( binary );
  }
  else {
    return window.btoa( binary );
  }
};
