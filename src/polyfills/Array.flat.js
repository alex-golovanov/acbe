if( !Array.prototype.flat ) {
  Array.prototype.flat = function( depth = 1 ) { // eslint-disable-line no-extend-native
    depth = isNaN( depth ) ? 0 : Math.floor( depth );
    if( depth < 1 ) return this.slice();
    if( depth === 1 ) return [].concat( ...this );
    
    return [].concat( ...this.map( v => Array.isArray( v ) ? v.flat( depth - 1 ) : v ) );
  };
}
