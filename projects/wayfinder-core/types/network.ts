import { Vector2Expression } from './geometry';
import { Dehydrated, FeatureType, NetworkFeature } from './network-features';

export interface NetworkFeatureChange<T extends Dehydrated<NetworkFeature> = any> {
  featureId: string;
  featureType: FeatureType;
  path: (string | number)[];
  left: any;
  right: any;
}

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
