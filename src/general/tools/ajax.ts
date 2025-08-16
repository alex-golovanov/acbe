/* global RequestInit */
type AjaxParameters = {
  'body'?: string,
  'credentials'?: 'omit' | 'same-origin' | 'include',
  'data'?: any,
  'dataType'?: 'json' | 'text',
  'headers'?: { [ key: string ]: string },
  'method': 'DELETE' | 'GET' | 'POST' | 'PUT',
  'mode'?: 'cors' | 'no-cors' | 'same-origin'
};

type ErrorWithStatus = Error & {
  'status'?: integer,
  'responseText'?: string
};


/** Simplified AJAX function, POST by default */
export default async(
  url: string,
  params: AjaxParameters
): Promise<any> => {
  const { data, method } = params;
  const dataType = params.dataType || 'text';

  // Headers
  const headers = ( () => {
    if( params.headers ) return params.headers;
    if( method === 'POST' && !data && !params.body ) {
      return { 'Content-Type': 'application/x-www-form-urlencoded' };
    }
    
    return {};
  })();

  params = Object.assign({}, params );
  delete params.data;
  delete params.dataType;
  delete params.headers;

  // Result options object for fetch
  let options: RequestInit = { method };

  // Body
  if( data ) {
    if( method === 'POST' ) {
      options.body = JSON.stringify( data );

      if( !headers[ 'Content-Type' ] ) {
        headers[ 'Content-Type' ] = 'application/json';
      }
    }
    else {
      options.body =
        ( Object.entries( data ) as Array<[ string, string ]> )
          .map( ( [ key, value ] ): string => (
            key + '=' + encodeURIComponent( value )
          ) )
          .join( '&' );
    }
  }

  // Credentials
  options.credentials = params.credentials || 'include';

  Object.assign( options, params );
  if( Object.keys( headers ).length ) Object.assign( options, { headers });

  const response: Response = await fetch( url, options );

  if( response.ok ) {
    return dataType === 'json'
      ? ( response.json()/*: Promise<Object>*/ )
      : ( response.text()/*: Promise<string>*/ );
  }

  const error: ErrorWithStatus = new Error( response.statusText );
  error.status = response.status;
  try {
    error.responseText = await response.text();
  }
  catch ( error ) {}

  throw error;
};
