import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { BasePresenter } from './base-presenter';
import { network } from '../state/network';
import { FeatureType, NetworkFeatureByType } from '../types/network-features';
import { WFState } from '../types/store';
import { cacheValue } from '../utils/rx-operators';

export abstract class FeaturePresenter<T extends FeatureType> extends BasePresenter {
  protected feature$: Observable<NetworkFeatureByType[T] | undefined> = this.store.pipe(
    select(network.getFeature(this.featureId, this.featureType)),
    cacheValue(false),
  );

  constructor(
    public readonly featureId: string,
    public readonly featureType: T,
    protected store: Store<WFState>,
  ) {
    super();
    this.feature$.subscribe();
  }
}
