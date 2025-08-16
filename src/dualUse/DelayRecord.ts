import log from 'log';
import sendMessage from 'tools/sendMessage';


const bgRequest = location.href.includes( 'background' );
const counts: { [ key: string ]: number } = {};

let internalCounter/*: integer*/ = 0;
const prefix/*: string*/ =
  Math.floor( Math.random() * 1000000000 ) + '_'; // Every popup is unique


/** @class */
export default class {
  _id: integer;
  _name: string; // @ts-ignore
  _startPoint: number;

  constructor( name: string ) {
    this._name = name;

    let id: integer = bgRequest
      ? counts[ name ] || 0
      : internalCounter++;
    this._id = id;

    // Increase count
    if( bgRequest ) counts[ name ] = id + 1;

    if( bgRequest ) log( `Delay. ${name} #${id} started` );

    if( bgRequest ) {
      this._startPoint = performance.now();
    }
    else {
      ( async() => {
        this._startPoint = await sendMessage({
          'id': prefix + id,
          name,
          'type': 'DelayRecord start'
        });
      })();
    }
  }

  get startStamp(): number {
    return this._startPoint;
  }

  /** @method */
  end(): integer {
    if( bgRequest ) {
      // delay in milliseconds
      let delay: integer = Math.round( performance.now() - this._startPoint );

      log( `Delay. ${this._name} #${this._id} ended: ${delay} milliseconds` );

      return delay;
    }

    sendMessage({
      'id': prefix + this._id,
      'name': this._name,
      'type': 'DelayRecord end'
    });

    return 0; // Type crap
  }
};
