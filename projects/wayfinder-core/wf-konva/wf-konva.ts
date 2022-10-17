import { WFEvent, WFEventType } from './wf-tween';
import { fromEvent, Observable } from 'rxjs';
import Konva from 'konva';

export namespace WFKonva {
  export function on$<T extends WFEvent>(target: Konva.Node, event: T): Observable<WFEventType[T]> {
    return fromEvent(target, event) as Observable<WFEventType[T]>;
  }

  export function fire<T extends WFEvent>(target: Konva.Node, event: T, data: WFEventType[T]) {
    target.fire(event, data);
  }
}
