import { ComponentHarness } from '@angular/cdk/testing';

class LegendLineHarness extends ComponentHarness {
  static hostSelector: string = '[qa-line]';

  #swatch = this.locatorFor('[qa-swatch]');

  async getName() {
    return (await this.host()).text();
  }

  async getColor() {
    return (await this.#swatch()).getCssValue('background-color');
  }
}

export class LegendHarness extends ComponentHarness {
  static hostSelector = 'wf-legend';

  #systemName = this.locatorForOptional('[qa-system-name]');

  lines = this.locatorForAll(LegendLineHarness);

  async getSystemName() {
    return (await this.#systemName())?.text();
  }
}
