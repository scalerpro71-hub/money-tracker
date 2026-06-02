import { useMemo } from 'react';
import { todayStr, startOfWeekStr, startOfMonthStr, getLast7Days, daysRemainingInMonth } from '../lib/dateUtils';

function getLast6Months() {
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - (5 - i));
    return {
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleDateString('en-IN', { month: 'short' }),
    };
  });
}

function getLast30DaysArr() {
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split('T')[0];
  });
}

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

    // 6-month trend
    const months = getLast6Months();
    const monthlyTrend = months.map(({ key, label }) => ({
      label,
      amount: sum(expenses.filter(e => e.date?.startsWith(key))),
    }));

    // Week-over-week
    const prevWeekStart = new Date();
    prevWeekStart.setDate(prevWeekStart.getDate() - prevWeekStart.getDay() - 7);
    const prevWeekEnd = new Date(prevWeekStart);
    prevWeekEnd.setDate(prevWeekEnd.getDate() + 6);
    const prevWeekStartStr = prevWeekStart.toISOString().split('T')[0];
    const prevWeekEndStr = prevWeekEnd.toISOString().split('T')[0];
    const prevWeekTotal = sum(expenses.filter(e => e.date >= prevWeekStartStr && e.date <= prevWeekEndStr));
    const weekChange = prevWeekTotal > 0 ? ((weekTotal - prevWeekTotal) / prevWeekTotal) * 100 : null;

    // 30-day heatmap
    const last30 = getLast30DaysArr();
    const heatmapData = last30.map(date => ({
      date,
      amount: sum(expenses.filter(e => e.date === date)),
    }));

    // Days remaining & daily budget pace
    const daysLeft = daysRemainingInMonth();
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const daysPassed = daysInMonth - daysLeft;
    const avgDailySpend = daysPassed > 0 ? monthTotal / daysPassed : 0;

    return {
      todayTotal,
      weekTotal,
      monthTotal,
      categoryTotals: Object.values(categoryTotals).sort((a, b) => b.total - a.total),
      dailyBars,
      periodTotal: sum(periodExpenses),
      monthlyTrend,
      weekChange,
      prevWeekTotal,
      heatmapData,
      daysLeft,
      avgDailySpend,
    };
  }, [expenses, timeRange]);
}
