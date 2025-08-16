const applyGa4 = require( './applyGa4' );


const config = {
  'type': 'qa',

  'apiServerUrls': [
    'https://d3np4aywxojjzc.cloudfront.net/'
  ],
  'auth': {
    // When disabled, users can't login/register
    'enabled': true
  },
  'baseUrl': 'https://qa.testbs.net',
  'ga': {
    'enabled': true,
    'tracking_id': 'UA-60149654-2',
    'chance': 1,
    'fullTrackingId': 'UA-60149654-7'
  },
  'smartSettings': {
    // 'fakeDomainTemplate': 'httpstat.us',
  },
  'rootUrl': 'https://gist.githubusercontent.com/brwinfo/57bb84e8dd5ba79059b76d7bd64cbadb/raw',
  'dynamicConfigUrl': 'https://gist.githubusercontent.com/brwinfo/6f73159599a237a061a0d3fc457d77d8/raw/',
  'siteAuthorizationDomains': [
    'd1wx9749f4rwq8.cloudfront.net',
    'qa.testbs.net',
  ],
};


module.exports = applyGa4( config );
