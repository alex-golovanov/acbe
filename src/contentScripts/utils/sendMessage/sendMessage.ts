/**
 * Sends a message using the browser's API usually to the background script.
 *
 * @param {any} message - The message to be sent.
 * @return {Promise<any>} A promise that resolves with the response from the message.
 */
export const sendMessage = (message: any): Promise<any> => {
  if (typeof browser !== 'undefined') {
    return browser.runtime.sendMessage(message);
  }

  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, resolve);
  });
};
