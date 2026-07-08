import { useState } from 'react';
import { ActivityTab } from './ActivityTab';
import { BudgetsTab } from './BudgetsTab';
import { CommitmentsTab } from './CommitmentsTab';

const TABS = [
  { id: 'activity', label: 'Activity' },
  { id: 'budgets', label: 'Budgets' },
  { id: 'commitments', label: 'Commitments' },
];

export function MoneyPage() {
  const [tab, setTab] = useState('activity');

  return (
    <div>
      <div className="filter-chips" style={{ marginBottom: 18 }}>
        {TABS.map(t => (
          <button key={t.id} className={`filter-chip${tab === t.id ? ' on' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'activity' && <ActivityTab />}
      {tab === 'budgets' && <BudgetsTab />}
      {tab === 'commitments' && <CommitmentsTab />}
    </div>
  );
}
