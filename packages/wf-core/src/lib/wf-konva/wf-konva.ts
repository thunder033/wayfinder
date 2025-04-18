import Konva from 'konva';
import { fromEvent, Observable, takeUntil } from 'rxjs';

import { WFEvent, WFEventType } from './wf-tween';

export namespace WFKonva {
  export function on$<T extends WFEvent>(target: Konva.Node, event: T): Observable<WFEventType[T]> {
    return fromEvent(target, event) as Observable<WFEventType[T]>;
  }

  export function fire<T extends WFEvent>(target: Konva.Node, event: T, data: WFEventType[T]) {
    target.fire(event, data);
  }

  export function Extended<TBase extends Constructor<Konva.Node>>(base: TBase) {
    abstract class ExtendedNode extends base {
      protected onDestroy$ = this.on$(WFEvent.Destroy);
      protected withCleanup = <T>() => takeUntil<T>(this.onDestroy$);

      on$<T extends WFEvent>(event: T): Observable<WFEventType[T]> {
        return fromEvent(this, event) as Observable<WFEventType[T]>;
      }
    }
    return ExtendedNode;
  }
}
