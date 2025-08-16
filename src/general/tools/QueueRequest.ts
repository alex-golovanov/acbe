/** @class */
export default class <T> {
  _inProcess: boolean;
  _queue: T | null;
  _request: ( arg: T ) => any;
  _syncAction: ( arg: T ) => void;

  constructor(
    { request, syncAction }:
    { 'request': ( arg: T ) => any, 'syncAction': ( arg: T ) => void }
  ) {
    this._inProcess = false;
    this._queue/*: Array<any> | Object | string | number | null*/ = null;

    this._request = request;
    this._syncAction = syncAction;
  }

  get currentQueueItem() {
    return this._queue;
  }

  get inProcess() {
    return this._inProcess;
  }

  /** @method */
  async set(
    value: T/*: Array<any> | Object | string | number*/
  ): Promise<void> {
    if( this._inProcess ) {
      this._queue = value;
      this._syncAction( value );
      return;
    }

    this._inProcess = true;
    this._syncAction( value );

    return new Promise( resolve => {
      /** @function */
      let loop = async( loopValue: T ) => {
        let lastQueue = loopValue;
        await this._request( loopValue );

        if( lastQueue === this._queue || this._queue === null ) {
          this._queue = null;
          this._inProcess = false;
          resolve();
          return;
        }

        loop( this._queue );
      };
      loop( value ); // Initial
    });
  }
};

