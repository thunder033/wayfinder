import { createAction, createReducer, on, props } from '@ngrx/store';

import { Post, PostsGridFeatureState } from '../types/posts-grid';

export const postsGridDefaultState: PostsGridFeatureState = {
  allPosts: {},
  currentPostId: null,
};

export const postsGridActions = {
  loadPost: createAction('POSTS_GRID::LOAD_POST', props<{ post: Post }>()),
  focusPost: createAction('POSTS_GRID::FOCUS_POST', props<{ id: number }>()),
};

export const postsGridReducer = createReducer(
  postsGridDefaultState,
  on(
    postsGridActions.loadPost,
    (state, { post }) =>
      ({
        ...state,
        allPosts: { ...state.allPosts, [post.id]: post },
      } satisfies PostsGridFeatureState),
  ),
  on(
    postsGridActions.focusPost,
    (state, { id }) =>
      ({
        ...state,
        currentPostId: id,
      } satisfies PostsGridFeatureState),
  ),
);
