import { useState } from 'react';
import toast from 'react-hot-toast';
import { CalendarClock, Pencil, PiggyBank, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { savingsApi } from '../services/endpoints.js';
import { getErrorMessage } from '../services/api.js';
import { formatDate, pct, toDateInput } from '../utils/format.js';
import { Alert, ConfirmDialog, EmptyState, ErrorState, Field, Modal, PageHeader, PageLoader, ProgressBar, Spinner, StatCard } from '../components/ui.jsx';

function GoalForm({ goal, onSaved, onCancel }) {
  const [form, setForm] = useState({
    name: goal?.name || '',
    targetAmount: goal?.targetAmount ?? '',
    currentAmount: goal?.currentAmount ?? 0,
    deadline: goal?.deadline ? toDateInput(goal.deadline) : '',
    notes: goal?.notes || '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.name.trim().length < 2) return setError('Give your goal a name (at least 2 characters)');
    if (!(Number(form.targetAmount) >= 1)) return setError('Target amount must be at least 1');
    if (Number(form.currentAmount) < 0) return setError('Saved amount cannot be negative');

    const payload = {
      name: form.name.trim(),
      targetAmount: Number(form.targetAmount),
      currentAmount: Number(form.currentAmount) || 0,
      notes: form.notes,
      ...(form.deadline ? { deadline: form.deadline } : {}),
    };
    setSaving(true);
    try {
      if (goal) await savingsApi.update(goal._id, payload);
      else await savingsApi.create(payload);
      toast.success(goal ? 'Goal updated' : 'Goal created');
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
      <Field label="Goal name" htmlFor="g-name"><input id="g-name" className="input" maxLength={60} placeholder="e.g. Emergency fund" value={form.name} onChange={set('name')} /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Target amount" htmlFor="g-target"><input id="g-target" type="number" min="1" step="0.01" className="input" value={form.targetAmount} onChange={set('targetAmount')} /></Field>
        <Field label="Saved so far" htmlFor="g-current"><input id="g-current" type="number" min="0" step="0.01" className="input" value={form.currentAmount} onChange={set('currentAmount')} /></Field>
      </div>
      <Field label="Deadline (optional)" htmlFor="g-deadline"><input id="g-deadline" type="date" className="input" value={form.deadline} onChange={set('deadline')} /></Field>
      <Field label="Notes (optional)" htmlFor="g-notes"><input id="g-notes" className="input" maxLength={200} value={form.notes} onChange={set('notes')} /></Field>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={saving}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={saving}>{saving && <Spinner className="h-4 w-4 text-white" />} {goal ? 'Save changes' : 'Create goal'}</button>
      </div>
    </form>
  );
}

function FundsForm({ goal, onSaved, onCancel }) {
  const { money } = useAuth();
  const [mode, setMode] = useState('add');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const n = Number(amount);
    if (!(n > 0)) return setError('Enter an amount greater than 0');
    if (mode === 'withdraw' && n > goal.currentAmount) return setError(`You only have ${money(goal.currentAmount)} saved in this goal`);
    setSaving(true);
    setError('');
    try {
      await savingsApi.contribute(goal._id, mode === 'add' ? n : -n);
      toast.success(mode === 'add' ? 'Funds added' : 'Funds withdrawn');
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
      <p className="text-sm text-ink-soft">{goal.name}: {money(goal.currentAmount)} of {money(goal.targetAmount)} saved.</p>
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-mist p-1" role="radiogroup" aria-label="Add or withdraw">
        {['add', 'withdraw'].map((m) => (
          <button key={m} type="button" role="radio" aria-checked={mode === m} onClick={() => setMode(m)} className={`rounded-md py-2 text-sm font-semibold capitalize ${mode === m ? 'bg-white text-ink' : 'text-ink-soft'}`}>
            {m === 'add' ? 'Add funds' : 'Withdraw'}
          </button>
        ))}
      </div>
      <Field label="Amount" htmlFor="f-amount"><input id="f-amount" type="number" min="0.01" step="0.01" className="input" value={amount} onChange={(e) => setAmount(e.target.value)} /></Field>
      <div className="flex justify-end gap-2">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={saving}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={saving}>{saving && <Spinner className="h-4 w-4 text-white" />} Confirm</button>
      </div>
    </form>
  );
}

export default function Savings() {
  const { money } = useAuth();
  const goalsQ = useFetch(() => savingsApi.list(), []);
  const summaryQ = useFetch(() => savingsApi.summary(), []);
  const [editing, setEditing] = useState(null); // null | 'new' | goal
  const [funding, setFunding] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const refresh = () => { goalsQ.reload(); summaryQ.reload(); };

  const remove = async () => {
    setDeleteBusy(true);
    try {
      await savingsApi.remove(deleting._id);
      toast.success('Goal deleted');
      setDeleting(null);
      refresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleteBusy(false);
    }
  };

  const goals = goalsQ.data || [];
  const s = summaryQ.data;

  return (
    <>
      <PageHeader
        title="Savings goals"
        description="Put money aside for the things that matter."
        actions={<button type="button" className="btn-primary" onClick={() => setEditing('new')}><Plus className="h-4 w-4" /> New goal</button>}
      />

      {s && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Saved this month" value={money(s.monthlySavings)} tone={s.monthlySavings < 0 ? 'expense' : 'income'} hint="Income minus expenses" icon={PiggyBank} />
          <StatCard label="Total saved in goals" value={money(s.totalSaved)} />
          <StatCard label="Total target" value={money(s.totalTarget)} />
          <StatCard label="Overall progress" value={pct(s.overallProgress)} hint={`${s.completed} of ${s.goalsCount} goals reached`} />
        </div>
      )}

      {goalsQ.loading ? (
        <PageLoader />
      ) : goalsQ.error ? (
        <ErrorState message={goalsQ.error} onRetry={refresh} />
      ) : goals.length === 0 ? (
        <div className="card">
          <EmptyState icon={PiggyBank} title="No savings goals yet" description="Pick something to save for, set a target and track your progress." action={<button type="button" className="btn-primary" onClick={() => setEditing('new')}>Create your first goal</button>} />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {goals.map((g) => {
            const done = g.currentAmount >= g.targetAmount;
            return (
              <article key={g._id} className="card p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="truncate font-semibold">{g.name}</h2>
                    {g.deadline && <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-soft"><CalendarClock className="h-3.5 w-3.5" aria-hidden="true" /> By {formatDate(g.deadline)}</p>}
                  </div>
                  {done && <span className="badge bg-pine-light text-pine">Reached</span>}
                </div>
                <p className="mt-4 text-2xl font-bold tracking-tight">{money(g.currentAmount)}</p>
                <p className="text-sm text-ink-soft">of {money(g.targetAmount)} target</p>
                <div className="mt-3"><ProgressBar value={g.progress} status="ok" label={`${g.name} progress`} /></div>
                <p className="mt-1.5 text-xs text-ink-soft">{pct(g.progress)} complete{!done && ` - ${money(g.targetAmount - g.currentAmount)} to go`}</p>
                {g.notes && <p className="mt-2 text-sm text-ink-soft">{g.notes}</p>}
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" className="btn-primary" onClick={() => setFunding(g)}>Add or withdraw</button>
                  <button type="button" className="btn-secondary px-3" onClick={() => setEditing(g)} aria-label={`Edit ${g.name}`}><Pencil className="h-4 w-4" /></button>
                  <button type="button" className="btn-secondary px-3 text-brick" onClick={() => setDeleting(g)} aria-label={`Delete ${g.name}`}><Trash2 className="h-4 w-4" /></button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Modal open={Boolean(editing)} title={editing === 'new' ? 'New savings goal' : 'Edit savings goal'} onClose={() => setEditing(null)}>
        {editing && <GoalForm goal={editing === 'new' ? null : editing} onCancel={() => setEditing(null)} onSaved={() => { setEditing(null); refresh(); }} />}
      </Modal>
      <Modal open={Boolean(funding)} title="Update saved amount" onClose={() => setFunding(null)}>
        {funding && <FundsForm goal={funding} onCancel={() => setFunding(null)} onSaved={() => { setFunding(null); refresh(); }} />}
      </Modal>
      <ConfirmDialog open={Boolean(deleting)} title="Delete this goal?" message={deleting ? `"${deleting.name}" and its progress will be removed.` : ''} busy={deleteBusy} onConfirm={remove} onClose={() => setDeleting(null)} />
    </>
  );
}
