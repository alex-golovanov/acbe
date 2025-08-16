import computeMode from './computeMode';
import IndexLocations from '../locations';


/** @method */
export default function( this: IndexLocations, event: KeyboardEvent ) {
  let { key }/*: { 'key': string }*/ = event;

  if( key === 'ArrowDown' || key === 'ArrowUp' ) {
    event.preventDefault();

    let newHighlightedCountryIndex: integer = ( () => {
      let length: integer = this.namesList.length;

      const highlightedCountry = this.highlightedCountry;
      if( !highlightedCountry ) return key === 'ArrowUp' ? length - 1 : 0;

      let index: integer = this.namesList.findIndex( ({ code, premium }) => (
        highlightedCountry.code === code
        && highlightedCountry.premium === premium
      ) );
      index += key === 'ArrowDown' ? 1 : -1;

      return ( index + length ) % length;
    })();

    let data/*: LocationsNameListItem*/ =
      this.namesList[ newHighlightedCountryIndex ];

    this.highlightedCountry = {
      'code': data.code,
      'premium': data.premium
    };

    // Scroll whole list if new item is partially or not visible
    let topEdge/*: number*/ = this.scrollElement.scrollTop;
    let screenHeight/*: number*/ = this.scrollElement.offsetHeight;
    let bottomEdge/*: number*/ = topEdge + screenHeight;
    let newElementHeight/*: number*/ = data.element.offsetHeight;
    let newElementTopEdge/*: number*/ = data.element.offsetTop;
    let newElementBottomEdge/*: number*/ = newElementTopEdge + newElementHeight;

    let visible/*: boolean*/ =
      newElementTopEdge >= topEdge && newElementBottomEdge <= bottomEdge;
    if( visible ) return;

    let scrollTop/*: number*/ = ( () => {
      // Hidden item at bottom
      if( newElementTopEdge >= topEdge ) {
        return newElementBottomEdge - screenHeight + 4;
      }

      // Hidden item at top
      return newElementTopEdge - 2;
    })();
    this.scrollElement.scrollTop = scrollTop;
    return;
  }
  if( key === 'Enter' ) {
    if( !this.highlightedCountry ) return;

    let { code }/*: { 'code': string }*/ = this.highlightedCountry;

    let mode/*: string*/ = computeMode(
      this.highlightedCountry, this.premiumUser, this.country
    );

    if( mode === 'current' ) return;

    this.countryClick({ 'detail': { mode, 'country': code } });
    return;
  }

  this.charsBuffer.keydownListener( event );
};
