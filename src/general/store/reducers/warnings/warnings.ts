import storage from 'storage';
import log from 'log';

import type { StoreState } from 'types/StoreState';
import { TReducerArgs } from '../types';
import {
  REMOVE_WARNING_ACTION,
  ADD_WARNING_ACTION,
  SET_WARNING_ACTION,
} from 'general/store/actions';

export const addWarningReducer = ({
  noStorage,
  action,
  state,
  showLogs,
}: TReducerArgs<{
  type: typeof ADD_WARNING_ACTION;
  data: string;
}>): StoreState => {
  if (state.warnings.includes(action.data)) return state;

  const warnings = [...state.warnings, action.data];

  if (!noStorage) storage.set('warnings', warnings);

  if (showLogs) {
    log('Store: warnings update. New: ', warnings, '. Old: ', state.warnings);
  }

  return { ...state, warnings };
};

export const removeWarningReducer = ({
  noStorage,
  action,
  state,
  showLogs,
}: TReducerArgs<{
  type: typeof REMOVE_WARNING_ACTION;
  data: string;
}>): StoreState => {
  const prevWarnings = state.warnings;
  if (!prevWarnings.includes(action.data)) return state;

  const warnings = prevWarnings.filter((item: string) => item !== action.data);

  if (!noStorage) {
    storage.set('warnings', warnings);
  }

  if (showLogs) {
    log('Store: warnings update. New: ', warnings, '. Old: ', prevWarnings);
  }
  return { ...state, warnings };
};

export const setWarningsReducer = ({
  noStorage,
  action,
  state,
  showLogs,
}: TReducerArgs<{
  type: typeof SET_WARNING_ACTION;
  data: string[];
}>): StoreState => {
  const warnings = action.data;

  if (!noStorage) storage.set('warnings', warnings);

  if (showLogs) {
    log('Store: warnings update. New: ', warnings, '. Old: ', state.warnings);
  }

  return { ...state, warnings };
};
