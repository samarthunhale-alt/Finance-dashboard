import { Link } from 'react-router-dom';
import { ArrowDownRight, ArrowUpRight, Calendar, PiggyBank, Plus, Receipt, Wallet } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { reportsApi } from '../services/endpoints.js';
import { formatDate, monthLong } from '../utils/format.js';
import { EmptyState, ErrorState, PageHeader, PageLoader, StatCard } from '../components/ui.jsx';
import { ExpenseCategoryChart, IncomeExpenseChart } from '../components/charts/Charts.jsx';

export default function Dashboard() {
  const { user, money } = useAuth();
  const { data, loading, error, reload } = useFetch(() => reportsApi.dashboard(), []);

  const header = (
    <PageHeader
      title={`Hello, ${user.name.split(' ')[0]}`}
      description="Here is where your money stands."
      actions={<Link to="/app/transactions/new" className="btn-primary"><Plus className="h-4 w-4" /> Add transaction</Link>}
    />
  );

  if (loading) return <>{header}<PageLoader /></>;
  if (error) return <>{header}<ErrorState message={error} onRetry={reload} /></>;

  const { totals, month, goals, recentTransactions, expenseByCategory, incomeVsExpense } = data;
  const isEmpty = totals.income === 0 && totals.expense === 0;
  const monthName = monthLong(month.key);

  return (
    <>
      {header}
      {isEmpty ? (
        <div className="card">
          <EmptyState
            icon={Receipt}
            title="No transactions yet"
            description="Add your first income or expense and this dashboard will fill in with totals and charts."
            action={<Link to="/app/transactions/new" className="btn-primary">Add your first transaction</Link>}
          />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard label="Current balance" value={money(totals.balance)} icon={Wallet} tone={totals.balance < 0 ? 'expense' : 'default'} hint="All income minus all expenses" />
            <StatCard label="Total income" value={money(totals.income)} icon={ArrowUpRight} tone="income" />
            <StatCard label="Total expenses" value={money(totals.expense)} icon={ArrowDownRight} tone="expense" />
            <StatCard label={`Income in ${monthName}`} value={money(month.income)} icon={Calendar} tone="income" />
            <StatCard label={`Expenses in ${monthName}`} value={money(month.expense)} icon={Calendar} tone="expense" />
            <StatCard
              label="Saved this month"
              value={money(month.savings)}
              icon={PiggyBank}
              tone={month.savings < 0 ? 'expense' : 'income'}
              hint={goals.target ? `${money(goals.saved)} set aside across your goals` : 'Income minus expenses'}
            />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <IncomeExpenseChart data={incomeVsExpense} subtitle="Last 6 months" />
            <ExpenseCategoryChart data={expenseByCategory} subtitle={monthName} />
          </div>
        </>
      )}

      <section className="card mt-6">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-semibold">Recent transactions</h2>
          <Link to="/app/transactions" className="text-sm font-semibold text-pine hover:underline">View all</Link>
        </div>
        {recentTransactions.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-ink-soft">Nothing here yet.</p>
        ) : (
          <ul className="divide-y divide-line">
            {recentTransactions.map((t) => (
              <li key={t._id} className="flex items-center justify-between gap-4 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{t.description || t.category?.name}</p>
                  <p className="text-xs text-ink-soft">{t.category?.name} - {formatDate(t.date)}</p>
                </div>
                <p className={`shrink-0 text-sm font-semibold ${t.type === 'income' ? 'text-pine' : 'text-brick'}`}>
                  {t.type === 'income' ? '+' : '-'}{money(t.amount)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
