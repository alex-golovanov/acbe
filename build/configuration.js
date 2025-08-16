// @flow
const fs = require( 'fs' );

const development = require( '../config/development' );
const production = require( '../config/production' );
const qa = require( '../config/qa' );
const qa2 = require( '../config/qa2' );
const qa3 = require( '../config/qa3' );
const staging = require( '../config/staging' );
const lvh = require( '../config/lvh' );

const configs = {
  development,
  lvh,
  production,
  qa,
  qa2,
  qa3,
  staging
};

const ownJsonExist/*: boolean*/ =
  fs.existsSync( './config/own.json' ); // flow ignore next line

const env = process.env.ENV || 'production';
const config = ownJsonExist ? require( '../config/own' ) : configs[ env ];


module.exports = config;
