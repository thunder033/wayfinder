import { createAction, createReducer, on, props } from '@ngrx/store';
import { NetworkState } from '../types/store';

export const networkDefaultState: NetworkState = {
  node: {},
  segment: {},
  service: {},
  line: {},
  system: {},
};

export const actions = {
  restore: createAction('NETWORK::RESTORE', props<{ state: NetworkState }>()),
};

const reducer = createReducer(
  networkDefaultState,
  on(actions.restore, (_, { state }) => ({ ...state })),
);

export const network = { reducer, ...actions };
