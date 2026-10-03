import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { reportsApi } from '../../services/endpoints.js';
import { ErrorState, PageHeader, PageLoader } from '../../components/ui.jsx';
import { IncomeExpenseChart, ExpenseCategoryChart, SimpleBarChart } from '../../components/charts/Charts.jsx';
import { COLORS } from '../../utils/constants.js';

export default function AdminReports() {
  const { money } = useAuth();
  const [months, setMonths] = useState(6);
  const { data, loading, error, reload } = useFetch(() => reportsApi.adminMonthly(months), [months]);

  return (
    <>
      <PageHeader
        title="System reports"
        description="Platform-wide totals, growth and spending."
        actions={
          <select aria-label="Number of months" className="input w-auto" value={months} onChange={(e) => setMonths(Number(e.target.value))}>
            <option value={3}>Last 3 months</option>
            <option value={6}>Last 6 months</option>
            <option value={12}>Last 12 months</option>
          </select>
        }
      />
      {loading ? (
        <PageLoader />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <IncomeExpenseChart data={data.monthly} title="Income vs expenses (all users)" subtitle={`Last ${months} months`} />
          <SimpleBarChart data={data.monthly} dataKey="transactions" name="Transactions" title="Transactions per month" subtitle="By transaction date" color={COLORS.savings} />
          <SimpleBarChart data={data.monthly} dataKey="signups" name="New users" title="New sign-ups" subtitle="Accounts created per month" color={COLORS.income} />
          <ExpenseCategoryChart
            title="Top expense categories"
            subtitle="All time, all users"
            data={data.topCategories}
          />
          {data.topCategories.length > 0 && (
            <p className="text-xs text-ink-soft lg:col-span-2">
              Largest category: {data.topCategories[0].name} with {money(data.topCategories[0].total)} across {data.topCategories[0].count} transactions.
            </p>
          )}
        </div>
      )}
    </>
  );
}
