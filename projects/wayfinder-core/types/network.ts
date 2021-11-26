import { Vector2Expression } from './geometry';
import { NetworkFeature, NetworkFeatureType } from './network-features';

export type NetworkFeatureChange = Partial<Omit<NetworkFeatureType, 'id' | 'type'>>;

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
