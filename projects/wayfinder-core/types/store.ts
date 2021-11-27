import { Dehydrated, Line, Segment, Service, System, WFNode, WFNodeType } from './network-features';

export interface NetworkState {
  node: { [id: string]: Dehydrated<WFNode<WFNodeType>> };
  segment: { [id: string]: Dehydrated<Segment> };
  service: { [id: string]: Dehydrated<Service> };
  line: { [id: string]: Dehydrated<Line> };
  system: { [id: string]: Dehydrated<System> };
}

export type WFState = { network: NetworkState };
