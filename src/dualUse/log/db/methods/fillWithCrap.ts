import { LogDb } from '../index';
import limit from '../limit';


/** @function */
const generatePart = ()/*: string*/ => Math.random().toString( 36 ).substr( 2, 5 );

/** @function */
const generateString = ()/*: string*/ => Array( 6 ).fill( 0 )
  .map( () => generatePart() )
  .join( '' );


/** Fill db up to limit with crap (for testing purposes)
@method */
export default function( this: LogDb ): void {
  let list = this.state;
  let delta: integer = limit - list.length;
  if( delta <= 0 ) return;

  let fillData: Array<{
    'record': string,
    'timestamp': number,
    'type': 'log'
  }> = Array( delta ).fill( 0 ).map( () => ({
    'record': generateString(),
    'timestamp': Date.now(),
    'type': 'log'
  }) );
  list.push.apply( list, fillData );

  this.state = list;
};
