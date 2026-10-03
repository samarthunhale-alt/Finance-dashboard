/**
 * End-to-end API smoke test. Run against a live API (local or production):
 *   API_URL=http://localhost:5000/api npm run smoke
 *   API_URL=https://your-service.onrender.com/api npm run smoke
 * It registers a throw-away user (smoke_<timestamp>@example.com); delete it from the admin Users page afterwards.
 */
const base = (process.env.API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const email = `smoke_${Date.now()}@example.com`;
const password = 'SmokeTest123';
let token = '';
let passed = 0;

async function call(method, path, body, expected = 200) {
  const res = await fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (res.status !== expected) throw new Error(`${method} ${path} returned ${res.status}, expected ${expected}: ${json.message}`);
  return json;
}
const check = (name, condition) => {
  if (!condition) throw new Error(`Assertion failed: ${name}`);
  passed += 1;
  console.log(`  ok  ${name}`);
};

const month = new Date().toISOString().slice(0, 7);
const today = new Date().toISOString().slice(0, 10);

try {
  console.log(`Smoke testing ${base}`);
  const health = await call('GET', '/health');
  check('health endpoint reports database connected', health.database === 'connected');

  await call('GET', '/transactions', null, 401);
  check('protected route rejects missing token', true);

  const reg = await call('POST', '/auth/register', { name: 'Smoke Tester', email, password }, 201);
  token = reg.data.token;
  check('register returns token and user role "user"', token && reg.data.user.role === 'user' && !reg.data.user.password);
  await call('POST', '/auth/register', { name: 'Smoke Tester', email, password }, 409);
  check('duplicate email is rejected', true);
  await call('POST', '/auth/login', { email, password: 'WrongPass123' }, 401);
  check('wrong password is rejected', true);
  const login = await call('POST', '/auth/login', { email, password });
  token = login.data.token;
  check('login works', Boolean(token));
  check('/auth/me returns the user', (await call('GET', '/auth/me')).data.email === email);
  await call('GET', '/users', null, 403);
  check('regular user cannot list users (role-based authorization)', true);
  await call('GET', '/reports/admin/overview', null, 403);

  const cats = (await call('GET', '/categories')).data;
  const food = cats.find((c) => c.name === 'Food');
  const salary = cats.find((c) => c.name === 'Salary');
  check('default categories are seeded', Boolean(food && salary));
  await call('POST', '/transactions', { type: 'income', amount: 100, category: food._id }, 400);
  check('expense-only category cannot be used for income', true);
  await call('POST', '/transactions', { type: 'expense', amount: -5, category: food._id }, 400);
  check('validation rejects negative amount', true);

  const custom = (await call('POST', '/categories', { name: `Pets ${Date.now() % 1000}`, type: 'expense' }, 201)).data;
  check('custom category created', custom.isDefault === false);

  const income = (await call('POST', '/transactions', { type: 'income', amount: 5000, category: salary._id, description: 'Monthly salary', date: today }, 201)).data;
  const expense = (await call('POST', '/transactions', { type: 'expense', amount: 120.5, category: food._id, description: 'Groceries', date: today }, 201)).data;
  await call('POST', '/transactions', { type: 'expense', amount: 40, category: custom._id, description: 'Pet food', date: today }, 201);
  check('transactions created', income._id && expense._id);

  const updated = await call('PUT', `/transactions/${expense._id}`, { amount: 150 });
  check('transaction updated', updated.data.amount === 150);

  const list = await call('GET', '/transactions?type=expense&minAmount=100&q=grocer');
  check('search + type + amount filters combine', list.data.length === 1 && list.data[0]._id === expense._id);
  check('filtered summary is returned', list.summary.expense === 150);
  const byCat = await call('GET', `/transactions?category=${food._id}`);
  check('category filter works', byCat.data.length === 1);
  const byDate = await call('GET', `/transactions?startDate=${today}&endDate=${today}`);
  check('date filter works', byDate.pagination.total === 3);

  const budget = (await call('POST', '/budgets', { month, totalAmount: 1000, categoryBudgets: [{ category: food._id, amount: 100 }] }, 201)).data;
  check('budget created with live usage', budget.usage.totalSpent === 190 && budget.usage.categories[0].status === 'over');
  await call('POST', '/budgets', { month, totalAmount: 500 }, 409);
  check('one budget per month enforced', true);

  const goal = (await call('POST', '/savings', { name: 'Laptop', targetAmount: 1000 }, 201)).data;
  const funded = (await call('POST', `/savings/${goal._id}/contribute`, { amount: 250 })).data;
  check('savings progress is calculated', funded.progress === 25);
  await call('POST', `/savings/${goal._id}/contribute`, { amount: -999 }, 400);
  check('cannot withdraw more than saved', true);
  check('savings summary', (await call('GET', '/savings/summary')).data.totalSaved === 250);

  const dash = (await call('GET', '/reports/dashboard')).data;
  check('dashboard totals', dash.totals.income === 5000 && dash.totals.expense === 190 && dash.totals.balance === 4810);
  check('dashboard recent transactions and category breakdown', dash.recentTransactions.length === 3 && dash.expenseByCategory.length === 2);
  check('income-vs-expense series', (await call('GET', '/reports/income-expense?months=3')).data.length === 3);
  check('savings trend series', (await call('GET', '/reports/savings-trend?months=3')).data.length === 3);
  check('monthly spending series', (await call('GET', '/reports/monthly-spending?months=3')).data.length === 3);
  check('budget utilization report', (await call('GET', `/reports/budget-utilization?month=${month}`)).data.categories.length === 1);

  await call('DELETE', `/categories/${custom._id}`, null, 409);
  check('category in use cannot be deleted', true);
  await call('DELETE', `/transactions/${expense._id}`);
  await call('GET', '/nope', null, 404);
  check('unknown route returns 404', true);

  console.log(`\nAll ${passed} checks passed.`);
} catch (err) {
  console.error(`\nFAILED after ${passed} passing checks:\n${err.message}`);
  process.exit(1);
}
