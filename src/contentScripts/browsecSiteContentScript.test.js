import { describe, beforeEach, test, expect, jest } from '@jest/globals';
import { browsecSiteContentScriptMessageHandler } from 'contentScripts/browsecSiteContentScript';

const invalidEvents = [
  { isTrusted: false },
  { isTrusted: true, data: undefined },
  { isTrusted: true, data: { type: 'auth', account: {} } },
  { isTrusted: true, data: { type: 'auth', account: { unrelevantAccField: 123 } } },
  { isTrusted: true, data: { type: 'auth', account: { guest: false } } },
  { isTrusted: true, data: { type: 'auth', account: { credentials: {} } } },
  { isTrusted: true, data: { type: 'auth', account: { credentials: { unrelevant: '123' } } } },
];

describe('BrowSec Site Content Script', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test.each(invalidEvents)('does nothing if no credentials %s', (invalidEvent) => {
    browsecSiteContentScriptMessageHandler(invalidEvent);
    expect(global.chrome.runtime.sendMessage).not.toHaveBeenCalled();
  });

  test('passes sign out event further', () => {
    const validSignOutEvent = {
      isTrusted: true, data: {
        type: 'auth',
        account: {
          guest: true,
        },
      },
    };
    browsecSiteContentScriptMessageHandler(validSignOutEvent);

    expect(global.chrome.runtime.sendMessage).toHaveBeenCalled();
  });

  test('passes sign in event further', () => {
    const validSignInEvent = {
      isTrusted: true, data: {
        type: 'auth',
        account: {
          credentials: {
            ipsec_password: 'ipsec_password',
          },
        },
      },
    };
    browsecSiteContentScriptMessageHandler(validSignInEvent);

    expect(global.chrome.runtime.sendMessage).toHaveBeenCalled();
  });
});
