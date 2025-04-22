import { Vector2Expression } from './geometry';
import { Dehydrated, FeatureType, NetworkFeature } from './network-features';

/**
 * describes a change in the properties of a network feature
 */
export interface NetworkFeatureChange {
  featureId: string;
  featureType: FeatureType;
  path: string[];
  /** describes how a list at "path" should be mutated relative to a feature */
  mutateList?: Dehydrated<ListMutation>;
  left: any;
  right: any;
}

/** different from NetworkFeatureChange.left/right */
export enum ListPointerSide {
  Left = 'left-of-item',
  Right = 'right-of-item',
}

/**
 * Describes how the list will be mutated
 */
export interface ListMutation {
  relativeTo?: string; // TODO does this need to be a network feature?
  side?: ListPointerSide;
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
