// have to import this Node because the namespaced one has no generic
import { Node } from 'konva/lib/Node';
import Konva from 'konva';
import { Vector2 } from '../math';

export type TweenOptions<C extends Konva.NodeConfig, T extends Node<C>> = { [key in keyof C]?: C[key] } & {
  /** In *seconds* (not ms) */
  duration: number;
  /** DMActor position (not Konva local X/Y) */
  position?: Vector2;

  /** fires when the tween reaches end state */
  onFinish?(): void;
  /** fires if/when the tween is reset */
  onReset?(): void;
  /** fires if/when the play state is updated - not per-frame */
  onUpdate?(): void;

  /** Konva local X/Y */
  x?: number;
  y?: number;
}

export type Renderable = Konva.Shape | Konva.Group;
