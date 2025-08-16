import { describe, beforeEach, afterEach, test, expect } from '@jest/globals';
import { showModal } from './showModal';

describe('showModal', () => {
  let parentElement;

  beforeEach(() => {
    parentElement = document.createElement('div');
    parentElement.className = 'MainContainer';
    document.body.appendChild(parentElement);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('should append a modal element if it does not already exist', () => {
    showModal('modal-element');
    expect(parentElement.querySelector('modal-element')).not.toBeNull();
  });

  test('should not append a modal element if it already exists', () => {
    const existingModal = document.createElement('modal-element');
    parentElement.appendChild(existingModal);
    showModal('modal-element');
    const modals = parentElement.querySelectorAll('modal-element');
    expect(modals.length).toBe(1);
  });

  test('should do nothing if the parent element does not exist', () => {
    document.body.innerHTML = '';
    showModal('modal-element');
    expect(document.body.innerHTML).toBe('');
  });

  test('should handle an empty element name correctly', () => {
    showModal('');
    expect(parentElement.innerHTML).toBe('');
  });
});
