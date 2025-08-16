import { describe, beforeEach, test, expect } from '@jest/globals';
import ajax from 'tools/ajax';
import Browser from 'crossbrowser-webextension';
import { domainsRequest } from './domainsRequest';

jest.mock('tools/ajax');
jest.mock('crossbrowser-webextension', () => ({
  webRequest: {
    onErrorOccurred: {
      addListener: jest.fn(),
      removeListener: jest.fn(),
    },
  },
}));

describe('domainsRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return success state if all requests are successful', async () => {
    ajax.mockResolvedValueOnce({});
    ajax.mockResolvedValueOnce({});

    const addListenerMock = Browser.webRequest.onErrorOccurred.addListener;
    const removeListenerMock =
      Browser.webRequest.onErrorOccurred.removeListener;

    const result = await domainsRequest([
      'http://example.com',
      'http://example.org',
    ]);

    expect(result.errors).toEqual([]);
    expect(result.requests).toEqual({ total: 2, success: 2 });
    expect(result.state).toBe('success');

    expect(addListenerMock).toHaveBeenCalled();
    expect(removeListenerMock).toHaveBeenCalled();
  });

  test('should handle external errors and set warning state', async () => {
    ajax.mockImplementation(() =>
      Promise.reject({ message: 'Error 1', status: 500 }),
    );

    const onErrorOccurred = Browser.webRequest.onErrorOccurred.addListener;
    onErrorOccurred.mockImplementation((listener) => {
      listener({ error: 'Error 1', url: 'http://example.com?_=721794887' });
    });

    const result = await domainsRequest([
      'http://example.com',
      'http://example.org',
    ]);

    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.stringMatching(
          /Browser external error \|500\| for domain http:\/\/example\.com\?_=.*: Error 1/,
        ),
      ]),
    );
    expect(result.requests).toEqual({ total: 2, success: 0 });
    expect(result.state).toBe('error');
  });

  test('should handle timeouts and set warning state', async () => {
    ajax.mockImplementation(
      () =>
        new Promise((_, reject) =>
          setTimeout(
            () => reject({ message: 'Timeout', status: 'timeout' }),
            1000,
          ),
        ),
    );

    const addListenerMock = Browser.webRequest.onErrorOccurred.addListener;
    const removeListenerMock =
      Browser.webRequest.onErrorOccurred.removeListener;

    const result = await domainsRequest(['http://example.com']);

    expect(result.errors).toEqual(expect.arrayContaining([
      expect.stringMatching(/^Browser external error \|timeout\| for domain http:\/\/example\.com\?_=([0-9]+): Timeout$/)
    ]));
    expect(result.requests).toEqual({ total: 1, success: 0 });
    expect(result.state).toBe('error');

    expect(addListenerMock).toHaveBeenCalled();
    expect(removeListenerMock).toHaveBeenCalled();
  });
});
