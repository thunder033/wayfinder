import { RegionState } from '../../types/store';
import { createAction, createReducer, on, props } from '@ngrx/store';

export const regionDefaultState: RegionState = {
  alterationIndex: 0,
  network: null,
};

export const regionActions = {
  restore: createAction('REGION::RESTORE', props<{ state: RegionState }>()),
};

export const regionReducer = createReducer(
  regionDefaultState,
  on(regionActions.restore, (_, { state }) => ({ ...state })),
);
