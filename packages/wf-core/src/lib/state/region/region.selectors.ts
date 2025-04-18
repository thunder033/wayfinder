import { createSelector } from '@ngrx/store';

import { WFState } from '../../types/store';
import { network } from '../network';

const getRegion = (state: WFState) => state.region;

const getHeadAlteration = createSelector(
  getRegion,
  network.peekAlterationStack,
  (region, alterationId) => region.network?.ledger.find(({ id }) => id === alterationId),
);

const getNextAlteration = createSelector(
  getRegion,
  network.peekAlterationStack,
  (region, alterationId) => {
    if (!alterationId) {
      return region.network?.ledger[0];
    }

    const currentIndex = region.network?.ledger.findIndex(({ id }) => id === alterationId);
    return Number.isFinite(currentIndex) ? region.network?.ledger[currentIndex! + 1] : null;
  },
);

export const regionSelectors = {
  getRegion,
  getNextAlteration,
  getHeadAlteration,
};
