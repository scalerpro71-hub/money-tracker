import { useState } from 'react';
import { Link } from 'react-router';
import { useJourney } from '../../lib/journey/useJourney';
import { Spinner } from '../../components/layout/Spinner';
import { Icon } from '../../components/layout/Icon';
import { PortfolioTab } from './PortfolioTab';
import { NetWorthTab } from './NetWorthTab';
import { GoalsTab } from './GoalsTab';
import { GlossaryTab } from './GlossaryTab';

const TABS = [
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'networth', label: 'Net worth' },
  { id: 'goals', label: 'Goals' },
  { id: 'glossary', label: 'Glossary' },
];

function LockedInvest({ journey }) {
  const l5 = journey.levels.find(l => l.id === 'l5');
  const pct = Math.round((l5?.unlockCheck.progress ?? 0) * 100);
  return (
    <div className="inv-locked card">
      <div className="inv-locked-emoji">🌱</div>
      <h2>Investing unlocks at Level 5</h2>
      <p>
        This is deliberate. Investing before you have a safety net is how beginners get burned
        and never come back. Finish the groundwork — tracking, budgets, one month of emergency
        fund — and this tab opens with your first SIP lesson waiting.
      </p>
      <div className="jm-bar" style={{ maxWidth: 320, margin: '18px auto 8px' }}>
        <div className="jm-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="inv-locked-hint">{l5?.unlockCheck.label}</div>
      <Link to="/learn" className="btn-accent" style={{ textDecoration: 'none', marginTop: 18 }}>
        Continue the journey <Icon name="arrowR" size={15} />
      </Link>
      <div className="inv-locked-note">
        Already investing? Log 10 expenses, set your income and budgets, and create your emergency
        fund goal — the levels will catch up to you quickly.
      </div>
    </div>
  );
}

export function InvestPage() {
  const journey = useJourney();
  const [tab, setTab] = useState('portfolio');

  if (journey.loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><Spinner size={36} /></div>;
  }

  const l5Unlocked = journey.levels.find(l => l.id === 'l5')?.unlocked;
  const hasInvestments = journey.snapshot.investmentCount > 0;
  if (!l5Unlocked && !hasInvestments) {
    return <LockedInvest journey={journey} />;
  }

  return (
    <div>
      <div className="filter-chips" style={{ marginBottom: 18 }}>
        {TABS.map(t => (
          <button key={t.id} className={`filter-chip${tab === t.id ? ' on' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'portfolio' && <PortfolioTab snapshot={journey.snapshot} />}
      {tab === 'networth' && <NetWorthTab />}
      {tab === 'goals' && <GoalsTab snapshot={journey.snapshot} />}
      {tab === 'glossary' && <GlossaryTab />}
    </div>
  );
}
