import Deferred from 'tools/Deferred';
import storage from 'storage';


type DiagnosticRequestsDbItem = {
  'cached'?: boolean,
  'hasProxy': boolean,
  'requestId': string,
  'status'?: integer,
  'timeStamp': number,
  'url': string
};


export default new class {
  isProcessing: boolean;
  stack: Array<any>;

  constructor() {
    this.stack = [];

    this.isProcessing = false;
  }

  /** @method */
  read(): Promise<DiagnosticRequestsDbItem[]> {
    const deferred = new Deferred<DiagnosticRequestsDbItem[]>();

    this.stack.push({ deferred, 'action': 'read' });

    if( !this.isProcessing ) this.process();

    return deferred;
  }

  /** @method */
  add( data: DiagnosticRequestsDbItem ) {
    const deferred = new Deferred<DiagnosticRequestsDbItem[]>();

    this.stack.push({ deferred, 'action': 'add', data });

    if( !this.isProcessing ) this.process();

    return deferred;
  }

  /** @method */
  update(
    requestId: string,
    extra: { 'errorText'?: string, 'status'?: number }
  ) {
    const deferred = new Deferred<DiagnosticRequestsDbItem[]>();

    this.stack.push({ deferred, 'action': 'update', requestId, extra });

    if( !this.isProcessing ) this.process();

    return deferred;
  }

  /** @method */

  async process() {
    if( this.stack.length === 0 ) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;

    while( true ) {
      if( this.stack.length > 0 ) {
        const stackItem = this.stack.shift()!;

        const value: DiagnosticRequestsDbItem[] =
          await storage.get( 'Diagnostic requests' ) || [];

        switch( stackItem.action ) {
          case 'add':{
            const { data } = stackItem;
            if( !value.length || value.every( ({ requestId }) => requestId !== data.requestId ) ) { // Strange firefox behaviour with proxy.onRequest called twice for same request
              value.push( data );
            }
            break;
          }
          case 'read':
            break;
          case 'update': {
            const item = value.find( ({ requestId }) => requestId === stackItem.requestId );

            if( item ) Object.assign( item, stackItem.extra );
            break;
          }
        }

        await storage.set( 'Diagnostic requests', value );

        stackItem.deferred.resolve( value );
        continue;
      }

      break;
    }
    this.isProcessing = false;
  }
}();
