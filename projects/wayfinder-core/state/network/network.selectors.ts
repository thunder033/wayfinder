import { NetworkState, WFState } from '../../types/store';
import {
  Dehydrated,
  FeatureType,
  Line,
  NetworkFeature,
  NetworkFeatureByType,
  Segment,
  Service,
  System
} from '../../types/network-features';
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

const FEATURE_PATH: {[type in FeatureType]: keyof NetworkState } = {
  [FeatureType.GeometryNode]: 'node',
  [FeatureType.Station]: 'node',
  [FeatureType.Segment]: 'segment',
  [FeatureType.Service]: 'service',
  [FeatureType.Line]: 'line',
  [FeatureType.System]: 'system',
};

const getFeature = <T extends FeatureType>(id: string, type: T) =>
  createSelector(
    getNetwork,
    (state) =>
      <NetworkFeatureByType[T]>getHydratedFeature<NetworkFeature>(state, state[FEATURE_PATH[type]][id]),
  );

export const networkSelectors = {
  getNetwork,
  getSystem,
  getFeature,
};
