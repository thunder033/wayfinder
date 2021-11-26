import {
  combineLatest,
  concatMap,
  MonoTypeOperatorFunction,
  Observable,
  ObservableInputTuple,
  of,
  OperatorFunction,
  shareReplay,
  take,
  tap
} from 'rxjs';

export function cacheValue<T>() {
  return shareReplay<T>({ bufferSize: 1, refCount: true });
}

export function withSampleFrom<T, O extends unknown[]>(...inputs: [...ObservableInputTuple<O>]): OperatorFunction<T, [T, ...O]> {
  return concatMap((value) =>
    (combineLatest([of(value), ...inputs]) as Observable<[T, ...O]>).pipe(take(1))
  );
}

export function sampleMap<A, B>(source$: Observable<B>): OperatorFunction<A, B> {
  return concatMap(() => source$.pipe(take(1)));
}

// logging utility
(window as any).logOut = (tag: string): MonoTypeOperatorFunction<any> =>
  tap((...args) => {
    console.log(`${tag} @ ${performance.now().toFixed(0)}`, ...args);
  });

/**
 * Global (tslint banned) pipe operator to log out all arguments from a stream
 * Accepts a tag to mark values
 */
declare global {
  function logOut<T>(tag: string): MonoTypeOperatorFunction<T>;
}
