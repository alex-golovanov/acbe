import ajax from 'tools/ajax';
import sendMessage from 'tools/sendMessage';


const bgRequest: boolean = location.href.includes( 'background' );


/** Get list of all servers
@function */
export default async( url: string ): Promise<void> => {
  if( !bgRequest ) {
    return sendMessage({ 'type': 'ajaxes.availableServerTest', url });
  }

  
  const data: any = await ajax(
    url,
    {
      'dataType': 'json',
      'headers': {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      },
      'method': 'GET'
    }
  );

  if( data?.ok === true ) return;
  throw new Error( 'Server test request: incorrect request return' );
};
