import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Area, AreaChart,
} from 'recharts';
import { useAuth } from '../../context/AuthContext.jsx';
import { COLORS, CATEGORY_PALETTE } from '../../utils/constants.js';
import { monthLabel } from '../../utils/format.js';
import { ChartFrame, axisProps, gridProps } from './shared.jsx';

const withLabels = (rows) => rows.map((r) => ({ ...r, label: monthLabel(r.month) }));
const hasValues = (rows, keys) => rows.some((r) => keys.some((k) => Number(r[k]) !== 0));

export function IncomeExpenseChart({ data = [], title = 'Income vs expenses', subtitle }) {
  const { money, moneyCompact } = useAuth();
  const rows = withLabels(data);
  return (
    <ChartFrame title={title} subtitle={subtitle} empty={!hasValues(rows, ['income', 'expense'])}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="label" {...axisProps} />
          <YAxis {...axisProps} tickFormatter={moneyCompact} width={64} />
          <Tooltip formatter={(v) => money(v)} cursor={{ fill: '#EAEFEA' }} />
          <Legend iconType="circle" />
          <Bar dataKey="income" name="Income" fill={COLORS.income} radius={[4, 4, 0, 0]} />
          <Bar dataKey="expense" name="Expenses" fill={COLORS.expense} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

export function ExpenseCategoryChart({ data = [], title = 'Expenses by category', subtitle }) {
  const { money } = useAuth();
  const total = data.reduce((s, d) => s + d.total, 0);
  return (
    <ChartFrame title={title} subtitle={subtitle} empty={!data.length} emptyText="No expenses recorded for this month." height={300}>
      <div className="flex h-full flex-col items-center gap-2 sm:flex-row">
        <div className="h-48 w-full sm:h-full sm:w-1/2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="total" nameKey="name" innerRadius="58%" outerRadius="90%" paddingAngle={2} stroke="none">
                {data.map((d, i) => <Cell key={d.name} fill={CATEGORY_PALETTE[i % CATEGORY_PALETTE.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => money(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="w-full space-y-1.5 overflow-y-auto text-sm sm:w-1/2" style={{ maxHeight: '100%' }}>
          {data.map((d, i) => (
            <li key={d.name} className="flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: CATEGORY_PALETTE[i % CATEGORY_PALETTE.length] }} />
                <span className="truncate">{d.name}</span>
              </span>
              <span className="shrink-0 text-ink-soft">{total ? Math.round((d.total / total) * 100) : 0}% - {money(d.total)}</span>
            </li>
          ))}
        </ul>
      </div>
    </ChartFrame>
  );
}

export function MonthlySpendingChart({ data = [], title = 'Monthly spending', subtitle }) {
  const { money, moneyCompact } = useAuth();
  const rows = withLabels(data);
  return (
    <ChartFrame title={title} subtitle={subtitle} empty={!hasValues(rows, ['spending'])}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS.expense} stopOpacity={0.25} />
              <stop offset="100%" stopColor={COLORS.expense} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="label" {...axisProps} />
          <YAxis {...axisProps} tickFormatter={moneyCompact} width={64} />
          <Tooltip formatter={(v) => money(v)} />
          <Area type="monotone" dataKey="spending" name="Spending" stroke={COLORS.expense} strokeWidth={2.5} fill="url(#spendFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

export function SavingsTrendChart({ data = [], title = 'Savings trend', subtitle }) {
  const { money, moneyCompact } = useAuth();
  const rows = withLabels(data);
  return (
    <ChartFrame title={title} subtitle={subtitle} empty={!hasValues(rows, ['savings', 'cumulative'])}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="label" {...axisProps} />
          <YAxis {...axisProps} tickFormatter={moneyCompact} width={64} />
          <Tooltip formatter={(v) => money(v)} />
          <Legend iconType="circle" />
          <Line type="monotone" dataKey="savings" name="Saved that month" stroke={COLORS.savings} strokeWidth={2.5} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="cumulative" name="Running total" stroke={COLORS.income} strokeWidth={2.5} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

export function BudgetUtilizationChart({ data, title = 'Budget utilization', subtitle }) {
  const { money, moneyCompact } = useAuth();
  const rows = (data?.categories || []).map((c) => ({ name: c.name, Budget: c.budget, Spent: c.spent, status: c.status }));
  return (
    <ChartFrame
      title={title}
      subtitle={subtitle}
      empty={!rows.length}
      emptyText={data ? 'This budget has no category limits yet.' : 'No budget set for this month.'}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="name" {...axisProps} />
          <YAxis {...axisProps} tickFormatter={moneyCompact} width={64} />
          <Tooltip formatter={(v) => money(v)} cursor={{ fill: '#EAEFEA' }} />
          <Legend iconType="circle" />
          <Bar dataKey="Budget" fill="#B9C7C1" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Spent" radius={[4, 4, 0, 0]}>
            {rows.map((r) => (
              <Cell key={r.name} fill={r.status === 'over' ? COLORS.expense : r.status === 'warning' ? COLORS.warn : COLORS.income} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

export function SimpleBarChart({ data = [], dataKey, name, color = COLORS.savings, title, subtitle, formatter }) {
  const rows = withLabels(data);
  return (
    <ChartFrame title={title} subtitle={subtitle} empty={!hasValues(rows, [dataKey])}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="label" {...axisProps} />
          <YAxis {...axisProps} allowDecimals={false} tickFormatter={formatter} width={64} />
          <Tooltip formatter={formatter} cursor={{ fill: '#EAEFEA' }} />
          <Bar dataKey={dataKey} name={name} fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
