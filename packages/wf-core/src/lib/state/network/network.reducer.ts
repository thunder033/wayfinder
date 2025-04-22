import { createAction, createReducer, on, props } from '@ngrx/store';
import { cloneDeep, get, omit, set } from 'lodash';

import { Alteration, ListPointerSide, NetworkFeatureChange } from '../../types/network';
import { FeatureType, NetworkFeature } from '../../types/network-features';
import { NetworkFeatureState, NetworkState } from '../../types/store';

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
        alteration.changes.slice().reverse(),
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

/**
 * Removes the object property at the given path
 * @param target
 * @param path
 */
function omitAt<T extends object>(target: T, path: (string | number)[]): T {
  if (path.length > 1) {
    const out = cloneDeep(target);
    const workingPath = [...path];
    const targetProp = workingPath.pop()!; // we checked there is at least one item
    const parent = get(out, workingPath);
    delete parent[targetProp];
    return out;
  }

  // does not work for arrays a root level
  return omit(target, path) as T;
}

const removesItem = (value: unknown) => {
  return typeof value === 'undefined';
};

interface SpliceListParams<T> {
  list: T[];
  cutAt: number;
  omitUntil?: number;
}
const spliceList = <T>(
  { list, cutAt, omitUntil }: SpliceListParams<T>,
  ...insertItems: T[]
): T[] => {
  const leftItems = list.slice(0, cutAt);
  const rightItems = list.slice(omitUntil || cutAt);
  return [...leftItems, ...insertItems, ...rightItems];
};

const getOtherSide = (side: 'left' | 'right') => {
  return side === 'left' ? 'right' : 'left';
};

/**
 * Applies a list mutation relative to another item found in the list. During removals, this method
 * does not check if the target item is actually the item specified, but works only from the reference
 * point by position
 * @param change
 * @param list
 * @param side
 */
const mutateListRelativeTo = (
  change: NetworkFeatureChange,
  list: string[],
  side: 'left' | 'right',
) => {
  if (typeof change.mutateList?.relativeTo === 'string') {
    const pointer = change.mutateList;

    const isRemoval = removesItem(change[side]);
    const mutate = {
      removeLeft: isRemoval && pointer.side === ListPointerSide.Left ? -1 : 0,
      removeRight: isRemoval && pointer.side === ListPointerSide.Right ? 1 : 0,
    };

    const refIndex =
      list.indexOf(pointer.relativeTo!) + (pointer.side === ListPointerSide.Left ? 0 : 1);
    const insertion = isRemoval ? [] : [change[side]];
    return spliceList(
      { list, cutAt: refIndex + mutate.removeLeft, omitUntil: refIndex + mutate.removeRight },
      ...insertion,
    );
  }

  return list;
};

/**
 * Apply simple list mutation inferring the operation from the available properties. Removes an item
 * or inserts at the head/tail of this list.
 * @param change
 * @param list
 * @param side
 */
const mutateListSimple = (change: NetworkFeatureChange, list: string[], side: 'left' | 'right') => {
  const isRemoval = removesItem(change[side]);
  if (isRemoval) {
    const targetIndex =
      change.mutateList?.side === ListPointerSide.Right
        ? list.indexOf(change[getOtherSide(side)])
        : list.lastIndexOf(change[getOtherSide(side)]);
    return spliceList({ list, cutAt: targetIndex, omitUntil: targetIndex + 1 });
  } else {
    const targetIndex = change.mutateList?.side === ListPointerSide.Left ? 0 : list.length;
    return spliceList({ list, cutAt: targetIndex }, change[side]);
  }
};

function applyChanges(
  state: NetworkState,
  changes: NetworkFeatureChange[],
  side: 'left' | 'right',
): NetworkState {
  return changes.reduce((out, change) => {
    const key = getKey({ type: change.featureType });
    const feature = out[key][change.featureId];
    const targetValue = get(feature, change.path);
    if (Array.isArray(targetValue)) {
      // it would be safest to check if this was actually a string array, but it should be a safe bet
      const outList = change.mutateList?.relativeTo
        ? mutateListRelativeTo(change, targetValue as string[], side)
        : mutateListSimple(change, targetValue as string[], side);

      return {
        ...out,
        [key]: { ...out[key], [feature.id]: set(cloneDeep(feature), change.path, outList) },
      };
    }
    if (removesItem(change[side])) {
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
