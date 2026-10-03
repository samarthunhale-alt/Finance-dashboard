import { Link } from 'react-router-dom';
import { Activity, FileBarChart, LayoutDashboard, Users, Wallet } from 'lucide-react';
import DashboardLayout from './DashboardLayout.jsx';

const LINKS = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/activity', label: 'User activity', icon: Activity },
  { to: '/admin/reports', label: 'System reports', icon: FileBarChart },
];

export default function AdminLayout() {
  const footerLink = (
    <Link to="/app" className="mb-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white">
      <Wallet className="h-4 w-4" aria-hidden="true" /> My finances
    </Link>
  );
  return <DashboardLayout links={LINKS} badge="Admin" footerLink={footerLink} />;
}
