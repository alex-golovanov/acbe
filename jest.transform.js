module.exports = require( 'babel-jest' ).createTransformer({
  'plugins': [
    '@babel/plugin-transform-modules-commonjs',
    '@babel/plugin-transform-typescript'
  ]
});
