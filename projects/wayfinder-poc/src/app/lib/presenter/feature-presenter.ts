import { select, Store } from '@ngrx/store';
import Konva from 'konva';
import {
  concatMap,
  combineLatest,
  defer,
  forkJoin,
  Observable,
  share,
  shareReplay,
  startWith,
  Subject,
  switchMap,
  take,
  map,
  concatAll,
  endWith,
  finalize,
  ignoreElements,
  ReplaySubject,
  fromEvent,
  takeUntil,
} from 'rxjs';

import { network } from '@wf-core/state/network';
import { FeatureType, NetworkFeatureByType } from '@wf-core/types/network-features';
import { Renderable } from '@wf-core/types/presentation';
import { WFState } from '@wf-core/types/store';
import { cacheValue } from '@wf-core/utils/rx-operators';
import { WFEvent, WFTween } from '@wf-core/wf-konva/wf-tween';

function playTween$(tweens: WFTween[]): Observable<unknown> {
  return forkJoin(
    tweens.map((tween) =>
      defer(() => {
        tween.play();
        return tween.onIdle$.pipe(take(1));
      }),
    ),
  );
}

interface IWFAnimatable {
  animation$: Observable<unknown>;
  isIdle$: Observable<boolean>;
}

export function WFAnimatable<TBase extends Constructor>(base: TBase) {
  return class extends base implements IWFAnimatable {
    protected animation$$ = new Subject<WFTween[]>();
    animation$ = this.animation$$.pipe(concatMap(playTween$), share());

    isIdle$ = this.animation$$.pipe(
      switchMap((tweens) =>
        combineLatest(tweens.map((tween) => tween.isIdle$)).pipe(
          map((...isIdleAll) => isIdleAll.every(Boolean)),
        ),
      ),
      startWith(true),
      shareReplay(),
    );

    protected queueTween(config: Konva.TweenConfig) {
      const tween = new WFTween(config);
      this.animation$$.next([tween]);
      return tween;
    }
  };
}

WFAnimatable.base = () => WFAnimatable(class {});

export abstract class BasePresenter extends WFAnimatable(EventTarget) {
  onDestroy$ = fromEvent(this, WFEvent.Destroy);

  private rootNode = new Konva.Group();
  private onInitialize$$ = new ReplaySubject<void>(1);
  protected onInitialize$ = this.onInitialize$$.asObservable();

  protected renderable$$ = new Subject<Renderable>();
  renderable$ = this.renderable$$.pipe(takeUntil(this.onDestroy$));
  protected onUpdate$$ = new Subject<void>();
  onUpdate$ = this.onUpdate$$.pipe(takeUntil(this.onDestroy$));

  protected constructor() {
    super();
    // forward all events to renderables
    Object.values(WFEvent).forEach((type) => {
      this.addEventListener(type, (event) => {
        console.log('forward', event);
        this.rootNode.getChildren().forEach((node) => node.dispatchEvent(event));
      });
    });
  }

  destroy() {}

  initialize(...args: unknown[]): void {
    console.log('initialize ' + this.constructor.name);
    this.renderable$$.next(this.rootNode);
    this.onInitialize$$.next();
    this.onInitialize$$.complete();
  }

  protected render$(renderable: Renderable & Partial<IWFAnimatable>) {
    renderable.animation$?.subscribe();
    return this.onInitialize$.pipe(
      map(() => {
        this.rootNode.add(renderable);
        return renderable;
      }),
    );
  }

  protected updateInventory$<T extends object, R extends BasePresenter | Renderable>(
    inventory: Inventory<R>,
    inputList: T[],
    getId: (item: T) => string,
    getNewRenderable: (item: T) => R,
  ): Observable<Inventory<R>> {
    const existing: Inventory<R> = inputList
      .filter((item) => Object.keys(inventory).includes(getId(item)))
      .reduce((out, item) => ({ ...out, [getId(item)]: inventory[getId(item)] }), {});
    // TODO: queue wf-konva for updated renderables?
    const added: Inventory<R> = inputList
      .filter((item) => !Object.keys(inventory).includes(getId(item)))
      .reduce((out, item) => ({ ...out, [getId(item)]: getNewRenderable(item) }), {});
    Object.values(added).forEach((item) => {
      if (item instanceof Konva.Node) {
        this.renderable$$.next(item);
      } else if ('renderable$' in item) {
        item.renderable$.subscribe((renderable) => {
          this.renderable$$.next(renderable);
        });
        // wait until everything has reacted to new network state
        setTimeout(() => item.initialize(), 0);
      }
      // TODO: this is hacky - queue initialization and presentation of renderables
      // wait until new state is stable and initialized
      setTimeout(() => item.dispatchEvent(new Event(WFEvent.Present)), 1);
    });

    // teardown removed items in the inventory
    const teardown$s = Object.keys(inventory)
      .filter((signature) => !Object.keys(existing).includes(signature))
      .map((signature) => {
        const renderable = inventory[signature];
        const teardown$$ = new ReplaySubject<Observable<unknown>>();
        renderable.dispatchEvent(Object.assign(new Event(WFEvent.Destroy), { teardown$$ }));
        setTimeout(() => teardown$$.complete(), 0);
        return <Observable<Inventory<R>>>teardown$$.pipe(
          tapLog('wait for ' + signature),
          concatAll(),
          ignoreElements(),
          startWith({ [`${signature}-teardown`]: renderable }),
          endWith({}),
          tapLog('teardown entry ' + signature),
          finalize(() => {
            console.log('destroy ' + signature);
            return renderable.destroy();
          }),
        );
      });

    return combineLatest(teardown$s).pipe(
      startWith([]),
      map((teardowns) => Object.assign({ ...existing, ...added }, ...teardowns)),
      tapLog('inventory'),
      cacheValue(),
    );
  }
}

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
