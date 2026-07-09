import { useEffect, useState } from 'react';
import { useAuthCtx } from '../../app/auth-context';
import { useTheme } from '../../contexts/ThemeContext';
import { useProfile, useUpdateProfile, useCategories, useCategoryMutations, useExpenses } from '../../lib/queries';
import { useToast } from '../../components/layout/Toast';
import { Icon } from '../../components/layout/Icon';
import { exportExpensesCSV } from '../../lib/reportExport';

const EXPERIENCE = [['beginner', 'Total beginner'], ['curious', 'Curious but confused'], ['dabbled', "I've dabbled"]];
const RISKS = [['low', 'Slow and steady'], ['medium', 'Balanced'], ['high', 'Growth-first']];
const SAFETY = [['none', 'No safety net yet'], ['family_support', 'Family has my back'], ['own_emergency_fund', 'I have some savings']];

function Section({ title, sub, children }) {
  return (
    <div className="card pad" style={{ marginBottom: 16 }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 15.5, fontWeight: 800 }}>{title}</div>
        {sub && <div style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 600, marginTop: 2 }}>{sub}</div>}
      </div>
      {children}
    </div>
  );
}

export function SettingsPage() {
  const { user, signOut } = useAuthCtx();
  const { theme, toggle: toggleTheme } = useTheme();
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const { data: categories = [] } = useCategories();
  const { add: addCategory, remove: removeCategory } = useCategoryMutations();
  const { data: expenses = [] } = useExpenses();
  const toast = useToast();

  const [name, setName] = useState('');
  const [income, setIncome] = useState('');
  const [payday, setPayday] = useState(1);
  const [newCat, setNewCat] = useState('');

  useEffect(() => {
    if (!profile) return;
    setName(profile.full_name || '');
    setIncome(profile.monthly_income || '');
    setPayday(profile.payday_day || 1);
  }, [profile]);

  async function saveProfile() {
    try {
      await updateProfile.mutateAsync({
        full_name: name.trim(),
        monthly_income: Number(income) || null,
        payday_day: Number(payday) || null,
      });
      toast('Profile saved');
    } catch (err) { toast(err.message, 'error'); }
  }

  async function saveInvestingField(field, value) {
    try {
      await updateProfile.mutateAsync({ [field]: value });
      toast('Saved — your coach adapts to this');
    } catch (err) { toast(err.message, 'error'); }
  }

  async function handleAddCategory() {
    const catName = newCat.trim();
    if (!catName) return;
    try {
      await addCategory.mutateAsync({ name: catName, icon: '🏷️', color: '#6B7280', is_default: false });
      setNewCat('');
      toast('Category added');
    } catch (err) { toast(err.message, 'error'); }
  }

  async function handleDeleteCategory(cat) {
    if (!confirm(`Delete "${cat.name}"? Existing transactions keep their history but lose this label.`)) return;
    try { await removeCategory.mutateAsync(cat.id); toast('Deleted'); }
    catch (err) { toast(err.message, 'error'); }
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <Section title="Profile" sub={user?.email}>
        <div className="form-group">
          <label>Name</label>
          <input value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Monthly income (in-hand)</label>
            <input type="number" inputMode="numeric" min="0" value={income} onChange={e => setIncome(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Payday</label>
            <select value={payday} onChange={e => setPayday(e.target.value)}>
              {Array.from({ length: 28 }, (_, i) => i + 1).map(d => <option key={d} value={d}>Day {d}</option>)}
            </select>
          </div>
        </div>
        <button className="btn-accent" style={{ padding: '10px 18px', fontSize: 14 }} onClick={saveProfile} disabled={updateProfile.isPending}>
          Save profile
        </button>
      </Section>

      <Section title="Investing profile" sub="The coach and journey adapt to these answers">
        <div className="form-group">
          <label>Experience</label>
          <select value={profile?.investing_experience || 'beginner'} onChange={e => saveInvestingField('investing_experience', e.target.value)}>
            {EXPERIENCE.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Risk comfort</label>
            <select value={profile?.risk_tolerance || 'medium'} onChange={e => saveInvestingField('risk_tolerance', e.target.value)}>
              {RISKS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Safety net</label>
            <select value={profile?.safety_net || 'none'} onChange={e => saveInvestingField('safety_net', e.target.value)}>
              {SAFETY.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        </div>
      </Section>

      <Section title="Categories" sub="Labels for your spending — deleting one never deletes transactions">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
          {categories.map(cat => (
            <span key={cat.id} className="chip" style={{ paddingRight: 6 }}>
              {cat.icon} {cat.name}
              <button
                onClick={() => handleDeleteCategory(cat)}
                aria-label={`Delete ${cat.name}`}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', display: 'flex', padding: 2 }}
              >
                <Icon name="x" size={11} />
              </button>
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={newCat} onChange={e => setNewCat(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
            placeholder="New category name"
            className="focus-ring"
            style={{ flex: 1, padding: '10px 14px', borderRadius: 'var(--r-xs)', border: '1.5px solid var(--hair-2)', background: 'var(--surface)', color: 'var(--ink)', fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none' }}
          />
          <button className="btn-ghost" onClick={handleAddCategory}>Add</button>
        </div>
      </Section>

      <Section title="Appearance">
        <button className="btn-ghost" onClick={toggleTheme}>
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={16} />
          Switch to {theme === 'dark' ? 'light' : 'dark'} mode
        </button>
      </Section>

      <Section title="Your data" sub="Your data is yours — take it anywhere, anytime">
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn-ghost" onClick={() => { exportExpensesCSV(expenses, 'paisacoach-expenses.csv'); toast('CSV downloaded'); }}>
            <Icon name="download" size={16} />Export transactions (CSV)
          </button>
        </div>
      </Section>

      <button className="btn-danger-soft" onClick={signOut} style={{ marginBottom: 30 }}>
        Sign out
      </button>
    </div>
  );
}
