export default ( (): number | undefined => {
  if( typeof browser !== 'undefined' ) return;

  let matches = navigator.userAgent.match( /Chrome\/([0-9]+)/ );
  if( !matches ) return;

  return Number( matches[ 1 ] );
})();
