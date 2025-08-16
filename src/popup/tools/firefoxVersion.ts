export default ( ( async(): Promise<number | undefined> => {
  if( typeof browser === 'undefined' ) return;

  let { version } = await browser.runtime.getBrowserInfo();
  return Number( version.split( '.' )[ 0 ] );
})() );
