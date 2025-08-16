import ajax from 'tools/ajax';
import config from 'config';
import sendMessage from 'tools/sendMessage';


const bgRequest = location.href.includes( 'background' );


export default (): Promise<string[]> => {
  if( !bgRequest ) {
    return sendMessage({ 'type': 'ajaxes.availableServerServerList' });
  }


  return ajax(
    `${config.rootUrl}?${Math.floor( Math.random() * 10 ** 12 )}`,
    {
      'dataType': 'json',
      'headers': {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      },
      'method': 'GET'
    }
  );
};
