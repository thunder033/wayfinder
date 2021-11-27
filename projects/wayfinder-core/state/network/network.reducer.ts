import { createAction, createReducer, on, props } from '@ngrx/store';
import { NetworkState } from '../../types/store';

export const networkDefaultState: NetworkState = {
  node: {},
  segment: {},
  service: {},
  line: {},
  system: {},
};

export const networkActions = {
  restore: createAction('NETWORK::RESTORE', props<{ state: NetworkState }>()),
};

export const networkReducer = createReducer(
  networkDefaultState,
  on(networkActions.restore, (_, { state }) => ({ ...state })),
);
