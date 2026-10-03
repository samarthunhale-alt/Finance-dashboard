import { useState } from 'react';
import toast from 'react-hot-toast';
import { AlertTriangle, Pencil, Plus, Target, Trash2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { useCategories } from '../hooks/useCategories.js';
import { budgetsApi } from '../services/endpoints.js';
import { getErrorMessage } from '../services/api.js';
import { currentMonth, monthLong, pct } from '../utils/format.js';
import { Alert, ConfirmDialog, EmptyState, ErrorState, Field, Modal, PageHeader, PageLoader, ProgressBar, Spinner } from '../components/ui.jsx';

const STATUS_TEXT = { ok: 'On track', warning: 'Nearly used', over: 'Over budget' };
const STATUS_BADGE = { ok: 'bg-pine-light text-pine', warning: 'bg-amber-light text-amber', over: 'bg-brick-light text-brick' };

function BudgetForm({ month, budget, categories, onSaved, onCancel }) {
  const [total, setTotal] = useState(budget?.totalAmount ?? '');
  const [rows, setRows] = useState(
    (budget?.categoryBudgets || []).map((cb) => ({ category: cb.category?._id || cb.category, amount: cb.amount }))
  );
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const expenseCats = categories.filter((c) => c.type !== 'income');
  const used = new Set(rows.map((r) => r.category));
  const available = expenseCats.filter((c) => !used.has(c._id));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const totalNum = Number(total);
    if (!totalNum || totalNum <= 0) return setError('Enter a total monthly budget greater than 0');
    if (rows.some((r) => !r.category || !(Number(r.amount) > 0))) return setError('Every category needs an amount greater than 0');

    const payload = { totalAmount: totalNum, categoryBudgets: rows.map((r) => ({ category: r.category, amount: Number(r.amount) })) };
    setSaving(true);
    try {
      if (budget) await budgetsApi.update(budget._id, payload);
      else await budgetsApi.create({ month, ...payload });
      toast.success(budget ? 'Budget updated' : 'Budget created');
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
    return undefined;
  };

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      {error && <Alert>{error}</Alert>}
      <Field label={`Total budget for ${monthLong(month)}`} htmlFor="b-total">
        <input id="b-total" type="number" min="0.01" step="0.01" className="input" value={total} onChange={(e) => setTotal(e.target.value)} placeholder="0.00" />
      </Field>

      <div>
        <p className="label">Category limits (optional)</p>
        <div className="space-y-2">
          {rows.map((row, i) => (
            <div key={i} className="flex gap-2">
              <select aria-label="Category" className="input" value={row.category} onChange={(e) => setRows(rows.map((r, j) => (j === i ? { ...r, category: e.target.value } : r)))}>
                <option value="">Choose category</option>
                {expenseCats.filter((c) => c._id === row.category || !used.has(c._id)).map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              <input aria-label="Limit" type="number" min="0.01" step="0.01" className="input w-32" placeholder="Limit" value={row.amount} onChange={(e) => setRows(rows.map((r, j) => (j === i ? { ...r, amount: e.target.value } : r)))} />
              <button type="button" className="btn-ghost px-2" onClick={() => setRows(rows.filter((_, j) => j !== i))} aria-label="Remove category limit"><X className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
        <button type="button" className="btn-secondary mt-2" disabled={!available.length} onClick={() => setRows([...rows, { category: '', amount: '' }])}>
          <Plus className="h-4 w-4" /> Add category limit
        </button>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={saving}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={saving}>{saving && <Spinner className="h-4 w-4 text-white" />} Save budget</button>
      </div>
    </form>
  );
}

export default function Budgets() {
  const { money } = useAuth();
  const { categories } = useCategories();
  const [month, setMonth] = useState(currentMonth());
  const { data, loading, error, reload } = useFetch(() => budgetsApi.list({ month }), [month]);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const budget = data?.[0];
  const usage = budget?.usage;
  const overCats = usage?.categories.filter((c) => c.status === 'over') || [];

  const remove = async () => {
    setDeleteBusy(true);
    try {
      await budgetsApi.remove(budget._id);
      toast.success('Budget deleted');
      setDeleting(false);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Budgets"
        description="Set a limit for the month and see how much of it is used."
        actions={
          <>
            <input type="month" aria-label="Budget month" className="input w-auto" value={month} onChange={(e) => e.target.value && setMonth(e.target.value)} />
            {budget && (
              <>
                <button type="button" className="btn-secondary" onClick={() => setFormOpen(true)}><Pencil className="h-4 w-4" /> Edit</button>
                <button type="button" className="btn-secondary text-brick" onClick={() => setDeleting(true)}><Trash2 className="h-4 w-4" /> Delete</button>
              </>
            )}
          </>
        }
      />

      {loading ? (
        <PageLoader />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !budget ? (
        <div className="card">
          <EmptyState
            icon={Target}
            title={`No budget for ${monthLong(month)}`}
            description="Set a total limit and, if you like, a limit for each category."
            action={<button type="button" className="btn-primary" onClick={() => setFormOpen(true)}><Plus className="h-4 w-4" /> Create budget</button>}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {usage.status !== 'ok' && (
            <Alert tone={usage.status === 'over' ? 'error' : 'warning'}>
              <span className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                {usage.status === 'over'
                  ? `You are ${money(Math.abs(usage.remaining))} over your total budget for ${monthLong(month)}.`
                  : `You have used ${pct(usage.percentUsed)} of your total budget. Only ${money(usage.remaining)} is left.`}
              </span>
            </Alert>
          )}
          {overCats.length > 0 && (
            <Alert>Over limit in: {overCats.map((c) => c.category?.name).join(', ')}.</Alert>
          )}

          <section className="card p-6">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="text-sm text-ink-soft">Spent of {money(budget.totalAmount)}</p>
                <p className="text-3xl font-bold tracking-tight">{money(usage.totalSpent)}</p>
              </div>
              <div className="text-right">
                <span className={`badge ${STATUS_BADGE[usage.status]}`}>{STATUS_TEXT[usage.status]}</span>
                <p className="mt-1 text-sm text-ink-soft">{usage.remaining >= 0 ? `${money(usage.remaining)} remaining` : `${money(-usage.remaining)} over`}</p>
              </div>
            </div>
            <div className="mt-4"><ProgressBar value={usage.percentUsed} status={usage.status} label="Total budget used" /></div>
            <p className="mt-2 text-xs text-ink-soft">{pct(usage.percentUsed)} used</p>
          </section>

          {usage.categories.length > 0 && (
            <section className="card divide-y divide-line">
              <h2 className="px-6 py-4 font-semibold">By category</h2>
              {usage.categories.map((c) => (
                <div key={c.category?._id} className="px-6 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="font-medium">{c.category?.name}</span>
                    <span className="text-ink-soft">{money(c.spent)} of {money(c.budget)}</span>
                  </div>
                  <div className="mt-2"><ProgressBar value={c.percentUsed} status={c.status} label={`${c.category?.name} budget used`} /></div>
                  <p className={`mt-1.5 text-xs ${c.status === 'over' ? 'font-semibold text-brick' : 'text-ink-soft'}`}>
                    {c.remaining >= 0 ? `${money(c.remaining)} remaining` : `Over by ${money(-c.remaining)}`}
                  </p>
                </div>
              ))}
            </section>
          )}
        </div>
      )}

      <Modal open={formOpen} title={budget ? 'Edit budget' : 'Create budget'} onClose={() => setFormOpen(false)} wide>
        <BudgetForm month={month} budget={budget} categories={categories} onCancel={() => setFormOpen(false)} onSaved={() => { setFormOpen(false); reload(); }} />
      </Modal>
      <ConfirmDialog open={deleting} title="Delete this budget?" message={`The budget for ${monthLong(month)} will be removed. Your transactions are not affected.`} busy={deleteBusy} onConfirm={remove} onClose={() => setDeleting(false)} />
    </>
  );
}
