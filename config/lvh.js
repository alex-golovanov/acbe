const applyGa4 = require( './applyGa4' );


const config = {
  'type': 'lvh',

  'apiServerUrls': [
    'http://lvh.me:3000/api/v1'
  ],
  // Authentication settings
  'auth': {
    // Allow users to log in or register
    'enabled': true
  },
  'baseUrl': 'http://lvh.me:3000',
  'ga': {
    'enabled': true,
    'chance': 0.01,
    'fullTrackingId': 'UA-110931800-1'
  },
  'rootUrl': 'https://gist.githubusercontent.com/brwinfo/0d4c6d2ebbe6fd716a43f0ac9d37ce22/raw',
  'dynamicConfigUrl': 'https://gist.githubusercontent.com/brwinfo/6f73159599a237a061a0d3fc457d77d8/raw/',
  'siteAuthorizationDomains': [
    'mirror.lvh.me:3000'
  ],
};

module.exports = applyGa4( config );
