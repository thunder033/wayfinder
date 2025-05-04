import { itemSelectorActions, itemSelectorReducer } from './item-selector.reducer';
import { itemSelectorSelectors } from './item-selector.selctors';

/**
 * itemsSelector actions and selectors
 *
 * "namespace" for feature state that exposes all the actions/selectors. I find
 * this pattern addresses a lot of entropy/confusion I saw in large NgRx-based apps
 * where it's easy to have overlapping selectors from different features. Also
 * makes alot of the reducer-internal code a lot less verbose.
 */
export const itemSelector = {
  reducer: itemSelectorReducer,
  ...itemSelectorActions,
  ...itemSelectorSelectors,
};
