import { Vector2Expression } from './geometry';
import { NetworkFeature } from './network-features';

export interface NetworkFeatureChange<T = any> {
  featureId: string;
  path: ObjectPathNormalize<T>;
  left: any;
  right: any;
}

export interface Alteration {
  id: string;
  date: string;
  additions: NetworkFeature[];
  removals: NetworkFeature[];
  changes: NetworkFeatureChange[];
}

export interface Network {
  id: string;
  size: Vector2Expression;
  ledger: Alteration[];
}
