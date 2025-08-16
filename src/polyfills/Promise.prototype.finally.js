( () => {
  if( self.Promise.prototype.finally ) return;

  /**
  @method
  @param {Function}
  @return {Promise} initial */
  self.Promise.prototype.finally = function( onFinally ) { // eslint-disable-line no-extend-native
    this.then( onFinally, onFinally );

    return this;
  };
})();
