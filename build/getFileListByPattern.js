// @flow
const { glob, hasMagic } = require( 'glob' );


/**
@function
@return list of files */
module.exports = async( urls/*: string*/ )/*: Promise<string[]>*/ => {
  if( !hasMagic( urls ) ) return [ urls ];

  const files = await glob( urls );

  return files.map( item => item.replace( /\\/g, '/' ) );
};
