/* global Extension, ExtensionInfo */
import Browser from 'crossbrowser-webextension';

/** No other proxy extensions (Chrome only)
@function */
export const filterExtensions = ( extensions: ExtensionInfo[] | undefined, filterProxy = true ): Extension[] => {
  if( !extensions ) return [];

  return extensions
    .filter( ({ enabled, id, permissions }) => (
      enabled
      && ( !filterProxy || ( filterProxy && permissions.includes( 'proxy' ) ) )
      && Browser.runtime.id !== id // Ignore our extension
    ) )
    .map( transformExtension );
};

const transformExtension = ({ id, name, icons }: ExtensionInfo ) => {
  const extension: Extension = { id, name };
  let icon = null;

  if( icons ) {
    const iconUrl: string | undefined = ( icons[ 1 ] || icons[ 0 ] )?.url;

    if( iconUrl ) {
      icon = typeof browser !== 'undefined'
        ? iconUrl
        : `chrome://favicon/size/38/chrome-extension://${id}/`;
    }
  }

  return {
    ...extension,
    ...( icon && { icon })
  };
};
