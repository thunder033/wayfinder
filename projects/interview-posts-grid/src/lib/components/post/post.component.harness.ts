import { BaseHarnessFilters, ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

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
