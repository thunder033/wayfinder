import { SystemService } from '../system.service';
import { FeaturePresenter } from './feature-presenter';
import { Camera } from '../viewport/camera';
import { Observable, Subject } from 'rxjs';
import { Renderable } from '../viewport/viewport.types';
import { NodePresenter } from './node-presenter';
import { LinePresenter } from './line-presenter';
import { Bind } from 'lodash-decorators';
import { FeatureType, NetworkFeature } from '@wf-core/types/network-features';
import { Store } from '@ngrx/store';
import { WFState } from '@wf-core/types/store';

export class NetworkPresenter {
  private presenters: {[featureId: string]: FeaturePresenter<FeatureType> } = {};

  private renderable$$ = new Subject<Renderable>();
  renderable$ = this.renderable$$.asObservable();
  private update$$ = new Subject<void>();
  update$ = this.update$$.asObservable();

  constructor(
    private systemService: SystemService,
    private store: Store<WFState>,
  ) {}

  present(camera: Camera): void {
    this.systemService.system$.subscribe((system) => {
      system.nodes
        .filter(this.requiresPresenter)
        .forEach((node) => {
          const presenter = NodePresenter.create(camera, node, system.id, this.store);
          presenter.renderable$.subscribe(this.pushRenderable);
          this.bubbleUpdate(presenter.update$);
          presenter.initialize(node);
          this.presenters[node.id] = presenter;
        });

      system.lines
        .filter(this.requiresPresenter)
        .forEach((line) => {
          const presenter = new LinePresenter(line.id, line.type, this.store);
          presenter.renderable$.subscribe(this.pushRenderable);
          this.bubbleUpdate(presenter.update$);
          presenter.initialize();
          this.presenters[line.id] = presenter;
        });
    });
  }

  @Bind()
  private requiresPresenter(feature: NetworkFeature): boolean {
    return !this.presenters[feature.id];
  }

  @Bind()
  private pushRenderable(renderable: Renderable): void {
    this.renderable$$.next(renderable);
  }

  private bubbleUpdate(update$: Observable<any>): void {
    update$.subscribe(() => this.update$$.next());
  }
}
