/** @class */
export default class {
  lastTimestamp?: number;
  listeners: Array<( word: string ) => any>;
  word: string;

  constructor() {
    this.listeners = [];
    this.word = '';

    this.keydownListener = this.keydownListener.bind( this );
  }

  /** @method */
  addChar( char: string ) {
    let word: string = this.word;
    let timestamp: number = performance.now();
    let clear: boolean = !this.lastTimestamp
      ? true
      : timestamp - this.lastTimestamp > 700;
    if( clear ) word = '';
    word += char;

    this.lastTimestamp = timestamp;

    if( word === this.word ) return;

    this.word = word;
    this.listeners.forEach( listener => { listener( word ); });
  };

  /** @method */
  addListener( listener: ( word: string ) => any ) {
    this.listeners.push( listener );
  }

  /** @method */
  removeListener( listener: ( word: string ) => any ) {
    this.listeners = this.listeners.filter( item => item !== listener );
  }

  /** @method */
  keydownListener( event: KeyboardEvent ) {
    let { code, key } = event;
    if( key === ' ' ) event.preventDefault();

    /** @type {(String|undefined)} */
    let symbol = code ? code.replace( /^key/i, '' ) : key;
    if( symbol === 'Space' ) symbol = ' ';
    if( !symbol || symbol.length !== 1 || !/[ a-z]/i.test( symbol ) ) return;

    symbol = symbol.toLowerCase();

    this.addChar( symbol );
  }
};
