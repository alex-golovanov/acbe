/* global Tab */
import Browser from 'crossbrowser-webextension';
import onStartAction from 'bg/onStartAction';
import { checkUrlInList } from './notification/utils';

const contentScriptUrl = '/notification.js';

const manifestVersion = Browser.runtime.getManifest().manifest_version;
// bc-651: multiple content scripts for same site tabs.update complete (SPA problem only)
const usedTabs = new Map();

/** @function */
const inject = (
  { tabId, url }: { tabId: integer; url?: string },
  contentScriptUrl: string,
): Promise<any> => {
  usedTabs.set(tabId, url);

  if (manifestVersion === 3) {
    return chrome.scripting.executeScript({
      target: { tabId },
      files: [contentScriptUrl],
    });
  }

  return Browser.tabs.executeScript(tabId, { file: contentScriptUrl });
};

Browser.tabs.onUpdated.addListener((tabId, { status }, { url }) => {
  if (status !== 'complete' || !checkUrlInList(url)) return;
  // if urls the same it means that it was reload page and not SPA
  if (usedTabs.has(tabId) && usedTabs.get(tabId) !== url) return;

  inject({ tabId, url }, contentScriptUrl);
});

// Initial
onStartAction(async () => {
  const tabs: Tab[] = await Browser.tabs.query();
  const loadedTabs: Tab[] = tabs.filter(
    ({ url, status }) => checkUrlInList(url) && status === 'complete',
  );

  // Inject
  for (const { id, url } of loadedTabs)
    inject({ tabId: id, url }, contentScriptUrl);
});
