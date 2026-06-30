import { ComponentHarness } from '@angular/cdk/testing';

import { ButtonHarness } from '../test-utils/button.harness';

export class ViewportHarness extends ComponentHarness {
  static hostSelector = 'wf-viewport';

  #currentYear = this.locatorFor('[qa-current-year]');

  #prev = this.locatorFor(ButtonHarness.with({ selector: '[qa-prev]' }));
  #next = this.locatorFor(ButtonHarness.with({ selector: '[qa-next]' }));

  #gridToggle = this.locatorFor(ButtonHarness.with({ selector: '[qa-grid-toggle]' }));

  async getCurrentYear() {
    return (await this.#currentYear()).text();
  }
  async applyPrev() {
    await (await this.#prev()).click();
  }

  async applyNext() {
    await (await this.#next()).click();
  }

  async toggleGrid() {
    await (await this.#gridToggle()).click();
  }
}
