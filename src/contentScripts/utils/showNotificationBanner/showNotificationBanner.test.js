import { describe, beforeEach, beforeAll, test, expect, jest } from '@jest/globals';
import { NOTIFICATIONS } from 'constants/messages/notifications';

// Mock implementation for createElement
const mockAddEventListener = jest.fn();
const mockQuerySelector = jest.fn(() => ({
  addEventListener: mockAddEventListener,
}));
const mockQuerySelectorAll = jest.fn(() => []);

// Ensure that mockCreateElement returns a mocked element with necessary methods
const mockCreateElement = jest.fn(() => {
  const mockElement = document.createElement('div');
  mockElement.querySelector = mockQuerySelector;
  mockElement.querySelectorAll = mockQuerySelectorAll;
  mockElement.addEventListener = mockAddEventListener;
  return mockElement;
});

// Mock insertStyle and sendMessage
jest.mock('../../../general/tools/insertStyle', () => jest.fn());
jest.mock('../../../contentScripts/utils', () => ({
  sendMessage: jest.fn(),
}));

// Import the module after mocks have been set
const { showNotificationBanner } = require('./showNotificationBanner');

describe('showNotificationBanner', () => {
  let appendSpy;
  let removeChildSpy;

  beforeAll(() => {
    jest.mock('../../../general/tools/createElement', () => mockCreateElement);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    appendSpy = jest.spyOn(document.body, 'append');
    removeChildSpy = jest.spyOn(HTMLElement.prototype, 'remove');
    document.body.innerHTML = '';
  });

  test('should insert styles', () => {
    const css = 'body { color: red; }';
    const modifier = (className) => className;

    showNotificationBanner({
      html: { tag: 'div', class: 'test-class' },
      promotionId: 'promo-123',
      size: 'small',
      css,
      modifier,
    });

    const insertStyle = require('../../../general/tools/insertStyle');
    expect(insertStyle).toHaveBeenCalledWith(css);
  });

  test('should handle click events', () => {
    const mockElement = document.createElement('div');
    mockCreateElement.mockReturnValue(mockElement);

    showNotificationBanner({
      html: { tag: 'div', class: 'test-class' },
      promotionId: 'promo-123',
      size: 'small',
      css: '',
      modifier: (className) => className,
    });

    // Ensure that the elements are properly set up for testing
    const makeBigElement = mockElement.querySelector('div._Notification_Big');
    const makeSmallElements = mockElement.querySelectorAll(
      'div[data-click="close"]',
    );

    if (makeBigElement) {
      makeBigElement.click();
      expect(
        require('../../../contentScripts/utils').sendMessage,
      ).toHaveBeenCalledWith({
        type: NOTIFICATIONS.requestSetVisibility,
        visible: true,
      });
    }

    makeSmallElements.forEach((element) => {
      element.click();
      expect(
        require('../../../contentScripts/utils').sendMessage,
      ).toHaveBeenCalledWith({
        type: NOTIFICATIONS.requestSetVisibility,
        visible: false,
      });
    });
  });

  test('should add the banner to the DOM after 10 seconds', () => {
    jest.useFakeTimers();
    const css = 'body { color: red; }';
    const modifier = (className) => className;
    const html = { tag: 'div', class: 'test-class' };

    // Mock the creation of elements
    mockCreateElement.mockImplementation((structure) => {
      const element = document.createElement(structure.tag);
      element.className = structure.class || '';
      if (structure.children) {
        structure.children.forEach((child) => {
          const childElement = document.createElement(child.tag);
          childElement.className = child.class || '';
          if (child.node) child.node(childElement);
          element.appendChild(childElement);
        });
      }
      return element;
    });

    showNotificationBanner({
      html,
      promotionId: 'promo-123',
      size: 'small',
      css,
      modifier,
    });

    // Check that append was not called immediately
    expect(appendSpy).not.toHaveBeenCalled();

    // Move the timer forward by 10 seconds
    jest.advanceTimersByTime(10000);

    // Check that the append method was called
    expect(appendSpy).toHaveBeenCalled();
    expect(document.body.innerHTML).toContain('_Notification');
    jest.useRealTimers();
  });
});
