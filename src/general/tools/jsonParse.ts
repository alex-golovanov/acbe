/** @function */
export default ( data: any, defaultValue: any = undefined ): any => {
  try {
    return data && JSON.parse( data ) || defaultValue;
  }
  catch ( e ) {
    return defaultValue;
  }
};
