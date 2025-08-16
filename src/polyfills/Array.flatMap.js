if( !Array.prototype.flatMap ) {
  Array.prototype.flatMap = function( callback, thisArg = this ) { // eslint-disable-line no-extend-native
    return this.map( callback, thisArg ).flat();
  };
}
