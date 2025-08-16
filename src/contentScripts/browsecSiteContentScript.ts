import { isProd } from 'utils';

const _browser = typeof browser !== 'undefined' ? browser : chrome;

export const browsecSiteContentScriptMessageHandler = (event: MessageEvent<any>) => {
  const { isTrusted, data } = event;

  if (!isTrusted) {
    if (!isProd) console.warn('browsecSiteContentScript: event is not trusted');
    return;
  }

  if (!data || data.type !== 'auth') {
    if (!isProd) console.warn('browsecSiteContentScript: data is not for auth');
    return;
  }

  const { account: { credentials, guest } } = data;
  if (credentials && credentials.ipsec_password || guest === true) {
    _browser.runtime.sendMessage(event.data);
    return;
  }

  if (!isProd) console.warn('browsecSiteContentScript: data.account is not valid');
};

self.addEventListener('message', browsecSiteContentScriptMessageHandler);
