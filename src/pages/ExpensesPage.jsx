import { useState, useMemo } from 'react';
import { ExpenseItem } from '../components/expenses/ExpenseItem';
import { AddExpenseModal } from '../components/expenses/AddExpenseModal';
import { useToast } from '../components/layout/Toast';
import { formatINR } from '../lib/dateUtils';

export function ExpensesPage({ expenses, categories, onAdd, onUpdate, onDelete }) {
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [editingExpense, setEditingExpense] = useState(null);
  const toast = useToast();

  const filtered = useMemo(() => {
    return expenses.filter(e => {
      const matchSearch = !search || (e.note || '').toLowerCase().includes(search.toLowerCase())
        || (e.category?.name || '').toLowerCase().includes(search.toLowerCase());
      const matchCat = !filterCat || e.category_id === filterCat;
      return matchSearch && matchCat;
    });
  }, [expenses, search, filterCat]);

  async function handleDelete(id) {
    if (!confirm('Delete this expense?')) return;
    try {
      await onDelete(id);
      toast('Expense deleted');
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  async function handleUpdate(data) {
    await onUpdate(editingExpense.id, data);
    toast('Expense updated');
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>Expenses</h2>
        <div className="expense-summary">{filtered.length} entries · {formatINR(filtered.reduce((a, e) => a + Number(e.amount), 0))}</div>
      </div>

      <div className="filter-row">
        <input className="search-input" type="search" placeholder="Search expenses..." value={search} onChange={e => setSearch(e.target.value)} />
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="filter-select">
          <option value="">All categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <p>No expenses found</p>
          <p className="empty-sub">Use the + button to add your first expense</p>
        </div>
      ) : (
        <div className="expense-list">
          {filtered.map(e => (
            <ExpenseItem key={e.id} expense={e} onEdit={setEditingExpense} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {editingExpense && (
        <AddExpenseModal categories={categories} initialData={editingExpense} onAdd={handleUpdate} onClose={() => setEditingExpense(null)} />
      )}
    </div>
  );
}
