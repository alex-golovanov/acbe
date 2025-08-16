import type { StoreState } from 'types/StoreState';

export type TReducerArgs<A> = {
  noStorage: boolean;
  action: A;
  state: StoreState;
  showLogs?: boolean;
};

export type TAction<T, D> = {
  type: T;
  data: D;
  noStorage?: boolean;
};
