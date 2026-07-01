import { FeatureType, Mode, ServiceType } from 'wf-core';

import { createAlteration, createFeature, dehydrate } from './data-utils';

// Data set represent a chunk of the SF Bay BART System
const westOakland = createFeature(FeatureType.Station, {
  name: 'Oakland West',
  position: { x: 0, y: 0 },
});

const oaklandWye = createFeature(FeatureType.GeometryNode, {
  position: { x: 1, y: 0 },
});

const oakland12thSt = createFeature(FeatureType.Station, {
  name: '12th St/Oakland City Center',
  position: { x: 1, y: 1 },
});

const oakland19thSt = createFeature(FeatureType.Station, {
  name: '19th St/Oakland',
  position: { x: 1, y: 2 },
});

const lakeMerritt = createFeature(FeatureType.Station, {
  name: 'Lake Merritt',
  position: { x: 2, y: -1 },
});

const fruitvale = createFeature(FeatureType.Station, {
  name: 'Fruitvale',
  position: { x: 3, y: -2 },
});

const node = { westOakland, oaklandWye, oakland12thSt, oakland19thSt, lakeMerritt, fruitvale };

const segment = {
  oaklandTransbay: createFeature(FeatureType.Segment, {
    mode: Mode.Metro,
    nodes: [westOakland, oaklandWye, oakland12thSt, oakland19thSt],
  }),
  oaklandEast: createFeature(FeatureType.Segment, {
    mode: Mode.Metro,
    nodes: [westOakland, oaklandWye, lakeMerritt, fruitvale],
  }),
  oaklandCentral: createFeature(FeatureType.Segment, {
    mode: Mode.Metro,
    nodes: [fruitvale, lakeMerritt, oaklandWye, oakland12thSt, oakland19thSt],
  }),
};

const service = {
  richmondTransbay: createFeature(FeatureType.Service, {
    segments: [segment.oaklandTransbay],
    serviceType: ServiceType.Standard,
  }),

  antiochTransbay: createFeature(FeatureType.Service, {
    segments: [segment.oaklandTransbay],
    serviceType: ServiceType.Standard,
  }),

  southBayTransbay: createFeature(FeatureType.Service, {
    segments: [segment.oaklandEast],
    serviceType: ServiceType.Standard,
  }),

  eastBayLocal: createFeature(FeatureType.Service, {
    segments: [segment.oaklandCentral],
    serviceType: ServiceType.Standard,
  }),
};

const line = {
  red: createFeature(FeatureType.Line, {
    name: 'Richmond - Daly City',
    services: [service.richmondTransbay],
    color: '#dc1c00',
  }),

  yellow: createFeature(FeatureType.Line, {
    name: 'Concord - Daly City',
    services: [service.antiochTransbay],
    color: '#dad000',
  }),

  orange: createFeature(FeatureType.Line, {
    name: 'Richmond - Fremont',
    services: [service.eastBayLocal],
    color: '#d07938',
  }),

  greenLine: createFeature(FeatureType.Line, {
    name: 'Fremont - Daly City',
    services: [service.southBayTransbay],
    color: '#007a03',
  }),
};

export const bart = createFeature(FeatureType.System, {
  name: 'BART',
  nodes: [...Object.values(node)],
  lines: [...Object.values(line)],
});

export const bartAlterations = [
  createAlteration(1972, {
    additions: [
      ...Object.values(node),
      ...Object.values(segment),
      ...Object.values(service),
      ...Object.values(line),
      bart,
    ].map(dehydrate),
  }),
];
