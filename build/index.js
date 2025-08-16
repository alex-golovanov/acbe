// @flow
// Simple tasks
require( './tasks/simple/assets' );
require( './tasks/simple/bundles' );
require( './tasks/simple/checkEnvironment' );
require( './tasks/simple/clean' );
require( './tasks/simple/cloudfronts' );
require( './tasks/simple/createDirectories' );
require( './tasks/simple/downloadDomainDependencies' );
require( './tasks/simple/libraries' );
require( './tasks/simple/locales' );
require( './tasks/simple/manifest' );
require( './tasks/simple/pages' );
require( './tasks/simple/polyfills' );
require( './tasks/simple/servers' );
require( './tasks/simple/source-archive' );
require( './tasks/simple/zip' );

// Combinations
require( './tasks/complex/v3' );
require( './tasks/complex/chrome' );
require( './tasks/complex/edge' );
require( './tasks/complex/firefox' );
require( './tasks/complex/opera' );

// require( './tasks/complex/distNoUglify');
require( './tasks/complex/dist' );
require( './tasks/complex/default' );

require( './gists/upload' );
