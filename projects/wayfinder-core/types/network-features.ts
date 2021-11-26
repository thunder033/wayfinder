import { Vector2Expression } from './geometry';

export enum FeatureType {
  Station = 'station',
  Segment = 'segment',
  Service = 'service',
  Line = 'line',
  System = 'system',
  GeometryNode = 'geometry-node',
}

export interface NetworkFeature<T extends FeatureType = FeatureType> {
  readonly id: string;
  readonly type: T;
}

export interface WFNode extends NetworkFeature {
  position: Vector2Expression;
}

export interface Station extends WFNode {
  type: FeatureType.Station;
  name: string;
}

export enum Mode {
  Metro = 'metro',
}

export interface Segment extends NetworkFeature {
  type: FeatureType.Segment;
  mode: Mode;
  nodes: WFNode[];
}

export enum ServiceType {
  Standard = 'standard',
  Limited = 'limited'
}

export interface Service extends NetworkFeature {
  type: FeatureType.Service;
  segments: Segment[];
  serviceType: ServiceType;
}

export interface Line extends NetworkFeature {
  type: FeatureType.Line;
  name: string;
  color: string;
  services: Service[];
}

export interface System extends NetworkFeature {
  type: FeatureType.System;
  name: string;
  nodes: WFNode[];
  lines: Line[];
}

export type NetworkFeatureType = WFNode | Station | Segment | Service | Line | System;

export interface NetworkFeatureByType {
  [FeatureType.GeometryNode]: WFNode;
  [FeatureType.Station]: Station;
  [FeatureType.Segment]: Segment;
  [FeatureType.Service]: Service;
  [FeatureType.Line]: Line;
  [FeatureType.System]: System;
}
