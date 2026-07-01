import {
  combineLatest,
  concat,
  concatMap,
  filter,
  ignoreElements,
  map,
  MonoTypeOperatorFunction,
  Observable,
  ObservableInput,
  ObservableInputTuple,
  of,
  OperatorFunction,
  ReplaySubject,
  share,
  shareReplay,
  switchMap,
  take,
  tap,
} from 'rxjs';
import '../types/ambient';

/**
 * {@link shareReplay} with standardize defaults/semantics to flavor a stream as a "value"
 * @param refCount - complete when no more subscribers; defaults to true here
 */
export function cacheValue<T>(refCount = true) {
  return shareReplay<T>({ bufferSize: 1, refCount });
}

/**
 * Emits the latest value from one or more streams, with more desirable behavior in most cases
 * than {@link withLatestFrom}
 */
export function withSampleFrom<T, O extends unknown[]>(
  ...inputs: [...ObservableInputTuple<O>]
): OperatorFunction<T, [T, ...O]> {
  return concatMap((value) =>
    (combineLatest([of(value), ...inputs]) as Observable<[T, ...O]>).pipe(take(1)),
  );
}

/**
 * Maps each emission to the latest sample (value) of the source
 * @param source$ - the stream to sample
 */
export function sampleMap<A, B>(source$: Observable<B>): OperatorFunction<A, B> {
  return concatMap(() => source$.pipe(take(1)));
}

/**
 * For each emission on source$, samples predicate and filters by that value. If the sample is
 * truthy, the original value from source is emitted.
 * @param predicate$ - a stream of (truthy-evaluated) values
 */
export const toggleBy =
  <T>(predicate$: Observable<boolean>) =>
  (source$: Observable<T>) =>
    source$.pipe(
      withSampleFrom(predicate$),
      filter(([, predicate]) => predicate),
      map(([value]) => value),
    );

/**
 * Delays emissions of the source until the signal emits once. After the signal emits, all
 * previous and subsequent emissions of the source are emitted in order
 * @param signal$ - a stream to wait for; emissions after the first have no effect
 */
export const delayUntil =
  <T>(signal$: Observable<unknown>) =>
  (source$: Observable<T>) => {
    const buffer$$ = new ReplaySubject<T>();
    source$.subscribe(buffer$$);
    return concat(signal$.pipe(take(1), ignoreElements()), buffer$$).pipe(share());
  };

/**
 * Allows concise access to properties of values that are emitted on the source. Intended for OOP mixed with
 * Observables, where a stream emits instances that themselves have observable properties.
 * @example
 * chainRead(this.camera$, 'position$').pipe(map(position) => { ... })
 * @param source$
 * @param key
 */
export function chainRead<T, K extends KeysOfType<T, ObservableInput<unknown>>>(
  source$: Observable<T>,
  key: K,
): T[K] {
  return source$.pipe(switchMap((v) => v[key] as ObservableInput<unknown>)) as T[K];
}

// logging utility
(window as any).tapLog = (tag: string): MonoTypeOperatorFunction<any> =>
  tap((...args) => {
    console.log(`${tag} @ ${performance.now().toFixed(0)}`, ...args);
  });

/**
 * Global (eslint banned) pipe operator to log out all arguments from a stream
 * Accepts a tag to mark values
 */
declare global {
  function tapLog<T>(tag: string): MonoTypeOperatorFunction<T>;
}
