const applyGa4 = require( './applyGa4' );
const productionApiServerUrls = require( './productionApiServerUrls' );


const config = {
  'type': 'production',

  'apiServerUrls': productionApiServerUrls,
  'auth': {
    // When disabled, users can't login/register
    'enabled': true
  },
  'baseUrl': 'https://browsec.com',
  'ga': {
    'enabled': false,
    'extension_id': [
      'omghfjlpggmjjaagoclmmobgdodcjboh',
      'dknfpcdpbkjijldegonllfnnfhabjpde',
      '05908b89-695d-4687-aa36-6d87f42a464d' // NOTE temporary
    ],
    'tracking_id': 'UA-43024042-1',
    'chance': 0.01,
    'fullTrackingId': 'UA-43024042-3'
  },
  'smartSettings': {
    'fakeDomainTemplate': 'httpstat.us',
  },
  'rootUrl': 'https://gist.githubusercontent.com/brwinfo/0d4c6d2ebbe6fd716a43f0ac9d37ce22/raw',
  'dynamicConfigUrl': 'https://gist.githubusercontent.com/brwinfo/ef7f684e524d01137b84313a60e1ed01/raw/',
  'siteAuthorizationDomains': [
    'browsec.com',
    'd3k73twqqvofzb.cloudfront.net',
  ],
};


module.exports = applyGa4( config );
