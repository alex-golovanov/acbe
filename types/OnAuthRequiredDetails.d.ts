// https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/webRequest/onAuthRequired#details
declare type OnAuthRequiredDetails = {
  'challenger': {
    'host': string,
    'port': integer
  },
  'frameId': integer,
  'initiator'?: string,
  'ip'?: string,
  'isProxy': boolean,
  'method': string,
  'parentFrameId': integer,
  'realm'?: string,
  'requestId': string,
  'scheme': string,
  'statusCode': integer,
  'statusLine': string,
  'tabId': integer,
  'timeStamp': number,
  'url': string
};
