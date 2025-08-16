// @flow
/** @function */
module.exports = (name /*: string*/) /*: BabelSettings */ => ({
  babelrc: false,
  plugins: [
    '@babel/plugin-transform-typescript',
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-nullish-coalescing-operator',
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-proposal-class-properties', { loose: true }],
  ],
});
