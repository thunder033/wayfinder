import { Observable, Observer, Subject } from 'rxjs';

import { delayUntil } from './rx-operators';

class TestObserver<T> implements Observer<T> {
  static observe<T>(source$: Observable<T>) {
    const obs = new TestObserver();
    source$.subscribe(obs);

    return obs;
  }

  private spy = vi.fn();

  next(value: T): void {
    this.spy(value);
  }

  error(err: any): void {
    console.error(err);
  }

  complete(): void {}

  emissions(): T[] {
    return this.spy.mock.calls.map((call) => call[0]);
  }
}

describe('Rx Operators', () => {
  describe('delayUntil', () => {
    it('holds values from source until signal emits', () => {
      const source$$ = new Subject<string>();
      const signal$$ = new Subject<void>();
      const obs = TestObserver.observe(source$$.pipe(delayUntil(signal$$)));

      source$$.next('before signal 1');
      source$$.next('before signal 2 ');
      expect(obs.emissions().length).toBe(0);
      signal$$.next();
      expect(obs.emissions().length).toBe(2);
      source$$.next('after signal 1');
      source$$.next('after signal 2');

      expect(obs.emissions()).toEqual([
        'before signal 1',
        'before signal 2 ',
        'after signal 1',
        'after signal 2',
      ]);
    });
  });
});
