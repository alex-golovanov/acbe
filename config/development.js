const applyGa4 = require( './applyGa4' );
const productionApiServerUrls = require( './productionApiServerUrls' );


const config = {
  'type': 'development',

  'apiServerUrls': productionApiServerUrls,
  // Authentication settings
  'auth': {
    // Allow users to log in or register
    'enabled': true
  },
  'baseUrl': 'https://browsec.com',
  'ga': {
    'enabled': false,
    'chance': 0.01,
    'fullTrackingId': 'UA-60149654-7'
  },
  'smartSettings': {
    'fakeDomainTemplate': 'httpstat.us',
  },
  'rootUrl': 'https://gist.githubusercontent.com/brwinfo/c89223109562d96b6a3f3e51693b4d87/raw',
  'dynamicConfigUrl': 'https://gist.githubusercontent.com/brwinfo/6f73159599a237a061a0d3fc457d77d8/raw/',
  'siteAuthorizationDomains': [
    'browsec.com',
    'd3k73twqqvofzb.cloudfront.net',
  ],
};


module.exports = applyGa4( config );
