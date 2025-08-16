const applyGa4 = require( './applyGa4' );


const config = {
  'type': 'qa2',

  'apiServerUrls': [
    'https://d2s2qg8m8nj69x.cloudfront.net/'
  ],
  'auth': {
    // When disabled, users can't login/register
    'enabled': true
  },
  'baseUrl': 'https://qa2.testbs.net',
  'ga': {
    'enabled': true,
    'tracking_id': 'UA-60149654-2',
    'chance': 1,
    'fullTrackingId': 'UA-60149654-7'
  },
  'smartSettings': {
    // 'fakeDomainTemplate': 'httpstat.us',
  },
  'rootUrl': 'https://gist.githubusercontent.com/brwinfo/8b8d36b124ffa887f77f7e0551242da5/raw',
  'dynamicConfigUrl': 'https://gist.githubusercontent.com/brwinfo/6f73159599a237a061a0d3fc457d77d8/raw/',
  'siteAuthorizationDomains': [
    'd2jtbys1n8mjfo.cloudfront.net',
    'qa2.testbs.net',
  ],
};

module.exports = applyGa4( config );
