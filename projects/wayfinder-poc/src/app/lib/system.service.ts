import { Injectable } from '@angular/core';
import {
  FeatureType,
  Mode,
  ServiceType,
} from '@wf-core/types/network-features';
import { select, Store } from '@ngrx/store';
import { RegionState, WFState } from '@wf-core/types/store';
import { network } from '@wf-core/state/network';
import { cacheValue } from '@wf-core/utils/rx-operators';
import { region } from '@wf-core/state/region';
import { filter, take } from 'rxjs';
import { createAlteration, createFeature, dehydrate } from './data-utils';

// Most of this file is mock data right now, eventually this would come from a database
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

const system1 = createFeature(FeatureType.System, {
  name: 'Test System A',
  nodes: [station1, station2],
  lines: [line1],
});

@Injectable({
  providedIn: 'root'
})
export class SystemService {
  system$ = this.store$.pipe(select(network.getSystem(system1.id)), cacheValue());

  constructor(private store$: Store<WFState>) {
    this.restoreRegion();
    this.applyNextAlteration();
  }

  private restoreRegion() {
    const alteration0 = createAlteration(1960, {
      additions: [
        station1,
        station2,
        segment1,
        service1,
        line1,
        system1,
      ].map(dehydrate),
    });

    const alteration1 = createAlteration(1975, {
      additions: [
        station3,
        geometryNode1,
      ].map(dehydrate),
      changes: [{
        featureId: segment1.id,
        featureType: FeatureType.Segment,
        path: ['nodes', 2],
        left: undefined,
        right: geometryNode1.id,
      }, {
        featureId: segment1.id,
        featureType: FeatureType.Segment,
        path: ['nodes', 3],
        left: undefined,
        right: station3.id,
      }, {
        featureId: system1.id,
        featureType: FeatureType.System,
        path: ['nodes', 2],
        left: undefined,
        right: geometryNode1.id,
      }, {
        featureId: system1.id,
        featureType: FeatureType.System,
        path: ['nodes', 3],
        left: undefined,
        right: station3.id,
      }],
    });

    const alteration2 = createAlteration(1990, {
      additions: [
        station4,
        segment2,
        service2,
        line2,
      ].map(dehydrate),
      changes: [{
        featureId: system1.id,
        featureType: FeatureType.System,
        path: ['nodes', 4],
        left: undefined,
        right: station4.id,
      }, {
        featureId: system1.id,
        featureType: FeatureType.System,
        path: ['lines', 1],
        left: undefined,
        right: line2.id,
      }],
    });

    const state: RegionState = {
      alterationIndex: 0,
      network: {
        id: 'network-0',
        size: { x: 1, y: 1 },
        // ledger: bartAlterations,
        ledger: [alteration0, alteration1, alteration2],
      }
    };

    this.store$.dispatch(region.restore({ state }));
  }

  applyNextAlteration() {
    this.store$
      .pipe(select(region.getNextAlteration), take(1), logOut('alteration'), filter(Boolean))
      .subscribe({
        error: (thrown) => console.error(thrown),
        next: (alteration) => this.store$.dispatch(network.applyAlteration(alteration))
      });
  }

  rollBackAlteration() {
    this.store$
      .pipe(select(region.getHeadAlteration), take(1), filter(Boolean))
      .subscribe({
        error: (thrown) => console.error(thrown),
        next: (alteration) => this.store$.dispatch(network.rollBackAlteration(alteration))
      });
  }
}
