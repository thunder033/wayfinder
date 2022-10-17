import Konva from 'konva';
import {
  combineLatest,
  concatMap,
  defer,
  forkJoin,
  map,
  Observable,
  share,
  startWith,
  Subject,
  switchMap,
  take,
} from 'rxjs';

import { cacheValue } from '../utils/rx-operators';
import { WFTween } from '../wf-konva/wf-tween';

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

export interface IWFAnimatable {
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
      cacheValue(),
    );

    protected queueTween(config: Konva.TweenConfig) {
      const tween = new WFTween(config);
      this.animation$$.next([tween]);
      return tween;
    }
  };
}

WFAnimatable.base = () => WFAnimatable(class {});
