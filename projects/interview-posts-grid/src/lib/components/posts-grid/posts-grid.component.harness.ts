import { ComponentHarness } from '@angular/cdk/testing';

import { PostHarness } from '../post/post.component.harness';

export class PostsGridHarness extends ComponentHarness {
  static hostSelector = 'app-posts-grid';

  posts = this.locatorForAll(PostHarness);
  focusedPostId = this.locatorFor('[qa-focused-post-id]');

  async getFocusedPostId() {
    return await (await this.focusedPostId()).text();
  }

  async getPostById(id: number) {
    return await this.locatorFor(PostHarness.with({ selector: `#app-post-${id}` }))();
  }
}
