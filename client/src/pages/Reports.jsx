import { useState } from 'react';
import { useFetch } from '../hooks/useFetch.js';
import { reportsApi } from '../services/endpoints.js';
import { currentMonth, monthLong } from '../utils/format.js';
import { ErrorState, PageHeader, PageLoader } from '../components/ui.jsx';
import {
  BudgetUtilizationChart, ExpenseCategoryChart, IncomeExpenseChart, MonthlySpendingChart, SavingsTrendChart,
} from '../components/charts/Charts.jsx';

export default function Reports() {
  const [months, setMonths] = useState(6);
  const [month, setMonth] = useState(currentMonth());

  const { data, loading, error, reload } = useFetch(async () => {
    const [incomeExpense, byCategory, spending, savings, budget] = await Promise.all([
      reportsApi.incomeExpense(months),
      reportsApi.expenseByCategory(month),
      reportsApi.monthlySpending(months),
      reportsApi.savingsTrend(months),
      reportsApi.budgetUtilization(month),
    ]);
    return { data: { incomeExpense: incomeExpense.data, byCategory: byCategory.data, spending: spending.data, savings: savings.data, budget: budget.data } };
  }, [months, month]);

  return (
    <>
      <PageHeader
        title="Reports"
        description="Trends over time and a closer look at one month."
        actions={
          <>
            <select aria-label="Number of months" className="input w-auto" value={months} onChange={(e) => setMonths(Number(e.target.value))}>
              <option value={3}>Last 3 months</option>
              <option value={6}>Last 6 months</option>
              <option value={12}>Last 12 months</option>
            </select>
            <input type="month" aria-label="Month for category and budget charts" className="input w-auto" value={month} onChange={(e) => e.target.value && setMonth(e.target.value)} />
          </>
        }
      />
      {loading ? (
        <PageLoader />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <IncomeExpenseChart data={data.incomeExpense} subtitle={`Last ${months} months`} />
          <MonthlySpendingChart data={data.spending} subtitle={`Last ${months} months`} />
          <ExpenseCategoryChart data={data.byCategory} subtitle={monthLong(month)} />
          <BudgetUtilizationChart data={data.budget} subtitle={monthLong(month)} />
          <div className="lg:col-span-2">
            <SavingsTrendChart data={data.savings} subtitle={`Income minus expenses, last ${months} months`} />
          </div>
        </div>
      )}
    </>
  );
}
