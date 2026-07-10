import { useSearchParams } from 'react-router';
import { useJourney } from '../../lib/journey/useJourney';
import { Spinner } from '../../components/layout/Spinner';
import { PlanTab } from './PlanTab';
import { ExploreTab } from './ExploreTab';
import { PortfolioTab } from './PortfolioTab';
import { NetWorthTab } from './NetWorthTab';
import { GoalsTab } from './GoalsTab';
import { GlossaryTab } from './GlossaryTab';

const TABS = [
  { id: 'plan', label: 'My plan' },
  { id: 'explore', label: 'Explore' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'networth', label: 'Net worth' },
  { id: 'goals', label: 'Goals' },
  { id: 'glossary', label: 'Glossary' },
];

export function InvestPage() {
  const journey = useJourney();
  const [params, setParams] = useSearchParams();

  if (journey.loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><Spinner size={36} /></div>;
  }

  /* First-timers land on the plan; investors land on their portfolio. */
  const tab = params.get('tab') || (journey.snapshot.investmentCount > 0 ? 'portfolio' : 'plan');
  const setTab = id => setParams({ tab: id }, { replace: true });

  return (
    <div>
      <div className="filter-chips" style={{ marginBottom: 18 }}>
        {TABS.map(t => (
          <button key={t.id} className={`filter-chip${tab === t.id ? ' on' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'plan' && <PlanTab snapshot={journey.snapshot} onSwitchTab={setTab} />}
      {tab === 'explore' && <ExploreTab />}
      {tab === 'portfolio' && <PortfolioTab snapshot={journey.snapshot} />}
      {tab === 'networth' && <NetWorthTab snapshot={journey.snapshot} />}
      {tab === 'goals' && <GoalsTab snapshot={journey.snapshot} />}
      {tab === 'glossary' && <GlossaryTab />}
    </div>
  );
}
