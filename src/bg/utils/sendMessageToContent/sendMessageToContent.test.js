import { describe, beforeEach, test, expect, jest } from '@jest/globals';
import { sendMessageToContent } from './sendMessageToContent';
import Browser from 'crossbrowser-webextension';
import log from 'log';

// Mock the 'crossbrowser-webextension' module
jest.mock('crossbrowser-webextension', () => ({
  tabs: {
    query: jest.fn(),
    sendMessage: jest.fn(),
  },
  runtime: {
    getManifest: jest.fn().mockReturnValue({
      permissions: [],
    }),
  },
}));

// Mock the 'log' module
jest.mock('log', () => ({
  error: jest.fn(),
}));

describe('sendMessageToContent', () => {
  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods
    Browser.tabs.query.mockClear();
    Browser.tabs.sendMessage.mockClear();
    log.error.mockClear();
  });

  test('should send message to active tab', async () => {
    const message = { type: 'testMessage' };
    const activeTabs = [{ id: 1 }];

    Browser.tabs.query.mockResolvedValue(activeTabs);

    await sendMessageToContent(message);

    expect(Browser.tabs.query).toHaveBeenCalledWith({ active: true });
    expect(Browser.tabs.sendMessage).toHaveBeenCalledWith(1, message);
  });

  test('should not send message if no active tabs found', async () => {
    const message = { type: 'testMessage' };

    Browser.tabs.query.mockResolvedValue([]);

    await sendMessageToContent(message);

    expect(Browser.tabs.query).toHaveBeenCalledWith({ active: true });
    expect(Browser.tabs.sendMessage).not.toHaveBeenCalled();
  });

  test('should filter tabs and send message to filtered tabs', async () => {
    const message = { type: 'testMessage' };
    const tabs = [
      { id: 1, url: 'https://example.com' },
      { id: 2, url: 'https://test.com' },
    ];
    const filter = (tab) => tab.url === 'https://example.com';

    Browser.tabs.query.mockResolvedValue(tabs);

    // Invoke the function with the filter
    await sendMessageToContent(message, { filter });

    // Expect query to be called with active: true and other options
    expect(Browser.tabs.query).toHaveBeenCalledWith(
      expect.objectContaining({}),
    );

    // Check if the correct messages are sent
    expect(Browser.tabs.sendMessage).toHaveBeenCalledWith(1, message);
    expect(Browser.tabs.sendMessage).not.toHaveBeenCalledWith(2, message);
  });

  test('should log error if Browser.tabs.query throws an error', async () => {
    const message = { type: 'testMessage' };
    const error = new Error('test error');

    Browser.tabs.query.mockRejectedValue(error);

    await sendMessageToContent(message);

    expect(log.error).toHaveBeenCalledWith(error, message);
  });
});
