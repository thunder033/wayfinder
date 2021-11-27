import { FeatureType, NetworkFeature } from '../types/network-features';

export function isNetworkFeature<T extends FeatureType>(input: any, type?: T): input is NetworkFeature<T> {
  return (input && typeof input === 'object')
    && 'id' in input
    && Object.values(FeatureType).includes(input?.type)
    && (!type || input.type === type);
}

export function asNetworkFeature(input: any): NetworkFeature {
  if (isNetworkFeature(input)) {
    return input as any;
  }

  console.warn('Failed to resolve input as NetworkFeature', input);
  throw new Error('Could not resolve input as NetworkFeature!');
}
