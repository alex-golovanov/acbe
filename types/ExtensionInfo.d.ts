// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/management/ExtensionInfo
declare type ExtensionInfo = {
  'enabled': boolean,
  'icons': Array<{
    'size': integer,
    'url': string
  }>,
  'id': string,
  'name': string,
  'permissions': string[]
};
