// @flow
const getRawDomainDependencies = require( './getRawDomainDependencies' );


module.exports = async() => {
  const rawDomainDependencies/*: string[][]*/ = await getRawDomainDependencies();

  return rawDomainDependencies.map(
    ( oldBlock/*: string[]*/ ) => oldBlock.map( entry => {
      if( entry.startsWith( 'regexp:' ) ) {
        return {
          'format': 'regex',
          'value': entry.replace( /^regexp:/, '' )
        };
      }
      if( entry.startsWith( 'full:' ) ) {
        return {
          'format': 'full domain',
          'value': entry.replace( /^full:/, '' )
        };
      }
      return {
        'format': 'domain',
        'value': entry
      };
    })
  );
};
