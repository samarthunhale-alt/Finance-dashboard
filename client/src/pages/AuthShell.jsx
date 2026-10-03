import { Link } from 'react-router-dom';
import Logo from '../components/Logo.jsx';

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-4 py-10">
      <Link to="/" className="mb-8" aria-label="Ledgerly home"><Logo /></Link>
      <div className="card w-full max-w-md p-6 sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
      <p className="mt-6 text-sm text-ink-soft">{footer}</p>
    </div>
  );
}
