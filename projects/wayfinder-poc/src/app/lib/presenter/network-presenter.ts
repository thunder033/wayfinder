import { SystemService } from '../system.service';
import { FeaturePresenter } from './feature-presenter';
import { Camera } from '../viewport/camera';
import { Subject } from 'rxjs';
import { Renderable } from '../viewport/viewport.types';
import { NodePresenter } from './node-presenter';
import { LinePresenter } from './line-presenter';
import { Bind } from 'lodash-decorators';

export class NetworkPresenter {
  private presenters: {[featureId: string]: FeaturePresenter<any> } = {};

  private renderable$$ = new Subject<Renderable>();
  renderable$ = this.renderable$$.asObservable();

  constructor(
    private systemService: SystemService
  ) {}

  present(camera: Camera): void {
    this.systemService.system$.subscribe((system) => {
      system.nodes.forEach((node) => NodePresenter.create(camera, node, system.lines));

      system.lines.forEach((line) => {
        const presenter = new LinePresenter(line.id, line.type);
        presenter.renderable$.subscribe(this.pushRenderable);
        presenter.initialize(line);
        this.presenters[line.id] = presenter;
      });

      system.nodes.forEach(({id}) => {
        const presenter = NodePresenter.get(id);
        presenter.renderable$.subscribe(this.pushRenderable);
      });
    });
  }

  @Bind()
  private pushRenderable(renderable: Renderable): void {
    this.renderable$$.next(renderable);
  }
}
