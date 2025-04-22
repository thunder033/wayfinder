import { Vector2Expression } from './geometry';

export enum FeatureType {
  Station = 'station',
  Segment = 'segment',
  Service = 'service',
  Line = 'line',
  System = 'system',
  GeometryNode = 'geometry-node',
}

/**
 * Common network feature definition that supports robust processing and handling
 * of network data structures
 */
export interface NetworkFeature<T extends FeatureType = FeatureType> {
  readonly id: string;
  readonly type: T;
}

export interface WFNode<T extends FeatureType = WFNodeType> extends NetworkFeature<T> {
  position: Vector2Expression;
}

/**
 * Allows defining the shape of a network segment without displaying a specific
 * point of interest
 */
export interface GeometryNode extends WFNode<FeatureType.GeometryNode> {
  label?: string;
}

export interface Station extends WFNode<FeatureType.Station> {
  type: FeatureType.Station;
  name: string;
}

export type WFNodeType = FeatureType.Station | FeatureType.GeometryNode;

export enum Mode {
  Metro = 'metro',
  // TBD: Heavy Rail, Light Rail, BRT, Ferry, Cable Car, etc.
}

/**
 * Defines the connections between (two or more) adjacent nodes in a system by mode to
 * describe the geometry, but agnostic to a particular service or line. Somewhat analogous
 * to the physical rail or road geometry. Each {@link Service} is composed of one or more
 * segments.
 */
export interface Segment extends NetworkFeature<FeatureType.Segment> {
  type: FeatureType.Segment;
  /** type of connection */
  mode: Mode;
  nodes: WFNode[];
  label?: string;
}

/**
 * Semantic description of the type of service on a {@link Line}. Currently not utilized,
 * but intended to support visual variation and enhance detail.
 */
export enum ServiceType {
  Standard = 'standard',
  Limited = 'limited',
  // TBD: Local, Express?
}

/**
 * Describes a service offered one or more {@link Segment}s. Each {@link Line} is
 * composed of one or more services. It's theoretically possible to have a service
 * defined by multiple {@link Mode} types.
 *
 * @example A line may offer full service on only some segments or a complex network
 * geometry might define many segments with branches originating/terminating.
 */
export interface Service extends NetworkFeature<FeatureType.Service> {
  type: FeatureType.Service;
  segments: Segment[];
  serviceType: ServiceType;
  label?: string;
}

/**
 * Defines a line through one or more {@link Service} definitions, ultimately
 * describing how it's possible to move through the network.
 */
export interface Line extends NetworkFeature<FeatureType.Line> {
  type: FeatureType.Line;
  name: string;
  color: string;
  services: Service[];
}

/**
 * Sum of {@link Line} and {@link Node} definitions that describe an entire transit
 * system.
 */
export interface System extends NetworkFeature<FeatureType.System> {
  type: FeatureType.System;
  name: string;
  nodes: WFNode[];
  lines: Line[];
}

/**
 * An isolated network feature with references to other features replaced with ID
 * values.
 */
export type Dehydrated<T> = {
  [K in keyof T]: T[K] extends Array<infer U>
    ? U extends NetworkFeature
      ? string[]
      : U[]
    : T[K] extends NetworkFeature
    ? string
    : T[K] extends object
    ? Dehydrated<T[K]>
    : T[K];
};

export interface NetworkFeatureByType {
  [FeatureType.GeometryNode]: GeometryNode;
  [FeatureType.Station]: Station;
  [FeatureType.Segment]: Segment;
  [FeatureType.Service]: Service;
  [FeatureType.Line]: Line;
  [FeatureType.System]: System;
}
