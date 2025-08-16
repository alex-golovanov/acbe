import DelayRecord from 'DelayRecord';
import runtimeOnMessage from 'bg/runtime.onMessage';

const { _ } = self;


type DelayRecordObject = {
  'id': integer | string,
  'name': string,
  'object': DelayRecord
};


let records: DelayRecordObject[] = [];

runtimeOnMessage.addListener({
  'callback': ({ id, name }) => {
    let object = new DelayRecord( name );
    records.push({ id, name, object });

    return object.startStamp;
  },
  'type': 'DelayRecord start',
  'popupOnly': true
});

runtimeOnMessage.addListener({
  'callback': ({ id, name }) => {
    let item: DelayRecordObject | undefined =
      records.find( item => item.id === id && item.name === name );
    if( !item ) return;

    item.object.end();

    // Clear memory in 30 minutes
    ( async() => {
      await new Promise( resolve => { setTimeout( resolve, 30 * 60 * 1000 ); });
      _.remove( records, item => item.id === id && item.name === name );
    })();
  },
  'type': 'DelayRecord end',
  'popupOnly': true
});
