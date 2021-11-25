import { Vector2 } from './geometry';

export enum FeatureType {
  Station= 'station',
  Segment = 'segment',
  Service = 'service',
  Line = 'line',
  System = 'system'
}

export interface NetworkFeature<T extends FeatureType = FeatureType> {
  readonly id: string;
  readonly type: T;
}

export interface Node extends NetworkFeature {
  position: Vector2;
}

export interface Station extends Node {
  type: FeatureType.Station;
  name: string;
}

export enum Mode {
  Metro = 'metro',
}

export interface Segment extends NetworkFeature {
  type: FeatureType.Segment;
  mode: Mode;
  nodes: Node[];
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
  nodes: Node[];
  lines: Line[];
}

export type NetworkFeatureType = Station | Segment | Service | Line | System;

export interface NetworkFeatureByType {
  [FeatureType.Station]: Station;
  [FeatureType.Segment]: Segment;
  [FeatureType.Service]: Service;
  [FeatureType.Line]: Line;
  [FeatureType.System]: System;
}
