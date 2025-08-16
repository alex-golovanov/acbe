import { describe, test, expect, jest, beforeEach } from '@jest/globals';

import store from 'store';
import { ANTIVIRUS } from 'constants/common';
import { POPUP_PROXY_BLOCKED_BY_ANTIVIRUS } from 'popup/components/constants';
import { checkShowingAntivirusModal } from './checkShowingAntivirusModal';
import { showModal } from '../modal/showModal';

jest.mock('store', () => ({
  getStateAsync: jest.fn(),
  onChange: jest.fn(),
}));

jest.mock('../modal/showModal', () => ({
  showModal: jest.fn(),
}));

describe('checkShowingAntivirusModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should show the antivirus modal if warnings include ANTIVIRUS', async () => {
    store.getStateAsync.mockResolvedValue({ warnings: [ANTIVIRUS] });

    await checkShowingAntivirusModal();

    expect(showModal).toHaveBeenCalledWith(POPUP_PROXY_BLOCKED_BY_ANTIVIRUS);
  });

  test('should not show the antivirus modal if warnings do not include ANTIVIRUS', async () => {
    store.getStateAsync.mockResolvedValue({ warnings: [] });

    await checkShowingAntivirusModal();

    expect(showModal).not.toHaveBeenCalled();
  });

  test('should show the antivirus modal when warnings are updated to include ANTIVIRUS', async () => {
    const mockOnChangeCallback = jest.fn();
    store.getStateAsync.mockResolvedValue({ warnings: [] });
    store.onChange.mockImplementation((selector, callback) => {
      mockOnChangeCallback.mockImplementation(callback);
    });

    await checkShowingAntivirusModal();

    // Simulate the onChange callback being called with updated warnings
    mockOnChangeCallback([ANTIVIRUS]);

    expect(showModal).toHaveBeenCalledWith(POPUP_PROXY_BLOCKED_BY_ANTIVIRUS);
  });

  test('should not show the antivirus modal when warnings are updated and do not include ANTIVIRUS', async () => {
    const mockOnChangeCallback = jest.fn();
    store.getStateAsync.mockResolvedValue({ warnings: [ANTIVIRUS] });
    store.onChange.mockImplementation((selector, callback) => {
      mockOnChangeCallback.mockImplementation(callback);
    });

    await checkShowingAntivirusModal();

    expect(showModal).toHaveBeenCalledTimes(1);
    showModal.mockClear();

    // Simulate the onChange callback being called with updated warnings
    mockOnChangeCallback([]);

    expect(showModal).not.toHaveBeenCalledWith(
      POPUP_PROXY_BLOCKED_BY_ANTIVIRUS,
    );
  });
});
