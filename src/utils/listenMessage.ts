import Browser from 'crossbrowser-webextension';

type TListener = (
  message: any,
  sender: {
    frameId?: number | undefined;
    id?: string | undefined;
    url?: string | undefined;
  },
) => void;

/**
 * Adds a listener to the `Browser.runtime.onMessage` event, which listens for messages with a type.
 *
 * @param {string} key - The type of the message to listen for.
 * @param {TListener} listener - The callback function to be executed when a message with the specified type is received.
 * @return {void}
 */
export const listenMessage = (key: string, listener: TListener) => {
  Browser.runtime.onMessage.addListener((message, sender) => {
    if (message.type === key) {
      listener(message, sender);
    }
  });
};
