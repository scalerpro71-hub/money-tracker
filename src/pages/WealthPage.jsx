import { useState } from 'react';
import { Icon } from '../components/layout/Icon';
import { GoalsPage } from './GoalsPage';
import { InvestmentsPage } from './InvestmentsPage';
import { NetWorthPage } from './NetWorthPage';

const WEALTH_TABS = [
  { id: 'goals', label: 'Goals', icon: 'target' },
  { id: 'investments', label: 'Investments', icon: 'trend' },
  { id: 'networth', label: 'Net Worth', icon: 'gem' },
];

export function WealthPage({
  goals,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
  investments,
  onAddInvestment,
  onUpdateInvestment,
  onDeleteInvestment,
  assets,
  liabilities,
  onAddAsset,
  onUpdateAsset,
  onDeleteAsset,
  onAddLiability,
  onUpdateLiability,
  onDeleteLiability,
}) {
  const [active, setActive] = useState('goals');

  return (
    <div className="tab-enter">
      <div className="sec-head" style={{ marginTop: 0 }}>
        <h3>Wealth</h3>
      </div>

      <div className="filter-chips" style={{ marginBottom: 18 }}>
        {WEALTH_TABS.map(tab => (
          <button
            key={tab.id}
            className={`filter-chip${active === tab.id ? ' on' : ''}`}
            onClick={() => setActive(tab.id)}
          >
            <Icon name={tab.icon} size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      {active === 'goals' && (
        <GoalsPage
          goals={goals}
          onAdd={onAddGoal}
          onUpdate={onUpdateGoal}
          onDelete={onDeleteGoal}
        />
      )}

      {active === 'investments' && (
        <InvestmentsPage
          investments={investments}
          onAdd={onAddInvestment}
          onUpdate={onUpdateInvestment}
          onDelete={onDeleteInvestment}
        />
      )}

      {active === 'networth' && (
        <NetWorthPage
          assets={assets}
          liabilities={liabilities}
          onAddAsset={onAddAsset}
          onUpdateAsset={onUpdateAsset}
          onDeleteAsset={onDeleteAsset}
          onAddLiability={onAddLiability}
          onUpdateLiability={onUpdateLiability}
          onDeleteLiability={onDeleteLiability}
        />
      )}
    </div>
  );
}
