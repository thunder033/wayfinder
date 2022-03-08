import { Observable, Subject } from 'rxjs';
import { Renderable } from '../viewport/viewport.types';
import { FeatureType, NetworkFeatureByType } from '@wf-core/types/network-features';
import { WFState } from '@wf-core/types/store';
import { select, Store } from '@ngrx/store';
import { network } from '@wf-core/state/network';
import { cacheValue } from '@wf-core/utils/rx-operators';

// class AnimationController

export abstract class FeaturePresenter<T extends FeatureType> {
  protected renderable$$ = new Subject<Renderable>();
  renderable$ = this.renderable$$.asObservable();
  protected update$$ = new Subject<void>();
  update$ = this.update$$.asObservable();

  protected feature$: Observable<NetworkFeatureByType[T]> = this.store.pipe(
    select(network.getFeature(this.featureId, this.featureType)),
    cacheValue(),
  );

  constructor(
    public readonly featureId: string,
    public readonly featureType: T,
    protected store: Store<WFState>,
  ) {
    this.feature$.subscribe();
  }

  abstract initialize(feature: NetworkFeatureByType[T]): void;

  protected updateRenderableInventory<T extends object, R extends Renderable>(
    inventory: Inventory<R>,
    inputList: T[],
    getId: (item: T) => string,
    getNewRenderable: (item: T) => R,
  ): Inventory<R> {
    const existing: Inventory<R> = inputList
      .filter((item) => Object.keys(inventory).includes(getId(item)))
      .reduce((out, item) => ({ ...out, [getId(item)]: inventory[getId(item)] }), {});
    // TODO: queue animation for updated renderables?
    const added: Inventory<R> = inputList
      .filter((item) => !Object.keys(inventory).includes(getId(item)))
      .reduce((out, item) => ({ ...out, [getId(item)]: getNewRenderable(item) }), {});
    // TODO: queue presentation of new renderables here
    Object.values(added).forEach((item) => this.renderable$$.next(item));
    Object.values(added).forEach((item) => item.fire('present'));
    Object.keys(inventory)
      .filter((signature) => !Object.keys(existing).includes(signature))
      .forEach((signature) => {
        inventory[signature].destroy();
        delete inventory[signature];
      });

    return { ...existing, ...added };
  }
}
