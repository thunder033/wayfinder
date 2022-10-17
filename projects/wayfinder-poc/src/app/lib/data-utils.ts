import { isArray } from 'lodash';

import { Alteration } from '@wf-core/types/network';
import {
  Dehydrated,
  FeatureType,
  NetworkFeature,
  NetworkFeatureByType,
} from '@wf-core/types/network-features';
import { isNetworkFeature } from '@wf-core/utils/network-feature.utils';

let id = 0;
export function createFeature<
  F extends FeatureType,
  T extends NetworkFeature = NetworkFeatureByType[F],
>(type: F, properties: Omit<T, 'id' | 'type'>): T {
  return { id: `feature-${id++}`, type, ...properties } as T;
}

function getDateForYear(year: number): string {
  const date = new Date();
  date.setFullYear(year);
  return date.toISOString();
}

let alterationId = 0;
export function createAlteration(
  year: number,
  properties: Partial<Omit<Alteration, 'id' | 'date'>>,
): Alteration {
  return {
    id: `alteration-${alterationId++}`,
    date: getDateForYear(year),
    additions: [],
    changes: [],
    removals: [],
    ...properties,
  };
}

export function dehydrate<T extends NetworkFeature>(feature: T): Dehydrated<T> {
  return Object.entries(feature).reduce(
    (out, [key, value]) => ({
      ...out,
      [key]: isArray(value)
        ? value.map((item) => (isNetworkFeature(item) ? item.id : item))
        : isNetworkFeature(value)
        ? value.id
        : value,
    }),
    {} as any,
  );
}

export function toMap<T extends NetworkFeature>(...input: T[]): { [id: string]: Dehydrated<T> } {
  return input.reduce((out, feature) => ({ ...out, [feature.id]: dehydrate(feature) }), {});
}
