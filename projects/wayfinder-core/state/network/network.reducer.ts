import { createAction, createReducer, on, props } from '@ngrx/store';
import { NetworkFeatureState, NetworkState } from '../../types/store';
import { Alteration, NetworkFeatureChange } from '../../types/network';
import { FeatureType, NetworkFeature } from '../../types/network-features';
import { omit, set, cloneDeep } from 'lodash';

export const networkDefaultState: NetworkState = {
  alterationStack: [],
  node: {},
  segment: {},
  service: {},
  line: {},
  system: {},
};

export const networkActions = {
  restore: createAction('NETWORK::RESTORE', props<{ state: NetworkState }>()),
  applyAlteration: createAction('NETWORK::APPLY_ALTERATION', props<Alteration>()),
};

export const networkReducer = createReducer(
  networkDefaultState,
  on(networkActions.restore, (_, { state }) => ({ ...state })),
  on(networkActions.applyAlteration, (state, alteration) => ({
    ...applyChanges(
      applyAdditions(
        applyRemovals(state, alteration.removals),
        alteration.additions),
      alteration.changes),
    alterationStack: [...state.alterationStack, alteration.id],
  })),
);

function applyAdditions(state: NetworkState, additions: NetworkFeature[]): NetworkState {
  return additions.reduce((out, addition) => ({
    ...out,
    [getKey(addition)]: {
      ...out[getKey(addition)],
      [addition.id]: addition,
    },
  }), state);
}

function applyRemovals(state: NetworkState, removals: NetworkFeature[]): NetworkState {
  return removals.reduce((out, removal) => ({
    ...out,
    [getKey(removal)]: omit(out, removal.id),
  }), state);
}

function applyChanges(state: NetworkState, changes: NetworkFeatureChange[]): NetworkState {
  return changes.reduce((out, change) => {
    const key = getKey({ type: change.featureType });
    const feature = out[key][change.featureId];
    if (typeof change.right === 'undefined') {
      return ({
        ...out,
        [key]: { ...out[key], [feature.id]: feature },
      });
    }
    return ({
      ...out,
      [key]: {
        ...out[key],
        [feature.id]: {
          ...set(cloneDeep(feature), change.path, change.right),
        }
      }
    });
  }, state);
}

function getKey(feature: { type: FeatureType }): keyof NetworkFeatureState {
  return ({
    [FeatureType.Station]: 'node' as const,
    [FeatureType.Segment]: 'segment' as const,
    [FeatureType.Line]: 'line' as const,
    [FeatureType.Service]: 'service' as const,
    [FeatureType.System]: 'system' as const,
    [FeatureType.GeometryNode]: 'node' as const,
  })[feature.type];
}
