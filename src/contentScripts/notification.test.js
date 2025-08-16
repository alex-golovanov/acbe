import { describe, beforeEach, test, expect, jest } from '@jest/globals';
import { sendMessage, showNotificationBanner } from './utils';
import { listenMessage } from 'utils';
import { NOTIFICATIONS } from 'constants/messages/notifications';
import { modifier, sendInitNotification } from './notification';

jest.mock('./utils', () => ({
  sendMessage: jest.fn(),
  showNotificationBanner: jest.fn(),
}));

jest.mock('utils', () => ({
  listenMessage: jest.fn(),
}));

jest.mock('bg/contentScripts/notification/notification.css', () => 'some css content');

describe('notification functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('modifier', () => {
    test('should modify class names correctly', () => {
      const className = 'className';
      const modified = modifier(className);
      expect(modified).not.toEqual(className);
      expect(modified).toMatch(/^className\d+$/);
    });
  });

  describe('sendInitNotification', () => {
    test('should call sendMessage and showNotificationBanner when proxyEnabled is true', async () => {
      const data = {
        html: {},
        proxyEnabled: true,
        promotionId: 'promotion123',
        size: 'big',
        readyToShow: true,
      };

      sendMessage.mockResolvedValue(data);

      await sendInitNotification();

      expect(sendMessage).toHaveBeenCalledWith({
        language: expect.any(String),
        type: NOTIFICATIONS.requestInitial,
        url: location.href,
      });

      expect(showNotificationBanner).toHaveBeenCalledWith({
        html: data.html,
        promotionId: data.promotionId,
        size: data.size,
        css: expect.any(String),
        modifier: expect.any(Function),
      });
    });

    test('should listen to proxyTurnedOn message and call showNotificationBanner when proxyEnabled is false', async () => {
      const data = {
        html: {},
        proxyEnabled: false,
        promotionId: 'promotion123',
        size: 'big',
        readyToShow: true,
      };

      sendMessage.mockResolvedValue(data);

      await sendInitNotification();

      expect(sendMessage).toHaveBeenCalledWith({
        language: expect.any(String),
        type: NOTIFICATIONS.requestInitial,
        url: location.href,
      });

      expect(listenMessage).toHaveBeenCalledWith(NOTIFICATIONS.proxyTurnedOn, expect.any(Function));

      const callback = listenMessage.mock.calls[0][1];
      callback();

      expect(showNotificationBanner).toHaveBeenCalledWith({
        html: data.html,
        promotionId: data.promotionId,
        size: data.size,
        css: expect.any(String),
        modifier: expect.any(Function),
      });
    });
  });
});
