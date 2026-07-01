import { bart, bartAlterations } from './bart-data';
import { system1, system1Alterations } from './system1-data';

enum TestSystem {
  BART,
  Test1,
}

const testSystemValues = {
  [TestSystem.BART]: { ledger: bartAlterations, systemId: bart.id },
  [TestSystem.Test1]: { ledger: system1Alterations, systemId: system1.id },
};

export const ACTIVE_SYSTEM = testSystemValues[TestSystem.Test1];
