import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { cacheValue, network, WFState } from 'wf-core';

import { ACTIVE_SYSTEM } from './mock-data/region-data';

/**
 * Provides data for systems in the network
 * There is currently 1 mock system active at any given moment
 */
@Injectable({
  providedIn: 'root',
})
export class SystemService {
  system$ = this.store$.pipe(select(network.getSystem(ACTIVE_SYSTEM.systemId)), cacheValue());

  constructor(private store$: Store<WFState>) {}
}
