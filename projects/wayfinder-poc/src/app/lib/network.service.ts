import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { filter, take } from 'rxjs';
import { network, region, RegionState, WFState } from 'wf-core';

import { ACTIVE_SYSTEM } from './mock-data/region-data';

// this service would eventually provide access to multiple systems across the region
@Injectable({
  providedIn: 'root',
})
export class NetworkService {
  constructor(private store$: Store<WFState>) {
    this.restoreRegion();
    this.applyNextAlteration();
  }

  private restoreRegion() {
    const state: RegionState = {
      alterationIndex: 0,
      network: {
        id: 'network-0',
        size: { x: 1, y: 1 },
        ledger: ACTIVE_SYSTEM.ledger,
      },
    };

    this.store$.dispatch(region.restore({ state }));
  }

  applyNextAlteration() {
    this.store$
      .pipe(select(region.getNextAlteration), take(1), tapLog('alteration'), filter(Boolean))
      .subscribe({
        error: (thrown) => console.error(thrown),
        next: (alteration) => this.store$.dispatch(network.applyAlteration(alteration)),
      });
  }

  rollBackAlteration() {
    this.store$.pipe(select(region.getHeadAlteration), take(1), filter(Boolean)).subscribe({
      error: (thrown) => console.error(thrown),
      next: (alteration) => this.store$.dispatch(network.rollBackAlteration(alteration)),
    });
  }
}
