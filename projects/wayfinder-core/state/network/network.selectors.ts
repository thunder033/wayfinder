import { NetworkState, WFState } from '../../types/store';
import { Dehydrated, FeatureType, Line, NetworkFeature, Segment, Service, System } from '../../types/network-features';
import { asNetworkFeature } from '../../utils/network-feature.utils';
import { createSelector } from '@ngrx/store';

const getNetwork = (state: WFState) => state.network;

function asDehydrated<T extends NetworkFeature>(input: any): Dehydrated<T> {
  return asNetworkFeature(input) as Dehydrated<T>;
}

function getHydratedFeature<T extends NetworkFeature>(state: NetworkState, input: Dehydrated<T>): T {
  switch (input.type) {
    case FeatureType.Segment:
      return {
        ...input,
        nodes: asDehydrated<Segment>(input).nodes
          .map((id) => getHydratedFeature(state, state.node[id])),
      } as T;
    case FeatureType.Service:
      return {
        ...input,
        segments: asDehydrated<Service>(input).segments
          .map((id) => getHydratedFeature(state, state.segment[id]))
      } as T;
    case FeatureType.Line:
      return {
        ...input,
        services: asDehydrated<Line>(input).services
          .map((id) => getHydratedFeature(state, state.service[id]))
      } as T;
    case FeatureType.System: {
      const system = asDehydrated<System>(input);
      return {
        ...input,
        nodes: system.nodes.map((id) => getHydratedFeature(state, state.node[id])),
        lines: system.lines.map((id) => getHydratedFeature(state, state.line[id])),
      } as T;
    }
    case FeatureType.GeometryNode:
    case FeatureType.Station:
    default:
      return input as T;
  }
}

const getSystem = (id: string) =>
  createSelector(
    getNetwork,
    (state) => getHydratedFeature(state, state.system[id]),
  );

export const networkSelectors = {
  getNetwork,
  getSystem,
};
