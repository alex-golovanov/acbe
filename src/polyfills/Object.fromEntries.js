if( !Object.fromEntries ) {
  Object.fromEntries = ( iterable ) => {
    return [ ...iterable ].reduce( ( obj, [ key, val ] ) => {
      obj[ key ] = val;
      return obj;
    }, {});
  };
}
