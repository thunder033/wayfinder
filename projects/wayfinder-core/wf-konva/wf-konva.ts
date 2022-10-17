import Konva from 'konva';
import { fromEvent, Observable } from 'rxjs';

import { WFEvent, WFEventType } from './wf-tween';

export namespace WFKonva {
  export function on$<T extends WFEvent>(target: Konva.Node, event: T): Observable<WFEventType[T]> {
    return fromEvent(target, event) as Observable<WFEventType[T]>;
  }

  export function fire<T extends WFEvent>(target: Konva.Node, event: T, data: WFEventType[T]) {
    target.fire(event, data);
  }
}
