module.exports = typeof browser !== 'undefined'
  ? require( './firefox' )
  : require( './chrome' );
