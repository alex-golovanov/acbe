/* global TreeElement */
import 'polyfills/Promise.prototype.finally'; // @ts-ignore
import preOriginalCss from 'bg/contentScripts/notification/notification.css';
import { sendMessage, showNotificationBanner } from './utils';
import { listenMessage } from 'utils';
import { NOTIFICATIONS } from 'constants/messages/notifications';

type InitialPromiseData = {
  html: TreeElement;
  proxyEnabled?: boolean;
  promotionId?: string;
  size: 'small' | 'big';
  readyToShow: true;
};

const originalCss: string = preOriginalCss; // TS crap

const minClassLength: integer = (() => {
  let lengths = originalCss
    .split('{')
    .slice(0, -1)
    .flatMap((part, index): integer[] => {
      part = part.trim();
      if (index) part = part.split('}')[1];

      return part
        .split(',')
        .map((item) => item.trim().replace(/^\./g, '').length);
    });

  return Math.min.apply(Math, lengths);
})();

// Class modification parameter
const modifierOptions: { offset: integer; value: integer } = {
  offset: 1 + Math.floor(Math.random() * (minClassLength - 1)),
  value: Math.floor(Math.random() * 999999),
};

/** @function */
export const modifier = (className: string): string => {
  const left /*: string*/ = className.slice(0, modifierOptions.offset);
  const right /*: string*/ = className.slice(modifierOptions.offset);

  return left + modifierOptions.value + right;
};

const css: string = originalCss
  .split('}')
  .slice(0, -1)
  .map((part) => {
    let [selectors, rules] /*: string[]*/ = part
      .split('{')
      .map((item) => item.trim());
    rules = '{' + rules + '}';

    selectors = selectors
      .split(',')
      .map((selector) =>
        selector
          .trim()
          .replace(
            /\.([_a-zA-Z]+)/g,
            (match, className) => '.' + modifier(className),
          ),
      )
      .join(',');

    return selectors + rules;
  })
  .join('');

// User's language
const language /*: string*/ = navigator.language.slice(0, 2).toLowerCase();

/**
 * Sends an initial notification to get the popup status and translation.
 * This function is called when the page is fully loaded and a message is received.
 *
 * @return {Promise<void>} A promise that resolves when the notification is sent.
 */
export const sendInitNotification = async () => {
  /** Intitial call to get popup status + translation
  (When page fully loaded + message received) */
  let { html, promotionId, size, proxyEnabled }: InitialPromiseData =
    await new Promise<InitialPromiseData>(async (resolve) => {
      const data = await sendMessage({
        language,
        type: NOTIFICATIONS.requestInitial,
        url: location.href,
      });
      if (data?.readyToShow) resolve(data);
    });

  if (proxyEnabled) {
    showNotificationBanner({ html, promotionId, size, css, modifier });
  } else {
    listenMessage(NOTIFICATIONS.proxyTurnedOn, () => {
      showNotificationBanner({ html, promotionId, size, css, modifier });
    });
  }
};

sendInitNotification();
