import config from 'config';
import db from './db';
import sendMessage from 'tools/sendMessage';

const { _ } = self;


interface Log {
  ( ...args: any[] ): void;
  warn: ( ...args: any[] ) => void;
  error: ( ...args: any[] ) => void;
  group: ( name: string, entries: any[][] ) => void;
};


const bgRequest: boolean = location.href.includes( 'background' );


/** @function */
const stringify = ( data: any[] ): string => (
  data
    .map( item => {
      if( _.isObject( item ) ) return JSON.stringify( item );
      return typeof item === 'string' ? item : String( item );
    })
    .join( ', ' )
);


/** @function */
const storageLogger = async(
  { type, data }: { 'type': 'log' | 'warn' | 'error', 'data': any[] }
): Promise<void> => {
  const dbStringData: string = stringify( data );
  const date = new Date();
  const time: string = ( () => {
    let date = new Date();
    let [ day, hours, minutes, seconds ] = [
      date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(),
      date.getUTCSeconds()
    ].map( value => String( value ).padStart( 2, '0' ) );

    const ms = String( date.getUTCMilliseconds() ).padStart( 3, '0' );

    return `[${day}, ${hours}:${minutes}:${seconds}.${ms} (${performance.now()})]`;
  })();
  data.unshift( time );

  // Console output
  ( () => {
    if( config.type !== 'production' ) {
      console[ type ].apply( console, data );
      return;
    }

    console[ type ]( time + ', ' + dbStringData );
  })();

  await new Promise( resolve => { setTimeout( resolve, 0 ); }); // NOTE GAP!

  // Storing all logs
  db.add({ 'timestamp': date.getTime(), type, 'record': dbStringData });
};


/** @function */
const logger = (
  { type, data }: { 'type': 'log' | 'warn' | 'error', 'data': any[] }
): void => {
  if( bgRequest ) {
    storageLogger({ type, data });
    return;
  }

  // Console
  switch( type ) {
    case 'log':
      console.log.apply( console, data );
      break;
    case 'warn':
      console.warn.apply( console, data );
      break;
    case 'error':
      console.error.apply( console, data );
      break;
  }

  // Send message to background
  const messageType = ( () => {
    switch( type ) {
      case 'log': return 'log';
      case 'warn': return 'log.warn';
      case 'error': return 'log.error';
    }
  })();
  sendMessage({ 'type': messageType, data });
};


let log: Log = Object.assign(
  ( ...args: any[] ) => {
    logger({ 'type': 'log', 'data': args });
  },
  {
    /** console.warn analog */
    'warn': ( ...args: any[] ) => {
      logger({ 'type': 'warn', 'data': args });
    },

    /** console.error analog */
    'error': ( ...args: any[] ) => {
      logger({ 'type': 'error', 'data': args });
    },

    /** console.group() + console.log[] + console.groupEnd() */
    'group': ( name: string, entries: any[][] ) => {
      console.group( name );

      entries.forEach( entry => {
        logger({ 'type': 'log', 'data': entry });
      });

      console.groupEnd();
    }
  }
);


export default log;
