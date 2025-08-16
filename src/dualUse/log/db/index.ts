import Browser from 'crossbrowser-webextension';
import config from 'config';
import fillWithCrap from './methods/fillWithCrap';
import limit from './limit';
import storage from 'storage';
import time from 'time';


type LogRecord = {
  'timestamp': number,
  'type': 'log' | 'warn' | 'error',
  'record': string
};


const bgRequest: boolean = location.href.includes( 'background' );


/** @function */
const calcByteSize = ( data: any ): integer => (
  new TextEncoder().encode( JSON.stringify( data ) ).length
);


export class LogDb {
  delayedState: LogRecord[];
  fillWithCrap?: () => void;
  initiated: boolean;
  ready: Promise<LogRecord[]>;
  state: LogRecord[];

  constructor() {
    this.state = [];
    this.delayedState = [];
    this.initiated = false;

    if( config.type !== 'production' ) {
      // Fill db up to limit with crap (for testing purposes)
      this.fillWithCrap = fillWithCrap.bind( this );
    }

    // Initial
    this.ready = ( async() => {
      const value = await storage.get( 'log' ) || []; // @ts-ignore
      Array.prototype.push.apply( value, this.delayedState );

      this.state = value;
      this.initiated = true;

      return value;
    })();

    if( bgRequest ) {
      /** @function */
      const loop = async() => {
        await this.ready;

        const totalSize = calcByteSize( this.state );
        if( totalSize > 4000000 ) {
          // Step 1: check size of every entity to get how much to cut
          const difference = totalSize - 4000000;

          let size = 0;
          let count = 0;

          for( const record of this.state ) {
            size += calcByteSize( record );
            count++;

            if( size > difference ) break;
          }

          this.state.splice( 0, count );

          // Step 2: cut to make whole size less then 4,000,000 ( comma have size too )
          while( calcByteSize( this.state ) > 4000000 ) {
            this.state.splice( 0, 10 );
          }
        }

        if( typeof browser === 'undefined' ) { // Only Chrone have 'storage.local.getBytesInUse' function
          const bytesUsage =
            await Browser.storage.local.getBytesInUse( 'log' );
          if( bytesUsage > 4000000 ) {
            this.state.splice( 0, 10 );
          }
        }


        try {
          await storage.set( 'log', this.state );
        }
        catch ( error ) {
          this.state.splice( 0, 10 );
        }
      };

      time.onStart({
        'name': 'log db',
        'startDelayInMs': 30 * 1000,
        'repeatInMinutes': 1
      }, loop );
    }
  }

  /** Add row to database
  @method */
  async add({
    timestamp,
    type = 'log',
    record
  }: {
    'timestamp': number,
    'type'?: 'log' | 'warn' | 'error',
    'record': string
  }): Promise<void> {
    const data = { timestamp, type, record };

    if( !this.initiated ) {
      this.delayedState.push( data );
      return;
    }

    this.state.push( data );
    if( this.state.length > limit ) {
      this.state.splice( 0, this.state.length - limit );
    }
  }

  /** Get all data from database
  @function */
  async clear(): Promise<void> {
    return storage.set( 'log', [] );
  }

  /** Get all data from database
  @method */
  async getAll(): Promise<Array<{
    'timestamp': number,
    'type': 'log' | 'warn' | 'error',
    'record' : string
  }>> {
    if( this.initiated ) return this.state;

    return this.ready;
  }
}


export default new LogDb();
