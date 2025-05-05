import { BaseHarnessFilters, ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

/**
 * I've found Angular's ComponentHarnesses to be one of the best (integration)
 * testing patterns out there: https://angular.dev/guide/testing/component-harnesses-overview,
 * but I find the uptake is somewhat limited.
 */
export class PostHarness extends ComponentHarness {
  static hostSelector = 'app-post';

  static with(options: BaseHarnessFilters): HarnessPredicate<PostHarness> {
    return new HarnessPredicate(PostHarness, options);
  }

  content = this.locatorFor('[qa-content]');

  async getText() {
    return await (await this.content()).text();
  }

  async toggleContent() {
    return await (await this.host()).click();
  }
}
