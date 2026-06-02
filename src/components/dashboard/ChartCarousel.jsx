import { useState, useRef } from 'react';
import { SpendingChart } from './SpendingChart';
import { MonthlyTrendChart } from './MonthlyTrendChart';
import { IncomeExpenseBar } from './IncomeExpenseBar';
import { SpendingHeatmap } from './SpendingHeatmap';
import { SavingsGauge } from './SavingsGauge';
import { CategoryPieChart } from './CategoryPieChart';
import { CumulativeSpendChart } from './CumulativeSpendChart';
import { DayOfWeekChart } from './DayOfWeekChart';
import { CategoryBreakdown } from './CategoryBreakdown';
import { TopExpenses } from './TopExpenses';

export function ChartCarousel({ data, profile, expenses, budgets }) {
  const [active, setActive] = useState(0);
  const startX = useRef(null);

  const income = Number(profile?.monthly_income) || 0;
  const budgetTotal = budgets?.reduce((a, b) => a + b.limit_amount, 0) || 0;

  const monthStart = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  })();
  const monthExpenses = (expenses || []).filter(e => e.date >= monthStart);

  const slides = [
    {
      id: 'spending',
      label: '📈 Week',
      render: () => <SpendingChart dailyBars={data.dailyBars} />,
    },
    {
      id: 'cumulative',
      label: '📉 This Month',
      render: () => <CumulativeSpendChart expenses={expenses || []} budgetTotal={budgetTotal} />,
    },
    {
      id: 'trend',
      label: '📅 6-Month',
      render: () => <MonthlyTrendChart monthlyTrend={data.monthlyTrend} />,
    },
    {
      id: 'categories',
      label: '🥧 Pie',
      render: () => <CategoryPieChart categoryTotals={data.categoryTotals} />,
    },
    {
      id: 'breakdown',
      label: '📊 Breakdown',
      render: () => <CategoryBreakdown categoryTotals={data.categoryTotals} total={data.monthTotal} />,
    },
    {
      id: 'top',
      label: '🏆 Top Spends',
      render: () => <TopExpenses expenses={monthExpenses} />,
    },
    {
      id: 'dayofweek',
      label: '📆 By Day',
      render: () => <DayOfWeekChart expenses={expenses || []} />,
    },
    {
      id: 'heatmap',
      label: '🔥 Heatmap',
      render: () => <SpendingHeatmap heatmapData={data.heatmapData} />,
    },
    ...(income > 0 ? [
      {
        id: 'income',
        label: '💰 Income vs Spend',
        render: () => <IncomeExpenseBar income={income} spent={data.monthTotal} />,
      },
      {
        id: 'gauge',
        label: '🎯 Savings Rate',
        render: () => <SavingsGauge income={income} spent={data.monthTotal} />,
      },
    ] : []),
  ];

  function onTouchStart(e) { startX.current = e.touches[0].clientX; }
  function onTouchEnd(e) {
    if (startX.current === null) return;
    const diff = startX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) setActive(a => Math.min(a + 1, slides.length - 1));
      else setActive(a => Math.max(a - 1, 0));
    }
    startX.current = null;
  }

  return (
    <div className="chart-carousel">
      <div className="carousel-tabs">
        {slides.map((s, i) => (
          <button key={s.id} className={`carousel-tab ${i === active ? 'active' : ''}`} onClick={() => setActive(i)}>
            {s.label}
          </button>
        ))}
      </div>

      <div className="carousel-slide" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        {slides[active].render()}
      </div>

      <div className="carousel-dots">
        {slides.map((_, i) => (
          <button key={i} className={`carousel-dot ${i === active ? 'active' : ''}`} onClick={() => setActive(i)} />
        ))}
      </div>
    </div>
  );
}
