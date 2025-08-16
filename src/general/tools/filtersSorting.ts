/* global SiteFilter, PacSiteFilter */
/** @function */
const formatToFormatValue = (
  format: 'domain' | 'full domain' | 'regex'
): integer => {
  switch( format ) {
    case 'full domain': return 0;
    case 'domain': return 1;
    case 'regex' : return 2;

    default: throw new Error( 'Incorrect format ' + format );
  }
};


// Base sorting algorithm for pac.filters
/** @function */
export default (
  a: SiteFilter | PacSiteFilter, b: SiteFilter | PacSiteFilter
): integer => {
  let aFormatValue = formatToFormatValue( a.format );
  let bFormatValue = formatToFormatValue( b.format );

  if( aFormatValue !== bFormatValue ) {
    if( aFormatValue > bFormatValue ) return 1;
    if( aFormatValue < bFormatValue ) return -1;
  }

  let aValue = a.value;
  let bValue = b.value;
  if( typeof aValue === 'string' && typeof bValue === 'string' ) {
    let levels = {
      'a': aValue.split( '.' ).length,
      'b': bValue.split( '.' ).length
    };
    if( levels.a > levels.b ) return -1;
    if( levels.a < levels.b ) return 1;

    if( aValue > bValue ) return 1;
    if( aValue < bValue ) return -1;
  }
  
  return 0;
};
