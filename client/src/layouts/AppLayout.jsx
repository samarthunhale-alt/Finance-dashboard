import { Link } from 'react-router-dom';
import { ArrowLeftRight, LayoutDashboard, PiggyBank, PlusCircle, Settings2, ShieldCheck, Target, BarChart3 } from 'lucide-react';
import DashboardLayout from './DashboardLayout.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const LINKS = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/transactions', label: 'Transactions', icon: ArrowLeftRight, end: true },
  { to: '/app/transactions/new', label: 'Add transaction', icon: PlusCircle },
  { to: '/app/budgets', label: 'Budgets', icon: Target },
  { to: '/app/savings', label: 'Savings goals', icon: PiggyBank },
  { to: '/app/reports', label: 'Reports', icon: BarChart3 },
  { to: '/app/profile', label: 'Profile', icon: Settings2 },
];

export default function AppLayout() {
  const { user } = useAuth();
  const footerLink =
    user?.role === 'admin' ? (
      <Link to="/admin" className="mb-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white">
        <ShieldCheck className="h-4 w-4" aria-hidden="true" /> Admin area
      </Link>
    ) : null;
  return <DashboardLayout links={LINKS} footerLink={footerLink} />;
}
