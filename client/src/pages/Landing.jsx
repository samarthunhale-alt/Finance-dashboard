import { Link } from 'react-router-dom';
import { BarChart3, PiggyBank, ShieldCheck, Target } from 'lucide-react';
import Logo from '../components/Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const FEATURES = [
  { icon: BarChart3, title: 'See where money goes', text: 'Record income and expenses, then read the month in charts that split spending by category.' },
  { icon: Target, title: 'Hold yourself to a budget', text: 'Set a monthly limit and per-category limits. You get a warning before you overspend, not after.' },
  { icon: PiggyBank, title: 'Save toward something', text: 'Create goals with a target and a deadline, add funds as you go, and watch the progress bar fill.' },
  { icon: ShieldCheck, title: 'Your data stays yours', text: 'Passwords are hashed, sessions use signed tokens, and every record is scoped to your account.' },
];

const SAMPLE = [
  { name: 'Food', spent: 310, limit: 400, status: 'ok' },
  { name: 'Travel', spent: 190, limit: 220, status: 'warning' },
  { name: 'Shopping', spent: 275, limit: 250, status: 'over' },
];
const BAR = { ok: 'bg-pine', warning: 'bg-amber', over: 'bg-brick' };

export default function Landing() {
  const { user } = useAuth();
  const home = user ? (user.role === 'admin' ? '/admin' : '/app') : '/register';

  return (
    <div className="min-h-screen bg-paper">
      <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="flex items-center gap-2">
          {user ? (
            <Link to={home} className="btn-primary">Open dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">Log in</Link>
              <Link to="/register" className="btn-primary">Create account</Link>
            </>
          )}
        </nav>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Know what you earned, what you spent, and what is left.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-ink-soft">
              Ledgerly keeps your transactions, monthly budgets and savings goals in one dashboard, so the answer to
              "can I afford this?" takes seconds.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={home} className="btn-primary px-6 py-3 text-base">{user ? 'Open dashboard' : 'Start tracking for free'}</Link>
              {!user && <Link to="/login" className="btn-secondary px-6 py-3 text-base">I already have an account</Link>}
            </div>
          </div>

          <div className="card p-6" aria-label="Example budget">
            <div className="flex items-baseline justify-between">
              <h2 className="font-bold">Monthly budget</h2>
              <span className="text-xs text-ink-soft">Example figures</span>
            </div>
            <ul className="mt-5 space-y-5">
              {SAMPLE.map((row) => (
                <li key={row.name}>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="font-medium">{row.name}</span>
                    <span className={row.status === 'over' ? 'font-semibold text-brick' : 'text-ink-soft'}>
                      {row.spent} of {row.limit}{row.status === 'over' ? ' - over budget' : ''}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-mist">
                    <div className={`h-full rounded-full ${BAR[row.status]}`} style={{ width: `${Math.min(100, (row.spent / row.limit) * 100)}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-y border-line bg-white">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <div key={title}>
                <Icon className="h-6 w-6 text-pine" aria-hidden="true" />
                <h3 className="mt-3 font-bold">{title}</h3>
                <p className="mt-1.5 text-sm text-ink-soft">{text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-4 py-8 text-sm text-ink-soft sm:px-6">Ledgerly - a MERN stack portfolio project.</footer>
    </div>
  );
}
