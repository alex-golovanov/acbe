import ajax from 'tools/ajax';
import config from 'config';


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
  if( !config.ga.tracking_id ) return;

  let { type, action, category, label, noninteraction, value } = params;

  const ga4promise = ( async() => {
    if( !config.ga4.partial ) return;

    const apiSecret = config.ga4.partial.apiSecret;
    const measurementId = config.ga4.partial.measurementId;
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
