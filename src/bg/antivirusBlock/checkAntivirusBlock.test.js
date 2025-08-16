import { describe, beforeEach, test, expect, jest } from '@jest/globals';
import {
  detectAnivirusBlock,
  checkAntivirusBlock,
  onGlobalRequestError,
} from './checkAntivirusBlock';

import jitsu from 'jitsu';
import store from 'store';
import { ADD_WARNING_ACTION } from 'general/store/actions';
import { ANTIVIRUS } from 'constants/common';
import ajax from 'tools/ajax';

jest.mock('jitsu', () => ({
  track: jest.fn(),
}));

jest.mock('store', () => ({
  getStateSync: jest.fn(),
  dispatch: jest.fn(),
  getStateAsync: jest.fn(),
}));

jest.mock('tools/ajax', () => jest.fn());

jest.mock('lodash', () => ({ throttle: jest.fn((fn) => fn) }));

describe('Testing Antivirus Related Functions', () => {
  describe('detectAnivirusBlock', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('should return true if antivirus block is detected', async () => {
      ajax.mockRejectedValue({ status: 499, message: 'antivirus issue' });

      expect(await detectAnivirusBlock()).toBe(true);
    });

    test('should return false if antivirus error code is not present', async () => {
      ajax.mockRejectedValue({ status: 500, message: 'some other issue' });

      expect(await detectAnivirusBlock()).toBe(false);
    });

    test('should return false if there is no error', async () => {
      ajax.mockResolvedValue(null);

      expect(await detectAnivirusBlock()).toBe(false);
    });
  });

  describe('checkAntivirusBlock', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.spyOn(require('./checkAntivirusBlock'), 'detectAnivirusBlock');
    });

    test('should track event and dispatch action when antivirus block is detected', async () => {
      ajax.mockRejectedValue({ status: 499, message: 'antivirus issue' });
      store.getStateAsync.mockResolvedValue({
        warnings: [],
      });

      require('./checkAntivirusBlock').detectAnivirusBlock.mockResolvedValue(
        true,
      );

      await checkAntivirusBlock();

      expect(jitsu.track).toHaveBeenCalledWith('vpn_blocked', {
        source: 'antivirus',
      });
      expect(store.dispatch).toHaveBeenCalledWith({
        type: ADD_WARNING_ACTION,
        data: ANTIVIRUS,
      });
    });
  });

  describe('onGlobalRequestError', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.spyOn(require('./checkAntivirusBlock'), 'checkAntivirusBlock');
    });

    test('should not call checkAntivirusBlock if error does not contain antivirus code', () => {
      const error = 'Some other error';
      onGlobalRequestError(error);

      expect(checkAntivirusBlock).not.toHaveBeenCalled();
    });
  });
});
