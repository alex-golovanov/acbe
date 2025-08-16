import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import { addWarningReducer, removeWarningReducer, setWarningsReducer } from './warnings';
import storage from 'storage';
import log from 'log';
import { ADD_WARNING_ACTION, REMOVE_WARNING_ACTION, SET_WARNING_ACTION } from 'general/store/actions';

jest.mock('storage', () => ({
  set: jest.fn(),
}));

jest.mock('log', () => jest.fn());

describe('Reducers', () => {
  let initialState;

  beforeEach(() => {
    initialState = { warnings: [] };
    jest.clearAllMocks();
  });

  describe('addWarningReducer', () => {
    test('should add warning to state and call storage.set and log when noStorage is false and showLogs is true', () => {
      const action = { type: ADD_WARNING_ACTION, data: 'New Warning' };
      const state = { warnings: ['Old Warning'] };

      const newState = addWarningReducer({
        noStorage: false,
        action,
        state,
        showLogs: true,
      });

      expect(newState.warnings).toEqual(['Old Warning', 'New Warning']);
      expect(storage.set).toHaveBeenCalledWith('warnings', ['Old Warning', 'New Warning']);
      expect(log).toHaveBeenCalledWith('Store: warnings update. New: ', ['Old Warning', 'New Warning'], '. Old: ', ['Old Warning']);
    });

    test('should not add warning if it already exists in state', () => {
      const action = { type: ADD_WARNING_ACTION, data: 'Existing Warning' };
      const state = { warnings: ['Existing Warning'] };

      const newState = addWarningReducer({
        noStorage: true,
        action,
        state,
        showLogs: false,
      });

      expect(newState).toBe(state);
      expect(storage.set).not.toHaveBeenCalled();
      expect(log).not.toHaveBeenCalled();
    });

    test('should add warning to state even when noStorage is true and showLogs is false', () => {
      const action = { type: ADD_WARNING_ACTION, data: 'New Warning' };
      const state = { warnings: [] };

      const newState = addWarningReducer({
        noStorage: true,
        action,
        state,
        showLogs: false,
      });

      expect(newState.warnings).toEqual(['New Warning']);
      expect(storage.set).not.toHaveBeenCalled();
      expect(log).not.toHaveBeenCalled();
    });
  });

  describe('removeWarningReducer', () => {
    test('should remove warning from state and call storage.set and log when noStorage is false and showLogs is true', () => {
      const action = { type: REMOVE_WARNING_ACTION, data: 'Old Warning' };
      const state = { warnings: ['Old Warning', 'Another Warning'] };

      const newState = removeWarningReducer({
        noStorage: false,
        action,
        state,
        showLogs: true,
      });

      expect(newState.warnings).toEqual(['Another Warning']);
      expect(storage.set).toHaveBeenCalledWith('warnings', ['Another Warning']);
      expect(log).toHaveBeenCalledWith('Store: warnings update. New: ', ['Another Warning'], '. Old: ', ['Old Warning', 'Another Warning']);
    });

    test('should not remove warning if it does not exist in state', () => {
      const action = { type: REMOVE_WARNING_ACTION, data: 'Non-existing Warning' };
      const state = { warnings: ['Old Warning'] };

      const newState = removeWarningReducer({
        noStorage: true,
        action,
        state,
        showLogs: false,
      });

      expect(newState).toBe(state);
      expect(storage.set).not.toHaveBeenCalled();
      expect(log).not.toHaveBeenCalled();
    });

    test('should remove warning from state even when noStorage is true and showLogs is false', () => {
      const action = { type: REMOVE_WARNING_ACTION, data: 'Old Warning' };
      const state = { warnings: ['Old Warning'] };

      const newState = removeWarningReducer({
        noStorage: true,
        action,
        state,
        showLogs: false,
      });

      expect(newState.warnings).toEqual([]);
      expect(storage.set).not.toHaveBeenCalled();
      expect(log).not.toHaveBeenCalled();
    });
  });

  describe('setWarningsReducer', () => {
    test('should set warnings to state and call storage.set and log when noStorage is false and showLogs is true', () => {
      const action = { type: SET_WARNING_ACTION, data: ['New Warning'] };
      const state = { warnings: ['Old Warning'] };

      const newState = setWarningsReducer({
        noStorage: false,
        action,
        state,
        showLogs: true,
      });

      expect(newState.warnings).toEqual(['New Warning']);
      expect(storage.set).toHaveBeenCalledWith('warnings', ['New Warning']);
      expect(log).toHaveBeenCalledWith('Store: warnings update. New: ', ['New Warning'], '. Old: ', ['Old Warning']);
    });

    test('should set warnings to state even when noStorage is true and showLogs is false', () => {
      const action = { type: SET_WARNING_ACTION, data: ['New Warning'] };
      const state = { warnings: ['Old Warning'] };

      const newState = setWarningsReducer({
        noStorage: true,
        action,
        state,
        showLogs: false,
      });

      expect(newState.warnings).toEqual(['New Warning']);
      expect(storage.set).not.toHaveBeenCalled();
      expect(log).not.toHaveBeenCalled();
    });

    test('should replace all warnings in state with new warnings', () => {
      const action = { type: SET_WARNING_ACTION, data: ['New Warning', 'Another New Warning'] };
      const state = { warnings: ['Old Warning', 'Old Warning 2'] };

      const newState = setWarningsReducer({
        noStorage: true,
        action,
        state,
        showLogs: false,
      });

      expect(newState.warnings).toEqual(['New Warning', 'Another New Warning']);
      expect(storage.set).not.toHaveBeenCalled();
      expect(log).not.toHaveBeenCalled();
    });
  });
});
