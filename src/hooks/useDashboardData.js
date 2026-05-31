import { useMemo } from 'react';
import { todayStr, startOfWeekStr, startOfMonthStr, getLast7Days } from '../lib/dateUtils';

export function useDashboardData(expenses, timeRange = 'monthly') {
  return useMemo(() => {
    const today = todayStr();
    const weekStart = startOfWeekStr();
    const monthStart = startOfMonthStr();

    const todayExpenses = expenses.filter(e => e.date === today);
    const weekExpenses = expenses.filter(e => e.date >= weekStart);
    const monthExpenses = expenses.filter(e => e.date >= monthStart);

    const sum = arr => arr.reduce((acc, e) => acc + Number(e.amount), 0);

    const todayTotal = sum(todayExpenses);
    const weekTotal = sum(weekExpenses);
    const monthTotal = sum(monthExpenses);

    const periodExpenses = timeRange === 'daily' ? todayExpenses
      : timeRange === 'weekly' ? weekExpenses
      : monthExpenses;

    const categoryTotals = {};
    for (const e of periodExpenses) {
      const key = e.category?.id || 'uncategorized';
      if (!categoryTotals[key]) {
        categoryTotals[key] = {
          id: key,
          name: e.category?.name || 'Uncategorized',
          icon: e.category?.icon || '💰',
          color: e.category?.color || '#6B7280',
          total: 0,
        };
      }
      categoryTotals[key].total += Number(e.amount);
    }

    const last7 = getLast7Days();
    const dailyBars = last7.map(date => ({
      date,
      amount: sum(expenses.filter(e => e.date === date)),
    }));

    return {
      todayTotal,
      weekTotal,
      monthTotal,
      categoryTotals: Object.values(categoryTotals).sort((a, b) => b.total - a.total),
      dailyBars,
      periodTotal: sum(periodExpenses),
    };
  }, [expenses, timeRange]);
}
