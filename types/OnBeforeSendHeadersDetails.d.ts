declare type OnBeforeSendHeadersDetails = {
  'cookieStoreId': string,
  'documentUrl': string,
  'frameId': integer,
  'incognito': boolean,
  'method': string,
  'originUrl': string,
  'parentFrameId': integer,
  'requestHeaders': WebRequestHttpHeader[],
  'requestId': string,
  'tabId': integer,
  'thirdParty': boolean,
  'timeStamp': number,
  'type': string,
  'url': string
};