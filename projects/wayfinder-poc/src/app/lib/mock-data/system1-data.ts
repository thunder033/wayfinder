import {
  Dehydrated,
  FeatureType,
  ListMutation,
  ListPointerSide,
  Mode,
  NetworkFeatureChange,
  Segment,
  ServiceType,
  WFNode,
} from 'wf-core';

import { createAlteration, createFeature, dehydrate } from './data-utils';

const station1 = createFeature(FeatureType.Station, {
  name: 'Station 1',
  position: { x: 1, y: 1 },
});

const station2 = createFeature(FeatureType.Station, {
  name: 'Station 2',
  position: { x: 2, y: 2 },
});

const station3 = createFeature(FeatureType.Station, {
  name: 'Station 3',
  position: { x: 4, y: 3 },
});

const station4 = createFeature(FeatureType.Station, {
  name: 'Station 4',
  position: { x: 1, y: 3 },
});

const geometryNode1 = createFeature(FeatureType.GeometryNode, {
  position: { x: 3, y: 2 },
});

const segment1 = createFeature(FeatureType.Segment, {
  mode: Mode.Metro,
  nodes: [station1, station2],
});

const segment2 = createFeature(FeatureType.Segment, {
  mode: Mode.Metro,
  nodes: [station4, station2, geometryNode1, station3],
});

const service1 = createFeature(FeatureType.Service, {
  segments: [segment1],
  serviceType: ServiceType.Standard,
});

const service2 = createFeature(FeatureType.Service, {
  segments: [segment2],
  serviceType: ServiceType.Standard,
});

const line1 = createFeature(FeatureType.Line, {
  name: 'Red Line',
  color: '#b84040',
  services: [service1],
});

const line2 = createFeature(FeatureType.Line, {
  name: 'Blue Line',
  color: '#3656c5',
  services: [service2],
});

export const system1 = createFeature(FeatureType.System, {
  name: 'Test System A',
  nodes: [station1, station2],
  lines: [line1],
});

const insertSegmentNode = (segment: Segment, node: WFNode, at: ListMutation) =>
  ({
    featureId: segment.id,
    featureType: FeatureType.Segment,
    path: ['nodes'],
    mutateList: at,
    left: undefined,
    right: node.id,
  } satisfies Dehydrated<NetworkFeatureChange>);

const alteration0 = createAlteration(1960, {
  additions: [station1, station2, segment1, service1, line1, system1].map(dehydrate),
});

const alteration1 = createAlteration(1975, {
  additions: [station3, geometryNode1].map(dehydrate),
  changes: [
    insertSegmentNode(segment1, geometryNode1, {
      relativeTo: station2.id,
      side: ListPointerSide.Right,
    }),
    insertSegmentNode(segment1, station3, {
      relativeTo: geometryNode1.id,
      side: ListPointerSide.Right,
    }),
    {
      featureId: system1.id,
      featureType: FeatureType.System,
      path: ['nodes'],
      left: undefined,
      right: geometryNode1.id,
    },
    {
      featureId: system1.id,
      featureType: FeatureType.System,
      path: ['nodes'],
      left: undefined,
      right: station3.id,
    },
  ],
});

const alteration2 = createAlteration(1990, {
  additions: [station4, segment2, service2, line2].map(dehydrate),
  changes: [
    {
      featureId: system1.id,
      featureType: FeatureType.System,
      path: ['nodes'],
      left: undefined,
      right: station4.id,
    },
    {
      featureId: system1.id,
      featureType: FeatureType.System,
      path: ['lines'],
      left: undefined,
      right: line2.id,
    },
  ],
});

export const system1Alterations = [alteration0, alteration1, alteration2];
