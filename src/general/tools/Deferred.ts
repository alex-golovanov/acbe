// Deferred based on Promise
class Deferred<T> extends Promise<T> {
  _resolve: any;
  _reject: any;

  constructor(
    callback: ( ...args: any[] ) => any = ( resolve, reject ) => {}
  ) {
    let res, rej;

    super( ( resolve, reject ) => {
      res = resolve;
      rej = reject;
      callback( resolve, reject );
    });

    this._resolve = res;
    this._reject = rej;
  }

  resolve( result?: T ): Deferred<T> {
    this._resolve( result );
    return this;
  }

  reject( error: Error ): Deferred<T> {
    this._reject( error );
    return this;
  }
};


export default Deferred;
