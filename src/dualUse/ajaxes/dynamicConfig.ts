/* global DynamicConfig */
import ajax from 'tools/ajax';
import config from 'config';

export default (): Promise<DynamicConfig> => {
  return ajax(
    `${config.dynamicConfigUrl}?${Math.floor( Math.random() * 10 ** 12 )}`,
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


