import ajax from 'tools/ajax';
import config from 'config';
import getSessionId from './getSessionId';


/** @function */
const getTimeStamp = () => {
  const date = new Date();

  const year = date.getUTCFullYear();
  const month = String( date.getUTCMonth() + 1 ).padStart( 2, '0' );
  const day = String( date.getUTCDate() ).padStart( 2, '0' );
  const hour = String( date.getUTCHours() ).padStart( 2, '0' );
  const minutes = String( date.getUTCMinutes() ).padStart( 2, '0' );
  const seconds = String( date.getUTCSeconds() ).padStart( 2, '0' );

  return `${year}-${month}-${day}T${hour}:${minutes}:${seconds}`;
};


/** Request to GA server
@function */
export default async(
  gaUserId: string,
  params: {
    'type': string,
    'action'?: any,
    'category'?: any,
    'label'?: any,
    'noninteraction'?: any,
    'value'?: any
  }
): Promise<any> => {
  if( !config.ga.fullTrackingId ) return;

  const { type, action, category, label, noninteraction, value } = params;

  const sessionId = gaUserId + '.' + getSessionId();
  const timestamp = getTimeStamp();

  const ga4promise = ( async() => {
    if( !config.ga4.full ) return;

    const apiSecret = config.ga4.full.apiSecret;
    const measurementId = config.ga4.full.measurementId;
    const url =
      `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`;
    
    const data = {
      'client_id': gaUserId,
      'events': [ {
        'name': action,
        'params': {
          category,
          label,
          noninteraction,
          sessionId,
          timestamp,
          value,
        }
      } ]
    };

    return ajax(
      url,
      {
        'method': 'POST',
        'mode': 'cors',
        'body': JSON.stringify( data )
      }
    );
  })();

  return Promise.all( [
    ga4promise.catch( () => undefined )
  ] );
};

