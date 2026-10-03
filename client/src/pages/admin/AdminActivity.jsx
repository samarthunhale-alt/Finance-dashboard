import { useState } from 'react';
import { Activity } from 'lucide-react';
import { useFetch } from '../../hooks/useFetch.js';
import { usersApi } from '../../services/endpoints.js';
import { ACTION_LABELS } from '../../utils/constants.js';
import { formatDateTime } from '../../utils/format.js';
import { EmptyState, ErrorState, PageHeader, PageLoader, Pagination } from '../../components/ui.jsx';

export default function AdminActivity() {
  const [page, setPage] = useState(1);
  const { data, body, loading, error, reload } = useFetch(() => usersApi.activity({ page, limit: 20 }), [page]);

  return (
    <>
      <PageHeader title="User activity" description="Sign-ins and changes across all accounts. Entries are kept for 90 days." />
      {loading ? (
        <PageLoader />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : data.length === 0 ? (
        <div className="card"><EmptyState icon={Activity} title="No activity yet" description="Events appear here as people use the app." /></div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead className="border-b border-line bg-mist/60">
                <tr><th className="th">User</th><th className="th">Action</th><th className="th">When</th></tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data.map((a) => (
                  <tr key={a._id}>
                    <td className="td"><p className="font-medium">{a.user?.name || 'Deleted user'}</p><p className="text-xs text-ink-soft">{a.user?.email}</p></td>
                    <td className="td">{ACTION_LABELS[a.action] || a.action}{a.meta?.target && <span className="text-ink-soft"> ({a.meta.target})</span>}</td>
                    <td className="td whitespace-nowrap text-ink-soft">{formatDateTime(a.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={body.pagination.page} pages={body.pagination.pages} total={body.pagination.total} onChange={setPage} />
        </div>
      )}
    </>
  );
}
