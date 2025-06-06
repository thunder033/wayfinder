import { Store } from '@ngrx/store';
import { Bind } from 'lodash-decorators';
import { Observable, Subject } from 'rxjs';
import { Renderable, FeatureType, NetworkFeature, FeaturePresenter, WFState } from 'wf-core';

import { SystemService } from '../system.service';
import { LinePresenter } from './line-presenter';
import { NodePresenter } from './node-presenter';
import { Camera } from '../viewport/camera';

export class NetworkPresenter {
  private presenters: { [featureId: string]: FeaturePresenter<FeatureType> } = {};

  private renderable$$ = new Subject<Renderable>();
  renderable$ = this.renderable$$.asObservable();
  private update$$ = new Subject<void>();
  update$ = this.update$$.asObservable();

  constructor(private systemService: SystemService, private store: Store<WFState>) {}

  present(camera: Camera): void {
    this.systemService.system$.subscribe((system) => {
      system.nodes.filter(this.requiresPresenter).forEach((node) => {
        const presenter = NodePresenter.create(camera, node, system.id, this.store);
        presenter.renderable$.subscribe(this.pushRenderable);
        presenter.animation$.subscribe();
        this.bubbleUpdate(presenter.onUpdate$);
        presenter.initialize(node);
        this.presenters[node.id] = presenter;
      });

      system.lines.filter(this.requiresPresenter).forEach((line) => {
        const presenter = new LinePresenter(camera, line.id, this.store);
        presenter.renderable$.subscribe(this.pushRenderable);
        presenter.animation$.subscribe();
        this.bubbleUpdate(presenter.onUpdate$);
        presenter.initialize();
        this.presenters[line.id] = presenter;
      });
    });
  }

  @Bind()
  private requiresPresenter(feature: NetworkFeature): boolean {
    return feature && !this.presenters[feature.id];
  }

  @Bind()
  private pushRenderable(renderable: Renderable): void {
    this.renderable$$.next(renderable);
  }

  private bubbleUpdate(update$: Observable<any>): void {
    update$.subscribe(() => this.update$$.next());
  }
}
