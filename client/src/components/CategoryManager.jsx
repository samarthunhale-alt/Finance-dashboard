import { useState } from 'react';
import toast from 'react-hot-toast';
import { Trash2 } from 'lucide-react';
import { categoriesApi } from '../services/endpoints.js';
import { getErrorMessage } from '../services/api.js';
import { Alert, Modal, Spinner } from './ui.jsx';

export default function CategoryManager({ open, onClose, categories, onChanged }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('expense');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const custom = categories.filter((c) => !c.isDefault);

  const add = async (e) => {
    e.preventDefault();
    setError('');
    if (name.trim().length < 2) return setError('Category name must be at least 2 characters');
    setBusy(true);
    try {
      await categoriesApi.create({ name: name.trim(), type });
      toast.success('Category created');
      setName('');
      onChanged();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
    return undefined;
  };

  const remove = async (category) => {
    setError('');
    try {
      await categoriesApi.remove(category._id);
      toast.success('Category deleted');
      onChanged();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Manage categories">
      <form onSubmit={add} className="space-y-3">
        {error && <Alert>{error}</Alert>}
        <div className="flex flex-col gap-2 sm:flex-row">
          <input aria-label="New category name" className="input" placeholder="New category name" maxLength={30} value={name} onChange={(e) => setName(e.target.value)} />
          <select aria-label="Category type" className="input sm:w-32" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
            <option value="both">Both</option>
          </select>
          <button type="submit" className="btn-primary" disabled={busy}>{busy ? <Spinner className="h-4 w-4 text-white" /> : 'Add'}</button>
        </div>
      </form>

      <h3 className="mb-2 mt-6 text-sm font-semibold">Your custom categories</h3>
      {custom.length === 0 ? (
        <p className="rounded-lg bg-mist px-3 py-4 text-center text-sm text-ink-soft">No custom categories yet. Built-in ones: {categories.filter((c) => c.isDefault).map((c) => c.name).join(', ')}.</p>
      ) : (
        <ul className="divide-y divide-line rounded-lg border border-line">
          {custom.map((c) => (
            <li key={c._id} className="flex items-center justify-between px-3 py-2 text-sm">
              <span>{c.name} <span className="ml-1 text-xs text-ink-soft">({c.type})</span></span>
              <button type="button" className="btn-ghost px-2 py-1 text-brick" onClick={() => remove(c)} aria-label={`Delete ${c.name}`}>
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
