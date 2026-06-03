import { formatINR } from './dateUtils';

export function exportExpensesCSV(expenses, filename = 'rupee-tracker-expenses.csv') {
  const headers = ['Date', 'Amount', 'Category', 'Note', 'Type'];
  const rows = expenses.map(e => [
    e.date,
    e.amount,
    e.category?.name || 'Uncategorized',
    (e.note || '').replace(/,/g, ';'),
    e.type || 'expense',
  ]);

  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  downloadBlob(csv, filename, 'text/csv');
}

export function exportMonthlyReportCSV(expenses, budgets, profile) {
  const today = new Date();
  const month = today.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  const monthStart = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
  const monthEntries = expenses.filter(e => e.date >= monthStart);
  const monthExpenses = monthEntries.filter(e => e.type !== 'income');
  const monthIncome = monthEntries
    .filter(e => e.type === 'income')
    .reduce((a, e) => a + Number(e.amount), 0);

  const totalSpent = monthExpenses.reduce((a, e) => a + Number(e.amount), 0);
  const income = Number(profile?.monthly_income) || monthIncome || 0;
  const savings = income - totalSpent;
  const savingsRate = income > 0 ? Math.round((savings / income) * 100) : null;

  const byCategory = {};
  for (const e of monthExpenses) {
    const name = e.category?.name || 'Uncategorized';
    byCategory[name] = (byCategory[name] || 0) + Number(e.amount);
  }

  const lines = [
    `Rupee Tracker — Monthly Report`,
    `Month: ${month}`,
    `Generated: ${new Date().toLocaleDateString('en-IN')}`,
    ``,
    `=== SUMMARY ===`,
    `Total Spent,${formatINR(totalSpent)}`,
    income ? `Monthly Income,${formatINR(income)}` : null,
    income ? `Savings,${formatINR(savings)}` : null,
    savingsRate !== null ? `Savings Rate,${savingsRate}%` : null,
    `Transactions,${monthExpenses.length}`,
    ``,
    `=== BY CATEGORY ===`,
    `Category,Amount,% of Spend`,
    ...Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, amt]) => `${cat},${formatINR(amt)},${Math.round((amt / totalSpent) * 100)}%`),
    ``,
    `=== BUDGET STATUS ===`,
    `Category,Budget,Spent,Remaining,Status`,
    ...budgets.map(b => {
      const spent = byCategory[b.category?.name] || 0;
      const rem = b.limit_amount - spent;
      return `${b.category?.name},${formatINR(b.limit_amount)},${formatINR(spent)},${formatINR(rem)},${rem < 0 ? 'OVER' : 'OK'}`;
    }),
    ``,
    `=== ALL TRANSACTIONS ===`,
    `Date,Amount,Category,Note`,
    ...monthEntries
      .sort((a, b) => b.date.localeCompare(a.date))
      .map(e => `${e.date},${e.amount},${e.category?.name || 'Uncategorized'},${(e.note || '').replace(/,/g, ';')}`),
  ].filter(l => l !== null).join('\n');

  const filename = `rupee-tracker-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}.csv`;
  downloadBlob(lines, filename, 'text/csv');
}

function downloadBlob(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
}
