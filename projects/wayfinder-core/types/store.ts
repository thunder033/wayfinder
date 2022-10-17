import { Network } from './network';
import { Dehydrated, Line, Segment, Service, System, WFNode } from './network-features';

export interface NetworkFeatureState {
  node: { [id: string]: Dehydrated<WFNode> };
  segment: { [id: string]: Dehydrated<Segment> };
  service: { [id: string]: Dehydrated<Service> };
  line: { [id: string]: Dehydrated<Line> };
  system: { [id: string]: Dehydrated<System> };
}

export interface NetworkMetaState {
  alterationStack: string[];
}

export type NetworkState = NetworkFeatureState & NetworkMetaState;

export type WFState = { network: NetworkState; region: RegionState };

export interface RegionState {
  network: Network | null;
  alterationIndex: number;
}
