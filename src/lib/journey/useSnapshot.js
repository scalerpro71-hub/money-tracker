import { useMemo } from 'react';
import {
  useExpenses, useBudgets, useGoals, useInvestments,
  useEmis, useBills, useRecurring, useAssets, useLiabilities, useProfile,
} from '../queries';
import { buildSnapshot, snapshotInputsFromQueries } from './snapshot';

/** All domain queries + the computed snapshot in one hook. */
export function useSnapshot() {
  const q = {
    expenses: useExpenses(),
    budgets: useBudgets(),
    goals: useGoals(),
    investments: useInvestments(),
    emis: useEmis(),
    bills: useBills(),
    recurring: useRecurring(),
    assets: useAssets(),
    liabilities: useLiabilities(),
    profile: useProfile(),
  };
  const loading = Object.values(q).some(x => x.isLoading);
  const inputs = snapshotInputsFromQueries(q);
  const snapshot = useMemo(
    () => buildSnapshot(inputs),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      inputs.expenses, inputs.budgets, inputs.goals, inputs.investments,
      inputs.emis, inputs.bills, inputs.recurring, inputs.assets,
      inputs.liabilities, inputs.profile,
    ]
  );
  return { snapshot, loading, queries: q };
}
