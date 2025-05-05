import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { expect } from 'vitest';

import { PostsGridComponent } from './posts-grid.component';
import { PostsGridHarness } from './posts-grid.component.harness';
import { postsGrid, storeProvider } from '../../state';
import { TEST_POST } from '../../util/data.test-utils';

describe('PostsGridComponent', () => {
  const setup = async ({ postsCount = 10 } = {}) => {
    TestBed.configureTestingModule({ imports: [PostsGridComponent], providers: [storeProvider] });

    const fixture = TestBed.createComponent(PostsGridTest);
    const store = TestBed.inject(Store);

    Array.from({ length: postsCount }).map((_, id) =>
      store.dispatch(postsGrid.loadPost({ post: TEST_POST({ id }) })),
    );
    fixture.detectChanges();

    const loader = TestbedHarnessEnvironment.loader(fixture);
    const harness = await loader.getHarness(PostsGridHarness);

    return { store, harness, fixture };
  };

  it('displays all the loaded posts in a grid', async () => {
    const postsCount = 5;
    const ctx = await setup({ postsCount });
    expect(await ctx.harness.posts()).toHaveLength(postsCount);
  });

  it('displays the currently focused post ID', async () => {
    const ctx = await setup();

    expect(await ctx.harness.getFocusedPostId()).toBeFalsy();

    await (await ctx.harness.getPostById(0)).toggleContent();
    expect(await ctx.harness.getFocusedPostId()).toBe('0');

    await (await ctx.harness.getPostById(5)).toggleContent();
    expect(await ctx.harness.getFocusedPostId()).toBe('5');
  });
});

// don't remember having to do this previously, but this is the pattern Angular
// material is using to setup up tests...
@Component({
  imports: [PostsGridComponent],
  template: '<app-posts-grid></app-posts-grid>',
})
class PostsGridTest {}
