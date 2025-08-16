/* global Credentials */
import ajax from 'tools/ajax';
import encodeTokenCredentials from 'tools/encodeTokenCredentials';


// @ts-ignore
const projectVersion = PROJECT_VERSION;


/** @function */
export default (
  url: string,
  options: {
    'body'?: string,
    'cache'?: string,
    'credentials'?: 'omit' | 'same-origin' | 'include',
    'data'?: Object,
    'dataType'?: 'json' | 'text',
    'headers'?: { [ key: string ]: string },
    'method': 'DELETE' | 'GET' | 'POST' | 'PUT',
    'tokenCredentials'?: Credentials
  }
): Promise<any> => {
  let {
    body,
    cache,
    credentials,
    data,
    dataType,
    headers,
    method,
    tokenCredentials
  } = options;

  let newHeaders = headers || {};
  newHeaders[ 'X-Browsec-Version' ] = projectVersion;
  if( tokenCredentials ) {
    newHeaders.Authorization = encodeTokenCredentials( tokenCredentials );
  }

  let ajaxOptions: any = {
    body, cache, credentials, data, dataType, 'headers': newHeaders, method
  };
  Object.keys( ajaxOptions ).forEach( property => {
    if( ajaxOptions[ property ] === undefined ) delete ajaxOptions[ property ];
  });

  return ajax( url, ajaxOptions );
};
