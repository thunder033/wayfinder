import { createSelector } from '@ngrx/store';

import { AppState, PostsGridFeatureState } from '../types/posts-grid';

const getPostsGridState = (state: AppState) => state.postsGrid;
const getAllPosts = (state: PostsGridFeatureState) => state.allPosts;
const getFocusedPostId = (state: PostsGridFeatureState) => state.currentPostId;
const selectAllPosts = createSelector(getPostsGridState, getAllPosts);
const selectPostsList = createSelector(selectAllPosts, (allPosts) => Object.values(allPosts));
const selectFocusedPostId = createSelector(getPostsGridState, getFocusedPostId);

export const postsGridSelectors = {
  selectAllPosts,
  selectPostsList,
  selectPost: (id: number) =>
    createSelector(selectAllPosts, selectFocusedPostId, (items, focusedPostId) => ({
      ...items[id],
      isFocused: focusedPostId === id,
    })),
  selectFocusedPostId,
};
