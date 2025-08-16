import ajaxes from 'ajaxes';
import DelayRecord from 'DelayRecord';
import validateServerList from './validate';


/** @function */
export default async(): Promise<string[]> => {
  const timer = new DelayRecord( 'Available server. Request servers list' );

  await new Promise( resolve => { setTimeout( resolve, 0 ); }); // Critical
  
  const serverList: string[] = await new Promise( ( resolve, reject ) => {
    setTimeout( () => {
      reject( new Error(
        'ajaxes.availableServerServerList: timeout 15 seconds reached'
      ) );
    }, 15 * 1000 );

    ajaxes.availableServerServerList().then(
      serverList => { resolve( serverList ); },
      error => { reject( error ); }
    );
  });
  
  try {
    validateServerList( serverList );
    timer.end();
  }
  catch ( error ) {
    timer.end();
    throw error;
  }
  
  return serverList.map( item => {
    if( !item.endsWith( '/' ) ) item += '/';
    return item + 'v1';
  });
};
