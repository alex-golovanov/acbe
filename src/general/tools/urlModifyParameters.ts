/** @function */
export default (
  url: string,
  action: ( search: { [ key: string ]: string | number | boolean }) => ({ [ key: string ]: string | number | boolean })
): string => {
  const urlObject = new URL( url );

  let search: { [ key: string ]: string | number | boolean } =
    urlObject.search
      ? Object.fromEntries(
        urlObject.search.replace( /^\?/, '' ).split( '&' ).map( ( part ) => {
          let [ left, right ] = part.split( '=' );
          return [ left, right ? decodeURIComponent( right ) : true ];
        })
      )
      : {};
  search = action( search );

  urlObject.search = ( () => {
    let parts: string[] = Object.entries( search ).map(
      ( [ property, value ] ) => (
        encodeURIComponent( property ) + '=' + encodeURIComponent( value )
      )
    );

    return parts.length ? '?' + parts.join( '&' ) : '';
  })();

  return urlObject.toString();
};
