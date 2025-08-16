// @flow
const beautify = require( 'js-beautify' ).js_beautify;
const fs = require( 'fs' );
const gulp = require( 'gulp' );

const config = require( '../../configuration' );
const directory = require( '../../outputDirectory' );
const version = require( '../../version' );

const proxyDomains = [
  'prmsrvs.com',
  'trafcfy.com',
  'prmdom.com',
  'frmdom.com',
  'static-fn.com',
  'fn-cdn.com',
  'bd-assets.com',

  'cdnflow.net',
  'promptmesh.net',
  'contentnode.net',
  'swiftcdn.org',
  'rapidwebserve.com',
  'datafrenzy.org',
  'fastcache.xyz',
  'quickedgecdn.com',

  'cacheflow.cloud',
  'cacheflow.live',
  'cacheflow.pro',
  'cachequick.info',
  'cachequick.live',
  'cachequick.pro',
  'cachequick.xyz',
  'cdnaccelerate.site',
  'cdnaccelerate.space',
  'cdnaccelerate.xyz',
  'cdnexpress.art',
  'cdnexpress.live',
  'cdnnetwork.fun',
  'cdnnetwork.live',
  'cdnnetwork.xyz',
  'contentboost.click',
  'contentboost.website',
  'contentrush.fun',
  'contentrush.space',
  'datadispatch.xyz',
  'datadistribute.cloud',
  'datadistribute.live',
  'edgeaccelerator.space',
  'edgeaccelerator.website',
  'edgecache.fun',
  'edgecache.live',
  'edgecache.online',
  'edgecache.xyz',
  'fastcontent.live',
  'fastcontent.store',
  'fastcontent.xyz',
  'fastfetch.fun',
  'fastfetch.info',
  'fastfetch.live',
  'fastfetch.xyz',
  'quickcache.click',
  'quickcache.space',
  'quickcache.website',
  'rapidcdn.click',
  'speedstream.click',
  'speedstream.info',
  'speedstream.live',
  'speedycdn.fun',
  'speedycdn.space',
  'streamlined.delivery',
  'streamlineddata.space',
  'datadistribute.xyz',
  'edgeaccelerator.xyz',
  'rapidcdn.xyz',
  'speedycdn.xyz',
  'streamlineddata.pro'
];

/** @function */
const createTask = ( name/*: string*/ ) => {
  gulp.task( name, async() => {
    const v3/*: boolean*/ = name === 'manifest:v3';
    const browser/*: string*/ = v3 ? 'chrome' : name.split( ':' )[ 1 ];

    const text = await fs.promises.readFile( 'src/manifest.json', 'utf-8' );
    const json = JSON.parse( text );

    const writeJsonPromises = [];

    json.manifest_version = v3 ? 3 : 2;
    json.version = version;

    { // CSP
      const policy/*: string[]*/ =
        json.content_security_policy.trim().split( ';' )
          .map( item => item.trim() );

      if( browser !== 'firefox' ) {
        {
          const index/*: integer*/ =
            policy.findIndex( item => item.startsWith( 'img-src' ) );
          policy[ index ] += ' chrome:'; // For diagnostics/unblock proxy
        }

        if( !v3 ) {
          const index/*: integer*/ =
            policy.findIndex( item => item.startsWith( 'script-src' ) );
          policy[ index ] +=
            ' https://*.googletagmanager.com https://www.google-analytics.com'; // For ga
        }
      }

      {
        const connectSrcIndex = policy.findIndex( item => item.startsWith( 'connect-src' ) );

        proxyDomains.forEach( proxyDomain => {
          policy[ connectSrcIndex ] += ` http://${proxyDomain} http://*.${proxyDomain}`;
        });
      }

      const fullPolicy/*: string*/ = policy.join( '; ' );

      json.content_security_policy = !v3
        ? fullPolicy
        : { 'extension_pages': fullPolicy };
    }

    // Extra mandatory permissions
    const permissions = ( () => {
      if( browser === 'firefox' ) {
        return [ 'webRequestBlocking', 'privacy', 'tabs', '<all_urls>' ];
      }

      if( v3 ) {
        return [
          'alarms', 'background', 'browsingData', 'declarativeNetRequest', 'scripting', 'webRequestAuthProvider'
        ];
      }
      return [ 'webRequestBlocking', 'background', 'browsingData', '<all_urls>' ];
    })();
    Array.prototype.push.apply( json.permissions, permissions );

    // Optional permissions
    if( browser === 'firefox' ) {
      json.optional_permissions = [ 'browsingData', 'management' ];
    }
    else {
      json.optional_permissions = v3
        ? [ 'management', 'privacy', 'tabs' ]
        : [ 'chrome://favicon/', 'management', 'privacy', 'tabs' ]; // Privacy for WebRTC
    }

    // Minimal browser version
    if( browser === 'firefox' ) { // FF
      json.applications = {
        'gecko': { 'strict_min_version': '91.1.0' }
      };
      json.browser_specific_settings = {
        'gecko_android': {}
      };
    }
    else if( v3 ) {
      json.minimum_chrome_version = '108.0';
    }
    else { // Chrome
      json.minimum_chrome_version = '56.0';
    }

    // Background
    json.background = !v3
      ? { 'scripts': [ 'lodash.js', 'background.js' ] }
      : { 'service_worker': 'background.js' };

    // Manifest v3 special
    if( v3 ) {
      json.host_permissions = [ '<all_urls>' ];

      json.action = json.browser_action;
      delete json.browser_action;

      json.declarative_net_request = {
        'rule_resources': [ {
          'id': 'ruleset_1',
          'enabled': true,
          'path': 'rules.json'
        } ]
      };
    }

    // Manifest v3: special for declarativeNetRequest
    if( v3 ) {
      // regexFilter works only if resourceTypes is specified
      const declarativeNetRequestRules = [
        {
          'id': 1,
          'priority': 1,
          'action': {
            'type': 'modifyHeaders',
            'requestHeaders': [ {
              'operation': 'set',
              'header': 'X-Browsec-Installed',
              'value': '1'
            } ]
          },
          'condition': {
            'regexFilter': `^${config.baseUrl.replace( /\./g, '\\.' )}/.*`,
            'resourceTypes': [ 'main_frame', 'sub_frame', 'xmlhttprequest' ]
          }
        }
      ];

      writeJsonPromises.push(
        fs.promises.writeFile(
          directory + '/rules.json',
          JSON.stringify( declarativeNetRequestRules ),
          'utf8'
        )
      );
    }

    writeJsonPromises.push(
      fs.promises.writeFile(
        directory + '/manifest.json',
        beautify( JSON.stringify( json ), {
          'brace-style': 'collapse',
          'indent_size': 2,
        }),
        'utf8'
      )
    );

    await Promise.all( writeJsonPromises );
  });
};

createTask( 'manifest:chrome' );
createTask( 'manifest:edge' );
createTask( 'manifest:firefox' );
createTask( 'manifest:opera' );
createTask( 'manifest:v3' );
