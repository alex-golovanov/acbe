import { describe, beforeEach, test, expect, jest } from '@jest/globals';
import { sendMessage } from './sendMessage';

const browserMock = {
  runtime: {
    sendMessage: jest.fn(),
  },
};

const chromeMock = {
  runtime: {
    sendMessage: jest.fn(),
  },
};

describe('sendMessage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should use browser.runtime.sendMessage if browser is defined', async () => {
    global.browser = browserMock;

    const response = { success: true };
    browserMock.runtime.sendMessage.mockResolvedValue(response);

    const message = { test: 'message' };
    const result = await sendMessage(message);

    expect(browserMock.runtime.sendMessage).toHaveBeenCalledWith(message);
    expect(result).toBe(response);
  });

  test('should use chrome.runtime.sendMessage if browser is not defined', async () => {
    global.chrome = chromeMock;
    // Removing the `browser` to simulate absence
    delete global.browser;

    const response = { success: true };
    chromeMock.runtime.sendMessage.mockImplementation((message, callback) => {
      callback(response);
    });

    const message = { test: 'message' };
    const result = await sendMessage(message);

    expect(chromeMock.runtime.sendMessage).toHaveBeenCalledWith(message, expect.any(Function));
    expect(result).toBe(response);
  });
});
