import { regionActions, regionReducer } from './region.reducer';
import { regionSelectors } from './region.selectors';

export const region = {
  reducer: regionReducer,
  ...regionActions,
  ...regionSelectors,
};
