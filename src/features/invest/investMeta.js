/* Investment-type metadata: fixed display order and CVD-validated viz colors.
   Color follows the group entity - never reassigned as segments come and go. */

export const TYPE_META = {
  sip: { label: 'SIP', group: 'equity' },
  mf: { label: 'Mutual fund', group: 'equity' },
  stock: { label: 'Stock', group: 'stocks' },
  gold: { label: 'Gold', group: 'gold' },
  ppf: { label: 'PPF', group: 'retirement' },
  nps: { label: 'NPS', group: 'retirement' },
  fd: { label: 'Fixed deposit', group: 'deposits' },
  other: { label: 'Other', group: 'other' },
};

export const GROUPS = [
  { id: 'equity', label: 'Equity funds', color: 'var(--viz-1)' },
  { id: 'stocks', label: 'Stocks', color: 'var(--viz-2)' },
  { id: 'gold', label: 'Gold', color: 'var(--viz-3)' },
  { id: 'retirement', label: 'PPF / NPS', color: 'var(--viz-4)' },
  { id: 'deposits', label: 'Deposits', color: 'var(--viz-5)' },
  { id: 'other', label: 'Other', color: 'var(--viz-6)' },
];

export function groupOf(type) {
  return TYPE_META[type]?.group ?? 'other';
}

export function currentValue(inv) {
  return Number(inv.current_value ?? inv.invested_amount ?? 0);
}
