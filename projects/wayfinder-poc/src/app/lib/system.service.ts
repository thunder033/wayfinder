import { Injectable } from '@angular/core';
import {
  FeatureType,
  Mode,
  NetworkFeature,
  NetworkFeatureByType,
  ServiceType,
} from '../../../../wayfinder-core/types/network-features';
import { of } from 'rxjs';

let id = 0;
function createFeature<F extends FeatureType, T extends NetworkFeature = NetworkFeatureByType[F]>(
  type: F,
  properties: Omit<T, 'id' | 'type'>
): T {
  return {
    id: `feature-${id++}`,
    type,
    ...properties,
  } as T;
}

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
  nodes: [station1, station2, geometryNode1, station3],
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
  color: '#f00',
  services: [service1],
});

const line2 = createFeature(FeatureType.Line, {
  name: 'Blue Line',
  color: '#00f',
  services: [service2],
});

const system1 = createFeature(FeatureType.System, {
  name: 'Test System',
  nodes: [station1, station2, station3, geometryNode1, station4],
  lines: [line2, line1],
});

@Injectable({
  providedIn: 'root'
})
export class SystemService {

  system$ = of(system1);

  constructor() { }
}
