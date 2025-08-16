/**
@function */
export default (
  v0: string,
  sign: '<' | '>' | '>=' | '<=' | '===',
  v1: string
): boolean => {
  /**
  1 if v0 > v1
  -1 if v0 < v1
  0 if v0 === v1 */
  const comparisonResult = ( () => {
    if( v0 === v1 ) return 0;

    let a: integer[] = v0.split( '.' ).map( n => Number( n ) );
    let b: integer[] = v1.split( '.' ).map( n => Number( n ) );
  
    // loop while the components are equal
    let len = Math.min( a.length, b.length );
    for( let i = 0; i < len; i++ ) {
      if( a[ i ] > b[ i ] ) return 1; // A bigger than B
      if( a[ i ] < b[ i ] ) return -1; // B bigger than A
    }
  
    // If one's a prefix of the other, the longer one is greater.
    if( a.length > b.length ) return 1;
    if( a.length < b.length ) return -1;
  
    // Otherwise they are the same.
    return 0;
  })();

  switch( sign ) {
    case '<': return comparisonResult < 0;
    case '>': return comparisonResult > 0;
    case '<=': return comparisonResult <= 0;
    case '>=': return comparisonResult >= 0;
    case '===': return comparisonResult === 0;
  }
};
