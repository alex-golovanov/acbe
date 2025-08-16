import 'polyfills/Promise.prototype.finally';
import createElement from 'tools/createElement';
import insertStyle from 'tools/insertStyle';
import { sendMessage } from 'contentScripts/utils';
import type { TreeElement } from 'types/TreeElement';
import { NOTIFICATIONS } from 'constants/messages/notifications';

type TShowBannerParams = {
  html: TreeElement;
  promotionId?: string;
  size: 'small' | 'big';
  css: string;
  modifier: (className: string) => string;
};

export const showNotificationBanner = ({
  html,
  promotionId,
  size,
  css,
  modifier,
}: TShowBannerParams) => {
  const classModification = (className: string): string =>
    className
      .split(' ')
      .map((part) => modifier(part))
      .join(' ');

  // Inserting styles in <head>
  insertStyle(css);

  let elements: {
    makeBig: HTMLElement;
    makeSmall: HTMLElement[];
    parent: HTMLElement;
  } = (() => {
    let elements: any = {};

    let structure: TreeElement = {
      tag: 'div',
      class:
        '_Notification ' +
        (size === 'small' ? '_Notification_stSmall' : '_Notification_stBig'),
      children: [
        {
          tag: 'div',
          class: '_Notification_Small',
          node: (node) => {
            elements.makeBig = node;
          },
        },
        {
          tag: 'div',
          class: '_Notification_Big',
          children: [html],
        },
      ],
    };

    elements.parent = createElement(
      structure,
      classModification,
    ); /*: any*/ /*: HTMLElement*/
    elements.makeSmall = Array.from(
      elements.parent.querySelectorAll('[data-click="close"]'),
    );

    return elements;
  })();

  /** @function */
  const setVisibility = (
    visible: boolean, // true if visible
  ): void => {
    sendMessage({ type: NOTIFICATIONS.requestSetVisibility, visible });

    if (visible) {
      elements.parent.classList.add(modifier('_Notification_stBig'));
      elements.parent.classList.remove(modifier('_Notification_stSmall'));
    } else {
      elements.parent.classList.remove(modifier('_Notification_stBig'));
      elements.parent.classList.add(modifier('_Notification_stSmall'));
    }
  };

  elements.makeBig.addEventListener('click', () => {
    setVisibility(true);
  });
  elements.makeSmall.forEach((element) => {
    element.addEventListener('click', () => {
      setVisibility(false);
    });
  });

  elements.parent.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', async (event: MouseEvent) => {
      event.preventDefault();

      sendMessage({
        promotionId,
        type: NOTIFICATIONS.requestClick,
        url: location.href,
      });
      await new Promise((resolve) => {
        setTimeout(resolve, 50);
      });
      self.open(link.href);
    });
  });

  // Inserting into actual DOM with delay
  setTimeout(() => {
    document.body.append(elements.parent);

    // Wait for actual showing
    if (size !== 'big') return;

    const rect = elements.parent.getClientRects()[0];
    if (!rect.width || !rect.height) return;
    sendMessage({
      promotionId,
      type: NOTIFICATIONS.requestPopupShow,
      url: location.href,
    });
  }, 10 * 1000);

  // Ping to check all is OK
  /** @function */
  const ping = async () => {
    try {
      await new Promise<void>((resolve, reject) => {
        try {
          sendMessage({ type: NOTIFICATIONS.ping }).then((state: any) => {
            if (state === 'ok') resolve();
          });
          setTimeout(() => {
            reject(new Error('Ping timeout reached'));
          }, 3000);
        } catch (error) {
          reject(error);
        }
      });

      setTimeout(ping, 4000);
    } catch (x) {
      elements.parent.remove();
    }
  };
  ping();
};
