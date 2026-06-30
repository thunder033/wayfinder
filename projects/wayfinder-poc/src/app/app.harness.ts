import { ComponentHarness } from '@angular/cdk/testing';

import { LegendHarness } from './lib/legend/legend.harness';
import { ViewportHarness } from './lib/viewport/viewport.harness';

export class AppHarness extends ComponentHarness {
  static hostSelector = 'app-root';

  viewport = this.locatorFor(ViewportHarness);
  legend = this.locatorFor(LegendHarness);
}
