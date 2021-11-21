import { Vector2 } from './geometry';
import { NetworkFeature, NetworkFeatureTypes } from './network-features';

export type NetworkFeatureChange = Partial<Omit<NetworkFeatureTypes, 'id' | 'type'>>;

export interface Alteration {
  id: string;
  date: string;
  additions: NetworkFeature[];
  removals: NetworkFeature[];
  changes: NetworkFeatureChange[];
}

export interface Network {
  id: string;
  size: Vector2;
  ledger: Alteration[];
}
