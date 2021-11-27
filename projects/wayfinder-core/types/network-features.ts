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

export interface WFNode<T extends FeatureType> extends NetworkFeature<T> {
  position: Vector2Expression;
}

export interface GeometryNode extends WFNode<FeatureType.GeometryNode> {}

export interface Station extends WFNode<FeatureType.Station> {
  type: FeatureType.Station;
  name: string;
}

export enum Mode {
  Metro = 'metro',
}

export interface Segment extends NetworkFeature<FeatureType.Segment> {
  type: FeatureType.Segment;
  mode: Mode;
  nodes: WFNode<any>[];
}

export enum ServiceType {
  Standard = 'standard',
  Limited = 'limited'
}

export interface Service extends NetworkFeature<FeatureType.Service> {
  type: FeatureType.Service;
  segments: Segment[];
  serviceType: ServiceType;
}

export interface Line extends NetworkFeature<FeatureType.Line> {
  type: FeatureType.Line;
  name: string;
  color: string;
  services: Service[];
}

export interface System extends NetworkFeature<FeatureType.System> {
  type: FeatureType.System;
  name: string;
  nodes: WFNode<any>[];
  lines: Line[];
}

export type NetworkFeatureType = GeometryNode | Station | Segment | Service | Line | System;

export interface NetworkFeatureByType {
  [FeatureType.GeometryNode]: GeometryNode;
  [FeatureType.Station]: Station;
  [FeatureType.Segment]: Segment;
  [FeatureType.Service]: Service;
  [FeatureType.Line]: Line;
  [FeatureType.System]: System;
}
