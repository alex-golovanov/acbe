const applyGa4 = require( './applyGa4' );


const config = {
  'type': 'qa3',

  'apiServerUrls': [],
  'auth': {
    // When disabled, users can't login/register
    'enabled': true
  },
  'baseUrl': 'https://qa3.testbs.net/',
  'ga': {
    'enabled': true,
    'tracking_id': 'UA-60149654-2',
    'chance': 1,
    'fullTrackingId': 'UA-60149654-7'
  },
  'smartSettings': {
    // 'fakeDomainTemplate': 'httpstat.us',
  },
  'rootUrl': 'https://gist.githubusercontent.com/brwinfo/d603e3d1bc7b98c96d4fe79b61da5b4c/raw',
  'dynamicConfigUrl': 'https://gist.githubusercontent.com/brwinfo/6f73159599a237a061a0d3fc457d77d8/raw/',
  'siteAuthorizationDomains': [
    'd7w4lsixlgfw7.cloudfront.net',
    'qa3.testbs.net',
  ],
};

module.exports = applyGa4( config );
