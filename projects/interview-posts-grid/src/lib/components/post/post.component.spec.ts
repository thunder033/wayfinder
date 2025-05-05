import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { expect } from 'vitest';

import { PostComponent } from './post.component';
import { PostHarness } from './post.component.harness';
import { postsGrid, storeProvider } from '../../state';
import { AppState } from '../../types/posts-grid';
import { TEST_POST } from '../../util/data.test-utils';

const testPost = TEST_POST();

describe('PostComponent', () => {
  const setup = async () => {
    TestBed.configureTestingModule({ imports: [PostTest], providers: [storeProvider] });

    const fixture = TestBed.createComponent(PostTest);
    const store = TestBed.inject(Store);
    store.dispatch(postsGrid.loadPost({ post: testPost }));
    fixture.detectChanges();

    const loader = TestbedHarnessEnvironment.loader(fixture);
    const harness = await loader.getHarness(PostHarness);

    return { store, harness, fixture };
  };

  it('displays the post title by default', async () => {
    const ctx = await setup();
    expect(await ctx.harness.getText()).toContain(testPost.title);
  });

  it('cycles through each post property on click', async () => {
    const ctx = await setup();
    expect(await ctx.harness.getText()).toContain(testPost.title);

    await ctx.harness.toggleContent();
    expect(await ctx.harness.getText()).toContain(testPost.userId);

    await ctx.harness.toggleContent();
    expect(await ctx.harness.getText()).toContain(testPost.id);

    await ctx.harness.toggleContent();
    expect(await ctx.harness.getText()).toContain(testPost.body);

    // cycles back to first property
    await ctx.harness.toggleContent();
    expect(await ctx.harness.getText()).toContain(testPost.title);
  });

  it('focuses the post when toggling content', async () => {
    const ctx = await setup();
    expect(getFocusedPostId(ctx)).toBeFalsy();

    await ctx.harness.toggleContent();
    expect(getFocusedPostId(ctx)).toBe(testPost.id);
  });

  it('resets the current property post is unfocused', async () => {
    const ctx = await setup();
    await ctx.harness.toggleContent();
    expect(getFocusedPostId(ctx)).toBe(testPost.id);
    expect(await ctx.harness.getText()).toContain(testPost.userId);

    ctx.store.dispatch(postsGrid.focusPost({ id: 2 })); // any other post
    expect(await ctx.harness.getText()).toContain(testPost.title);
  });
});

const getFocusedPostId = (ctx: { store: Store<AppState> }) =>
  ctx.store.selectSignal(postsGrid.selectFocusedPostId)();

// don't remember having to do this previously, but this is the pattern Angular
// material is using to setup up tests...
@Component({
  template: '<app-post [id]="id"></app-post>',
  imports: [PostComponent],
})
class PostTest {
  id = testPost.id;
}
