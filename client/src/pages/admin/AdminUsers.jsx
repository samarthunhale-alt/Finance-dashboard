import { useState } from 'react';
import toast from 'react-hot-toast';
import { Search, Trash2, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { usersApi } from '../../services/endpoints.js';
import { getErrorMessage } from '../../services/api.js';
import { formatDate, formatDateTime } from '../../utils/format.js';
import { ConfirmDialog, EmptyState, ErrorState, PageHeader, PageLoader, Pagination } from '../../components/ui.jsx';

export default function AdminUsers() {
  const { user: me } = useAuth();
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const debouncedQ = useDebounce(q, 400);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  const { data, body, loading, error, reload } = useFetch(
    () => usersApi.list({ q: debouncedQ || undefined, page, limit: 10 }),
    [debouncedQ, page]
  );

  const update = async (u, patch, message) => {
    try {
      await usersApi.update(u._id, patch);
      toast.success(message);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const confirmDelete = async () => {
    setBusy(true);
    try {
      await usersApi.remove(deleting._id);
      toast.success('User deleted');
      setDeleting(null);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Users" description="Manage roles, access and accounts." />
      <div className="relative mb-4 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-ink-faint" aria-hidden="true" />
        <input aria-label="Search users" className="input pl-9" placeholder="Search by name or email" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
      </div>

      {loading ? (
        <PageLoader />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : data.length === 0 ? (
        <div className="card"><EmptyState icon={Users} title="No users found" description="Try a different search." /></div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="border-b border-line bg-mist/60">
                <tr>
                  <th className="th">User</th><th className="th">Role</th><th className="th">Status</th>
                  <th className="th text-right">Transactions</th><th className="th">Joined</th><th className="th">Last active</th>
                  <th className="th text-right"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data.map((u) => {
                  const self = u._id === me._id;
                  return (
                    <tr key={u._id}>
                      <td className="td"><p className="font-medium">{u.name}{self && <span className="ml-1 text-xs text-ink-soft">(you)</span>}</p><p className="text-xs text-ink-soft">{u.email}</p></td>
                      <td className="td">
                        <select aria-label={`Role for ${u.name}`} className="input w-auto py-1" value={u.role} disabled={self} onChange={(e) => update(u, { role: e.target.value }, 'Role updated')}>
                          <option value="user">User</option><option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="td">
                        <button type="button" disabled={self} onClick={() => update(u, { isActive: !u.isActive }, u.isActive ? 'User deactivated' : 'User reactivated')} className={`badge ${u.isActive ? 'bg-pine-light text-pine' : 'bg-brick-light text-brick'} disabled:cursor-not-allowed`} title={self ? undefined : 'Click to toggle'}>
                          {u.isActive ? 'Active' : 'Deactivated'}
                        </button>
                      </td>
                      <td className="td text-right">{u.transactionCount}</td>
                      <td className="td whitespace-nowrap text-ink-soft">{formatDate(u.createdAt)}</td>
                      <td className="td whitespace-nowrap text-ink-soft">{formatDateTime(u.lastActiveAt)}</td>
                      <td className="td text-right">
                        <button type="button" className="btn-ghost px-2 py-1 text-brick" disabled={self} onClick={() => setDeleting(u)} aria-label={`Delete ${u.name}`}><Trash2 className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination page={body.pagination.page} pages={body.pagination.pages} total={body.pagination.total} onChange={setPage} />
        </div>
      )}

      <ConfirmDialog open={Boolean(deleting)} title="Delete this user?" message={deleting ? `${deleting.name} and all of their transactions, budgets and goals will be permanently removed.` : ''} busy={busy} onConfirm={confirmDelete} onClose={() => setDeleting(null)} />
    </>
  );
}
