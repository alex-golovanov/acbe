import internationalize from 'tools/internationalize';


/** @function */
const transform = ( data: any ): any => {
  return Object.fromEntries(
    Object.entries( data ).map( ( [ key, value ] ) => {
      const updatedValue = typeof value === 'string'
        ? internationalize( value )
        : transform( value );
      return [ key, updatedValue ];
    })
  );
};
  
  
export default transform;
