import { postsGridActions, postsGridReducer } from './posts-grid.reducer';
import { postsGridSelectors } from './posts-grid.selctors';
import { provideStore } from '@ngrx/store';

/**
 * itemsSelector actions and selectors
 *
 * "namespace" for feature state that exposes all the actions/selectors. I find
 * this pattern addresses a lot of entropy/confusion I saw in large NgRx-based apps
 * where it's easy to have overlapping selectors from different features. Also
 * makes alot of the reducer-internal code a lot less verbose.
 */
export const postsGrid = {
  reducer: postsGridReducer,
  ...postsGridActions,
  ...postsGridSelectors,
};

export const storeProvider = provideStore({ postsGrid: postsGrid.reducer });
