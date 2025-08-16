import { describe, beforeEach, test, expect } from '@jest/globals';
import { listenMessage } from './listenMessage';
import Browser from 'crossbrowser-webextension';

describe('listenMessage', () => {
  beforeEach(() => {
    // Make sure that Browser.runtime and onMessage are defined
    Browser.runtime = {
      onMessage: {
        addListener: jest.fn()
      }
    };
  });

  test('should add listener to Browser.runtime.onMessage', () => {
    const key = 'testKey';
    const listener = jest.fn();

    listenMessage(key, listener);

    expect(Browser.runtime.onMessage.addListener).toHaveBeenCalled();
  });

  test('should call listener when message type matches', () => {
    const key = 'testKey';
    const listener = jest.fn();
    const message = { type: key };
    const sender = { id: 'testSender' };

    listenMessage(key, listener);

    const addListenerCallback = Browser.runtime.onMessage.addListener.mock.calls[0][0];

    addListenerCallback(message, sender);

    expect(listener).toHaveBeenCalledWith(message, sender);
  });

  test('should not call listener when message type does not match', () => {
    const key = 'testKey';
    const listener = jest.fn();
    const message = { type: 'someOtherType' };
    const sender = { id: 'testSender' };

    listenMessage(key, listener);

    const addListenerCallback = Browser.runtime.onMessage.addListener.mock.calls[0][0];

    addListenerCallback(message, sender);

    expect(listener).not.toHaveBeenCalled();
  });
});
