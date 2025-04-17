import { Vector2Expression } from './geometry';
import { Dehydrated, FeatureType, NetworkFeature } from './network-features';

/**
 * describes a change in the properties of a network feature
 */
export interface NetworkFeatureChange<T extends Dehydrated<NetworkFeature> = any> {
  featureId: string;
  featureType: FeatureType;
  path: (string | number)[];
  mutateList?: Dehydrated<ListPointer>;
  left: any;
  right: any;
}

export interface ListPointer {
  relativeTo: NetworkFeature;
  side: 'left' | 'right';
}

/**
 * A set of changes that represent a new network state
 */
export interface Alteration {
  id: string;
  date: string;
  additions: Dehydrated<NetworkFeature>[];
  removals: Dehydrated<NetworkFeature>[];
  changes: NetworkFeatureChange[];
}

export interface Network {
  id: string;
  size: Vector2Expression;
  ledger: Alteration[];
}
