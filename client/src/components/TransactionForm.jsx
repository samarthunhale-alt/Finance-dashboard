import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { transactionsApi } from '../services/endpoints.js';
import { getErrorMessage } from '../services/api.js';
import { toDateInput, todayISO } from '../utils/format.js';
import { Alert, Field, Spinner } from './ui.jsx';

export default function TransactionForm({ initial, categories, onSaved, onCancel }) {
  const editing = Boolean(initial?._id);
  const [form, setForm] = useState({
    type: initial?.type || 'expense',
    amount: initial?.amount ?? '',
    category: initial?.category?._id || '',
    description: initial?.description || '',
    date: initial?.date ? toDateInput(initial.date) : todayISO(),
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const options = useMemo(
    () => categories.filter((c) => c.type === 'both' || c.type === form.type),
    [categories, form.type]
  );

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const setType = (type) =>
    setForm((f) => {
      const stillValid = categories.some((c) => c._id === f.category && (c.type === 'both' || c.type === type));
      return { ...f, type, category: stillValid ? f.category : '' };
    });

  const validate = () => {
    const next = {};
    const amount = Number(form.amount);
    if (!form.amount || Number.isNaN(amount) || amount <= 0) next.amount = 'Enter an amount greater than 0';
    if (!form.category) next.category = 'Choose a category';
    if (!form.date) next.date = 'Choose a date';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!validate()) return;
    setSaving(true);
    const payload = { ...form, amount: Number(form.amount) };
    try {
      const res = editing ? await transactionsApi.update(initial._id, payload) : await transactionsApi.create(payload);
      toast.success(editing ? 'Transaction updated' : 'Transaction added');
      onSaved?.(res.data);
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      {formError && <Alert>{formError}</Alert>}

      <div className="grid grid-cols-2 gap-1 rounded-lg bg-mist p-1" role="radiogroup" aria-label="Transaction type">
        {['expense', 'income'].map((t) => (
          <button
            key={t}
            type="button"
            role="radio"
            aria-checked={form.type === t}
            onClick={() => setType(t)}
            className={`rounded-md py-2 text-sm font-semibold capitalize transition-colors ${
              form.type === t ? (t === 'income' ? 'bg-pine text-white' : 'bg-brick text-white') : 'text-ink-soft hover:text-ink'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Amount" htmlFor="tx-amount" error={errors.amount}>
          <input id="tx-amount" type="number" inputMode="decimal" min="0.01" step="0.01" className="input" placeholder="0.00" value={form.amount} onChange={set('amount')} />
        </Field>
        <Field label="Date" htmlFor="tx-date" error={errors.date}>
          <input id="tx-date" type="date" className="input" value={form.date} onChange={set('date')} />
        </Field>
      </div>

      <Field label="Category" htmlFor="tx-category" error={errors.category}>
        <select id="tx-category" className="input" value={form.category} onChange={set('category')}>
          <option value="">Select a category</option>
          {options.map((c) => <option key={c._id} value={c._id}>{c.name}{c.isDefault ? '' : ' (custom)'}</option>)}
        </select>
      </Field>

      <Field label="Description (optional)" htmlFor="tx-desc">
        <input id="tx-desc" type="text" maxLength={200} className="input" placeholder="e.g. Groceries at the market" value={form.description} onChange={set('description')} />
      </Field>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && <button type="button" className="btn-secondary" onClick={onCancel} disabled={saving}>Cancel</button>}
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving && <Spinner className="h-4 w-4 text-white" />}
          {editing ? 'Save changes' : 'Add transaction'}
        </button>
      </div>
    </form>
  );
}
