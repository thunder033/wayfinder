import Konva from 'konva';
import { mapTo, merge, Observable, startWith, Subject, switchMap, take, takeUntil } from 'rxjs';

import { Renderable } from '../types/presentation';
import { cacheValue } from '../utils/rx-operators';

/** Lifecycle events for {@link Renderable} items */
export enum WFEvent {
  /** fires once when a {@link Renderable} is created and drawn on screen */
  Present = 'present',
  /** fires once when a {@link Renderable} is destoryed */
  Destroy = 'destroy',
}

export interface WFEventType {
  [WFEvent.Present]: object;
  [WFEvent.Destroy]: { teardown$$: Subject<Observable<unknown>> };
}

// WIP
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface IAnimatable<T> {
  present$(): Observable<void>;
  update$(properties: T): Observable<void>;
  teardown$(): Observable<void>;
}

// WIP
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface WFAnimationParams<T extends Renderable> {
  renderable: T;
  duration: number;
  curve: (dt: number) => number;
}

/**
 * Event-based wrapper around the simple Konva.Tween animation
 * controller
 */
export class WFTween extends Konva.Tween {
  override readonly onFinish;
  override readonly onReset;

  private onFinish$$ = new Subject<void>();
  private onReset$$ = new Subject<void>();
  private onPlay$$ = new Subject<void>();
  private destroy$$ = new Subject<void>();

  onFinish$ = this.onFinish$$.asObservable();
  onReset$ = this.onReset$$.asObservable();
  onPlay$ = this.onPlay$$.asObservable();
  onIdle$ = merge(this.onFinish$, this.onReset$);

  isIdle$ = this.onPlay$.pipe(
    switchMap(() => this.onIdle$.pipe(take(1), mapTo(true), startWith(false))),
    startWith(true),
    cacheValue(),
    takeUntil(this.destroy$$),
  );

  constructor(config: Konva.TweenConfig) {
    super(config);
    this.onFinish = () => this.onFinish$$.next();
    this.onReset = () => this.onReset$$.next();
  }

  override play(): this {
    this.onPlay$$.next();
    return super.play();
  }

  override destroy() {
    this.destroy$$.next();
    super.destroy();
  }
}
