import {
  combineLatest,
  concat,
  concatMap,
  filter,
  ignoreElements,
  map,
  MonoTypeOperatorFunction,
  Observable,
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

export function cacheValue<T>(refCount = true) {
  return shareReplay<T>({ bufferSize: 1, refCount });
}

export function withSampleFrom<T, O extends unknown[]>(
  ...inputs: [...ObservableInputTuple<O>]
): OperatorFunction<T, [T, ...O]> {
  return concatMap((value) =>
    (combineLatest([of(value), ...inputs]) as Observable<[T, ...O]>).pipe(take(1)),
  );
}

export function sampleMap<A, B>(source$: Observable<B>): OperatorFunction<A, B> {
  return concatMap(() => source$.pipe(take(1)));
}

export const toggleBy =
  <T>(predicate$: Observable<boolean>) =>
  (source$: Observable<T>) =>
    source$.pipe(
      withSampleFrom(predicate$),
      filter(([, predicate]) => predicate),
      map(([value]) => value),
    );

export const delayUntil =
  <T>(signal$: Observable<unknown>) =>
  (source$: Observable<T>) => {
    const buffer$$ = new ReplaySubject<T>();
    source$.subscribe(buffer$$);
    return concat(signal$.pipe(take(1), ignoreElements()), buffer$$).pipe(share());
  };

export function chainRead<T, K extends KeysOfType<T, Observable<any>>>(
  source$: Observable<T>,
  key: K,
): T[K] {
  return source$.pipe(switchMap((v) => v[key])) as T[K];
}

// logging utility
(window as any).tapLog = (tag: string): MonoTypeOperatorFunction<any> =>
  tap((...args) => {
    console.log(`${tag} @ ${performance.now().toFixed(0)}`, ...args);
  });

/**
 * Global (tslint banned) pipe operator to log out all arguments from a stream
 * Accepts a tag to mark values
 */
declare global {
  function tapLog<T>(tag: string): MonoTypeOperatorFunction<T>;
}
