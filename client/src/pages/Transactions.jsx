import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowDown, ArrowUp, Pencil, Plus, Receipt, Search, Tags, Trash2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { useCategories } from '../hooks/useCategories.js';
import { transactionsApi } from '../services/endpoints.js';
import { getErrorMessage } from '../services/api.js';
import { formatDate } from '../utils/format.js';
import { ConfirmDialog, EmptyState, ErrorState, Modal, PageHeader, PageLoader, Pagination } from '../components/ui.jsx';
import TransactionForm from '../components/TransactionForm.jsx';
import CategoryManager from '../components/CategoryManager.jsx';

const BLANK = { q: '', type: '', category: '', startDate: '', endDate: '', minAmount: '', maxAmount: '' };
const LIMIT = 10;

export default function Transactions() {
  const { money } = useAuth();
  const { categories, reload: reloadCategories } = useCategories();
  const [filters, setFilters] = useState(BLANK);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState({ sortBy: 'date', order: 'desc' });
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [managing, setManaging] = useState(false);

  const debouncedFilters = useDebounce(filters, 400);

  const params = useMemo(() => {
    const p = { page, limit: LIMIT, ...sort };
    Object.entries(debouncedFilters).forEach(([k, v]) => { if (v !== '') p[k] = v; });
    return p;
  }, [debouncedFilters, page, sort]);

  const { data, body, loading, error, reload } = useFetch(() => transactionsApi.list(params), [JSON.stringify(params)]);

  const activeFilters = Object.values(filters).some((v) => v !== '');
  const setFilter = (field) => (e) => { setFilters((f) => ({ ...f, [field]: e.target.value })); setPage(1); };
  const toggleSort = (sortBy) => {
    setSort((s) => (s.sortBy === sortBy ? { sortBy, order: s.order === 'desc' ? 'asc' : 'desc' } : { sortBy, order: 'desc' }));
    setPage(1);
  };

  const confirmDelete = async () => {
    setDeleteBusy(true);
    try {
      await transactionsApi.remove(deleting._id);
      toast.success('Transaction deleted');
      setDeleting(null);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleteBusy(false);
    }
  };

  const SortIcon = ({ field }) =>
    sort.sortBy === field ? (sort.order === 'desc' ? <ArrowDown className="inline h-3 w-3" /> : <ArrowUp className="inline h-3 w-3" />) : null;

  const summary = body?.summary;
  const pagination = body?.pagination;

  return (
    <>
      <PageHeader
        title="Transactions"
        description="Search, filter and edit everything you have recorded."
        actions={
          <>
            <button type="button" className="btn-secondary" onClick={() => setManaging(true)}><Tags className="h-4 w-4" /> Categories</button>
            <Link to="/app/transactions/new" className="btn-primary"><Plus className="h-4 w-4" /> Add transaction</Link>
          </>
        }
      />

      <div className="card mb-4 p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative sm:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-ink-faint" aria-hidden="true" />
            <input aria-label="Search transactions" className="input pl-9" placeholder="Search description or category" value={filters.q} onChange={setFilter('q')} />
          </div>
          <select aria-label="Filter by type" className="input" value={filters.type} onChange={setFilter('type')}>
            <option value="">Income and expenses</option>
            <option value="income">Income only</option>
            <option value="expense">Expenses only</option>
          </select>
          <select aria-label="Filter by category" className="input" value={filters.category} onChange={setFilter('category')}>
            <option value="">All categories</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <div>
            <label htmlFor="f-start" className="mb-1 block text-xs text-ink-soft">From date</label>
            <input id="f-start" type="date" className="input" value={filters.startDate} max={filters.endDate || undefined} onChange={setFilter('startDate')} />
          </div>
          <div>
            <label htmlFor="f-end" className="mb-1 block text-xs text-ink-soft">To date</label>
            <input id="f-end" type="date" className="input" value={filters.endDate} min={filters.startDate || undefined} onChange={setFilter('endDate')} />
          </div>
          <div>
            <label htmlFor="f-min" className="mb-1 block text-xs text-ink-soft">Min amount</label>
            <input id="f-min" type="number" min="0" step="0.01" className="input" value={filters.minAmount} onChange={setFilter('minAmount')} />
          </div>
          <div>
            <label htmlFor="f-max" className="mb-1 block text-xs text-ink-soft">Max amount</label>
            <input id="f-max" type="number" min="0" step="0.01" className="input" value={filters.maxAmount} onChange={setFilter('maxAmount')} />
          </div>
        </div>
        {activeFilters && (
          <button type="button" className="btn-ghost mt-3 px-2 py-1 text-xs" onClick={() => { setFilters(BLANK); setPage(1); }}>
            <X className="h-3.5 w-3.5" /> Clear all filters
          </button>
        )}
      </div>

      {summary && (
        <p className="mb-3 text-sm text-ink-soft">
          Showing totals for {pagination.total} matching transaction{pagination.total === 1 ? '' : 's'}:{' '}
          <span className="font-semibold text-pine">{money(summary.income)} in</span>,{' '}
          <span className="font-semibold text-brick">{money(summary.expense)} out</span>
        </p>
      )}

      {loading ? (
        <PageLoader />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : data.length === 0 ? (
        <div className="card">
          {activeFilters ? (
            <EmptyState icon={Search} title="No matches" description="Try removing a filter or searching for something else." action={<button type="button" className="btn-secondary" onClick={() => setFilters(BLANK)}>Clear filters</button>} />
          ) : (
            <EmptyState icon={Receipt} title="No transactions yet" description="Your history will appear here once you add something." action={<Link to="/app/transactions/new" className="btn-primary">Add a transaction</Link>} />
          )}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="border-b border-line bg-mist/60">
                <tr>
                  <th className="th" aria-sort={sort.sortBy === 'date' ? (sort.order === 'desc' ? 'descending' : 'ascending') : 'none'}>
                    <button type="button" onClick={() => toggleSort('date')}>Date <SortIcon field="date" /></button>
                  </th>
                  <th className="th">Description</th>
                  <th className="th">Category</th>
                  <th className="th text-right" aria-sort={sort.sortBy === 'amount' ? (sort.order === 'desc' ? 'descending' : 'ascending') : 'none'}>
                    <button type="button" onClick={() => toggleSort('amount')}>Amount <SortIcon field="amount" /></button>
                  </th>
                  <th className="th text-right"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data.map((t) => (
                  <tr key={t._id}>
                    <td className="td whitespace-nowrap text-ink-soft">{formatDate(t.date)}</td>
                    <td className="td max-w-[240px] truncate">{t.description || <span className="text-ink-faint">No description</span>}</td>
                    <td className="td">
                      <span className={`badge ${t.type === 'income' ? 'bg-pine-light text-pine' : 'bg-brick-light text-brick'}`}>{t.category?.name || 'Uncategorized'}</span>
                    </td>
                    <td className={`td whitespace-nowrap text-right font-semibold ${t.type === 'income' ? 'text-pine' : 'text-brick'}`}>
                      {t.type === 'income' ? '+' : '-'}{money(t.amount)}
                    </td>
                    <td className="td whitespace-nowrap text-right">
                      <button type="button" className="btn-ghost px-2 py-1" onClick={() => setEditing(t)} aria-label="Edit transaction"><Pencil className="h-4 w-4" /></button>
                      <button type="button" className="btn-ghost px-2 py-1 text-brick" onClick={() => setDeleting(t)} aria-label="Delete transaction"><Trash2 className="h-4 w-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={pagination.page} pages={pagination.pages} total={pagination.total} onChange={setPage} />
        </div>
      )}

      <Modal open={Boolean(editing)} title="Edit transaction" onClose={() => setEditing(null)}>
        {editing && (
          <TransactionForm initial={editing} categories={categories} onCancel={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); }} />
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this transaction?"
        message={deleting ? `${deleting.description || deleting.category?.name} for ${money(deleting.amount)} will be removed permanently.` : ''}
        busy={deleteBusy}
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
      />

      <CategoryManager open={managing} onClose={() => setManaging(false)} categories={categories} onChanged={reloadCategories} />
    </>
  );
}
