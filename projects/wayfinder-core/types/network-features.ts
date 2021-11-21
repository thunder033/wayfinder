import { Vector2 } from './geometry';

export enum FeatureType {
  Station= 'station',
  Segment = 'segment',
  Service = 'service',
  Line = 'line',
  System = 'system'
}

export interface NetworkFeature {
  id: string;
  type: FeatureType;
}

export interface Node extends NetworkFeature {
  position: Vector2;
}

export interface Station extends Node {
  name: string;
}

export enum Mode {
  Metro = 'metro',
}

export interface Segment extends NetworkFeature {
  mode: Mode;
  nodes: Node[];
}

export enum ServiceType {
  AllDay = 'all-day',
  Limited = 'limited'
}

export interface Service extends NetworkFeature {
  segments: Segment[];
  serviceType: ServiceType;
}

export interface Line extends NetworkFeature {
  name: string;
  color: string;
  services: Service[];
}

export interface System extends NetworkFeature {
  name: string;
  nodes: Node[];
  lines: Line[];
}

export type NetworkFeatureTypes = Station | Segment | Service | Line | System;
