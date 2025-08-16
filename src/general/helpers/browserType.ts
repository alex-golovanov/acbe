
export default {
  /** @method */
  isChrome() {
    return ( typeof browser === 'undefined' );
  },
  /** @method */
  isFirefox() {
    return ( typeof browser !== 'undefined' )
  }
}
