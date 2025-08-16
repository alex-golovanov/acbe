import { describe, beforeEach, afterEach, test, expect } from '@jest/globals';
import { hideModal } from './hideModal';

describe('hideModal', () => {
  let parentElement;

  beforeEach(() => {
    // Create a mock element with the class MainContainer
    parentElement = document.createElement('div');
    parentElement.className = 'MainContainer';

    // Append the parent element to the DOM
    document.body.appendChild(parentElement);
  });

  afterEach(() => {
    // Clean up all elements from the DOM after each test
    document.body.innerHTML = '';
  });

  test('should remove the modal element if it exists', () => {
    // Создание и добавление модального окна
    const modalElement = document.createElement('div');
    modalElement.className = 'modal';
    parentElement.appendChild(modalElement);

    hideModal('.modal');

    expect(parentElement.querySelector('.modal')).toBeNull();
  });

  test('should do nothing if the parent element does not exist', () => {
    document.body.innerHTML = '';

    hideModal('.modal');

    expect(document.body.innerHTML).toBe('');
  });

  test('should do nothing if the modal element does not exist', () => {
    hideModal('.modal');

    expect(parentElement.innerHTML).toBe('');
  });

  test('should handle empty element name correctly', () => {
    const modalElement = document.createElement('div');
    modalElement.className = 'modal';
    parentElement.appendChild(modalElement);

    hideModal('');

    expect(parentElement.querySelector('.modal')).not.toBeNull();
  });
});
