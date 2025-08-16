declare const browsecConfig: {
  'type': string,

  'apiServerUrls': string[],
  'auth': {
    'enabled': boolean
  },
  'baseUrl': string,
  'ga': {
    'enabled': boolean,
    'extension_id': string[],
    'tracking_id': string,
    'chance': number,
    'fullTrackingId': string
  },
  'ga4': {
    'full'?: {
      'apiSecret': string,
      'measurementId': string
    },
    'partial'?: {
      'apiSecret': string,
      'measurementId': string
    },
  },
  'smartSettings': {
    'fakeDomainTemplate': string
  },
  'rootUrl': string,
  'dynamicConfigUrl': string,
  'siteAuthorizationDomains': string[],
};


export const type: string;
export default browsecConfig;
