import log from 'log';


const counts: { [ key: string ]: number } = {};


/** @class */
export default class {
  _id: integer;
  _name: string;
  _startPoint: number;
  _type: 'log' | 'warn' | 'error';

  constructor( name: string, type: 'log' | 'warn' | 'error' = 'log' ) {
    this._name = name;
    this._startPoint = performance.now();
    this._type = type;

    const id: integer = counts[ name ] || 0;
    this._id = id;

    // Increase count
    counts[ name ] = id + 1;
  }

  /** @method */
  end(): integer {
    // delay in milliseconds
    const delay: integer = Math.round( performance.now() - this._startPoint );

    const message =
      `Local delay. ${this._name} #${this._id}: ${delay} milliseconds`;
    switch( this._type ) {
      case 'log':
        log( message );
        break;
      case 'warn':
        log.warn( message );
        break;
      case 'error':
        log.error( message );
        break;
    }

    return delay;
  }
};
