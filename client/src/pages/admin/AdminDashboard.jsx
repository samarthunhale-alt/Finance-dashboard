import { Link } from 'react-router-dom';
import { Activity, ArrowDownRight, ArrowUpRight, Receipt, UserCheck, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { reportsApi } from '../../services/endpoints.js';
import { ACTION_LABELS } from '../../utils/constants.js';
import { formatDateTime } from '../../utils/format.js';
import { ErrorState, PageHeader, PageLoader, StatCard } from '../../components/ui.jsx';

export default function AdminDashboard() {
  const { money } = useAuth();
  const { data, loading, error, reload } = useFetch(() => reportsApi.adminOverview(), []);

  return (
    <>
      <PageHeader title="Admin overview" description="A snapshot of everyone using the platform." />
      {loading ? (
        <PageLoader />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard label="Total users" value={data.users.total} icon={Users} hint={`${data.users.newThisMonth} joined this month - ${data.users.admins} admin${data.users.admins === 1 ? '' : 's'}`} />
            <StatCard label="Active users" value={data.users.active} icon={UserCheck} hint={`Active in the last ${data.users.activeWindowDays} days`} />
            <StatCard label="Total transactions" value={data.transactions.total.toLocaleString()} icon={Receipt} />
            <StatCard label="Income recorded" value={money(data.transactions.income)} tone="income" icon={ArrowUpRight} />
            <StatCard label="Expenses recorded" value={money(data.transactions.expense)} tone="expense" icon={ArrowDownRight} />
            <StatCard label="Deactivated accounts" value={data.users.deactivated} icon={Users} />
          </div>

          <section className="card mt-6">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="flex items-center gap-2 font-semibold"><Activity className="h-4 w-4" aria-hidden="true" /> Latest user activity</h2>
              <Link to="/admin/activity" className="text-sm font-semibold text-pine hover:underline">View all</Link>
            </div>
            {data.recentActivity.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-ink-soft">No activity recorded yet.</p>
            ) : (
              <ul className="divide-y divide-line">
                {data.recentActivity.map((a) => (
                  <li key={a._id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm">
                    <span><span className="font-medium">{a.user?.name || 'Deleted user'}</span> <span className="text-ink-soft">{ACTION_LABELS[a.action] || a.action}</span></span>
                    <span className="text-xs text-ink-soft">{formatDateTime(a.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </>
  );
}
