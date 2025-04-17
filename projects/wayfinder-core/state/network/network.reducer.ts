import { createAction, createReducer, on, props } from '@ngrx/store';
import { omit, set, cloneDeep, get } from 'lodash';
import * as _ from 'lodash';

import { Alteration, ListPointer, NetworkFeatureChange } from '../../types/network';
import { Dehydrated, FeatureType, NetworkFeature } from '../../types/network-features';
import { NetworkFeatureState, NetworkState } from '../../types/store';
window._ = _;

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
  rollBackAlteration: createAction('NETWORK::ROLL_BACK_ALTERATION', props<Alteration>()),
};

export const networkReducer = createReducer(
  networkDefaultState,
  on(networkActions.restore, (_, { state }) => ({ ...state })),
  on(networkActions.applyAlteration, (state, alteration) => ({
    ...applyChanges(
      applyAdditions(applyRemovals(state, alteration.removals), alteration.additions),
      alteration.changes,
      'right',
    ),
    alterationStack: [...state.alterationStack, alteration.id],
  })),
  on(networkActions.rollBackAlteration, (state, alteration) => {
    if (
      state.alterationStack.length < 2 ||
      state.alterationStack[state.alterationStack.length - 1] !== alteration.id
    ) {
      console.warn('Invalid roll back attempt!');
      return state;
    }

    console.log('do rollback on', state);

    const out = {
      ...applyChanges(
        applyAdditions(applyRemovals(state, alteration.additions), alteration.removals),
        alteration.changes,
        'left',
      ),
      alterationStack: state.alterationStack.slice(0, -1),
    };

    console.log('rolled back', out);

    return out;
  }),
);

function applyAdditions(state: NetworkState, additions: NetworkFeature[]): NetworkState {
  return additions.reduce(
    (out, addition) => ({
      ...out,
      [getKey(addition)]: {
        ...out[getKey(addition)],
        [addition.id]: addition,
      },
    }),
    state,
  );
}

function applyRemovals(state: NetworkState, removals: NetworkFeature[]): NetworkState {
  return removals.reduce(
    (out, removal) => ({
      ...out,
      [getKey(removal)]: omit(out[getKey(removal)], removal.id),
    }),
    state,
  );
}

function omitAt<T extends object>(target: T, path: (string | number)[]): T {
  if (path.length > 1) {
    const out = cloneDeep(target);
    const workingPath = cloneDeep(path);
    const targetProp = workingPath.pop()!;
    const parent = get(out, workingPath);
    if (Array.isArray(parent) && typeof targetProp === 'number') {
      parent.splice(targetProp, 1);
    } else {
      delete parent[targetProp];
    }
    return out;
  }

  // does not work for arrays a root level
  return omit(target, path) as T;
}

function validateListMutation(list: string[], pointer: Dehydrated<ListPointer>, value?: string) {
  const { side, relativeTo } = pointer;
  const start = list.indexOf(relativeTo) + side === 'left' ? -1 : 0;
  const removeCount = typeof value === 'undefined' ? 1 : 0;
  const insert = typeof value === 'undefined' ? [] : [value];


}

function applyChanges(
  state: NetworkState,
  changes: NetworkFeatureChange[],
  side: 'left' | 'right',
): NetworkState {
  return changes.reduce((out, change) => {
    const key = getKey({ type: change.featureType });
    const feature = out[key][change.featureId];
    if (change.mutateList) {
      // safest way to guarantee were working with an array
      const list: string[] = Object.values(get(feature, change.path));
      const pointer = change.mutateList;
      const start = list.indexOf(pointer.relativeTo) + pointer.side === 'left' ? 0 : 1;
      const removeCount = typeof change[side] === 'undefined' ? 1 : 0;
      const insert = typeof change[side] === 'undefined' ? [] : [change[side]];

      if(Symbol.iterator

      if (list.includes(pointer.relativeTo)) {
        // list does not include pointer reference ${pointer.relativeTo}: ${list}
      }

      list.splice(start, removeCount, ...insert);
      return {
        ...out,
        [key]: { ...out[key], [feature.id]: set(cloneDeep(feature), change.path, list) },
      };
    }
    if (typeof change[side] === 'undefined') {
      return {
        ...out,
        [key]: { ...out[key], [feature.id]: omitAt(feature, change.path) },
      };
    }
    return {
      ...out,
      [key]: {
        ...out[key],
        [feature.id]: set(cloneDeep(feature), change.path, change[side]),
      },
    };
  }, state);
}

function getKey(feature: { type: FeatureType }): keyof NetworkFeatureState {
  return {
    [FeatureType.Station]: 'node' as const,
    [FeatureType.Segment]: 'segment' as const,
    [FeatureType.Line]: 'line' as const,
    [FeatureType.Service]: 'service' as const,
    [FeatureType.System]: 'system' as const,
    [FeatureType.GeometryNode]: 'node' as const,
  }[feature.type];
}
