import Browser from 'crossbrowser-webextension';
import log from 'log';

type TSendMessageToContentOptons = {
  active?: boolean;
  url?: string;
  currentWindow?: boolean;
  windiwId?: number;
  filter?: (tab: any) => boolean;
};

/**
 * Sends a message to the content script in the active tab.
 *
 * @param {any} message - The message to be sent.
 * @param {TSendMessageToContentOptions} options - Options to filter the tabs to which the message will be sent.
 * @return {Promise<any>} A Promise that resolves after sending the message.
 */
export const sendMessageToContent = async (
  message: any,
  options: TSendMessageToContentOptons = { active: true },
): Promise<any> => {
  try {
    const { filter, ...originalOptions } = options;
    let tabs = await Browser.tabs.query(originalOptions);

    if (!tabs.length) {
      log('sendMessageToContent: No active tab found;', message?.type);
      return;
    }

    const actualTabs = filter ? tabs.filter(filter) : tabs;

    actualTabs.forEach((tab) => {
      Browser.tabs.sendMessage(tab.id, message);
    });
  } catch (error) {
    log.error(error, message);
  }
};
