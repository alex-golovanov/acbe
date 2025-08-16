import Browser from 'crossbrowser-webextension';


const manifestVersion = Browser.runtime.getManifest().manifest_version;

export default manifestVersion === 3 ? chrome.action : Browser.browserAction;
