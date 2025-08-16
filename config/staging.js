const applyGa4 = require( './applyGa4' );


const config = {
  'type': 'staging',

  'apiServerUrls': [
    'https://d2zjtd67a5xcx.cloudfront.net/'
  ],
  'auth': {
    // When disabled, users can't login/register
    'enabled': true
  },
  'baseUrl': 'https://stage.testbs.net',
  'ga': {
    'enabled': true,
    'tracking_id': 'UA-60149654-2',
    'chance': 0.01
  },
  'smartSettings': {
    'fakeDomainTemplate': 'httpstat.us',
  },
  'rootUrl': 'https://gist.githubusercontent.com/brwinfo/e5ce6af89e0519e5407407ada07b0cbb/raw',
  'dynamicConfigUrl': 'https://gist.githubusercontent.com/brwinfo/ef7f684e524d01137b84313a60e1ed01/raw/',
  'siteAuthorizationDomains': [
    'd2zjtd67a5xcx.cloudfront.net'
  ],
};

module.exports = applyGa4( config );
