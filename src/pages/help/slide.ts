/** @function */
const uppercase = ( string: string ): string => (
  string.split( '-' )
    .map( ( part, index ) => {
      if( !index ) return part;

      let start = part.slice( 0, 1 ).toUpperCase();
      let end = part.slice( 1 );

      return start + end;
    })
    .join( '' )
);

const verticalProperties = Object.freeze( [
  'border-top-width', 'border-bottom-width', 'padding-top',
  'padding-bottom', 'height'
] );


export default (
  element: HTMLElement,
  direction: 'up' | 'down',
  properties/*: Object*/ = {}
)/*: Object*/ => {
  // Show
  if( direction !== 'up' ) element.style.cssText = 'display:block;';

  let style/*: CSSStyleDeclaration*/ = getComputedStyle( element );
  let keyframeObjectWithValue = Object.fromEntries(
    verticalProperties.map( property => (
      [ uppercase( property ), style.getPropertyValue( property ) ]
    ) )
  );
  let keyframeObjectWithZero = Object.fromEntries(
    verticalProperties.map(
      property => ( [ uppercase( property ), 0 ] )
    )
  );

  let keyframes/*: Object[]*/ = direction === 'up'
    ? [ keyframeObjectWithValue, keyframeObjectWithZero ] // Hide
    : [ keyframeObjectWithZero, keyframeObjectWithValue ]; // Show

  if( direction === 'up' ) { // Hide
    element.style.cssText = 'overflow:hidden;';
  }
  else { // Show
    element.style.cssText =
      'overflow:hidden;display:block;' +
      verticalProperties.map( property => `${property}:0px;` ).join( '' );
  }
  
  return element.animate( keyframes, properties );
};
