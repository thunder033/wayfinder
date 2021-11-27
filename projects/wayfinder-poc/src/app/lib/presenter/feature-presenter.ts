import { Subject } from 'rxjs';
import { Renderable } from '../viewport/viewport.types';
import { FeatureType, NetworkFeatureByType } from '@wf-core/types/network-features';

export abstract class FeaturePresenter<T extends FeatureType> {
  protected renderable$$ = new Subject<Renderable>();
  renderable$ = this.renderable$$.asObservable();

  // private properties$$ = new Subject<Omit<NetworkFeatureByType[T], 'id' | 'type'>>();
  // protected properties$ = this.properties$$.asObservable();

  constructor(
    public readonly featureId: string,
    public readonly featureType: T,
  ) {}

  abstract initialize(feature: NetworkFeatureByType[T]): void;
}
