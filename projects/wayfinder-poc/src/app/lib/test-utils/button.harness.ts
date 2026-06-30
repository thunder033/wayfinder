import { BaseHarnessFilters, ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

/**
 * Provides capabilities to interact with basic button elements
 */
export class ButtonHarness extends ComponentHarness {
  static hostSelector = 'button';

  static with(options: BaseHarnessFilters): HarnessPredicate<ButtonHarness> {
    return new HarnessPredicate(ButtonHarness, options);
  }

  async click() {
    await (await this.host()).click();
  }
}
