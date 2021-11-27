import { networkActions, networkReducer } from './network.reducer';
import { networkSelectors } from './network.selectors';

export const network = {
  reducer: networkReducer,
  ...networkActions,
  ...networkSelectors,
};
