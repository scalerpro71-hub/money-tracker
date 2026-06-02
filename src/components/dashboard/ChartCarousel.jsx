import { useState, useRef } from 'react';
import { SpendingChart } from './SpendingChart';
import { MonthlyTrendChart } from './MonthlyTrendChart';
import { IncomeExpenseBar } from './IncomeExpenseBar';
import { SpendingHeatmap } from './SpendingHeatmap';
import { SavingsGauge } from './SavingsGauge';
import { CategoryPieChart } from './CategoryPieChart';

export function ChartCarousel({ data, profile }) {
  const [active, setActive] = useState(0);
  const startX = useRef(null);

  const income = Number(profile?.monthly_income) || 0;

  const slides = [
    {
      id: 'spending',
      label: '📈 Week',
      render: () => <SpendingChart dailyBars={data.dailyBars} />,
    },
    {
      id: 'trend',
      label: '📅 Trend',
      render: () => <MonthlyTrendChart monthlyTrend={data.monthlyTrend} />,
    },
    {
      id: 'categories',
      label: '🥧 Categories',
      render: () => <CategoryPieChart categoryTotals={data.categoryTotals} />,
    },
    ...(income > 0 ? [
      {
        id: 'income',
        label: '💰 Income',
        render: () => <IncomeExpenseBar income={income} spent={data.monthTotal} />,
      },
      {
        id: 'gauge',
        label: '📊 Savings',
        render: () => <SavingsGauge income={income} spent={data.monthTotal} />,
      },
    ] : []),
    {
      id: 'heatmap',
      label: '🔥 Heatmap',
      render: () => <SpendingHeatmap heatmapData={data.heatmapData} />,
    },
  ];

  function onTouchStart(e) {
    startX.current = e.touches[0].clientX;
  }
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
      {/* Pill tabs */}
      <div className="carousel-tabs">
        {slides.map((s, i) => (
          <button
            key={s.id}
            className={`carousel-tab ${i === active ? 'active' : ''}`}
            onClick={() => setActive(i)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Slide */}
      <div
        className="carousel-slide"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {slides[active].render()}
      </div>

      {/* Dot indicators */}
      <div className="carousel-dots">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`carousel-dot ${i === active ? 'active' : ''}`}
            onClick={() => setActive(i)}
          />
        ))}
      </div>
    </div>
  );
}
