let dateCodeChange = ( Date, offsetDifference, proxyTimeZoneOffset ) => {
  /** @function */
  const zeroString = ( value/*: number | string*/ )/*: string*/ => {
    const outputString = String( value );
    return outputString.length >= 2 ? outputString : '0' + outputString;
  };

  const timezone/*: string*/ =
    ( proxyTimeZoneOffset >= 0 ? '+' : '-' ) +
    zeroString( Math.floor( Math.abs( proxyTimeZoneOffset ) / 60 ) ) +
    zeroString( Math.abs( proxyTimeZoneOffset ) % 60 );

  const changeDateStringTimezone = ( original/*: string*/ ) => {
    const newString = original.split( '(' )[ 0 ].trim();

    return newString.replace( /GMT[\\+\\-][0-9]{4}/, 'GMT' + timezone );
  };

  if( Date.isModified ) return Date;

  const originalMethods = {};
  originalMethods.now = Date.now;
  originalMethods.toString = Date.prototype.toString;
  originalMethods.toGMTString = Date.prototype.toGMTString;
  originalMethods.toUTCString = Date.prototype.toUTCString;
  originalMethods.toISOString = Date.prototype.toISOString;
  originalMethods.toTimeString = Date.prototype.toTimeString;
  originalMethods.toJSON = Date.prototype.toJSON;
  originalMethods.getTime = Date.prototype.getTime;


  const ModifiedDate = function( ...args ) {
    let date = new Date( ...args );

    /* No instance */
    if( !( this instanceof Date ) ) {
      date = new Date(
        date.getTime() + offsetDifference * 60 * 1000
      );

      return changeDateStringTimezone( date.toString() );
    }

    /* No arguments with instance */
    if( arguments.length === 0 ) {
      return new Date(
        date.getTime() + offsetDifference * 60 * 1000
      );
    }

    /* 1 argument with instance */
    if( arguments.length === 1 ) { /* timestamp */
      return new Date( arguments[ 0 ] );
    }

    /* 2+ agruments with instance */
    /*date = new Date(
      date.getTime() + offsetDifference * 60 * 1000
    ); */

    return date;
  };

  ModifiedDate.prototype = Date.prototype;
  /*ModifiedDate.prototype.getTime = function(){
    return (
      originalMethods.getTime.call( this ) - offsetDifference * 60 * 1000
    );
  };*/

  Object.getOwnPropertyNames( Date )
    .filter( name => ( !( name in ModifiedDate ) ) )
    .forEach( name => {
      Object.defineProperty(
        ModifiedDate,
        name,
        Object.getOwnPropertyDescriptor( Date, name )
      );
    });

  Object.defineProperties( Date.prototype, {
    'getTimezoneOffset': {
      'configurable': true,
      'enumerable': false,
      'writable': true,
      'value': function() {
        return -proxyTimeZoneOffset;
      }
    },
    'toISOString': {
      'configurable': true,
      'enumerable': false,
      'writable': true,
      'value': function() {
        const date = new Date( this.getTime() - offsetDifference * 60 * 1000 );
        return originalMethods.toISOString.call( date );
      }
    },
    'toString': {
      'configurable': true,
      'enumerable': false,
      'writable': true,
      'value': function() {
        const date = new Date( this.getTime() );
        return changeDateStringTimezone( originalMethods.toString.call( date ) );
      }
    },
    'toTimeString': {
      'configurable': true,
      'enumerable': false,
      'writable': true,
      'value': function() {
        const date = new Date( this.getTime() );
        return changeDateStringTimezone( originalMethods.toTimeString.call( date ) );
      }
    },
    'toUTCString': {
      'configurable': true,
      'enumerable': false,
      'writable': true,
      'value': function() {
        const date = new Date( this.getTime() - offsetDifference * 60 * 1000 );
        return originalMethods.toUTCString.call( date );
      }
    }
  });

  if( Date.prototype.toGMTString ) {
    Object.defineProperty( Date.prototype, 'toGMTString', {
      'configurable': true,
      'enumerable': false,
      'writable': true,
      'value': function() {
        const date = new Date( this.getTime() - offsetDifference * 60 * 1000 );
        return originalMethods.toGMTString.call( date );
      }
    });
  }

  ModifiedDate.now = function() {
    return originalMethods.now() + offsetDifference * 60 * 1000;
  };

  Object.defineProperties( ModifiedDate, {
    'length': {
      'enumerable': false,
      'configurable': true,
      'writable': false,
      'value': 7
    },
    'name': {
      'enumerable': false,
      'configurable': true,
      'writable': false,
      'value': 'Date'
    },
    'isModified': {
      'enumerable': false,
      'configurable': true,
      'writable': false,
      'value': true
    }
  });

  return ModifiedDate;
};


export default dateCodeChange;


