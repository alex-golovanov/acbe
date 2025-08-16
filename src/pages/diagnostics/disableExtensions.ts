/* global ExtensionInfo */
type BrowserExtension = typeof chrome;


/** @function */
const permissionRequest = async(): Promise<boolean> => {
  if( typeof browser !== 'undefined' ) {
    return browser.permissions.request({ 'permissions': [ 'management' ] });
  }

  return chrome.permissions.request({ 'permissions': [ 'management' ] });
};


/** @function */
export default async( extensions: string[] ): Promise<ExtensionInfo[]> => {
  let allowed = await permissionRequest();
  if( !allowed ) throw new Error( 'Not enough permissions' );

  if( typeof browser !== 'undefined' ) return [];

  const chromeObject: BrowserExtension | undefined = ( () => {
    if( typeof chrome.management.setEnabled === 'function' ) return chrome;

    const iframe =
      document.querySelector( '#managementIframe' ) as ( HTMLIFrameElement | null ); // @ts-ignore
    if( iframe ) return iframe.contentWindow.chrome;
  })();
  if( !chromeObject ) return [];

  await Promise.all( extensions.map( id => new Promise( resolve => {
    chromeObject.management.setEnabled( id, false, resolve );
  }) ) );

  return new Promise( resolve => {
    chromeObject.management.getAll( resolve );
  });
};
